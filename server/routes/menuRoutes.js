const express = require('express');
const { 
  getCategories, createCategory,
  getMenuItems, createMenuItem, updateMenuItem
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');
const restrictToTenant = require('../middleware/tenant');

const router = express.Router();

// Publicly accessible for customers to fetch the menu (restricted by restaurantId query)
router.get('/categories', getCategories);
router.get('/items', getMenuItems);

// Protected Staff Routes
router.post('/categories', protect, restrictToTenant, authorize('restaurant_admin', 'manager'), createCategory);
router.post('/items', protect, restrictToTenant, authorize('restaurant_admin', 'manager'), createMenuItem);
router.put('/items/:id', protect, restrictToTenant, authorize('restaurant_admin', 'manager', 'kitchen'), updateMenuItem);

module.exports = router;
