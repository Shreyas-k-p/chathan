const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// Category Management
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ restaurantId: req.tenantId }).sort({ order: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, restaurantId: req.tenantId });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// MenuItem Management
const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurantId: req.tenantId });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create({ ...req.body, restaurantId: req.tenantId });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, restaurantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'MenuItem not found.' });
    
    // Notify Real-time update (stock changes mid-order)
    const io = req.app.get('socketio');
    io.to(`restaurant_${req.tenantId}`).emit('stock_updated', {
        item: item.name,
        isSoldOut: item.isSoldOut,
        isAvailable: item.isAvailable
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getCategories, createCategory,
  getMenuItems, createMenuItem, updateMenuItem
};
