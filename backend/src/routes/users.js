import express from 'express';
import User from '../models/User.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate, validateParams, schemas } from '../middleware/validation.js';
import { apiLimiter } from '../middleware/security.js';

const router = express.Router();

// Get all users (admin only)
router.get('/',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find({ isActive: true })
        .select('-refreshTokens -userSalt -metadata')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments({ isActive: true });

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  }
);

// Get user by ID (admin only)
router.get('/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(schemas.userId),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-refreshTokens -userSalt');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: { user: user.toPublicJSON() }
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user'
      });
    }
  }
);

// Search users by email or wallet address
router.get('/search/:query',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { query } = req.params;
      const searchRegex = new RegExp(query, 'i');

      const users = await User.find({
        isActive: true,
        $or: [
          { email: searchRegex },
          { name: searchRegex },
          { suiWalletAddress: query } // Exact match for wallet address
        ]
      })
      .select('-refreshTokens -userSalt -metadata')
      .limit(20);

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Search failed'
      });
    }
  }
);

// Get user by wallet address (public endpoint for zkLogin verification)
router.get('/wallet/:walletAddress',
  apiLimiter,
  async (req, res) => {
    try {
      const { walletAddress } = req.params;

      const user = await User.findByWalletAddress(walletAddress);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Return minimal public info
      res.status(200).json({
        success: true,
        data: {
          exists: true,
          email: user.email,
          name: user.name,
          picture: user.picture,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Get user by wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user'
      });
    }
  }
);

// Deactivate user (admin only)
router.delete('/:id',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(schemas.userId),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete - mark as inactive
      user.isActive = false;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate user'
      });
    }
  }
);

// Reactivate user (admin only)
router.put('/:id/reactivate',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  validateParams(schemas.userId),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User reactivated successfully',
        data: { user: user.toPublicJSON() }
      });
    } catch (error) {
      console.error('Reactivate user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reactivate user'
      });
    }
  }
);

// Get user statistics (admin only)
router.get('/analytics/stats',
  apiLimiter,
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalInactive = await User.countDocuments({ isActive: false });
      const recentUsers = await User.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });

      // Get login activity for last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentLogins = await User.countDocuments({
        isActive: true,
        lastLoginAt: { $gte: sevenDaysAgo }
      });

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalInactive,
            recentUsers,
            recentLogins
          }
        }
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics'
      });
    }
  }
);

export default router;