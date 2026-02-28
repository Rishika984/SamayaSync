const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// ------------------ REGISTER ------------------
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password,
    });

    if (!user) return res.status(400).json({ message: 'Invalid user data' });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token,
      message: 'Registration successful',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------ LOGIN ------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.provider === 'google') {
      return res.status(400).json({
        message: 'This account uses Google sign-in. Please use the "Continue with Google" button.',
      });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------ LOGOUT ------------------
exports.logout = async (req, res) => {
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

// ------------------ GET CURRENT USER ------------------
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------ UPDATE PROFILE ------------------
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, studyGoal } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (studyGoal !== undefined) user.studyGoal = studyGoal;
    if (fullName !== undefined) user.fullName = fullName.trim();

    await user.save();

    return res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      nickName: user.nickName,
      profileImage: user.profileImage,
      studyGoal: user.studyGoal,
      role: user.role,
      createdAt: user.createdAt,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------ UPLOAD PROFILE IMAGE ------------------
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Store the relative path to the image
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};

// ------------------ FORGOT PASSWORD ------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        message: 'Password reset link sent (if account exists)',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 600000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#a78bfa;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link will expire in 10 Minutes.</p>
      <b>If you didn't request this, ignore this email.</b>
    `;

    await sendEmail({ to: user.email, subject: 'Password Reset Request', html: message });

    return res.json({
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Error sending password reset email' });
  }
};

// ------------------ RESET PASSWORD ------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Error resetting password' });
  }
};

// ------------------ HELPER FUNCTIONS ------------------
function setTokenCookie(res, token) {
  const cookieExpire = parseInt(process.env.JWT_COOKIE_EXPIRE || 30);

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    maxAge: 10 * 60 * 1000,
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Samaya Sync" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
