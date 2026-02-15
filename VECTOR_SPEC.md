# Behavioral Vector Specification

## Data Transmission Format

```json
{
  "payload": {
    "timestamp": 1707336000000,
    "nonce": "abc123...",
    "vector": [0.45, 0.32, ..., 0.78],
    "eventType": "TOUCH_ACCOUNT_DETAILS"
  },
  "signature": "sha256_hex_string"
}
```

- **timestamp**: Unix timestamp in milliseconds
- **nonce**: Cryptographic random nonce
- **vector**: 48-dimensional normalized array [0-1]
- **eventType**: Event type string (e.g., "TOUCH_ACCOUNT_DETAILS", "SCROLL_ACCOUNTS_LIST")
- **signature**: SHA256 signature of the payload

---

## Vector Dimensions (1-48)

### 1-6: Touch Raw Features
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 1 | Touch X | [0, 1] | Normalized X coordinate (0=left, 1=right) |
| 2 | Touch Y | [0, 1] | Normalized Y coordinate (0=top, 1=bottom) |
| 3 | Pressure | [0, 1] | Touch pressure/force intensity |
| 4 | Timestamp | [0, 1] | Relative time in window (ms / 1000ms) |
| 5 | Touch Type | [0, 1] | Gesture type: 0=tap, 0.5=swipe, 1=long-press |
| 6 | Touch Count | [0, 1] | Number of touches (normalized by max 30) |

### 7-12: Sensor Raw Features
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 7 | Accel X | [0, 1] | X-axis acceleration normalized [-2, 2]g |
| 8 | Accel Y | [0, 1] | Y-axis acceleration normalized [-2, 2]g |
| 9 | Accel Z | [0, 1] | Z-axis acceleration normalized [-2, 2]g |
| 10 | Gyro X | [0, 1] | X-axis rotation normalized [-10, 10]rad/s |
| 11 | Gyro Y | [0, 1] | Y-axis rotation normalized [-10, 10]rad/s |
| 12 | Gyro Z | [0, 1] | Z-axis rotation normalized [-10, 10]rad/s |

### 13-16: Context Variables
| # | Feature | Value | Meaning |
|---|---------|-------|---------|
| 13 | Orientation | 0 or 1 | 0=Portrait, 1=Landscape |
| 14 | Screen State | 0 or 1 | 0=Locked/Off, 1=Active |
| 15 | Battery | [0, 1] | Battery level percentage |
| 16 | App State | 0 or 1 | 0=Background, 1=Foreground |

### 17-24: Touch Dynamics
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 17 | Dwell Time | [0, 1] | Time finger stayed on screen (ms / 1000ms) |
| 18 | Velocity | [0, 1] | Touch movement speed (px/s, capped at 5000) |
| 19 | Direction | [0, 1] | Movement angle normalized [-180, 180]° |
| 20 | Jerk | [0, 1] | Change in acceleration (capped at 500000) |
| 21 | Avg Pressure | [0, 1] | Average pressure over window |
| 22 | Frequency | [0, 1] | Touch events per second (capped at 15) |
| 23 | Path Length | [0, 1] | Total distance traveled (px, capped at 3000) |
| 24 | Entropy | [0, 1] | Randomness of touch events (capped at 5) |

### 25-30: Accelerometer Dynamics
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 25 | Magnitude | [0, 1] | Vector magnitude (capped at 3) |
| 26 | Mean | [0, 1] | Average acceleration (capped at 3) |
| 27 | Variance | [0, 1] | Data spread (capped at 2) |
| 28 | Std Dev | [0, 1] | Standard deviation (capped at 2) |
| 29 | Energy | [0, 1] | Sum of squares (capped at 10) |
| 30 | Peak Count | [0, 1] | Number of spikes (capped at 50) |

### 31-36: Gyroscope Dynamics
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 31 | Magnitude | [0, 1] | Vector magnitude (capped at 15) |
| 32 | Mean | [0, 1] | Average rotation (capped at 15) |
| 33 | Variance | [0, 1] | Data spread (capped at 50) |
| 34 | Std Dev | [0, 1] | Standard deviation (capped at 10) |
| 35 | Energy | [0, 1] | Sum of squares (capped at 500) |
| 36 | Peak Count | [0, 1] | Number of spikes (capped at 50) |

### 37-40: Scroll Dynamics
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 37 | Velocity | [0, 1] | Scroll speed (px/s, capped at 5000) |
| 38 | Direction | [0, 1] | Scroll direction normalized [-1, 1] |
| 39 | Acceleration | [0, 1] | Scroll change rate (capped at 20000) |
| 40 | Pause Time | [0, 1] | Time between scrolls (ms / 1000ms) |

### 41-44: Temporal Features
| # | Feature | Range | Meaning |
|---|---------|-------|---------|
| 41 | Inter-Event Time | [0, 1] | Time between events (ms / 1000ms) |
| 42 | Rhythm | [0, 1] | Regularity of events (capped at 500) |
| 43 | Window Entropy | [0, 1] | Event randomness (capped at 5) |
| 44 | Stability Score | [0, 1] | Behavioral consistency |

### 45-48: Reserved
| # | Feature | Value | Meaning |
|---|---------|-------|---------|
| 45-48 | Reserved | 0 | For future use |

---

## Emission Triggers

- **Event-Driven**: Emit immediately on touch/scroll/keystroke
- **Fallback**: If no events for 1 second, emit automatically
- **Window Size**: 1000ms (1 second)

## Event Types

Common event type strings passed from UI:
- `TOUCH_ACCOUNT_DETAILS` - Account card interaction
- `TOUCH_PAY_TRANSFER` - Payment initiation
- `TOUCH_BALANCE_TOGGLE` - Balance visibility toggle
- `TOUCH_TRANSACTION_ROW` - Transaction detail access
- `SCROLL_ACCOUNTS_LIST` - Scrolling activity
- `KEYSTROKE_PIN_ENTRY` - PIN/password input
- `KEYSTROKE_OTP` - OTP code entry

---

## Normalization Ranges

All features are normalized to **[0, 1]** using these ranges:

| Feature Group | Normalization Method |
|---|---|
| Screen coordinates (X, Y) | Divide by screen dimensions |
| Pressure, battery, app state | Direct 0-1 clamping |
| Accelerometer | [-2, 2]g → [0, 1] |
| Gyroscope | [-10, 10]rad/s → [0, 1] |
| Angles | [-180, 180]° → [0, 1] |
| Velocity | Cap at 5000px/s → [0, 1] |
| Energy metrics | Feature-specific cap → [0, 1] |
