import { test, expect } from '@playwright/test';

test.describe('CSS Fix Verification', () => {
  test('should display styled welcome screen with gradients and colors', async ({ page }) => {
    // Navigate to the preview server
    await page.goto('http://localhost:4173');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check that the welcome screen is visible
    const heading = page.getByRole('heading', { name: 'StoryWeaver AI' });
    await expect(heading).toBeVisible();
    
    // Check that the page has the blue background (bg-blue-50)
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // bg-blue-50 should be rgb(239, 246, 255)
    expect(bgColor).toBe('rgb(239, 246, 255)');
    
    // Check that the font family is applied
    const fontFamily = await body.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    // Should include "Baloo 2"
    expect(fontFamily).toContain('Baloo 2');
    
    // Check that the welcome screen has gradient background
    const welcomeScreen = page.locator('.min-h-screen').first();
    const background = await welcomeScreen.evaluate((el) => {
      return window.getComputedStyle(el).backgroundImage;
    });
    
    // Should have a gradient
    expect(background).toContain('gradient');
    
    // Take a screenshot to verify visual styling
    await page.screenshot({ path: 'tests/screenshots/css-fix-verification.png', fullPage: true });
    
    console.log('✅ CSS is properly applied!');
    console.log('Background color:', bgColor);
    console.log('Font family:', fontFamily);
    console.log('Gradient:', background.substring(0, 100) + '...');
  });
  
  test('should not have CSS parsing errors in console', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
    
    // Filter for CSS-related errors
    const cssErrors = consoleErrors.filter(err => 
      err.includes('CSS') || 
      err.includes('parsing') || 
      err.includes('font-family') ||
      err.includes('webkit-text-size-adjust')
    );
    
    expect(cssErrors).toHaveLength(0);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors (non-CSS):', consoleErrors);
    } else {
      console.log('✅ No console errors!');
    }
  });
});

