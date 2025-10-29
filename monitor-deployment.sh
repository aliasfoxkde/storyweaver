#!/bin/bash

# Real-time Production Deployment Monitor
# Checks production site every 30 seconds for CSS fix deployment

PRODUCTION_URL="https://6480a433.storyweaver-8gh.pages.dev/"
MAX_CHECKS=20  # 20 checks * 30 seconds = 10 minutes max
CHECK_INTERVAL=30

echo "========================================="
echo "Production Deployment Monitor"
echo "========================================="
echo "Production URL: $PRODUCTION_URL"
echo "Started: $(date)"
echo "Max monitoring time: $((MAX_CHECKS * CHECK_INTERVAL / 60)) minutes"
echo ""

for i in $(seq 1 $MAX_CHECKS); do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Check #$i of $MAX_CHECKS - $(date)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check CSS file name
    CSS_FILE=$(curl -s "$PRODUCTION_URL" | grep -o 'index-[^.]*\.css' | head -1)
    echo "📄 CSS File: $CSS_FILE"
    
    # Check if it's the new file
    if [ "$CSS_FILE" = "index-CAXwH0bl.css" ]; then
        echo ""
        echo "🎉 SUCCESS! New CSS file detected!"
        echo ""
        
        # Verify CSS content
        echo "Verifying CSS content..."
        CSS_URL="${PRODUCTION_URL}assets/${CSS_FILE}"
        
        # Check for properly quoted font
        QUOTED_COUNT=$(curl -s "$CSS_URL" | grep -c '"Baloo 2"')
        echo "   ✅ Quoted 'Baloo 2' instances: $QUOTED_COUNT"
        
        # Check for unquoted font (the bug)
        UNQUOTED=$(curl -s "$CSS_URL" | grep -o 'font-family:Baloo 2,cursive' | head -1)
        if [ -z "$UNQUOTED" ]; then
            echo "   ✅ No unquoted 'Baloo 2' found (bug is fixed!)"
        else
            echo "   ❌ WARNING: Unquoted 'Baloo 2' still found!"
        fi
        
        echo ""
        echo "Sample CSS (first 3 font-family declarations):"
        curl -s "$CSS_URL" | grep -o 'font-family:[^;]*' | head -3 | sed 's/^/   /'
        
        echo ""
        echo "========================================="
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo "========================================="
        echo "Completed: $(date)"
        echo "Total time: $((i * CHECK_INTERVAL)) seconds"
        exit 0
    
    elif [ "$CSS_FILE" = "index-CXIJUCkE.css" ]; then
        echo "⏳ Status: Still serving OLD CSS file (broken version)"
        echo "   Waiting for Cloudflare Pages to rebuild..."
    
    else
        echo "🔍 Status: Different CSS file detected: $CSS_FILE"
        echo "   Checking if this is the fixed version..."
        
        # Check CSS content
        CSS_URL="${PRODUCTION_URL}assets/${CSS_FILE}"
        UNQUOTED=$(curl -s "$CSS_URL" | grep -o 'font-family:Baloo 2,cursive' | head -1)
        
        if [ -z "$UNQUOTED" ]; then
            echo "   ✅ This appears to be a FIXED version!"
            echo ""
            echo "========================================="
            echo "✅ DEPLOYMENT SUCCESSFUL!"
            echo "========================================="
            exit 0
        else
            echo "   ❌ This still has the bug (unquoted font)"
        fi
    fi
    
    # Don't sleep on the last check
    if [ $i -lt $MAX_CHECKS ]; then
        echo ""
        echo "Next check in $CHECK_INTERVAL seconds..."
        sleep $CHECK_INTERVAL
    fi
done

echo ""
echo "========================================="
echo "❌ TIMEOUT: Deployment not detected"
echo "========================================="
echo "Monitored for: $((MAX_CHECKS * CHECK_INTERVAL / 60)) minutes"
echo "CSS file still: $CSS_FILE"
echo ""
echo "Possible issues:"
echo "1. Cloudflare Pages auto-deploy not configured"
echo "2. Cloudflare Pages build queue delay"
echo "3. Cloudflare Pages build failing"
echo "4. Manual deployment required via dashboard"
echo ""
echo "Next steps:"
echo "- Check Cloudflare Pages dashboard for build status"
echo "- Check Cloudflare Pages build logs for errors"
echo "- Consider manual deployment via dashboard"
exit 1

