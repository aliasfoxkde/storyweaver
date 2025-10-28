import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('welcome screen should match snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('welcome-screen.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('chat interface should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start the Adventure/i }).click();
    
    // Wait for chat interface to load
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('chat-interface.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('history panel should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start the Adventure/i }).click();
    
    // Open history panel
    const historyButton = page.getByRole('button').filter({ has: page.locator('svg') }).nth(1);
    await historyButton.click();
    
    // Wait for panel to open
    await expect(page.getByRole('heading', { name: 'Story So Far' })).toBeVisible();
    await page.waitForTimeout(500); // Wait for animation
    
    // Take screenshot
    await expect(page).toHaveScreenshot('history-panel.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('loading placeholder should match snapshot', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Start the Adventure/i }).click();
    
    const input = page.getByPlaceholder(/What should happen next/i);
    await input.fill('Test prompt for loading state');
    await page.getByRole('button', { name: /Send prompt/i }).click();
    
    // Wait for loading placeholder to appear
    await expect(page.getByText(/Illustrating your story/i)).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of loading state
    await expect(page).toHaveScreenshot('loading-placeholder.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

