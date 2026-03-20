const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Customer: Place Order
const createOrder = async (req, res) => {
  const { restaurantId, tableId, items, customerMetadata, notes } = req.body;

  try {
    // Check item availability
    for (let item of items) {
      const dbItem = await MenuItem.findById(item.menuItemId);
      if (!dbItem || dbItem.isSoldOut || !dbItem.isAvailable) {
        return res.status(400).json({ success: false, message: `Item '${item.name}' is currently unavailable.` });
      }
    }

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const order = await Order.create({
      restaurantId,
      tableId,
      items,
      totalAmount,
      customerMetadata,
      notes,
      status: 'placed' // Strict flow start
    });

    // Notify Kitchen & Staff
    const io = req.app.get('socketio');
    io.to(`restaurant_${restaurantId}`).emit('new_order', {
        success: true,
        data: order,
        message: 'New order received!'
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Customer: Request Cancellation
const requestOrderCancel = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        // Rule: Allowed ONLY in "Placed"
        if (order.status === 'placed') {
            order.status = 'cancelled';
            await order.save();
            
            // Notify Real-time
            const io = req.app.get('socketio');
            io.to(`restaurant_${order.restaurantId}`).emit('order_updated', {
                orderId: order._id,
                status: 'cancelled',
                message: 'Order cancelled by customer.'
            });
            
            return res.json({ success: true, message: 'Order cancelled successfully.', data: order });
        }

        // Rule: Conditional in "Accepted" - Request required
        if (order.status === 'accepted') {
            order.cancelRequested = true;
            order.cancelStatus = 'pending';
            await order.save();

            // Notify Real-time cancel request
            const io = req.app.get('socketio');
            io.to(`restaurant_${order.restaurantId}`).emit('cancel_requested', {
                orderId: order._id,
                message: 'Customer requested to cancel an accepted order.'
            });

            return res.json({ success: true, message: 'Cancellation request sent to kitchen.', data: order });
        }

        // Rule: Blocked in "Preparing" and beyond
        return res.status(400).json({ 
            success: false, 
            message: 'Order already in preparation and cannot be cancelled.' 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Staff: Handle Status Transition
const updateOrderStatus = async (req, res) => {
    const { status, estimatedTime } = req.body;
    try {
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, restaurantId: req.tenantId },
            { status, estimatedTime },
            { new: true }
        ).populate('tableId');

        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        // Notify Table & Staff
        const io = req.app.get('socketio');
        io.to(`restaurant_${req.tenantId}`).emit('status_changed', {
            orderId: order._id,
            status: order.status,
            tableNumber: order.tableId.tableNumber
        });

        // Notify specific table session
        io.to(`table_${order.tableId._id}`).emit('order_status_update', {
            status: order.status,
            message: `Your order is now: ${order.status.toUpperCase()}`
        });

        res.json({ success: true, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Staff: Handle Cancel Request (Approve/Reject)
const handleCancelRequest = async (req, res) => {
    const { approve } = req.body; // boolean
    try {
        const order = await Order.findOne({ _id: req.params.id, restaurantId: req.tenantId });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        if (!order.cancelRequested) return res.status(400).json({ success: false, message: 'No cancel request for this order.' });

        if (approve) {
            order.status = 'cancelled';
            order.cancelStatus = 'approved';
            order.cancelRequested = false;
        } else {
            order.cancelStatus = 'rejected';
            order.cancelRequested = false;
        }

        await order.save();

        // Notify Table Session
        const io = req.app.get('socketio');
        io.to(`table_${order.tableId}`).emit('cancel_response', {
            approved: approve,
            message: approve ? 'Transcription approved. Order cancelled.' : 'Cancellation rejected by kitchen.'
        });

        res.json({ success: true, message: `Cancel request ${approve ? 'approved' : 'rejected'}.`, data: order });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Staff: Get All Orders (Filtered by Tenant)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.tenantId })
      .populate('tableId')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Staff & Customer: Get Single Order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('tableId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Call Waiter helper
const callWaiter = async (req, res) => {
    const { restaurantId, tableNumber, tableId } = req.body;
    try {
        const io = req.app.get('socketio');
        io.to(`restaurant_${restaurantId}`).emit('call_waiter', {
            tableNumber,
            tableId,
            timestamp: new Date()
        });
        res.json({ success: true, message: 'Waiter called.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
  createOrder, getOrders, getOrderById, updateOrderStatus, 
  requestOrderCancel, handleCancelRequest, callWaiter 
};
