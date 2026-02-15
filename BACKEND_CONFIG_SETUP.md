# Backend Configuration Setup Guide

## Overview
The CBSA mobile application now supports **runtime backend IP configuration** through the login screen. This eliminates the need to modify source code for different deployments.

## How It Works

### Architecture
```
User Login Screen
    ↓
⚙️ Backend Config Button
    ↓
IP Configuration UI
    ↓
AsyncStorage (Persistent)
    ↓
ConfigService (Loading)
    ↓
WebSocketService (Dynamic Connection)
```

### Key Components

#### 1. **ConfigService** (`services/ConfigService.ts`)
- Manages runtime backend configuration
- Stores IP/Port in AsyncStorage for persistence
- Validates IP addresses (IPv4 format + localhost)
- Tests connection before saving
- Provides WebSocket and REST URLs

**Methods:**
- `getWebSocketURL()` - Returns `ws://IP:PORT/ws/behaviour`
- `getRestURL()` - Returns `http://IP:PORT`
- `setConfig(config)` - Save user configuration
- `testConnection()` - Health check on backend
- `getConfig()` - Retrieve current configuration

#### 2. **Login Screen** (`app/login.tsx`)
- **PIN Entry**: User enters 4-digit PIN
- **⚙️ Backend Config Button**: Opens IP configuration screen
- **IP Configuration Screen**:
  - Enter Backend IP (e.g., `192.168.1.100`)
  - Enter Backend Port (e.g., `8000`)
  - Preview WebSocket URL: `ws://IP:PORT/ws/behaviour`
  - **Save & Test**: Validates and tests connection
  - **Back**: Return to PIN entry without saving

#### 3. **WebSocketService** (`services/WebSocketService.ts`)
- Now supports dynamic URLs via ConfigService
- Calls `configService.getWebSocketURL()` on initialization
- `updateURL()` method updates connection after config change
- Auto-reconnects if URL changes

## User Flow

### First-Time Setup (Deployment)
1. User runs APK on their device
2. Clicks ⚙️ **Backend Config** on login screen
3. Enters backend IP (e.g., `192.168.1.50`)
4. Enters backend port (e.g., `8000`)
5. Clicks **Save & Test**
6. If successful → Configuration saved to device storage
7. Enter PIN and proceed with login
8. WebSocket automatically connects to configured backend

### Subsequent Uses
- Configuration is stored on device
- App automatically connects to saved IP:PORT
- Can always change via ⚙️ **Backend Config** button

## Configuration Defaults

**Default Configuration:**
- IP: `localhost`
- Port: `8000`
- Used if no user configuration exists

**File:** `services/ConfigService.ts` (lines 15-18)

## Validation

### IP Validation
```typescript
✅ Valid formats:
  - 192.168.1.100
  - 10.0.0.1
  - 127.0.0.1
  - localhost

❌ Invalid formats:
  - 256.1.1.1 (octets > 255)
  - 192.168.1 (incomplete)
  - example.com (domain names)
```

### Port Validation
```typescript
✅ Valid range: 1-65535
❌ Invalid: 0, 65536, negative numbers
```

### Connection Testing
- Backend must respond to `GET /health` endpoint
- Timeout: 5 seconds
- User sees ✅ or ⚠️ status before saving

## Storage

### AsyncStorage Key
```
cbsa_backend_config
```

### Stored Data Structure
```typescript
{
  "backendIP": "192.168.1.100",
  "backendPort": 8000
}
```

### Persistence
- Data persists across app restarts
- Can be cleared via app uninstall
- No cloud sync (device-local only)

## API Endpoints Used

### Health Check (Connection Test)
```
GET /health
Response: HTTP 200 OK
Used by: ConfigService.testConnection()
```

### WebSocket Stream
```
WS /ws/behaviour
Connected to: BehavioralCollector
Payload: {timestamp, nonce, vector[48], eventType, deviceInfo, signature}
```

## Troubleshooting

### Configuration Won't Save
1. Check IP format (e.g., `192.168.1.100`)
2. Check port is 1-65535
3. Verify backend is running
4. Check backend `/health` endpoint responds with 200 OK

### WebSocket Won't Connect
1. Verify IP and port are correct via ⚙️ config screen
2. Check backend WebSocket server is listening on configured port
3. Verify firewall allows connection
4. Check WebSocketService logs in console

### Reset to Defaults
Delete stored configuration:
```typescript
await AsyncStorage.removeItem('cbsa_backend_config');
```
Then app will use `localhost:8000` on next start.

## Integration Points

### BehavioralCollector
```typescript
// WebSocketService automatically uses configured URL
const wsService = WebSocketService.getInstance();
wsService.send({
  timestamp: Date.now(),
  nonce: generateNonce(),
  vector: [...48 sensor values...],
  eventType: 'button_click',
  deviceInfo: {...35+ fields...},
  signature: calculateSignature()
});
```

### App Initialization Flow
```typescript
App Start
  ↓
Login Screen Rendered
  ↓
User taps ⚙️ Backend Config (optional)
  ↓
ConfigService loads saved config from AsyncStorage
  ↓
User enters PIN and proceeds
  ↓
BehavioralCollector starts
  ↓
WebSocketService connects to configured IP:PORT
  ↓
Data streaming begins
```

## Security Considerations

⚠️ **Current Implementation:**
- Configuration stored in device AsyncStorage (unencrypted)
- WebSocket connection uses `ws://` (unencrypted)
- IP/Port visible in UI

🔒 **Production Hardening (Future):**
- Encrypt AsyncStorage data
- Use WSS (secure WebSocket) with certificates
- Add authentication token to WebSocket connection
- Obfuscate or hide IP from UI logs

## Development Notes

### Testing Configuration Changes
```typescript
import { configService } from './services/ConfigService';

// Get current config
const config = await configService.getConfig();
console.log(config); // { backendIP: '...', backendPort: ... }

// Test connection
const isConnected = await configService.testConnection();
console.log(isConnected); // true/false

// Change configuration
await configService.setConfig({
  backendIP: '192.168.1.100',
  backendPort: 8000
});

// WebSocketService will auto-reconnect
```

### UI Styles
Configuration screen uses consistent styling:
- `configCard` - Input container (light gray)
- `configLabel` - Field labels
- `configInput` - TextInput fields
- `configInfo` - WebSocket URL preview
- `configButton` - Save & Test button
- `configButtonSecondary` - Back button

All defined in `app/login.tsx` StyleSheet (lines 428-499).

## Version Info

**Feature Added:** v1.0.0 (Runtime Configuration)

**Dependencies:**
- `@react-native-async-storage/async-storage` - Configuration persistence
- `expo` - Cross-platform runtime
- `react-native` - UI framework

**Files Modified:**
- `services/ConfigService.ts` (NEW - 146 lines)
- `services/WebSocketService.ts` (MODIFIED - dynamic URL support)
- `app/login.tsx` (MODIFIED - IP configuration UI)
- `package.json` (NEW dependency: async-storage)

---

**Last Updated:** After ConfigService + WebSocketService + Login UI integration
**Status:** ✅ Complete - Ready for testing
