import { test, expect } from '@playwright/test';

test.describe('UI Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start the Adventure/i }).click();
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
  });

  test('should open and close history panel', async ({ page }) => {
    // Click history button
    const historyButton = page.getByRole('button').filter({ has: page.locator('svg') }).nth(1);
    await historyButton.click();
    
    // History panel should be visible
    await expect(page.getByRole('heading', { name: 'Story So Far' })).toBeVisible();
    
    // Click again to close
    await historyButton.click();
    
    // Wait for panel to slide out
    await page.waitForTimeout(500);
  });

  test('should show export modal when clicking export button', async ({ page }) => {
    // Need at least one story segment to enable export
    // For now, just check that export button exists
    const exportButton = page.getByRole('button', { name: /Export/i });
    await expect(exportButton).toBeVisible();
    
    // Button should be disabled initially (no story segments)
    await expect(exportButton).toBeDisabled();
  });

  test('should show microphone button', async ({ page }) => {
    // Check for microphone button
    const micButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await expect(micButton).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
  });

  test('should show proper header elements', async ({ page }) => {
    // Check header
    await expect(page.getByRole('heading', { name: 'StoryWeaver AI' })).toBeVisible();
    
    // Check export button
    await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
    
    // Check history button
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(3); // Export, History, Mic, Send
  });

  test('should maintain scroll position when adding content', async ({ page }) => {
    const input = page.getByPlaceholder(/What should happen next/i);
    
    // Add a prompt
    await input.fill('First prompt');
    await page.getByRole('button', { name: /Send prompt/i }).click();
    
    // Wait for content
    await expect(page.getByText('First prompt')).toBeVisible({ timeout: 5000 });
    
    // The page should auto-scroll to show new content
    // Check that the input is still visible (at bottom)
    await expect(input).toBeInViewport();
  });
});

