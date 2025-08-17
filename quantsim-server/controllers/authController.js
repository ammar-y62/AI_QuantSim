const { admin } = require('../middleware/firebaseAuth');
const { db } = require('../services/firebaseService');

// User registration - creates user profile in Firestore
exports.registerUser = async (req, res) => {
  try {
    const { email, password, displayName, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim(),
      emailVerified: false
    });

    // Create user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || displayName,
      firstName: firstName || '',
      lastName: lastName || '',
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

    await db.collection('users').doc(userRecord.uid).set(userProfile);

    // Create custom token for immediate login
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      customToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        error: 'Password is too weak. Use at least 6 characters' 
      });
    }

    res.status(500).json({ 
      error: 'Registration failed. Please try again.' 
    });
  }
};

// User login - verifies Firebase token and updates last login
exports.loginUser = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        error: 'ID token is required' 
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user profile from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    const userProfile = userDoc.data();

    // Update last login time
    await db.collection('users').doc(decodedToken.uid).update({
      lastLogin: new Date()
    });

    // Create custom token for session
    const customToken = await admin.auth().createCustomToken(decodedToken.uid);

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userProfile.uid,
        email: userProfile.email,
        displayName: userProfile.displayName,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName
      },
      customToken,
      lastLogin: new Date()
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.' 
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        error: 'Token revoked. Please login again.' 
      });
    }

    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify the requesting user has access to this profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    const userProfile = userDoc.data();
    
    // Remove sensitive information
    delete userProfile.uid;

    res.status(200).json({
      user: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile' 
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, firstName, lastName, preferences } = req.body;
    
    // Verify the requesting user has access to this profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const updateData = {};
    
    if (displayName !== undefined) updateData.displayName = displayName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (preferences !== undefined) updateData.preferences = preferences;
    
    updateData.updatedAt = new Date();

    await db.collection('users').doc(uid).update(updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
      updatedFields: Object.keys(updateData)
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile' 
    });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify the requesting user has access to this profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Delete user profile from Firestore
    await db.collection('users').doc(uid).delete();
    
    // Delete user from Firebase Auth
    await admin.auth().deleteUser(uid);

    res.status(200).json({
      message: 'User account deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      error: 'Failed to delete user account' 
    });
  }
};