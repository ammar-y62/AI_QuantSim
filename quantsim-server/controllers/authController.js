const { admin } = require('../middleware/firebaseAuth');
const { query } = require('../config/database');

// User registration - creates user in Firebase Auth and PostgreSQL
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

    // Create user profile in PostgreSQL
    const userProfile = await query(
      'INSERT INTO users (firebase_uid, email, display_name) VALUES ($1, $2, $3) RETURNING *',
      [userRecord.uid, userRecord.email, userRecord.displayName || displayName]
    );

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
    
    // Get user profile from PostgreSQL
    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    const userProfile = userResult.rows[0];

    // Update last login time
    await query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userProfile.id]
    );

    // Create custom token for session
    const customToken = await admin.auth().createCustomToken(decodedToken.uid);

    res.status(200).json({
      message: 'Login successful',
      user: {
        uid: userProfile.firebase_uid,
        email: userProfile.email,
        displayName: userProfile.display_name,
        id: userProfile.id
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

// Get user profile from PostgreSQL
exports.getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify the requesting user has access to this profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User profile not found' 
      });
    }

    const userProfile = userResult.rows[0];
    
    // Get user preferences
    const preferencesResult = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userProfile.id]
    );

    res.status(200).json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        displayName: userProfile.display_name,
        subscriptionTier: userProfile.subscription_tier,
        subscriptionStatus: userProfile.subscription_status,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
        preferences: preferencesResult.rows[0] || {}
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Failed to get user profile' 
    });
  }
};

// Update user profile in PostgreSQL
exports.updateUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, preferences } = req.body;
    
    // Verify the requesting user has access to this profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Get user ID from firebase_uid
    const userResult = await query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const userId = userResult.rows[0].id;
    const updateData = {};
    
    if (displayName !== undefined) {
      await query(
        'UPDATE users SET display_name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [displayName, userId]
      );
      updateData.displayName = displayName;
    }

    if (preferences !== undefined) {
      await query(
        'UPDATE user_preferences SET theme = $1, default_chart_period = $2, notifications_enabled = $3, email_notifications = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5',
        [preferences.theme, preferences.defaultChartPeriod, preferences.notificationsEnabled, preferences.emailNotifications, userId]
      );
      updateData.preferences = preferences;
    }

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

// Delete user account from both Firebase and PostgreSQL
exports.deleteUser = async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify the requesting user has access to this profile
    if (req.user.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    // Get user ID from firebase_uid
    const userResult = await query(
      'SELECT id FROM users WHERE firebase_uid = $1',
      [uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const userId = userResult.rows[0].id;

    // Delete user from PostgreSQL (cascade will handle related tables)
    await query('DELETE FROM users WHERE id = $1', [userId]);
    
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