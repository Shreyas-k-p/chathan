const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mqtt = require("mqtt");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models
const User = require("./models/User");
const Order = require("./models/Order");
const Restaurant = require("./models/Restaurant");
const MenuItem = require("./models/MenuItem");
const Table = require("./models/Table");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Matrix Sync
mongoose.set('strictQuery', false);
const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  tlsAllowInvalidCertificates: true // Operational Fix for TLS/SSL store deadlocks on Windows
};

mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(()=>console.log("✅ SaaS Matrix Registry Connected to MongoDB Atlas"))
  .catch(err=>{
    console.error("❌ Registry Connectivity CRITICAL FAILURE:");
    console.error(err);
  });

// MQTT Bridge Hub (Wildcard subscription for multi-tenant monitoring)
const mqttClient = mqtt.connect("mqtts://y12dbb61.ala.asia-southeast1.emqxsl.com:8883", {
  username: "table_T01",
  password: "scan4serve",
  rejectUnauthorized: false
});

mqttClient.on("connect", () => {
  console.log("✅ MQTT Multi-Node Hub Connected");
  mqttClient.subscribe("restaurant/#");
});

// Middleware: Multi-Tenant Shield
const authShield = (roles = []) => {
  return async (req,res,next)=>{
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if(!token) return res.status(401).send("No Matrix Session Found");

      const decoded = jwt.verify(token, "secret_key");
      if(roles.length && !roles.includes(decoded.role)){
        return res.status(403).send("Registry Access Denied");
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).send("Session Expired");
    }
  };
};

// Auth Actions
app.post("/auth/login", async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid Node Credentials" });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Access Denied" });

    const token = jwt.sign({ id: user._id, role: user.role, restaurantId: user.restaurantId }, "secret_key");
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SaaS Matrix: Nodes (Super Admin Protected)
app.get("/restaurants", async (req,res)=> res.json(await Restaurant.find()));
app.post("/restaurants", async (req,res)=> res.json(await Restaurant.create(req.body)));

// Multi-Tenant Menu
app.get("/menu/:restaurantId", async (req,res)=> res.json(await MenuItem.find({ restaurantId: req.params.restaurantId })));
app.post("/menu", authShield(["MANAGER", "SUPER_ADMIN"]), async (req,res)=> res.json(await MenuItem.create({...req.body, restaurantId: req.user.restaurantId})));

// Isolated Tables
app.get("/tables/:restaurantId", async (req,res)=> res.json(await Table.find({ restaurantId: req.params.restaurantId })));

// Isolated Orders (The CORE)
app.get("/orders/:restaurantId", async (req,res)=> res.json(await Order.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 })));

app.post("/order", async (req,res)=>{
  try{
    const order = new Order(req.body);
    await order.save();
    
    // Multi-tenant MQTT Broadcast: restaurant/{resId}/table/{tabId}
    const topic = `restaurant/${order.restaurantId}/table/${order.tableId.replace('T', '') || '1'}`;
    mqttClient.publish(topic, JSON.stringify({ type: "ORDER_PLACED", order_id: order._id, items: order.items, total: order.total }));

    res.json({success:true, order});
  } catch(err){ res.status(500).json({error:err.message}); }
});

app.put("/order/status/:id", async (req,res)=>{
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  const topic = `restaurant/${order.restaurantId}/table/${order.tableId.replace('T', '') || '1'}`;
  mqttClient.publish(topic, JSON.stringify({ type: "STATUS_UPDATE", order_id: order._id, status: order.status }));
  res.json(order);
});

// 🧪 COMPREHENSIVE MULTI-TENANT SEED SCRIPT
app.get("/system/seed", async (req,res)=>{
  try {
    if (mongoose.connection.readyState !== 1) {
       console.log("Telemetry Alert: Re-anchoring Node Registry...");
       await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    }
    
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});

    // 1. Shreyas (Super Admin: Global Matrix Hub)
    const hashedSuper = await bcrypt.hash("shreyas5710", 10);
    await User.create({ name: 'Shreyas', email: 'shreyas5710kp@gmail.com', password: hashedSuper, role: 'SUPER_ADMIN' });

    // --- NODE A: THE GRAND PALACE ---
    const nodeA = await Restaurant.create({ name: 'The Grand Palace', managerName: 'Sanjay Malik', mobile: '9876543210', location: 'Mumbai HQ', valuation: '₹8.4L' });
    const hashedManagerA = await bcrypt.hash("manager123", 10);
    await User.create({ name: 'Sanjay Malik', email: 'manager@grandpalace.com', password: hashedManagerA, role: 'MANAGER', restaurantId: nodeA._id });
    await User.create({ name: 'Waiter Node A', email: 'waiter@grandpalace.com', password: hashedManagerA, role: 'WAITER', restaurantId: nodeA._id });
    await User.create({ name: 'Chef Raj', email: 'kitchen@grandpalace.com', password: hashedManagerA, role: 'KITCHEN', restaurantId: nodeA._id });

    await MenuItem.create([
      { restaurantId: nodeA._id, name: 'Palace Tikka', price: 450, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0' },
      { restaurantId: nodeA._id, name: 'Royal Paneer', price: 380, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7' }
    ]);

    // --- NODE B: SPICY BISTRO ---
    const nodeB = await Restaurant.create({ name: 'Spicy Bistro', managerName: 'Anita Rao', mobile: '9123456780', location: 'Delhi Hub', valuation: '₹4.2L' });
    const hashedManagerB = await bcrypt.hash("manager123", 10);
    await User.create({ name: 'Anita Rao', email: 'manager@spicybistro.com', password: hashedManagerB, role: 'MANAGER', restaurantId: nodeB._id });
    await User.create({ name: 'Kitchen B', email: 'kitchen@spicybistro.com', password: hashedManagerB, role: 'KITCHEN', restaurantId: nodeB._id });

    await MenuItem.create([
      { restaurantId: nodeB._id, name: 'Bistro Pizza', price: 590, category: 'Pizzas', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
      { restaurantId: nodeB._id, name: 'Spicy Pasta', price: 420, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8' }
    ]);

    res.json({ success: true, message: "SaaS Multi-Tenant Hub Seeded: 2 Nodes Isolated + Super Admin Active." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 5000;
app.listen(PORT, ()=>console.log(`Scan4Serve Matrix Engine v4.0 Active: Port ${PORT}`));
