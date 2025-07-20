import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate access token
export const generateAccessToken = (userId, email) => {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'access'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '15m',
      issuer: 'zklogin-backend',
      audience: 'zklogin-frontend'
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { 
      userId, 
      email,
      type: 'refresh',
      jti: crypto.randomUUID() // Unique token ID
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'zklogin-backend',
      audience: 'zklogin-frontend'
    }
  );
};

// Generate both access and refresh tokens
export const generateTokenPair = (userId, email) => {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email)
  };
};

// Verify token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

// Decode token without verification (for inspection)
export const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

// Check if token is expired
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

// Generate secure random string for salts, nonces, etc.
export const generateSecureRandom = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Hash sensitive data
export const hashData = (data, algorithm = 'sha256') => {
  return crypto.createHash(algorithm).update(data).digest('hex');
};

// Create HMAC signature
export const createHMACSignature = (data, secret = process.env.JWT_SECRET) => {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

// Verify HMAC signature
export const verifyHMACSignature = (data, signature, secret = process.env.JWT_SECRET) => {
  const expectedSignature = createHMACSignature(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

// Generate API key (for future use)
export const generateAPIKey = () => {
  const prefix = 'zk_';
  const randomPart = crypto.randomBytes(24).toString('base64url');
  return prefix + randomPart;
};

// Validate JWT structure (basic validation)
export const validateJWTStructure = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }
    
    // Try to decode each part
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    // Basic structure validation
    return (
      header && typeof header === 'object' &&
      payload && typeof payload === 'object' &&
      header.alg && header.typ
    );
  } catch (error) {
    return false;
  }
};

// Token blacklist utilities (for logout functionality)
const tokenBlacklist = new Set();

export const blacklistToken = (token) => {
  const decoded = jwt.decode(token);
  if (decoded && decoded.jti) {
    tokenBlacklist.add(decoded.jti);
  }
};

export const isTokenBlacklisted = (token) => {
  const decoded = jwt.decode(token);
  return decoded && decoded.jti && tokenBlacklist.has(decoded.jti);
};

// Clean up expired tokens from blacklist (call this periodically)
export const cleanupBlacklist = () => {
  // In a production environment, you'd want to store this in Redis or database
  // and clean up based on token expiration times
  tokenBlacklist.clear();
};