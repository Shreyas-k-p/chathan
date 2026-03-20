const express = require('express');
const { 
  createOrder, getOrders, getOrderById, updateOrderStatus, 
  requestOrderCancel, handleCancelRequest, callWaiter 
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const restrictToTenant = require('../middleware/tenant');

const router = express.Router();

// Public route for customers to place orders
router.post('/', createOrder);
// Public route for customers to request cancel or edit (using orderId)
router.post('/request-cancel/:id', requestOrderCancel);
router.post('/call-waiter', callWaiter);

// Protected Staff Routes
router.use(protect);
router.use(restrictToTenant);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', authorize('manager', 'kitchen', 'waiter'), updateOrderStatus);
router.post('/:id/cancel-response', authorize('manager', 'kitchen'), handleCancelRequest);

module.exports = router;
