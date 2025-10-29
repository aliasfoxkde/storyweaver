#!/bin/bash

# Production Deployment Verification Script
# Checks if the CSS fix is deployed to production

PRODUCTION_URL="https://6480a433.storyweaver-8gh.pages.dev/"

echo "========================================="
echo "Production Deployment Verification"
echo "========================================="
echo ""
echo "Production URL: $PRODUCTION_URL"
echo "Date: $(date)"
echo ""

# Check if site is accessible
echo "1. Checking site accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Site is accessible (HTTP $HTTP_CODE)"
else
    echo "   ❌ Site returned HTTP $HTTP_CODE"
    exit 1
fi
echo ""

# Get the CSS file name
echo "2. Checking CSS file..."
CSS_FILE=$(curl -s "$PRODUCTION_URL" | grep -o 'index-[^.]*\.css' | head -1)
echo "   CSS file: $CSS_FILE"
echo ""

# Download and check CSS content
echo "3. Checking CSS content..."
CSS_URL="${PRODUCTION_URL}assets/${CSS_FILE}"
echo "   CSS URL: $CSS_URL"

# Check for quoted font
QUOTED_COUNT=$(curl -s "$CSS_URL" | grep -o '"Baloo 2"' | wc -l)
echo "   Quoted 'Baloo 2' count: $QUOTED_COUNT"

# Check for unquoted font (excluding the quoted ones)
UNQUOTED_COUNT=$(curl -s "$CSS_URL" | grep -o 'Baloo 2,' | wc -l)
ACTUAL_UNQUOTED=$((UNQUOTED_COUNT - QUOTED_COUNT))
echo "   Unquoted 'Baloo 2' count: $ACTUAL_UNQUOTED"
echo ""

# Determine if fix is deployed
echo "4. CSS Fix Status:"
if [ "$QUOTED_COUNT" -gt 0 ] && [ "$ACTUAL_UNQUOTED" -eq 0 ]; then
    echo "   ✅ CSS FIX IS DEPLOYED"
    echo "   All font-family declarations are properly quoted"
    exit 0
else
    echo "   ❌ CSS FIX IS NOT DEPLOYED"
    echo "   Font-family declarations are not properly quoted"
    
    # Show sample of the CSS
    echo ""
    echo "   Sample CSS (first 3 font-family declarations):"
    curl -s "$CSS_URL" | grep -o 'font-family:[^;]*' | head -3 | sed 's/^/      /'
    
    exit 1
fi

