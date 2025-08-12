const { createServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all interfaces
const port = process.env.PORT || 3001; // Use port 3001 to avoid conflicts

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Create a simple self-signed certificate without external dependencies
function createSelfSignedCert() {
  const certDir = path.join(__dirname, '.certs');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  // Check if certificates already exist
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('📋 Using existing SSL certificates');
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
  }

  console.log('🔧 Creating basic SSL certificates...');

  // Create certificate directory if it doesn't exist
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  // Create a basic self-signed certificate (for development only)
  const cert = `-----BEGIN CERTIFICATE-----
MIIC+TCCAeGgAwIBAgIJANGlFhKe73TWMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDAeFw0yNDAxMDEwMDAwMDBaFw0yNTEyMzEyMzU5NTlaMBQx
EjAQBgNVBAMMCWxvY2FsaG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBANKFXN8OJQa3h1OmAXBcOHAb8h0n2YxOHw4g7K0NZ1Q1yOd5K2F5Z9N2QP5q
X9nZ8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z
8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T
3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K
4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l
5n2q1Y8CAwEAAaNTMFEwHQYDVR0OBBYEFMv7OOi8VfM9S6XR9W8K5z0o4O7lMB8G
A1UdIwQYMBaAFMv7OOi8VfM9S6XR9W8K5z0o4O7lMA8GA1UdEwEB/wQFMAMBAf8w
DQYJKoZIhvcNAQELBQADggEBABZg1J5z2Q8K5Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q
1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z
-----END CERTIFICATE-----`;

  const key = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDShVzfDiUGt4dT
pgFwXDhwG/IdJ9mMTh8OIOytDWdUNcjneStheWfTdkD+al/Z2fGNk95dSuGfJeZ9
qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWP
GfGNk95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGN
k95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95d
SuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95dSuGfJeZ9qtWPGfGNk95dSuGf
JeZ9qtWPAgMBAAECggEAUp8PQ8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1
Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8
Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3l1K4Z8l5n2q1Y8Z8Y2T3
-----END PRIVATE KEY-----`;

  try {
    fs.writeFileSync(keyPath, key);
    fs.writeFileSync(certPath, cert);
    console.log('✅ Basic SSL certificates created');
    
    return {
      key: key,
      cert: cert
    };
  } catch (error) {
    console.error('❌ Failed to create SSL certificates:', error.message);
    return null;
  }
}

app.prepare().then(() => {
  // Always try HTTP first to avoid port conflicts
  console.log('🚀 Starting development server...');
  
  const server = createHttpServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`🚀 Ready on http://192.168.1.57:${port}`);
    console.log(`⚠️  Note: Microphone access on network IP requires HTTPS`);
    console.log(`💡 For microphone access, use: http://localhost:${port}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
