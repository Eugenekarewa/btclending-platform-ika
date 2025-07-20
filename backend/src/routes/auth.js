import express from 'express';
import {
  zkLoginAuth,
  getWalletAddress,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  verifyWallet,
  getUserStats
} from '../controllers/authController.js';
import { authenticateToken, verifyRefreshToken } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

// Public routes (no authentication required)

// zkLogin authentication - main endpoint for login/signup
router.post('/zklogin', 
  authLimiter,
  validate(schemas.zkLoginAuth),
  zkLoginAuth
);

// Get wallet address for a user (fallback for frontend)
router.post('/wallet-address',
  authLimiter,
  getWalletAddress
);

// Refresh access token
router.post('/refresh',
  authLimiter,
  validate(schemas.refreshToken),
  verifyRefreshToken,
  refreshToken
);

// Protected routes (authentication required)

// Get current user profile
router.get('/profile',
  authenticateToken,
  getProfile
);

// Update user profile
router.put('/profile',
  authenticateToken,
  validate(schemas.updateProfile),
  updateProfile
);

// Verify wallet address
router.post('/verify-wallet',
  authenticateToken,
  validate(schemas.walletLookup),
  verifyWallet
);

// Get user statistics
router.get('/stats',
  authenticateToken,
  getUserStats
);

// Logout user
router.post('/logout',
  authenticateToken,
  logout
);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;