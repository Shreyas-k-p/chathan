const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subscriptionStatus: { type: String, enum: ['active', 'expired', 'suspended'], default: 'active' },
  plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
  logoUrl: { type: String },
  address: { type: String },
  contactNumber: { type: String },
  isActive: { type: Boolean, default: true },
  settings: {
    currency: { type: String, default: 'USD' },
    taxPercentage: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
