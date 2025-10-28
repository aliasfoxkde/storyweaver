import { test, expect } from '@playwright/test';

test.describe('Story Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Start the story
    await page.getByRole('button', { name: /Start the Adventure/i }).click();
    await expect(page.getByPlaceholder(/What should happen next/i)).toBeVisible();
  });

  test('should submit text prompt and show loading state', async ({ page }) => {
    const input = page.getByPlaceholder(/What should happen next/i);
    const submitButton = page.getByRole('button', { name: /Send prompt/i });
    
    // Type a prompt
    await input.fill('A brave knight discovers a magical sword');
    
    // Submit
    await submitButton.click();
    
    // Should show loading state
    await expect(page.getByPlaceholder(/The storyteller is thinking/i)).toBeVisible({ timeout: 2000 });
  });

  test('should display user prompt in story', async ({ page }) => {
    const input = page.getByPlaceholder(/What should happen next/i);
    const testPrompt = 'A brave knight discovers a magical sword';
    
    await input.fill(testPrompt);
    await page.getByRole('button', { name: /Send prompt/i }).click();
    
    // User's prompt should appear in the story
    await expect(page.getByText(testPrompt)).toBeVisible({ timeout: 5000 });
  });

  test('should show image loading placeholder', async ({ page }) => {
    const input = page.getByPlaceholder(/What should happen next/i);
    
    await input.fill('A dragon flies over a castle');
    await page.getByRole('button', { name: /Send prompt/i }).click();
    
    // Wait for user prompt to appear
    await expect(page.getByText('A dragon flies over a castle')).toBeVisible({ timeout: 5000 });
    
    // Should show image loading placeholder with animation
    const placeholder = page.locator('.animate-pulse').first();
    await expect(placeholder).toBeVisible({ timeout: 10000 });
    
    // Should show "Illustrating your story..." text
    await expect(page.getByText(/Illustrating your story/i)).toBeVisible({ timeout: 10000 });
  });

  test('should clear input after submission', async ({ page }) => {
    const input = page.getByPlaceholder(/What should happen next/i);
    
    await input.fill('Test prompt');
    await page.getByRole('button', { name: /Send prompt/i }).click();
    
    // Input should be cleared
    await expect(input).toHaveValue('');
  });

  test('should disable submit button when input is empty', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /Send prompt/i });
    
    // Button should be disabled when input is empty
    await expect(submitButton).toBeDisabled();
    
    // Type something
    await page.getByPlaceholder(/What should happen next/i).fill('Test');
    
    // Button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should show progressive text streaming', async ({ page }) => {
    const input = page.getByPlaceholder(/What should happen next/i);
    
    await input.fill('Tell me a short story');
    await page.getByRole('button', { name: /Send prompt/i }).click();
    
    // Wait for user prompt
    await expect(page.getByText('Tell me a short story')).toBeVisible({ timeout: 5000 });
    
    // Wait for AI response to start appearing (streaming)
    // The response should appear within a few seconds
    await page.waitForTimeout(3000);
    
    // Check that some story text has appeared (not the user's prompt)
    const storyElements = page.locator('.bg-white p');
    const count = await storyElements.count();
    expect(count).toBeGreaterThan(0);
  });
});

