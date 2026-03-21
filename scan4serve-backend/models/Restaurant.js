const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  managerName: String,
  mobile: String,
  location: String,
  status: { type: String, enum: ["active", "pending"], default: "active" },
  valuation: { type: String, default: "₹0" },
  staffCount: { type: Number, default: 0 },
  managerPhoto: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
