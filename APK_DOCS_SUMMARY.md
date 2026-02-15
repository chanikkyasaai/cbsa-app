# APK Build Documentation - Summary

I've created comprehensive guides to help you build and run the CBSA app as a standalone APK on your Android phone.

## 📄 New Files Created

### 1. **APK_QUICK_START.md** ⭐ START HERE
   - Quick reference for common tasks
   - Build methods comparison
   - Troubleshooting table
   - **Best for:** Quick lookups and reminders

### 2. **STEP_BY_STEP_APK.md** ⭐ DETAILED GUIDE
   - Complete walkthrough from setup to testing
   - Finding your PC's IP address
   - All installation methods explained
   - Troubleshooting with solutions
   - **Best for:** First time or when you get stuck

### 3. **BUILD_APK.md**
   - Comprehensive overview of all options
   - Prerequisites and setup
   - Development workflow
   - Advanced local build info
   - **Best for:** Understanding all possibilities

### 4. **build-apk.bat** (Windows)
   - Interactive helper script
   - Run: `.\build-apk.bat`

### 5. **build-apk.sh** (macOS/Linux)
   - Interactive helper script
   - Run: `chmod +x build-apk.sh && ./build-apk.sh`

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. One-time setup
npx expo login
npx eas build:configure

# 2. Update your PC's IP in config/backend.ts
# Find IP: ipconfig (Windows) or ifconfig (Mac)
# Change localhost to 192.168.x.x

# 3. Build
npx eas build --platform android

# 4. Download APK from https://expo.dev

# 5. Install
adb install -r app-release.apk

# Done! 🎉
```

---

## 💡 Key Points

| Item | Details |
|------|---------|
| **Time to build** | 5-10 minutes (first time) |
| **Build type** | Cloud build recommended (works anywhere) |
| **Installation** | USB or manual file transfer |
| **Phone needs** | USB debugging enabled |
| **Backend** | Must be running at configured IP:port |
| **After install** | No PC needed, app runs independently |

---

## 📖 Where to Find Answers

| Question | Read This |
|----------|-----------|
| "How do I start?" | STEP_BY_STEP_APK.md |
| "What's the command again?" | APK_QUICK_START.md |
| "Why isn't it working?" | BUILD_APK.md (Troubleshooting section) |
| "I want to understand everything" | BUILD_APK.md |

---

## ✅ Checklist Before Building

- [ ] Expo account created (signup at https://expo.dev)
- [ ] Logged in locally: `npx expo login`
- [ ] EAS configured: `npx eas build:configure`
- [ ] Backend URL updated in `config/backend.ts`
- [ ] Your PC's IP address found (ipconfig)
- [ ] Backend server running and accessible

---

## 📱 What Happens Next

After you build and install the APK:

1. **App installs** on your phone like any other Android app
2. **No PC connection needed** - app runs independently
3. **Connects to backend** at the IP address you configured
4. **Sends behavioral data** via WebSocket
5. **Works offline** (behavior is queued when backend unavailable)

---

## 🔄 Update Workflow Going Forward

Every time you make code changes:

```
1. Make code changes
2. Update config/backend.ts if needed
3. Run: npx eas build --platform android
4. Download APK when ready
5. Install: adb install -r app-release.apk
6. Test on phone
```

---

## 🆘 Help Resources

If you run into issues:

1. **Check the docs above** (likely answer is there)
2. **Read terminal output** (error messages are usually helpful)
3. **Check phone logs**: `adb logcat`
4. **Verify backend**: Is it running? Is IP correct?
5. **Check network**: Phone and PC on same WiFi?

---

## Next Steps

👉 **Read:** `STEP_BY_STEP_APK.md` to get started

Or if you're in a hurry:

```bash
# Just run this
npx eas build:configure
# ... wait for it to finish ...
npx eas build --platform android
# ... download APK when ready ...
adb install -r app-release.apk
```

Enjoy your standalone app! 🚀
