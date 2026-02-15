# CBSA App - Building APK for Standalone Use

This guide will help you build a standalone APK that can be installed on your Android phone without needing to connect to your development PC.

## Prerequisites

1. **Expo Account** - Required to build APKs
   - Sign up at https://expo.dev if you don't have an account
   - Login locally: `npx expo login`

2. **Node.js & npm** - Already installed

## Quick Build & Install (Recommended)

### Option 1: Build and Install Directly (Fastest)

```bash
# From project root
npx expo prebuild --clean
npx eas build --platform android --local
```

Then install the APK on your phone:
```bash
# After the build completes, it will show the APK path
adb install path/to/app-release.apk
```

### Option 2: Cloud Build (Recommended for First Time)

If you haven't set up Expo locally, use the cloud build:

```bash
# Initialize EAS (one-time setup)
npx eas build:configure

# Build on Expo servers
npx eas build --platform android
```

This will:
1. Build your app on Expo's servers
2. Generate a download link for the APK
3. You can download and install it directly on your phone

## Installation Methods

### Method 1: Using ADB (if phone is connected via USB)

```bash
adb install -r app-release.apk
```

### Method 2: Direct Transfer & Install

1. Download the APK from the build link
2. Transfer to your phone via USB
3. On phone: Go to `Settings > Security > Unknown Sources` (allow installation)
4. Open file manager, tap the APK, and install

### Method 3: Install via Web

1. Get the APK download link from the build
2. Send the link to your phone (email, chat, etc.)
3. Open link on phone and install

## For Subsequent Builds

After making code changes:

```bash
# Just rebuild
npx eas build --platform android

# Download new APK and reinstall
adb install -r new-app-release.apk
```

## Environment Variables for Backend URL

The app currently uses `http://localhost:8000/ws/behaviour` for the WebSocket.

For Android on your local network, update `config/backend.ts`:

```typescript
// If testing on physical phone on same network:
const DEV_CONFIG = {
  WS_URL: 'ws://192.168.x.x:8000/ws/behaviour',  // Your PC's IP
  REST_URL: 'http://192.168.x.x:8000',
};
```

Find your PC's IP:
```bash
ipconfig  # Look for IPv4 Address
```

## Troubleshooting

### "Build not found" or permission denied

```bash
npx expo login  # Login to Expo
npx eas whoami  # Verify you're logged in
```

### APK installation fails

```bash
# Uninstall old version first
adb uninstall com.cbsa.app

# Then install new one
adb install -r app-release.apk
```

### App crashes on startup

1. Check logcat: `adb logcat`
2. Make sure backend is running at the correct URL
3. Verify all permissions are granted on phone

## Development Workflow Going Forward

```
Code Changes
    ↓
npx eas build --platform android
    ↓
Download APK
    ↓
adb install -r app-release.apk
    ↓
Test on phone
```

## Full Local Build (Advanced)

If you want to build locally without cloud:

```bash
# Install build tools
npm install -g eas-cli

# Configure for local builds
npx eas build --platform android --local

# Requires Android SDK setup (complex)
# Recommended: Use cloud build instead
```

---

**Next Steps:**
1. Run: `npx eas build:configure`
2. Run: `npx eas build --platform android`
3. Download APK when ready
4. Install on phone: `adb install -r app.apk`
5. Update `config/backend.ts` with your PC's IP address
6. Profit! 🎉
