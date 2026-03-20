const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  isSoldOut: { type: Boolean, default: false },
  isVegetarian: { type: Boolean, default: false },
  calories: { type: Number },
  estimatedPreparationTime: { type: Number }, // in minutes
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
