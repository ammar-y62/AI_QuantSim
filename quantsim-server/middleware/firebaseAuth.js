const admin = require('firebase-admin');
const { query } = require('../config/database');

// Initialize Firebase Admin if not already initialized and env vars are available
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        clientId: process.env.FIREBASE_CLIENT_ID,
        authUri: process.env.FIREBASE_AUTH_URI,
        tokenUri: process.env.FIREBASE_TOKEN_URI,
        authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        clientX509CertUrl: process.env.FIREBASE_CLIENT_X509_CERT_URL
      })
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.log('Firebase Admin initialization failed:', error.message);
  }
} else if (!admin.apps.length) {
  console.log('Firebase Admin not initialized - missing environment variables');
}

// Middleware to verify Firebase JWT token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to ensure user exists in PostgreSQL database
const ensureUserExists = async (req, res, next) => {
  try {
    // Check if user exists in PostgreSQL database
    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [req.user.uid]
    );

    if (userResult.rows.length === 0) {
      // Create new user in PostgreSQL
      const newUserResult = await query(
        'INSERT INTO users (firebase_uid, email, display_name) VALUES ($1, $2, $3) RETURNING *',
        [req.user.uid, req.user.email, req.user.email.split('@')[0]] // Use email prefix as default display name
      );

      req.dbUser = newUserResult.rows[0];
    } else {
      req.dbUser = userResult.rows[0];
    }

    next();
  } catch (error) {
    console.error('PostgreSQL user creation error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  verifyFirebaseToken,
  ensureUserExists,
  admin
};