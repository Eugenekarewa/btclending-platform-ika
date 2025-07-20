import User from '../models/User.js';
import { generateTokenPair, verifyToken, generateSecureRandom } from '../utils/jwt.js';
import { jwtDecode } from 'jwt-decode';

// zkLogin authentication endpoint
export const zkLoginAuth = async (req, res) => {
  try {
    const { jwt: googleJWT, walletAddress, userSalt, maxEpoch, aud } = req.body;

    // Decode and validate Google JWT
    let googleClaims;
    try {
      googleClaims = jwtDecode(googleJWT);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JWT token format'
      });
    }

    // Validate required Google JWT fields
    if (!googleClaims.sub || !googleClaims.email || !googleClaims.iss) {
      return res.status(400).json({
        success: false,
        message: 'Missing required JWT claims'
      });
    }

    // Validate issuer (should be Google)
    if (googleClaims.iss !== 'https://accounts.google.com') {
      return res.status(400).json({
        success: false,
        message: 'Invalid JWT issuer'
      });
    }

    // Check if user exists by Google ID
    let user = await User.findByGoogleId(googleClaims.sub);

    if (user) {
      // Existing user - update login info
      await user.updateLoginInfo(
        req.get('user-agent') || 'Unknown',
        req.ip || 'Unknown'
      );

      // Verify wallet address matches
      if (user.suiWalletAddress !== walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address mismatch'
        });
      }
    } else {
      // New user - create account
      try {
        user = await User.createFromGoogleOAuth(
          {
            id: googleClaims.sub,
            email: googleClaims.email,
            name: googleClaims.name || googleClaims.email,
            picture: googleClaims.picture
          },
          walletAddress,
          userSalt,
          aud || googleClaims.aud
        );
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          if (error.keyPattern?.email) {
            return res.status(409).json({
              success: false,
              message: 'Email already registered'
            });
          }
          if (error.keyPattern?.suiWalletAddress) {
            return res.status(409).json({
              success: false,
              message: 'Wallet address already registered'
            });
          }
        }
        throw error;
      }
    }

    // Generate JWT tokens for our backend
    const tokens = generateTokenPair(user._id, user.email);

    // Add refresh token to user's token list
    await user.addRefreshToken(tokens.refreshToken);

    // Return user data and tokens
    res.status(200).json({
      success: true,
      message: user.loginCount === 1 ? 'Account created successfully' : 'Login successful',
      data: {
        user: user.toPublicJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        walletAddress: user.suiWalletAddress
      }
    });

  } catch (error) {
    console.error('zkLogin authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get wallet address for a user (for frontend fallback)
export const getWalletAddress = async (req, res) => {
  try {
    const { jwt: googleJWT } = req.body;

    // Decode Google JWT
    let googleClaims;
    try {
      googleClaims = jwtDecode(googleJWT);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JWT token format'
      });
    }

    // Find user by Google ID
    const user = await User.findByGoogleId(googleClaims.sub);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.suiWalletAddress,
        userSalt: user.userSalt
      }
    });

  } catch (error) {
    console.error('Get wallet address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet address'
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    const user = req.user; // Set by verifyRefreshToken middleware
    const oldRefreshToken = req.refreshToken;

    // Generate new token pair
    const tokens = generateTokenPair(user._id, user.email);

    // Remove old refresh token and add new one
    await user.removeRefreshToken(oldRefreshToken);
    await user.addRefreshToken(tokens.refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const user = req.user;
    const { refreshToken: tokenToRemove, logoutAll = false } = req.body;

    if (logoutAll) {
      // Remove all refresh tokens (logout from all devices)
      await user.clearAllRefreshTokens();
    } else if (tokenToRemove) {
      // Remove specific refresh token
      await user.removeRefreshToken(tokenToRemove);
    }

    res.status(200).json({
      success: true,
      message: logoutAll ? 'Logged out from all devices' : 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = req.user; // Set by authenticateToken middleware

    res.status(200).json({
      success: true,
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, preferences } = req.body;

    // Update allowed fields
    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Verify user's wallet address
export const verifyWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const user = req.user;

    if (user.suiWalletAddress !== walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address does not match'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Wallet address verified',
      data: {
        verified: true,
        walletAddress: user.suiWalletAddress
      }
    });

  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Wallet verification failed'
    });
  }
};

// Get user stats (for dashboard)
export const getUserStats = async (req, res) => {
  try {
    const user = req.user;

    const stats = {
      loginCount: user.loginCount,
      lastLoginAt: user.lastLoginAt,
      accountCreated: user.createdAt,
      isVerified: user.isVerified,
      totalRefreshTokens: user.refreshTokens.length
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user stats'
    });
  }
};