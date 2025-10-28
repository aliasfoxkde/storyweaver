import { test, expect } from '@playwright/test';

test.describe('Production CSS Fix Verification', () => {
  test('should load CSS without parsing errors in Firefox', async ({ page, browserName }) => {
    // This test specifically verifies the Firefox CSS parsing issue is fixed
    const cssErrors: string[] = [];
    const allErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        allErrors.push(text);
        
        // Check for CSS-related errors
        if (text.includes('CSS') || 
            text.includes('parsing') || 
            text.includes('font-family') ||
            text.includes('webkit-text-size-adjust') ||
            text.includes('Declaration dropped')) {
          cssErrors.push(text);
        }
      }
    });
    
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify no CSS parsing errors
    expect(cssErrors).toHaveLength(0);
    
    console.log(`✅ [${browserName}] No CSS parsing errors detected`);
    if (allErrors.length > 0) {
      console.log(`   Other errors (non-CSS): ${allErrors.length}`);
    }
  });
  
  test('should apply Baloo 2 font correctly', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check body font-family
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    // Should include "Baloo 2" (with quotes in the computed style)
    expect(bodyFont).toMatch(/Baloo 2|"Baloo 2"/);
    
    console.log(`✅ [${browserName}] Font applied: ${bodyFont}`);
  });
  
  test('should apply background color correctly', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check body background color (bg-blue-50)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    // bg-blue-50 is rgb(239, 246, 255)
    expect(bgColor).toBe('rgb(239, 246, 255)');
    
    console.log(`✅ [${browserName}] Background color: ${bgColor}`);
  });
  
  test('should render styled welcome screen', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that the welcome screen heading is visible
    const heading = page.getByRole('heading', { name: 'StoryWeaver AI' });
    await expect(heading).toBeVisible();
    
    // Check that the heading has styling (not default browser styles)
    const headingStyles = await heading.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: styles.color,
      };
    });
    
    // Font size should be larger than default (16px)
    const fontSize = parseFloat(headingStyles.fontSize);
    expect(fontSize).toBeGreaterThan(16);
    
    console.log(`✅ [${browserName}] Heading styled:`, headingStyles);
  });
  
  test('should load CSS file successfully', async ({ page, browserName }) => {
    const cssLoaded = await page.evaluate(() => {
      // Check if any stylesheet is loaded
      const stylesheets = Array.from(document.styleSheets);
      return stylesheets.length > 0;
    });
    
    expect(cssLoaded).toBe(true);
    
    const cssCount = await page.evaluate(() => {
      return document.styleSheets.length;
    });
    
    console.log(`✅ [${browserName}] CSS files loaded: ${cssCount}`);
  });
  
  test('should have valid CSS rules', async ({ page, browserName }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const cssRuleCount = await page.evaluate(() => {
      let totalRules = 0;
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          if (sheet.cssRules) {
            totalRules += sheet.cssRules.length;
          }
        } catch (e) {
          // CORS or other access issues
        }
      });
      return totalRules;
    });
    
    // Should have many CSS rules loaded
    expect(cssRuleCount).toBeGreaterThan(0);
    
    console.log(`✅ [${browserName}] CSS rules loaded: ${cssRuleCount}`);
  });
});

