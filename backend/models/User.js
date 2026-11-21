const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // `select: false` keeps the hash out of every query by default;
    // it is only loaded explicitly during login.
    password: { type: String, required: true, minlength: 6, select: false },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash the password before saving (only when it changed).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare a plaintext password against the stored hash.
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Public representation — never exposes the password hash.
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    registrationNumber: this.registrationNumber,
    role: this.role || 'voter',
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('User', userSchema);
