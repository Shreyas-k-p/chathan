const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected for seeding...');

    // 1. Create Restaurant
    const restaurant = await Restaurant.create({
      name: 'Scan4Serve Premium Grill',
      slug: 'premium-grill',
      plan: 'pro'
    });

    // 2. Create Restaurant Admin
    const admin = await User.create({
      name: 'Restaurant Admin',
      email: 'admin@scan4serve.com',
      password: 'password123',
      role: 'restaurant_admin',
      restaurantId: restaurant._id
    });

    // 3. Create Staff
    await User.create({
        name: 'Head Chef',
        email: 'kitchen@scan4serve.com',
        password: 'password123',
        role: 'kitchen',
        restaurantId: restaurant._id
    });

    // 4. Create Category
    const cat = await Category.create({
      restaurantId: restaurant._id,
      name: 'Signature Burgers',
      order: 1
    });

    // 5. Create Menu Items
    await MenuItem.create({
      restaurantId: restaurant._id,
      categoryId: cat._id,
      name: 'The Boss Burger',
      price: 18.5,
      description: 'Double beef patty, truffle oil, and mature cheddar.',
      isAvailable: true
    });

    // 6. Create Table
    await Table.create({
      restaurantId: restaurant._id,
      tableNumber: '14',
      capacity: 4
    });

    console.log('✅ Seeding Complete!');
    console.log(`- Login Email: admin@scan4serve.com`);
    console.log(`- Password: password123`);
    console.log(`- Customer QR URL: http://localhost:3000/order?restaurantId=${restaurant._id}&tableId=14`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
  }
};

seed();
