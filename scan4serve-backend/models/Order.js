const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true }, // Mission Critical: SaaS Isolation
  tableId: String,
  items: [
    {
      name: String,
      qty: Number,
      price: Number
    }
  ],
  total: Number,
  status: {
    type: String,
    enum: ["PLACED", "PREPARING", "READY", "SERVED", "CANCELLED"],
    default: "PLACED"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
