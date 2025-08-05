const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      })
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')

    // Add user info to request
    req.user = {
      id: decoded.userId
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please log in again'
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please log in again'
      })
    }

    res.status(401).json({
      error: 'Authentication failed',
      message: 'Please log in again'
    })
  }
}

module.exports = authMiddleware