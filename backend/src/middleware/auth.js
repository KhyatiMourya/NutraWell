import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_nutrawell_jwt_token_key_12345';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  // Extract token from 'Bearer <token>'
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    
    // Return 403 Forbidden on expired or modified tokens
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}
