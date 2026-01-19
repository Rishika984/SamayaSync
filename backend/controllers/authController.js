const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,  // ✅ CHANGED FROM joinDate
        message: 'Registration successful'
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user signed up with Google
    if (user.provider === 'google') {
      return res.status(400).json({
        message: 'This account uses Google sign-in. Please use the "Continue with Google" button.',
      });
    }

    // Check password
    if (await user.matchPassword(password)) {
      const token = generateToken(user._id);

      const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE || 30);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        maxAge: cookieExpire * 24 * 60 * 60 * 1000,
      });

      return res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,  // ✅ CHANGED FROM joinDate
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      nickName: user.nickName,
      studyGoal: user.studyGoal,
      role: user.role,
      createdAt: user.createdAt,  // ✅ ADDED THIS
      updatedAt: user.updatedAt,  // ✅ ADDED THIS
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { nickName, studyGoal } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (nickName !== undefined) user.nickName = nickName.trim();
    if (studyGoal !== undefined) user.studyGoal = studyGoal;

    await user.save();

    return res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      nickName: user.nickName,
      studyGoal: user.studyGoal,
      role: user.role,
      createdAt: user.createdAt,  // ✅ CHANGED FROM joinDate
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    
    return res.json({ message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
};