const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['restaurant_admin', 'manager', 'sub_manager', 'waiter', 'kitchen'], required: true },
  email: { type: String, required: true },
  profilePhoto: { type: String },
  status: { type: String, default: 'offline' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
