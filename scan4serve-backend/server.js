const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mqtt = require("mqtt");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Models Registry
const User = require("./models/User");
const Order = require("./models/Order");
const Restaurant = require("./models/Restaurant");
const MenuItem = require("./models/MenuItem");
const Table = require("./models/Table");
const Announcement = require("./models/Announcement");
const Staff = require("./models/Staff");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

// 📡 PRODUCTION HEALTH CHECK Node
app.get("/", (req, res) => res.send("📡 Scan4Serve Matrix Engine v5.0 [PRODUCTION_BLDR] Online"));

// MongoDB Matrix Sync (Cloud-Native)
mongoose.set('strictQuery', false);
const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
  tlsAllowInvalidCertificates: true 
};

mongoose.connect(process.env.MONGO_URI, mongoOptions)
  .then(()=>console.log("✅ SaaS Matrix Connected to MongoDB Atlas"))
  .catch(err=>console.error("❌ Registry CRITICAL FAILURE:", err));

// 📡 MQTT Multi-Node Hub Operational Config
const mqttUrl = process.env.MQTT_URL || "mqtts://y12dbb61.ala.asia-southeast1.emqxsl.com:8883";
const mqttClient = mqtt.connect(mqttUrl, {
  username: process.env.MQTT_USERNAME || "table_T01",
  password: process.env.MQTT_PASSWORD || "scan4serve",
  rejectUnauthorized: false
});

mqttClient.on("connect", () => {
  console.log("✅ MQTT Multi-Node Hub Synchronized");
  mqttClient.subscribe("restaurant/#");
});

// Middleware: SaaS Matrix Shield
const authShield = (roles = []) => {
  return async (req,res,next)=>{
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if(!token) return res.status(401).send("Matrix Node Unauthenticated");

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_matrix_key");
      if(roles.length && !roles.includes(decoded.role)){
        return res.status(403).send("Registry Access Denied");
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).send("Node Session Terminated");
    }
  };
};

// --- API ACTIONS Registry ---

// Auth Registry
app.post("/api/auth/login", async (req,res)=>{
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid Registry Credentials" });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Node Access Denied" });

    const token = jwt.sign({ id: user._id, role: user.role, name: user.name, restaurantId: user.restaurantId }, process.env.JWT_SECRET || "secret_matrix_key");
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements Registry
app.get("/api/announcements", async (req, res) => res.json(await Announcement.find().sort({ createdAt: -1 })));
app.post("/api/announcements", authShield(["SUPER_ADMIN", "MANAGER", "SUB_MANAGER"]), async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      authorId: req.user.id,
      authorName: req.user.name || "Admin Hub",
      restaurantId: req.user.restaurantId
    });
    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SaaS Matrix: Multi-Restaurant Hub
app.get("/api/restaurants", async (req,res)=> res.json(await Restaurant.find()));
app.post("/api/restaurants", async (req,res)=> {
    try { res.json(await Restaurant.create(req.body)); } 
    catch(err) { res.status(500).json({ error: err.message }); }
});

// Node-Isolated Staff Logic
app.get("/api/staff", async (req,res)=> res.json(await Staff.find().sort({ createdAt: -1 })));
app.post("/api/staff", async (req,res)=> {
    try { res.json(await Staff.create(req.body)); } 
    catch(err) { res.status(500).json({ error: err.message }); }
});
app.put("/api/staff/photo/:id", async (req,res)=> res.json(await Staff.findByIdAndUpdate(req.params.id, { profilePhoto: req.body.profilePhoto }, { new: true })));
app.delete("/api/staff/:id", async (req, res)=> res.json(await Staff.findByIdAndDelete(req.params.id)));


// Node-Isolated Menu Logic
app.get("/api/menu/:restaurantId", async (req,res)=> {
  if (req.params.restaurantId === 'ALL') return res.json(await MenuItem.find());
  res.json(await MenuItem.find({ restaurantId: req.params.restaurantId }));
});
app.post("/api/menu", authShield(["MANAGER", "SUPER_ADMIN"]), async (req,res)=> res.json(await MenuItem.create({...req.body, restaurantId: req.user.restaurantId})));

// Node-Isolated Orders
app.get("/api/orders/:restaurantId", async (req,res)=> {
  if (req.params.restaurantId === 'ALL') return res.json(await Order.find().sort({ createdAt: -1 }));
  res.json(await Order.find({ restaurantId: req.params.restaurantId }).sort({ createdAt: -1 }));
});

app.post("/api/order", async (req,res)=>{
  try{
    const order = await Order.create(req.body);
    
    // Broadcast Operational Telemetry
    const topic = `restaurant/${order.restaurantId}/table/${order.tableId.replace('T', '') || '1'}`;
    mqttClient.publish(topic, JSON.stringify({ type: "ORDER_PLACED", order_id: order._id, items: order.items, total: order.total }));

    res.json({success:true, order});
  } catch(err){ res.status(500).json({error:err.message}); }
});

app.put("/api/order/status/:id", async (req,res)=>{
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  const topic = `restaurant/${order.restaurantId}/table/${order.tableId.replace('T', '') || '1'}`;
  mqttClient.publish(topic, JSON.stringify({ type: "STATUS_UPDATE", order_id: order._id, status: order.status }));
  res.json(order);
});

// 🧪 SEED Registry Protocol
app.get("/api/system/seed", async (req,res)=>{
  try {
    if (mongoose.connection.readyState !== 1) {
       await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    }
    
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    await Order.deleteMany({});

    // Super Admin Identity
    const hashedSuper = await bcrypt.hash("shreyas5710", 10);
    await User.create({ name: 'Shreyas', email: 'shreyas5710kp@gmail.com', password: hashedSuper, role: 'SUPER_ADMIN' });

    // Node: The Grand Palace
    const nodeA = await Restaurant.create({ name: 'The Grand Palace', managerName: 'Sanjay Malik', mobile: '9876543210', location: 'Mumbai HQ', valuation: '₹8.4L' });
    const hashedManager = await bcrypt.hash("manager123", 10);
    await User.create({ name: 'Sanjay Malik', email: 'manager@grandpalace.com', password: hashedManager, role: 'MANAGER', restaurantId: nodeA._id });

    await MenuItem.create([
      { restaurantId: nodeA._id, name: 'Palace Tikka', price: 450, category: 'Starters', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0' },
      { restaurantId: nodeA._id, name: 'Royal Paneer', price: 380, category: 'Main Course', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7' }
    ]);

    res.json({ success: true, message: "SaaS Multi-Tenant Registry Seeded Successfully." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log(`📡 Scan4Serve Matrix Hub Synchronized to Port ${PORT}`));
