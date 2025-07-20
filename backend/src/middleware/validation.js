import Joi from 'joi';

// Generic validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }
    
    next();
  };
};

// Validation schemas
export const schemas = {
  // zkLogin authentication
  zkLoginAuth: Joi.object({
    jwt: Joi.string().required().messages({
      'string.empty': 'JWT token is required',
      'any.required': 'JWT token is required'
    }),
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required().messages({
      'string.pattern.base': 'Invalid Sui wallet address format',
      'any.required': 'Wallet address is required'
    }),
    userSalt: Joi.string().required().messages({
      'string.empty': 'User salt is required',
      'any.required': 'User salt is required'
    }),
    maxEpoch: Joi.number().integer().positive().optional(),
    aud: Joi.string().optional()
  }),

  // User registration (for future use)
  userRegistration: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Valid email address is required',
      'any.required': 'Email is required'
    }),
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    })
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Valid email address is required',
      'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token is required',
      'any.required': 'Refresh token is required'
    })
  }),

  // Update user profile
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').optional(),
      language: Joi.string().min(2).max(5).optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        push: Joi.boolean().optional()
      }).optional()
    }).optional()
  }),

  // Wallet address lookup
  walletLookup: Joi.object({
    walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required().messages({
      'string.pattern.base': 'Invalid Sui wallet address format',
      'any.required': 'Wallet address is required'
    })
  }),

  // Google OAuth data
  googleOAuth: Joi.object({
    code: Joi.string().required().messages({
      'string.empty': 'Authorization code is required',
      'any.required': 'Authorization code is required'
    }),
    state: Joi.string().optional(),
    scope: Joi.string().optional()
  }),

  // User ID parameter validation
  userId: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
  })
};

// Validate URL parameters
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Parameter validation error',
        errors: errorMessages
      });
    }
    
    next();
  };
};

// Validate query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Query validation error',
        errors: errorMessages
      });
    }
    
    next();
  };
};