# APK Build - Quick Reference

## 🚀 First Time Setup (One-Time)

```bash
# Login to Expo
npx expo login

# Configure for builds
npx eas build:configure
```

---

## 📦 Build & Install (Fastest Path)

### Windows PowerShell:
```powershell
# Option A: Run the helper script
.\build-apk.bat

# Option B: Manual cloud build
npx eas build --platform android

# After download, install with ADB:
adb install -r .\path\to\app-release.apk
```

### macOS/Linux:
```bash
# Run helper script
chmod +x build-apk.sh
./build-apk.sh

# Or manual build
npx eas build --platform android
```

---

## 🔄 Quick Rebuild (After Code Changes)

```bash
# 1. Build
npx eas build --platform android

# 2. Download APK from https://expo.dev

# 3. Install on phone
adb install -r app-release.apk
```

---

## 📱 Update Backend URL (Important!)

Before building, update your PC's IP in `config/backend.ts`:

```bash
# Find your PC's IP
ipconfig  # Windows - look for "IPv4 Address"
ifconfig # macOS/Linux

# Update config/backend.ts
const DEV_CONFIG = {
  WS_URL: 'ws://192.168.1.100:8000/ws/behaviour',  // ← Your PC's IP
  REST_URL: 'http://192.168.1.100:8000',
};
```

---

## ✅ Installation Methods

### Method 1: ADB (Fastest)
```bash
# Phone connected via USB
adb install -r app-release.apk
```

### Method 2: Manual Transfer
1. Copy APK to phone via USB
2. Open file manager on phone
3. Tap APK file and install

### Method 3: Email/Web
1. Send APK download link to phone
2. Open link and install

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "eas.json not found" | Run `npx eas build:configure` |
| App won't connect to backend | Check IP in `config/backend.ts` |
| APK won't install | Run `adb uninstall com.cbsa.app` first |
| Can't find APK | Check https://expo.dev downloads |

---

## 📊 Build Status

Check your builds anytime:
```bash
npx eas build:list
```

Download link: https://expo.dev/projects/[project-id]

---

## 💡 Pro Tips

- **First build takes longer** (5-10 min) - subsequent builds are faster
- **Phone doesn't need to be connected** after APK is installed
- **Backend needs to be running** at the configured IP:port
- **Update `config/backend.ts`** before each build if testing from different network
