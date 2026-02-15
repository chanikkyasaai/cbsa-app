# 🚀 Runtime IP Configuration - Quick Reference

## What Just Got Added

Your CBSA app can now accept backend IP/Port at login time instead of requiring code changes.

## User Experience

```
LOGIN SCREEN
├─ PIN Keypad (as before)
├─ ⚙️ Backend Config Button (NEW)
│  └─ Configuration Screen
│     ├─ Backend IP field (e.g., 192.168.1.100)
│     ├─ Port field (e.g., 8000)
│     ├─ Preview: ws://IP:PORT/ws/behaviour
│     ├─ 💾 Save & Test Button
│     │  └─ Tests connection, saves to device
│     └─ ← Back Button
└─ PROCEED (PIN entry continues as normal)
```

## Files Changed

| File | Change | Purpose |
|------|--------|---------|
| `services/ConfigService.ts` | ✨ NEW (146 lines) | Runtime config management |
| `services/WebSocketService.ts` | 🔄 MODIFIED | Now uses ConfigService for dynamic URLs |
| `app/login.tsx` | 🔄 MODIFIED | Added ⚙️ config button and IP input UI |
| `package.json` | ✅ UPDATED | Added `@react-native-async-storage/async-storage` |

## Key Features

✅ **Persistent Storage** - IP saved to device, persists across app restarts
✅ **Validation** - IP format check (IPv4 + localhost), port 1-65535
✅ **Connection Test** - Verifies backend /health endpoint before saving
✅ **User Friendly** - Shows preview of WebSocket URL before saving
✅ **Fallback** - Uses `localhost:8000` if no config exists

## Architecture Flow

```
AsyncStorage
    ↑
    │ (Load on app start)
    │
ConfigService
    ↑
    │ (Called by)
    │
WebSocketService
    ↑
    │ (Connects to)
    │
User Backend
```

## How to Test

### 1. Start with Default Config
App starts, no saved config → uses `ws://localhost:8000/ws/behaviour`

### 2. Change via Login Screen
- Tap ⚙️ **Backend Config**
- Enter IP: `192.168.1.100`
- Enter Port: `8000`
- See preview: `ws://192.168.1.100:8000/ws/behaviour`
- Tap **Save & Test**
- ✅ Success or ⚠️ Failed (backend not reachable)

### 3. Verify Persistence
- Close app completely
- Reopen app
- Same IP:Port should be remembered
- No need to enter again

## Code Examples

### Get Current Configuration
```typescript
import { configService } from './services/ConfigService';

const config = await configService.getConfig();
console.log(config.backendIP);   // e.g., "192.168.1.100"
console.log(config.backendPort); // e.g., 8000
```

### Get WebSocket URL
```typescript
const wsUrl = await configService.getWebSocketURL();
// Returns: "ws://192.168.1.100:8000/ws/behaviour"
```

### Test Connection
```typescript
const isHealthy = await configService.testConnection();
// Returns: true if backend responds to GET /health
```

### Set New Configuration
```typescript
await configService.setConfig({
  backendIP: '192.168.1.50',
  backendPort: 9000
});
// Validates, saves, and WebSocketService auto-reconnects
```

## Backend Requirements

Your backend must have a `/health` endpoint:

```python
# Python Flask example
@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok'}, 200
```

```javascript
// Node.js Express example
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

## Validation Rules

| Field | Rules | Examples |
|-------|-------|----------|
| IP | IPv4 format, octets 0-255, or localhost | ✅ `192.168.1.1`, `10.0.0.1`, `localhost` |
| Port | Integer 1-65535 | ✅ `8000`, `3000`, `5000` |

## Storage Location

- **Key:** `cbsa_backend_config`
- **Storage:** Device AsyncStorage (local, persistent)
- **Format:** JSON string `{"backendIP": "...", "backendPort": ...}`

## Clear Configuration

To reset to defaults:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.removeItem('cbsa_backend_config');
// App will use localhost:8000 on next start
```

## Compilation Status

✅ All files compile without errors:
- `services/ConfigService.ts` - ✅ No errors
- `services/WebSocketService.ts` - ✅ No errors  
- `app/login.tsx` - ✅ No errors
- `package.json` - ✅ Dependencies added

## What This Enables

🎯 **Single APK for Multiple Environments**
- Build once
- Deploy to multiple phones
- Each phone can configure its own backend

🎯 **Easier Development**
- No code changes for different backend IPs
- Test with different backend instances
- Share APK without config modifications

🎯 **Better User Experience**
- Users see exactly what IP they're connecting to
- Can test connection before proceeding
- Clear error messages if backend unreachable

---

**Status:** ✅ Ready for testing and deployment
