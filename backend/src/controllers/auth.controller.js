const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, targetRole } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ status: 'error', message: 'Name, email and password are required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ status: 'error', message: 'Email already registered' });

    const user = await User.create({ name, email: email.toLowerCase(), password, targetRole: targetRole || 'Not Set' });
    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully!',
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, targetRole: user.targetRole } }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ status: 'error', message: 'Registration failed. Please try again.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ status: 'error', message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, targetRole: user.targetRole, stats: user.stats }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 'error', message: 'Login failed. Please try again.' });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ status: 'success', data: { user } });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, targetRole, profile } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, targetRole, profile }, { new: true });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Update failed' });
  }
};
