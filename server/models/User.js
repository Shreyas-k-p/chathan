const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'restaurant_admin', 'manager', 'sub_manager', 'waiter', 'kitchen'], 
    required: true 
  },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: function() {
    return this.role !== 'super_admin'; // only super admin doesn't need restaurantId
  }},
  isActive: { type: Boolean, default: true },
  profilePhoto: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
