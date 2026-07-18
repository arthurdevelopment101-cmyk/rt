import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import PRODUCTS directly
import { PRODUCTS } from "./src/data.ts";
import { DB, connectDB, getDbConfig, saveDbConfig } from "./src/lib/db.ts";

// Dual ESM/CJS safe resolution of filename and directory
const currentFilename = typeof __filename !== "undefined" 
  ? __filename 
  : fileURLToPath(import.meta.url);
const currentDirname = typeof __dirname !== "undefined" 
  ? __dirname 
  : path.dirname(currentFilename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "products-db.json");
const ORDERS_FILE = path.join(process.cwd(), "orders-db.json");

app.use(express.json());

// Real-time SSE connection tracking
let sseClients: any[] = [];

function broadcastUpdate() {
  console.log(`Broadcasting real-time update to ${sseClients.length} connected clients...`);
  sseClients.forEach((client) => {
    try {
      client.write("data: REFRESH\n\n");
    } catch (err) {
      console.error("Error writing to SSE client:", err);
    }
  });
}

// Initialize database file with defaults if not exists
function getProductsFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading products database:", err);
  }
  // Write default products to disk
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(PRODUCTS, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing default products database:", err);
  }
  return PRODUCTS;
}

function saveProductsToDisk(products: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving products to database:", err);
  }
}

// Get and save orders from disk
function getOrdersFromDisk() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const content = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading orders database:", err);
  }
  return [];
}

function saveOrdersToDisk(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving orders to database:", err);
  }
}

// Real-Time SSE Endpoint
app.get("/api/updates", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Keep connection alive with initial status
  res.write("data: CONNECTED\n\n");

  sseClients.push(res);

  const heartbeat = setInterval(() => {
    try {
      res.write("data: PING\n\n");
    } catch (err) {
      // client disconnected
    }
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter((client) => client !== res);
  });
});

// API Routes - Products
app.get("/api/products", async (req, res) => {
  try {
    const products = await DB.getProducts();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const newProduct = req.body;
    if (!newProduct.id) {
      newProduct.id = `custom-${Date.now()}`;
    }
    const products = await DB.createProduct(newProduct);
    broadcastUpdate();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = req.body;
    const products = await DB.updateProduct(productId, updatedProduct);
    broadcastUpdate();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const products = await DB.deleteProduct(productId);
    broadcastUpdate();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/products/reset", async (req, res) => {
  try {
    const products = await DB.resetProducts();
    broadcastUpdate();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes - Orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await DB.getOrders();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = req.body;
    if (!newOrder.id) {
      newOrder.id = `order-${Date.now()}`;
    }
    const orders = await DB.createOrder(newOrder);
    broadcastUpdate();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const updatedOrder = req.body;
    const updated = await DB.updateOrder(orderId, updatedOrder);
    if (updated) {
      broadcastUpdate();
      res.json(updated);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const orders = await DB.deleteOrder(orderId);
    broadcastUpdate();
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes - Promos
app.get("/api/promos", async (req, res) => {
  try {
    const promos = await DB.getPromos();
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/promos", async (req, res) => {
  try {
    const newPromo = req.body;
    if (!newPromo.id) {
      newPromo.id = `promo-${Date.now()}`;
    }
    if (newPromo.code) {
      newPromo.code = newPromo.code.toUpperCase().trim();
    }
    const promos = await DB.createPromo(newPromo);
    broadcastUpdate();
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/promos/:id", async (req, res) => {
  try {
    const promoId = req.params.id;
    const updatedFields = req.body;
    if (updatedFields.code) {
      updatedFields.code = updatedFields.code.toUpperCase().trim();
    }
    const promos = await DB.updatePromo(promoId, updatedFields);
    broadcastUpdate();
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/promos/:id", async (req, res) => {
  try {
    const promoId = req.params.id;
    const promos = await DB.deletePromo(promoId);
    broadcastUpdate();
    res.json(promos);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes - Rewards
app.get("/api/rewards", async (req, res) => {
  try {
    const rewards = await DB.getRewards();
    res.json(rewards);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rewards", async (req, res) => {
  try {
    const newReward = req.body;
    if (!newReward.id) {
      newReward.id = `reward-${Date.now()}`;
    }
    if (newReward.code) {
      newReward.code = newReward.code.toUpperCase().trim();
    }
    const rewards = await DB.createReward(newReward);
    broadcastUpdate();
    res.json(rewards);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/rewards/:id", async (req, res) => {
  try {
    const rewardId = req.params.id;
    const updatedFields = req.body;
    if (updatedFields.code) {
      updatedFields.code = updatedFields.code.toUpperCase().trim();
    }
    const rewards = await DB.updateReward(rewardId, updatedFields);
    broadcastUpdate();
    res.json(rewards);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/rewards/:id", async (req, res) => {
  try {
    const rewardId = req.params.id;
    const rewards = await DB.deleteReward(rewardId);
    broadcastUpdate();
    res.json(rewards);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API Routes - Database Sync & Remote Configurations
app.get("/api/db-config", async (req, res) => {
  try {
    const config = getDbConfig();
    const isMongo = DB.isMongoConnected();
    
    // Test connection to Railway DB
    let isRailwayConnected = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const testRes = await fetch(`${config.railwayUrl.replace(/\/$/, "")}/api/products`, {
        signal: controller.signal
      });
      isRailwayConnected = testRes.ok;
      clearTimeout(timeoutId);
    } catch (err) {
      // Offline or errored
    }

    res.json({
      config,
      status: {
        mongoConnected: isMongo,
        railwayConnected: isRailwayConnected
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db-config", async (req, res) => {
  try {
    const { useRailwayDb, railwayUrl } = req.body;
    const current = getDbConfig();
    const updated = {
      useRailwayDb: typeof useRailwayDb === "boolean" ? useRailwayDb : current.useRailwayDb,
      railwayUrl: typeof railwayUrl === "string" ? railwayUrl.trim() : current.railwayUrl
    };
    saveDbConfig(updated);
    broadcastUpdate();
    res.json({ success: true, config: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db-sync/pull", async (req, res) => {
  try {
    const result = await (DB as any).pullFromRailway();
    broadcastUpdate();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/db-sync/push", async (req, res) => {
  try {
    const result = await (DB as any).pushToRailway();
    broadcastUpdate();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite or Static Assets handling
async function initServer() {
  // Try connecting to MongoDB on startup (falls back gracefully)
  connectDB().catch((err) => console.error("Initial database connection error:", err));

  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initServer();
