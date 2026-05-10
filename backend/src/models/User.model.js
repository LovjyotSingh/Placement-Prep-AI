const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  targetRole: {
    type: String,
    enum: ['SDE', 'Data Analyst', 'Business Analyst', 'Product Manager', 'Not Set'],
    default: 'Not Set'
  },
  profile: {
    college: String,
    graduationYear: Number,
    skills: [String],
    phone: String
  },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    lastInterviewDate: Date
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
