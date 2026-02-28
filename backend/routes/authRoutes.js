const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.resolve(__dirname, '..', 'uploads');
    console.log('Multer destination:', uploadPath);
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const userId = req.user._id.toString();
    const fileName = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
    console.log('Multer filename:', fileName);
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Images only!'));
    }
  },
});

const {
  register,
  login,
  getMe,
  updateProfile,
  uploadProfileImage,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation } = require('../utils/validators');
const validate = require('../middleware/validateMiddleware');

// Auth routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile/upload-image', protect, upload.single('image'), uploadProfileImage);
router.post('/logout', protect, logout);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:3000/login?error=google_auth_failed'
  }),
  (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      });

      const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE || 30);
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        maxAge: cookieExpire * 24 * 60 * 60 * 1000,
      });

      res.redirect('http://localhost:3000/dashboard');
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('http://localhost:3000/login?error=auth_failed');
    }
  }
);

module.exports = router;
