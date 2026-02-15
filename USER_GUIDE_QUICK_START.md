# 🚀 Quick Start: Setting Up Your Backend IP

## For End Users - 3 Simple Steps

### Step 1: Install the App
- Download the APK file on your Android device
- Tap to install
- Launch the app

### Step 2: Configure Backend (First Time Only)
When the login screen appears:

1. **Tap** ⚙️ **Backend Config** button
2. **Enter** your backend IP address
   - Example: `192.168.1.100`
   - Or: `10.20.30.40`
   - Or: `localhost` (if testing locally)
3. **Enter** your backend port
   - Usually: `8000` or `8080`
   - Can be any port your backend uses
4. **Review** the WebSocket URL shown
   - You should see: `ws://YOUR_IP:YOUR_PORT/ws/behaviour`
5. **Tap** 💾 **Save & Test**
   - App will test if backend is reachable
   - ✅ Success message or ⚠️ Warning will appear
6. **Tap** ← **Back** if you want to return to PIN entry

### Step 3: Proceed with Login
1. **Enter** your 4-digit PIN
2. **Tap** PROCEED
3. App is ready to use!

---

## That's It! 🎉

Your phone will now:
- ✅ Remember your backend IP (even if you restart the app)
- ✅ Send behavioral data to your configured backend
- ✅ Connect via WebSocket automatically

---

## Troubleshooting

### "Connection test failed"
This means the app couldn't reach your backend.

**Check:**
- Is your backend running? (Start it!)
- Is the IP address correct?
- Is the port correct?
- Are you on the same network?
- Is firewall blocking the port?

**Solution:**
- Fix the IP or port
- Tap ⚙️ **Backend Config** again
- Enter the correct IP/Port
- Tap **Save & Test**

### "Configuration won't save"
Make sure:
- IP is in format: `xxx.xxx.xxx.xxx` (e.g., `192.168.1.100`)
- Port is a number between 1-65535
- No spaces in the fields

### "WebSocket URL looks wrong"
The preview URL should be:
```
ws://YOUR_IP:YOUR_PORT/ws/behaviour
```

If it looks different, try re-entering the IP and Port.

### "App forgot my configuration"
This shouldn't happen, but if it does:
- Restart the app
- Configuration should reload
- If still missing, enter it again via ⚙️ button

---

## Example Configurations

### Local Testing
```
IP: localhost
Port: 8000
WebSocket: ws://localhost:8000/ws/behaviour
```

### Home Network
```
IP: 192.168.1.100
Port: 8000
WebSocket: ws://192.168.1.100:8000/ws/behaviour
```

### Cloud Server
```
IP: 54.123.45.67
Port: 443
WebSocket: ws://54.123.45.67:443/ws/behaviour
```

### Different Port
```
IP: 192.168.1.50
Port: 9000
WebSocket: ws://192.168.1.50:9000/ws/behaviour
```

---

## Changing Configuration Later

If you need to change your backend IP:

1. **Open** app
2. **Tap** ⚙️ **Backend Config** on login screen
3. **Enter** new IP and port
4. **Tap** 💾 **Save & Test**
5. **App reconnects** to new backend

That's all! No need to restart or reinstall.

---

## What's Happening Behind the Scenes

When you tap **Save & Test**, the app:

1. ✅ Checks IP format (must be valid IPv4)
2. ✅ Checks port is valid (1-65535)
3. ✅ Tries to contact your backend's health check
4. ✅ Saves your IP to device storage
5. ✅ Updates WebSocket connection
6. ✅ Shows you confirmation

After that, every time you use the app:
- ✅ Your IP is automatically loaded
- ✅ WebSocket connects to your backend
- ✅ App collects behavioral data
- ✅ Data streams to your backend

---

## Important Notes

### Security
- **⚠️ IP is stored on your device** (not encrypted)
- Only use with trusted backend servers
- Avoid using over public/untrusted networks
- Consider using VPN for sensitive data

### Storage
- Configuration persists even if you:
  - Close the app
  - Restart your phone
  - Update the app
- Configuration is cleared only if you uninstall the app

### Network
- App requires internet connection to reach backend
- WebSocket stays connected while app is open
- Connection automatically resumes if interrupted

---

## Need Help?

### Q: How do I know if my backend IP is correct?
**A:** Enter it in the config screen, tap **Save & Test**, and see if you get a success message.

### Q: What if I don't know my backend IP?
**A:** Ask your administrator for the IP address and port number.

### Q: Can I use a domain name instead of IP?
**A:** Not yet. You must use IP address format (e.g., 192.168.1.100).

### Q: Will my phone remember the IP forever?
**A:** Yes, until you uninstall the app or tap ⚙️ to change it.

### Q: Can I use different IPs on different days?
**A:** Yes! Just tap ⚙️ **Backend Config** and enter a different IP anytime.

### Q: What if backend is unreachable?
**A:** You'll see a warning, but you can still save the IP. Just fix the backend and tap **Save & Test** again.

### Q: Does app need internet always?
**A:** Yes, it needs internet to reach your backend server. It won't work if you're offline.

### Q: Can I change IP without restarting app?
**A:** Yes! Just tap ⚙️ **Backend Config**, change IP, and tap **Save & Test**. App reconnects immediately.

---

## Quick Reference

| What | Where | How |
|------|-------|-----|
| Set IP | Login Screen | Tap ⚙️ **Backend Config** |
| Change IP | Login Screen | Tap ⚙️ **Backend Config** → Enter new IP |
| Verify IP | Config Screen | Check WebSocket URL preview |
| Test Backend | Config Screen | Tap 💾 **Save & Test** |
| Proceed to App | Login Screen | Enter PIN → Tap **PROCEED** |

---

## Visual Guide

```
FIRST TIME

App Opens
  ↓
Login Screen appears
  ↓
Tap ⚙️ BACKEND CONFIG
  ↓
Config Screen opens
  ↓
Enter: 192.168.1.100
Enter: 8000
  ↓
See: ws://192.168.1.100:8000/ws/behaviour
  ↓
Tap: 💾 SAVE & TEST
  ↓
✅ Configuration saved!
  ↓
Enter 4-digit PIN
  ↓
Tap: PROCEED
  ↓
🎉 App Ready!


NEXT TIME

App Opens
  ↓
Config Auto-Loaded
  ↓
Login Screen appears
  ↓
(IP already configured,
 no need to enter again!)
  ↓
Enter 4-digit PIN
  ↓
Tap: PROCEED
  ↓
🎉 App Ready!
```

---

## Video Version

If available, a video walkthrough would show:
1. Opening the app
2. Tapping ⚙️ Backend Config
3. Entering IP and Port
4. Reviewing the URL preview
5. Tapping Save & Test
6. Seeing confirmation message
7. Returning to login
8. Entering PIN and proceeding

---

**That's everything you need to know!** 🌟

For technical details, see `BACKEND_CONFIG_SETUP.md`
For troubleshooting, see `QUICK_REFERENCE_IP_CONFIG.md`

Happy computing! 🚀
