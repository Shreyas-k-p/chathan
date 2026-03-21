const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  qrId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Table", tableSchema);
