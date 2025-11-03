import jwt from 'jsonwebtoken';

// Optional authentication middleware - doesn't reject unauthenticated requests
const optionalAuth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided - continue without user info
      req.user = null;
      return next();
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      // Invalid token - continue without user info
      req.user = null;
      next();
    }
  } catch (err) {
    req.user = null;
    next();
  }
};

export default optionalAuth;
