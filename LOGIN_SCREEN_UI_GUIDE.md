# Login Screen UI - Visual Guide

## Main Login Screen

```
┌─────────────────────────────────────┐
│                                     │
│    CBSA SECURITY ASSESSMENT         │
│    Enter Your PIN                   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ●      ●      ●      ●     │   │ ← PIN Dots (4)
│  └─────────────────────────────┘   │
│                                     │
│  ┌──┬──┬──┐                       │
│  │1 │2 │3 │                       │
│  ├──┼──┼──┤                       │
│  │4 │5 │6 │                       │
│  ├──┼──┼──┤                       │
│  │7 │8 │9 │                       │
│  ├──┼──┼──┤                       │
│  │0 │  │  │                       │
│  └──┴──┴──┘                       │
│   ↑                                │
│   CLEAR button in bottom-left      │
│                                     │
│  ┌────────────────────────────────┐│
│  │  ⚙️  BACKEND CONFIG           ││ ← NEW: Settings button
│  └────────────────────────────────┘│
│  ┌────────────────────────────────┐│
│  │     PROCEED (PIN MODE)         ││ ← Original proceed
│  └────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Backend Configuration Screen

```
┌─────────────────────────────────────┐
│  ⬅️  BACKEND CONFIGURATION         │
│                                     │
│  ┌────────────────────────────────┐│
│  │  Backend IP Address            ││
│  │  ┌──────────────────────────┐  ││
│  │  │ 192.168.1.100            │  ││ ← TextInput
│  │  └──────────────────────────┘  ││
│  │  (IPv4 or localhost)           ││
│  │                                 ││
│  │  Backend Port                  ││
│  │  ┌──────────────────────────┐  ││
│  │  │ 8000                     │  ││ ← TextInput
│  │  └──────────────────────────┘  ││
│  │  (1-65535)                     ││
│  │                                 ││
│  │  ┌──────────────────────────┐  ││
│  │  │ WebSocket URL Preview:   │  ││
│  │  │ ws://192.168.1.100:8000/ │  ││
│  │  │ ws/behaviour             │  ││
│  │  └──────────────────────────┘  ││
│  │                                 ││
│  │  ┌──────────────────────────┐  ││
│  │  │ 💾 SAVE & TEST           │  ││ ← Primary button
│  │  │ (Testing connection...)  │  ││   (shows loading)
│  │  └──────────────────────────┘  ││
│  │                                 ││
│  │  ┌──────────────────────────┐  ││
│  │  │ ← BACK (Don't Save)      │  ││ ← Secondary button
│  │  └──────────────────────────┘  ││
│  │                                 ││
│  └────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

---

## Color Scheme

| Element | Color | Hex Code |
|---------|-------|----------|
| Background | Light Gray | #E8E8EC |
| Cards/Inputs | Gray | #D5D5D8 |
| Primary Button | Dark Gray/Black | #2D3436 |
| Secondary Button | Light Gray | #8E8E93 |
| Text | Dark Gray | #5B5B63 |
| Input Text | Dark | #2D3436 |
| Button Text | White | #FFFFFF |
| Border | Light Gray | #BFBFBF |

---

## Button States

### ⚙️ Backend Config Button
```
┌────────────────────────────────┐
│ ⚙️ BACKEND CONFIG              │  ← Normal state
└────────────────────────────────┘
  Color: #8E8E93
  Font: 14px, bold
  Action: Open IP configuration screen
```

### 💾 Save & Test Button
```
Default:
┌────────────────────────────────┐
│ 💾 SAVE & TEST                 │  ← Ready state
└────────────────────────────────┘
  Color: #2D3436 (dark)
  Disabled: #BFBFBF (gray)

Loading:
┌────────────────────────────────┐
│ 🔄 Testing connection...       │  ← Loading state
└────────────────────────────────┘
  Same styling, disabled interaction

Success:
✅ Configuration saved successfully!
Backend connected to: ws://192.168.1.100:8000/ws/behaviour

Error:
⚠️ Connection test failed
Could not reach http://192.168.1.100:8000/health
```

### ← Back Button
```
┌────────────────────────────────┐
│ ← BACK (Don't Save)            │  ← Secondary styling
└────────────────────────────────┘
  Color: #5B5B63 (gray text)
  Border: 1px #BFBFBF
  Background: #FFFFFF (white)
  Action: Return to PIN entry without saving
```

---

## Keyboard Behavior

- **IP Address Field**: Standard keyboard, text input
- **Port Field**: Numeric keyboard (numbers 0-9)
- **Both**: Auto-dismiss keyboard when tapping Save/Back buttons

---

## Validation Feedback

### Real-time as user types:

```
IP: 192.168.1.100  ✅ Valid format
IP: 256.1.1.1      ❌ Octets must be 0-255
IP: localhost      ✅ Valid (localhost allowed)
IP: example.com    ❌ Not IPv4 format

Port: 8000         ✅ Valid (1-65535)
Port: 0            ❌ Too low (min 1)
Port: 65536        ❌ Too high (max 65535)
```

### After Save & Test:

```
Testing connection to http://192.168.1.100:8000/health...

✅ SUCCESS
Configuration saved to device
WebSocket: ws://192.168.1.100:8000/ws/behaviour

❌ FAILED
Unable to reach backend
Check that:
  - Backend IP is correct
  - Backend port is correct
  - Backend is running
  - Firewall allows connection
```

---

## Text Input Fields

### Backend IP Address
```
┌──────────────────────────────┐
│ 192.168.1.100                │
└──────────────────────────────┘
  Placeholder: "e.g., 192.168.1.100 or localhost"
  Font: 14px
  Padding: 10px vertical, 12px horizontal
  Border: 1px solid #BFBFBF
  Border Radius: 8px
  Background: #FFFFFF
```

### Backend Port
```
┌──────────────────────────────┐
│ 8000                         │
└──────────────────────────────┘
  Placeholder: "e.g., 8000"
  Font: 14px
  Numeric keyboard
  Max length: 5 (65535)
```

### WebSocket URL Preview (Read-only)
```
┌──────────────────────────────┐
│ WebSocket URL:               │
│ ws://192.168.1.100:8000/     │
│ ws/behaviour                 │
└──────────────────────────────┘
  Font: 12px monospace
  Background: #F5F5F5
  Border: 1px #BFBFBF
  Non-editable (for reference)
```

---

## Flow Diagram

```
Start App
    ↓
LOGIN SCREEN
    ├─ Enter PIN
    │  └─ Tap PROCEED → Continue to home
    │
    ├─ Tap ⚙️ BACKEND CONFIG
    │  ↓
    │  CONFIGURATION SCREEN
    │  ├─ Enter IP Address
    │  ├─ Enter Port
    │  ├─ See Preview
    │  │
    │  ├─ Tap 💾 SAVE & TEST
    │  │  ├─ Validate IP format
    │  │  ├─ Validate Port range
    │  │  ├─ Test connection to /health
    │  │  └─ If OK: Save to AsyncStorage
    │  │
    │  └─ Tap ← BACK
    │     └─ Discard changes, return to login
    │
    └─ Taps ⚙️ again (optional)
       └─ Same flow, can change IP anytime
```

---

## Responsive Design

### Portrait (Primary)
- Full-width input fields with max-width 320px
- Centered on screen
- Keyboard pushes content up automatically

### Landscape
- Same max-width constraints
- Scrollable if needed
- Same responsive behavior

---

## Accessibility

- All buttons have clear labels
- Color contrast meets WCAG AA standards
- TextInput fields have placeholders for guidance
- Error messages are user-friendly
- Loading states clearly indicate processing

---

## Animation States

| Event | Animation |
|-------|-----------|
| Button press | Slight opacity change (0.7) |
| Loading | Disabled state (grayed out) |
| Success | Alert dialog with ✅ icon |
| Error | Alert dialog with ⚠️ icon |
| Keyboard | Slide up with content adjustment |

---

**Styling Location:** `app/login.tsx` (lines 428-499)
**Component Location:** `app/login.tsx` (lines 1-340)

All styles are defined in the `StyleSheet.create()` at the bottom of the file:
- `configAccessButton` - ⚙️ Settings button
- `configAccessButtonText` - Button text
- `configCard` - Card container
- `configLabel` - Field labels
- `configInput` - TextInput styling
- `configInfo` - Preview box
- `configInfoText` / `configInfoBold` - Preview text
- `configButton` - Save button
- `configButtonSecondary` - Back button
- `buttonsContainer` - Button layout wrapper
