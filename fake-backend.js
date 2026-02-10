/**
 * Fake Backend Server
 * 
 * Simple Node.js/Express-like backend for development
 * Handles:
 * - Login (validates PIN 1234)
 * - Behavioral vector collection
 * - CSV storage
 * 
 * Run with: node fake-backend.js
 * Runs on: http://localhost:3001
 */

const fs = require('fs');
const path = require('path');

// Simple HTTP server (no external dependencies)
const http = require('http');
const url = require('url');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PORT = 3001;
const CSV_DIR = path.join(__dirname, 'behavioral_data');
const CSV_BUFFER_TIME = 3 * 60 * 1000; // 3 minutes in milliseconds

// ============================================================================
// DATA STORAGE
// ============================================================================

let behavioralVectorBuffer = [];
let csvBufferTimer = null;

// Ensure data directory exists
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
  console.log(`Created directory: ${CSV_DIR}`);
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/login
 * Validates login credentials
 */
function handleLogin(body, callback) {
  try {
    const data = JSON.parse(body);
    const { userId, pin } = data;

    // Validate PIN (hardcoded for demo)
    if (pin === '1234') {
      const response = {
        success: true,
        message: 'Login successful',
        userId,
        timestamp: Date.now(),
        token: generateToken(userId),
      };
      callback(200, response);
    } else {
      const response = {
        success: false,
        message: 'Invalid PIN',
        timestamp: Date.now(),
      };
      callback(401, response);
    }
  } catch (error) {
    console.error('Login error:', error);
    callback(400, { success: false, message: 'Bad request', error: error.message });
  }
}

/**
 * POST /api/behavioral/vector
 * Receives 48-dimensional behavioral vector
 */
function handleBehavioralVector(body, callback) {
  try {
    const data = JSON.parse(body);
    const { userId, vector, timestamp, metadata } = data;

    if (!vector || vector.length !== 48) {
      callback(400, {
        success: false,
        message: `Expected 48-dimensional vector, got ${vector.length}`,
      });
      return;
    }

    // Add to buffer
    behavioralVectorBuffer.push({
      userId,
      vector,
      timestamp,
      metadata: metadata || {},
      receivedAt: Date.now(),
    });

    console.log(
      `[${new Date().toISOString()}] Received behavioral vector for user ${userId} (buffer size: ${
        behavioralVectorBuffer.length
      })`
    );

    // Respond immediately
    callback(200, {
      success: true,
      message: 'Vector received',
      vectorId: generateVectorId(),
      bufferedVectors: behavioralVectorBuffer.length,
    });

    // Schedule CSV save if not already scheduled
    if (!csvBufferTimer) {
      scheduleCSVSave();
    }
  } catch (error) {
    console.error('Behavioral vector error:', error);
    callback(400, { success: false, message: 'Bad request', error: error.message });
  }
}

/**
 * GET /api/status
 * Health check endpoint
 */
function handleStatus(callback) {
  callback(200, {
    success: true,
    message: 'Server is running',
    uptime: process.uptime(),
    vectorsInBuffer: behavioralVectorBuffer.length,
    timestamp: Date.now(),
  });
}

/**
 * GET /api/behavioral/stats
 * Get statistics about collected vectors
 */
function handleBehavioralStats(callback) {
  const userVectorCounts = {};
  behavioralVectorBuffer.forEach((item) => {
    userVectorCounts[item.userId] = (userVectorCounts[item.userId] || 0) + 1;
  });

  callback(200, {
    success: true,
    totalVectorsInBuffer: behavioralVectorBuffer.length,
    userCount: Object.keys(userVectorCounts).length,
    userVectorCounts,
    csvDirectory: CSV_DIR,
    timestamp: Date.now(),
  });
}

// ============================================================================
// CSV OPERATIONS
// ============================================================================

/**
 * Schedule CSV save after buffer timeout
 */
function scheduleCSVSave() {
  console.log(`[${new Date().toISOString()}] CSV save scheduled for ${CSV_BUFFER_TIME / 1000} seconds`);

  csvBufferTimer = setTimeout(() => {
    saveBufferToCSV();
    csvBufferTimer = null;
  }, CSV_BUFFER_TIME);
}

