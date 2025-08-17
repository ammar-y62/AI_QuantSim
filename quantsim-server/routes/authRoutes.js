const express = require('express');
const router = express.Router();
const { 
  loginUser, 
  registerUser, 
  getUserProfile, 
  updateUserProfile, 
  deleteUser 
} = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

// Public routes (no authentication required)
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes (require Firebase token)
router.get('/profile/:uid', verifyFirebaseToken, getUserProfile);
router.put('/profile/:uid', verifyFirebaseToken, updateUserProfile);
router.delete('/profile/:uid', verifyFirebaseToken, deleteUser);

module.exports = router;
