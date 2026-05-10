const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      return res.status(401).json({ status: 'error', message: 'Please login to continue' });

    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ status: 'error', message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ status: 'error', message: 'Invalid or expired token. Please login again.' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ status: 'error', message: 'Admin access required' });
  next();
};