/**
 * Save buffered vectors to CSV file
 */
function saveBufferToCSV() {
  if (behavioralVectorBuffer.length === 0) {
    console.log(`[${new Date().toISOString()}] No vectors to save`);
    return;
  }

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `behavioral_vectors_${timestamp}.csv`;
    const filepath = path.join(CSV_DIR, filename);

    // Create CSV header
    const dimensions = [];
    for (let i = 0; i < 48; i++) {
      dimensions.push(`dim_${i}`);
    }

    const header = [
      'userId',
      'timestamp',
      'receivedAt',
      ...dimensions,
      'metadata',
    ].join(',');

    // Create CSV rows
    const rows = behavioralVectorBuffer.map((item) => {
      const vectorStr = item.vector.map((v) => v.toFixed(6)).join(',');
      const metadataStr = JSON.stringify(item.metadata).replace(/,/g, ';'); // Escape commas
      return `${item.userId},${item.timestamp},${item.receivedAt},${vectorStr},"${metadataStr}"`;
    });

    const csvContent = [header, ...rows].join('\n');

    // Write to file
    fs.writeFileSync(filepath, csvContent, 'utf8');

    console.log(
      `[${new Date().toISOString()}] Saved ${behavioralVectorBuffer.length} vectors to ${filepath}`
    );

    // Archive summary
    const summary = {
      filename,
      filepath,
      vectorCount: behavioralVectorBuffer.length,
      userCount: new Set(behavioralVectorBuffer.map((v) => v.userId)).size,
      savedAt: new Date().toISOString(),
      dimensions: 48,
    };

    // Log to console
    console.log('CSV Summary:', summary);

    // Clear buffer
    behavioralVectorBuffer = [];
  } catch (error) {
    console.error('Error saving to CSV:', error);
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate authentication token
 */
function generateToken(userId) {
  const timestamp = Date.now();
  return Buffer.from(`${userId}:${timestamp}:${Math.random()}`).toString('base64');
}

/**
 * Generate unique vector ID
 */
function generateVectorId() {
  return `vec_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Parse JSON body from request
 */
function parseBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    callback(body);
  });
}

// ============================================================================
// HTTP SERVER
// ============================================================================

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${pathname}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS (CORS preflight)
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Route handler
  const sendResponse = (statusCode, data) => {
    res.writeHead(statusCode);
    res.end(JSON.stringify(data));
  };

  // Routes
  if (method === 'POST' && pathname === '/api/login') {
    parseBody(req, (body) => {
      handleLogin(body, sendResponse);
    });
  } else if (method === 'POST' && pathname === '/api/behavioral/vector') {
    parseBody(req, (body) => {
      handleBehavioralVector(body, sendResponse);
    });
  } else if (method === 'GET' && pathname === '/api/status') {
    handleStatus(sendResponse);
  } else if (method === 'GET' && pathname === '/api/behavioral/stats') {
    handleBehavioralStats(sendResponse);
  } else {
    sendResponse(404, {
      success: false,
      message: 'Endpoint not found',
      path: pathname,
    });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              🚀 Fake Backend Server Started                    ║
╠════════════════════════════════════════════════════════════════╣
║  URL:           http://localhost:${PORT}                         ║
║  Login PIN:     1234                                           ║
║  CSV Directory: ${CSV_DIR}                      ║
║  Buffer Time:   ${CSV_BUFFER_TIME / 1000} seconds (3 minutes)                     ║
╠════════════════════════════════════════════════════════════════╣
║  Endpoints:                                                    ║
║  POST   /api/login                  - Login with PIN           ║
║  POST   /api/behavioral/vector      - Send 48D vector          ║
║  GET    /api/status                 - Health check             ║
║  GET    /api/behavioral/stats       - Vector statistics        ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SIGINT] Saving remaining vectors...');
  saveBufferToCSV();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[SIGTERM] Saving remaining vectors...');
  saveBufferToCSV();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
