#!/bin/bash
# Build APK script for CBSA App
# Usage: ./build-apk.sh

set -e

echo "======================================"
echo "CBSA App - APK Builder"
echo "======================================"

# Check if EAS is configured
if [ ! -f "eas.json" ]; then
  echo "⚠️  eas.json not found. Running configuration..."
  npx eas build:configure
fi

echo ""
echo "Choose build method:"
echo "1) Local build (faster, requires Android SDK)"
echo "2) Cloud build (slower, but works anywhere)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
  echo ""
  echo "Starting local build..."
  npx eas build --platform android --local
  echo ""
  echo "✅ Local build complete!"
  echo "APK should be in: build/outputs/bundle/release/"
  
elif [ "$choice" = "2" ]; then
  echo ""
  echo "Starting cloud build (this may take 5-10 minutes)..."
  npx eas build --platform android
  echo ""
  echo "✅ Cloud build submitted!"
  echo "Check https://expo.dev to monitor progress and download APK"
  
else
  echo "❌ Invalid choice"
  exit 1
fi

echo ""
echo "======================================"
echo "Build complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Download the APK"
echo "2. Connect phone via USB"
echo "3. Run: adb install -r app-release.apk"
echo "4. Or manually transfer and install on phone"
echo "======================================"
