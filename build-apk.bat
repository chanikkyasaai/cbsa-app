@echo off
REM Build APK script for CBSA App (Windows)
REM Usage: build-apk.bat

cls
echo ======================================
echo CBSA App - APK Builder
echo ======================================
echo.

REM Check if eas.json exists
if not exist "eas.json" (
  echo [!] eas.json not found. Running configuration...
  call npx eas build:configure
)

echo.
echo Choose build method:
echo 1) Local build (faster, requires Android SDK)
echo 2) Cloud build (slower, but works anywhere)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
  echo.
  echo Starting local build...
  call npx eas build --platform android --local
  echo.
  echo [+] Local build complete!
  echo APK should be in: build/outputs/bundle/release/
  
) else if "%choice%"=="2" (
  echo.
  echo Starting cloud build (this may take 5-10 minutes)...
  call npx eas build --platform android
  echo.
  echo [+] Cloud build submitted!
  echo Check https://expo.dev to monitor progress and download APK
  
) else (
  echo [-] Invalid choice
  exit /b 1
)

echo.
echo ======================================
echo Build complete! [+]
echo.
echo Next steps:
echo 1. Download the APK
echo 2. Connect phone via USB
echo 3. Run: adb install -r app-release.apk
echo 4. Or manually transfer and install on phone
echo ======================================
pause
