import { test, expect } from '@playwright/test';

test.describe('Welcome Screen', () => {
  test('should display welcome screen on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Check for welcome screen elements
    await expect(page.getByRole('heading', { name: 'StoryWeaver AI' })).toBeVisible();
    await expect(page.getByText(/Let's create a magical story together/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Start the Adventure/i })).toBeVisible();
  });

  test('should start story when clicking Start button', async ({ page }) => {
    await page.goto('/');
    
    // Click start button
    await page.getByRole('button', { name: /Start the Adventure/i }).click();
    
    // Should show chat interface
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
    
    // Should show header
    await expect(page.getByRole('heading', { name: 'StoryWeaver AI' })).toBeVisible();
  });

  test('should have proper styling and layout', async ({ page }) => {
    await page.goto('/');
    
    const welcomeScreen = page.locator('.min-h-screen');
    await expect(welcomeScreen).toBeVisible();
    
    // Check gradient background
    await expect(welcomeScreen).toHaveClass(/bg-gradient-to-br/);
  });
});

