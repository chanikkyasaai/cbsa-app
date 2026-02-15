# CBSA App - Step by Step APK Build Instructions

## Step 1: Initial Setup (First Time Only)

### 1a. Login to Expo
```bash
npx expo login
# Enter your Expo credentials
```

### 1b. Configure EAS Build
```bash
npx eas build:configure
# This creates `eas.json` file with build settings
# Accept the defaults for Android
```

---

## Step 2: Update Backend URL

**IMPORTANT:** Before building, update your backend URL to your PC's IP

### Find your PC's IP address:

**Windows:**
```powershell
ipconfig
# Look for: IPv4 Address (like 192.168.1.100)
```

**macOS:**
```bash
ifconfig
# Look for inet address
```

### Update the config file

Edit `config/backend.ts`:

```typescript
// Replace localhost with your PC's IP
const DEV_CONFIG = {
  WS_URL: 'ws://192.168.1.100:8000/ws/behaviour',  // ← YOUR PC'S IP
  REST_URL: 'http://192.168.1.100:8000',
};
```

---

## Step 3: Build the APK

### Option A: Quick Cloud Build (Recommended)
```bash
npx eas build --platform android
```

This will:
- Build your app on Expo's servers
- Show a progress link
- Provide a download link when done
- Takes 5-10 minutes

### Option B: Local Build (Requires Android SDK)
```bash
npx eas build --platform android --local
```

Monitor progress:
```bash
# In another terminal
npx eas build:list
```

---

## Step 4: Download the APK

### From Cloud Build:
1. Go to the link shown in terminal (usually https://expo.dev)
2. Find your build
3. Click "Download" to get the APK file

### From Local Build:
- APK will be in: `./build/outputs/bundle/release/app-release.apk`

---

## Step 5: Install on Your Android Phone

### Option A: Via USB (Fastest)
```bash
# Connect phone via USB
# Enable USB debugging in phone settings

adb devices  # Should show your phone

# Install the APK
adb install -r path/to/app-release.apk
```

### Option B: Manual File Transfer
1. Copy APK file to phone via USB
2. On phone, go to Settings → Security → Unknown Sources (enable)
3. Open file manager
4. Find the APK file
5. Tap it and select "Install"

### Option C: Email/Cloud
1. Email yourself the APK download link
2. Open email on phone
3. Tap the link and download
4. Open the downloaded file and install

---

## Step 6: Launch & Test

1. Find "cbsa" app on your phone
2. Tap to open
3. Make sure your backend is running: `http://YOUR_PC_IP:8000`
4. Test the app functionality
5. Check backend logs to see if behavioral data is being received

---

## Rebuilding After Code Changes

When you make changes and want to update the app:

```bash
# 1. Make your code changes
# 2. Update backend URL if needed (in config/backend.ts)
# 3. Build again
npx eas build --platform android

# 4. Wait for build to complete
# 5. Download new APK
# 6. Reinstall
adb install -r app-release.apk
```

---

## Useful Commands

```bash
# Check if adb/phone is connected
adb devices

# View app logs
adb logcat | grep cbsa

# Uninstall old version
adb uninstall com.cbsa.app

# List your builds
npx eas build:list

# Check build status
npx eas build:view <BUILD_ID>
```

---

## Troubleshooting

### "Device not found" error
```bash
# Phone might not have USB debugging enabled
# Settings → Developer Options → USB Debugging → ON
# Try: adb devices
```

### APK won't install
```bash
# Uninstall old version first
adb uninstall com.cbsa.app
adb install -r app-release.apk
```

### App crashes on startup
1. Check phone logs: `adb logcat`
2. Verify backend IP in `config/backend.ts`
3. Make sure backend is running and accessible
4. Check that phone and PC are on same network

### "eas.json not found"
```bash
npx eas build:configure
```

### Can't login to Expo
```bash
npx expo logout
npx expo login
```

---

## What You'll Have After This

✅ **Standalone APK** - Install on any Android phone
✅ **No PC needed** - Phone doesn't connect to your PC
✅ **Direct backend connection** - Connects to your backend server
✅ **Easy updates** - Just rebuild and reinstall APK

---

## Next Steps

1. **Make code changes** as needed
2. **Rebuild APK**: `npx eas build --platform android`
3. **Reinstall**: `adb install -r app-release.apk`
4. **Test on phone** - No development PC needed!

---

Need help? Check:
- Terminal output for specific error messages
- `adb logcat` for app crash details
- Backend logs to confirm data is being received
