#!/bin/bash

# CheckTang - Capacitor Android Build Script
# This script builds the app as an optimized, static SPA for Android deployment
# 
# Usage: 
#   ./scripts/build-android.sh        # Build and sync
#   ./scripts/build-android.sh --run  # Build, sync, and run on device/emulator

set -e

echo "🔧 CheckTang Android Build Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean previous builds
echo -e "${YELLOW}Step 1: Cleaning previous builds...${NC}"
rm -rf dist/
echo -e "${GREEN}✓ Clean complete${NC}"

# Step 2: Build optimized production bundle with Capacitor configuration
echo -e "${YELLOW}Step 2: Building optimized production bundle...${NC}"
npm run build:capacitor
echo -e "${GREEN}✓ Build complete${NC}"

# Step 3: Verify build output
echo -e "${YELLOW}Step 3: Verifying build output...${NC}"

if [ ! -f "dist/client/index.html" ]; then
    echo -e "${RED}✗ Error: dist/client/index.html not found${NC}"
    exit 1
fi

# Check that paths are relative (start with ./)
if grep -q 'src="/' dist/client/index.html 2>/dev/null || grep -q 'href="/' dist/client/index.html 2>/dev/null; then
    if ! grep -q 'src="./' dist/client/index.html 2>/dev/null && ! grep -q 'href="./' dist/client/index.html 2>/dev/null; then
        echo -e "${YELLOW}⚠ Warning: Some asset paths may not be relative${NC}"
    fi
fi

echo -e "${GREEN}✓ Build verification passed${NC}"

# Step 4: Sync with Capacitor
echo -e "${YELLOW}Step 4: Syncing with Capacitor Android...${NC}"
npx cap sync android
echo -e "${GREEN}✓ Capacitor sync complete${NC}"

# Step 5: Check if --run flag was passed
if [ "$1" = "--run" ]; then
    echo -e "${YELLOW}Step 5: Running on Android device/emulator...${NC}"
    npx cap run android
elif [ "$1" = "--open" ]; then
    echo -e "${YELLOW}Step 5: Opening Android Studio...${NC}"
    npx cap open android
else
    echo ""
    echo -e "${GREEN}✓ Build complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  - Open Android Studio:  npx cap open android"
    echo "  - Run on device:        npx cap run android"
    echo "  - Or use:               ./scripts/build-android.sh --run"
fi

echo ""
echo "Build output: dist/client/"
echo "Android app:  android/app/src/main/assets/public/"
