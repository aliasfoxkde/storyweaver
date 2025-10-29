import { test, expect } from '@playwright/test';

test.describe('Production Deployment Verification', () => {
  const PRODUCTION_URL = 'https://6480a433.storyweaver-8gh.pages.dev/';
  
  test('should verify CSS is loaded and styled correctly', async ({ page, browserName }) => {
    console.log(`\n🔍 Checking production deployment at: ${PRODUCTION_URL}`);
    console.log(`   Browser: ${browserName}\n`);
    
    const cssErrors: string[] = [];
    const allConsoleMessages: string[] = [];
    
    page.on('console', (msg) => {
      const text = msg.text();
      allConsoleMessages.push(`[${msg.type()}] ${text}`);
      
      if (msg.type() === 'error') {
        if (text.includes('CSS') || 
            text.includes('parsing') || 
            text.includes('font-family') ||
            text.includes('webkit-text-size-adjust') ||
            text.includes('Declaration dropped')) {
          cssErrors.push(text);
        }
      }
    });
    
    // Navigate to production
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: `tests/screenshots/production-${browserName}-${Date.now()}.png`, 
      fullPage: true 
    });
    
    // Check for CSS errors
    if (cssErrors.length > 0) {
      console.log('❌ CSS ERRORS DETECTED:');
      cssErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log('✅ No CSS parsing errors');
    }
    
    // Check if page is styled
    const bodyBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    const bodyFont = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });
    
    console.log(`\n📊 Styling Status:`);
    console.log(`   Background: ${bodyBgColor}`);
    console.log(`   Font: ${bodyFont}`);
    
    // Check if heading is visible
    const heading = page.getByRole('heading', { name: 'StoryWeaver AI' });
    const isHeadingVisible = await heading.isVisible();
    console.log(`   Heading visible: ${isHeadingVisible}`);
    
    // Get CSS file name
    const cssFileName = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      return links.map(link => (link as HTMLLinkElement).href);
    });
    
    console.log(`\n📁 CSS Files:`);
    cssFileName.forEach(file => console.log(`   - ${file}`));
    
    // Check if CSS is actually loaded
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
    
    console.log(`   CSS rules loaded: ${cssRuleCount}`);
    
    // Determine if fix is deployed
    const isFixed = bodyFont.includes('Baloo 2') && 
                    bodyBgColor === 'rgb(239, 246, 255)' &&
                    cssErrors.length === 0;
    
    console.log(`\n${isFixed ? '✅' : '❌'} CSS Fix Status: ${isFixed ? 'DEPLOYED' : 'NOT DEPLOYED'}\n`);
    
    // Log all console messages for debugging
    if (allConsoleMessages.length > 0) {
      console.log('📝 All console messages:');
      allConsoleMessages.slice(0, 10).forEach(msg => console.log(`   ${msg}`));
      if (allConsoleMessages.length > 10) {
        console.log(`   ... and ${allConsoleMessages.length - 10} more`);
      }
    }
  });
  
  test('should check CSS file content', async ({ page, browserName }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    
    // Get the CSS file URL
    const cssUrl = await page.evaluate(() => {
      const link = document.querySelector('link[rel="stylesheet"]') as HTMLLinkElement;
      return link ? link.href : null;
    });
    
    if (cssUrl) {
      console.log(`\n🔍 Checking CSS file: ${cssUrl}`);
      
      // Fetch the CSS content
      const cssContent = await page.evaluate(async (url) => {
        const response = await fetch(url);
        return await response.text();
      }, cssUrl);
      
      // Check for the fix
      const hasQuotedFont = cssContent.includes('"Baloo 2"');
      const hasUnquotedFont = cssContent.includes('Baloo 2,') && !cssContent.includes('"Baloo 2",');
      
      console.log(`   Contains "Baloo 2" (quoted): ${hasQuotedFont}`);
      console.log(`   Contains Baloo 2 (unquoted): ${hasUnquotedFont}`);
      
      if (hasQuotedFont && !hasUnquotedFont) {
        console.log('   ✅ CSS fix is present in the file');
      } else {
        console.log('   ❌ CSS fix is NOT present in the file');
      }
    }
  });
});

