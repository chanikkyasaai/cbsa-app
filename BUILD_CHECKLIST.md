# CBSA App - Complete Build & Run Checklist

## ✅ Pre-Build Checklist

### Accounts & Setup
- [ ] Expo account created (https://expo.dev)
- [ ] `npx expo login` executed and successful
- [ ] `npx eas build:configure` completed
- [ ] `eas.json` file exists in project root

### Code Preparation
- [ ] All code changes committed (good practice)
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] App builds locally: `npx expo start` works

### Backend Configuration
- [ ] Find PC IP: `ipconfig` (Windows) or `ifconfig` (Mac)
- [ ] Update `config/backend.ts` with your PC's IP
  ```
  DEV_CONFIG = {
    WS_URL: 'ws://192.168.1.xxx:8000/ws/behaviour',
    REST_URL: 'http://192.168.1.xxx:8000',
  }
  ```
- [ ] Backend server is running and accessible from PC

### Phone Preparation
- [ ] Android phone with USB cable (if using ADB method)
- [ ] USB debugging enabled: Settings → Developer Options → USB Debugging
- [ ] Phone unlocked and screen not sleeping
- [ ] ADB recognizes phone: `adb devices` shows your phone

---

## 🔨 Build Phase

### Cloud Build (Recommended)

```bash
# Step 1: Initiate build
npx eas build --platform android

# Step 2: Wait for build to complete (5-10 minutes)
# Monitor at: https://expo.dev

# Step 3: Download APK when ready
# Link: https://expo.dev/builds
```

Progress checklist:
- [ ] Build started successfully
- [ ] No authentication errors
- [ ] Build progressing on https://expo.dev
- [ ] APK download link received

---

## 📥 Installation Phase

### Via USB (Fastest)

```bash
# Step 1: Verify device connected
adb devices
# Should show: [phone-id] device

# Step 2: Uninstall old version (if exists)
adb uninstall com.cbsa.app

# Step 3: Install new APK
adb install -r app-release.apk
# Should show: Success

# Step 4: Verify installation
adb shell pm list packages | grep cbsa
```

Installation checklist:
- [ ] Phone shows in `adb devices`
- [ ] Old version uninstalled (if existed)
- [ ] `adb install` shows "Success"
- [ ] App appears on phone home screen

### Via Manual Transfer

```bash
# Step 1: Connect phone via USB
# Step 2: Copy APK to phone (via file explorer)
# Step 3: On phone: Open file manager → find APK
# Step 4: Tap APK and select "Install"
# Step 5: Grant permissions if prompted
```

Manual install checklist:
- [ ] APK copied to phone
- [ ] File manager shows the APK
- [ ] Install dialog appeared
- [ ] Installation completed

---

## 🧪 Testing Phase

### Launch & Basic Tests

```bash
# Step 1: Open app from phone home screen
# (Look for "cbsa" icon)

# Step 2: Check connection status
# App should attempt to connect to backend

# Step 3: Verify backend IP
# Check logs: adb logcat | grep WebSocket

# Step 4: Perform test interactions
# - Tap buttons
# - Scroll screens
# - Enter text
```

Testing checklist:
- [ ] App launches without crashing
- [ ] No immediate error messages
- [ ] WebSocket connects (check logs)
- [ ] UI is responsive
- [ ] Can navigate between screens

### Verify Backend Connection

```bash
# In another terminal, check your backend
# Should see incoming behavioral events

# Or check with curl:
curl http://192.168.1.xxx:8000/health
# Should return: {"status": "healthy", ...}
```

Backend checklist:
- [ ] Backend is running
- [ ] WebSocket endpoint accessible
- [ ] App connects (check backend logs)
- [ ] Behavioral data is being received

---

## 🚨 Troubleshooting Checklist

If something doesn't work, check in order:

### App Won't Launch
- [ ] APK installed successfully: `adb shell pm list packages | grep cbsa`
- [ ] No permission errors: `adb logcat | grep cbsa`
- [ ] Android version compatible (minSdk checked)
- [ ] Storage space available on phone

### App Crashes on Startup
- [ ] Backend IP correct in `config/backend.ts`
- [ ] Backend server is running
- [ ] Phone and PC on same network
- [ ] Check logs: `adb logcat | grep ERROR`
- [ ] Try reinstall: `adb uninstall com.cbsa.app && adb install -r app-release.apk`

### Can't Connect to Backend
- [ ] Phone and PC on same WiFi network
- [ ] Firewall not blocking port 8000
- [ ] Backend URL in `config/backend.ts` is correct
- [ ] Test connectivity: `adb shell ping 192.168.1.xxx`
- [ ] Check backend logs for connection errors

### ADB Issues
- [ ] Phone plugged in and unlocked
- [ ] USB debugging enabled
- [ ] Correct cable (try different one)
- [ ] Try: `adb kill-server && adb start-server`
- [ ] Try: `adb devices` to see if phone appears

### Build Failed
- [ ] Check error message in Expo dashboard
- [ ] Verify EAS is configured: `cat eas.json`
- [ ] Try again (sometimes transient errors)
- [ ] Check internet connection
- [ ] Try: `npx eas build:configure` again

---

## 📋 Development Workflow (Going Forward)

After successful first installation:

```bash
# Make code changes
# ↓
# npm run lint (optional but good)
# ↓
npx eas build --platform android
# ↓
# Download APK from https://expo.dev
# ↓
adb install -r app-release.apk
# ↓
# Test on phone
# ↓
# Iterate
```

Workflow checklist:
- [ ] Code changes made
- [ ] No TypeScript errors
- [ ] Backend URL updated if needed
- [ ] Build initiated
- [ ] APK downloaded
- [ ] APK installed
- [ ] App tested

---

## ✨ Success Criteria

Your build is successful when:

- ✅ APK installs without errors
- ✅ App launches on phone
- ✅ No immediate crashes
- ✅ WebSocket connects to backend
- ✅ UI is responsive
- ✅ Backend receives behavioral data
- ✅ App works without PC connection
- ✅ Can reinstall without rebuilding from repo

---

## 🎉 Congratulations!

If all checklist items are completed, you now have:

- A standalone APK that works on any Android phone
- No need to connect to development PC
- Direct connection to backend via WebSocket
- Automatic behavioral data streaming
- Easy update workflow for future changes

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Check phone connected | `adb devices` |
| View logs | `adb logcat` |
| Install APK | `adb install -r app-release.apk` |
| Uninstall | `adb uninstall com.cbsa.app` |
| Build app | `npx eas build --platform android` |
| List builds | `npx eas build:list` |
| Check config | `cat config/backend.ts` |

---

## 📖 Related Docs

- **APK_QUICK_START.md** - Quick commands reference
- **STEP_BY_STEP_APK.md** - Detailed walkthrough
- **BUILD_APK.md** - Comprehensive guide
- **APK_DOCS_SUMMARY.md** - Overview of all docs

---

**Last Updated:** February 15, 2026
**Status:** Ready for production APK builds
