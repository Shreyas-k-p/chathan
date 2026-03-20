const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    notes: { type: String }
  }],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['placed', 'accepted', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'rejected'], 
    default: 'placed' 
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['cash', 'qr_card', 'stripe'], default: 'cash' },
  
  // New specific requirements
  cancelRequested: { type: Boolean, default: false },
  cancelStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
  editable: { type: Boolean, default: true },
  
  customerMetadata: {
    customerName: { type: String },
    customerPhone: { type: String }
  },
  estimatedTime: { type: Number }, // in minutes
  assignedWaiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps and auto-manage 'editable' status
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Rule: Before kitchen accepts (Placed), customer can edit.
  // After kitchen accepts (Accepted, Preparing, etc.), customer CANNOT edit directly.
  if (this.status !== 'placed') {
    this.editable = false;
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);
