const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  tableNumber: { type: String, required: true },
  qrCodeUrl: { type: String },
  capacity: { type: Number },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Table', tableSchema);
