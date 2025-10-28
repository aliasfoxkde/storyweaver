/**
 * Structured logging system with different log levels
 * Configurable via environment variable: VITE_LOG_LEVEL
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LogContext {
  operation?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

class Logger {
  private level: LogLevel;
  private startTimes = new Map<string, number>();

  constructor() {
    // Get log level from environment or default to INFO in production, DEBUG in development
    const envLevel = import.meta.env.VITE_LOG_LEVEL as string | undefined;
    const isDev = import.meta.env.DEV;
    
    if (envLevel) {
      this.level = LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
    } else {
      this.level = isDev ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const parts = [`[${timestamp}]`, `[${level}]`];
    
    if (context?.operation) {
      parts.push(`[${context.operation}]`);
    }
    
    parts.push(message);
    
    if (context?.duration !== undefined) {
      parts.push(`(${context.duration}ms)`);
    }
    
    return parts.join(' ');
  }

  private logWithContext(
    level: LogLevel,
    levelName: string,
    message: string,
    context?: LogContext,
    ...args: unknown[]
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);
    
    if (context?.metadata) {
      console[levelName.toLowerCase() as 'log' | 'warn' | 'error'](
        formattedMessage,
        context.metadata,
        ...args
      );
    } else {
      console[levelName.toLowerCase() as 'log' | 'warn' | 'error'](
        formattedMessage,
        ...args
      );
    }
  }

  debug(message: string, context?: LogContext, ...args: unknown[]): void {
    this.logWithContext(LogLevel.DEBUG, 'DEBUG', message, context, ...args);
  }

  info(message: string, context?: LogContext, ...args: unknown[]): void {
    this.logWithContext(LogLevel.INFO, 'INFO', message, context, ...args);
  }

  warn(message: string, context?: LogContext, ...args: unknown[]): void {
    this.logWithContext(LogLevel.WARN, 'WARN', message, context, ...args);
  }

  error(message: string, context?: LogContext, ...args: unknown[]): void {
    this.logWithContext(LogLevel.ERROR, 'ERROR', message, context, ...args);
  }

  /**
   * Start a performance timer for an operation
   */
  startTimer(operationId: string): void {
    this.startTimes.set(operationId, performance.now());
  }

  /**
   * End a performance timer and log the duration
   */
  endTimer(operationId: string, message?: string): number {
    const startTime = this.startTimes.get(operationId);
    if (startTime === undefined) {
      this.warn(`Timer not found for operation: ${operationId}`);
      return 0;
    }

    const duration = Math.round(performance.now() - startTime);
    this.startTimes.delete(operationId);

    if (message) {
      this.info(message, { operation: operationId, duration });
    }

    return duration;
  }

  /**
   * Log an operation with automatic timing
   */
  async logOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const timerId = `${operation}-${Date.now()}`;
    this.startTimer(timerId);
    this.debug(`Starting operation: ${operation}`, { metadata });

    try {
      const result = await fn();
      const duration = this.endTimer(timerId);
      this.info(`Completed operation: ${operation}`, { duration, metadata });
      return result;
    } catch (error) {
      const duration = this.endTimer(timerId);
      this.error(`Failed operation: ${operation}`, {
        duration,
        metadata: { ...metadata, error: error instanceof Error ? error.message : String(error) },
      });
      throw error;
    }
  }

  /**
   * Set the log level dynamically
   */
  setLevel(level: LogLevel): void {
    this.level = level;
    this.info(`Log level changed to: ${LogLevel[level]}`);
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);
export const startTimer = logger.startTimer.bind(logger);
export const endTimer = logger.endTimer.bind(logger);
export const logOperation = logger.logOperation.bind(logger);

