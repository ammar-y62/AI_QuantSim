const admin = require('firebase-admin');

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

// Middleware to ensure user exists in Firestore
const ensureUserExists = async (req, res, next) => {
  try {
    const { db } = require('../services/firebaseService');

    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      // Create new user profile in Firestore
      const userProfile = {
        uid: req.user.uid,
        email: req.user.email,
        displayName: req.user.displayName || '',
        firstName: '',
        lastName: '',
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
        preferences: {
          theme: 'light',
          notifications: true,
          timezone: 'UTC'
        },
        trading: {
          defaultCurrency: 'USD',
          riskTolerance: 'moderate',
          tradingHours: '9:30-16:00'
        }
      };

      await db.collection('users').doc(req.user.uid).set(userProfile);
      req.dbUser = userProfile;
    } else {
      req.dbUser = userDoc.data();
    }

    next();
  } catch (error) {
    console.error('Firestore user creation error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
};

module.exports = {
  verifyFirebaseToken,
  ensureUserExists,
  admin
};