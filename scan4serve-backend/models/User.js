const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["SUPER_ADMIN", "MANAGER", "KITCHEN", "WAITER"],
    default: "WAITER"
  },
  restaurantId: { type: String }, // Links to the restaurant node
  profilePhoto: { type: String }
});

module.exports = mongoose.model("User", userSchema);
