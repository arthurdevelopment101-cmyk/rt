import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import PRODUCTS directly
import { PRODUCTS } from "./src/data.ts";
import { DB, connectDB, getJsonBinConfig, saveJsonBinConfig, pushToJsonBin, pullFromJsonBin, createJsonBin } from "./src/lib/db.ts";

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

// JSONBin.io Integration API endpoints
app.get("/api/jsonbin/config", (req, res) => {
  res.json(getJsonBinConfig());
});

app.post("/api/jsonbin/config", async (req, res) => {
  try {
    const { masterKey, binId, enabled } = req.body;
    let finalBinId = binId;

    if (enabled && masterKey && !finalBinId) {
      // Auto-create bin if missing but key is provided
      const createdId = await createJsonBin(masterKey);
      if (createdId) {
        finalBinId = createdId;
      } else {
        return res.status(400).json({ error: "Failed to automatically create a bin. Please verify your Master Key." });
      }
    }

    const newConfig = {
      masterKey: masterKey || "",
      binId: finalBinId || "",
      enabled: !!enabled
    };

    saveJsonBinConfig(newConfig);

    // If enabled, do an immediate pull to sync, or if empty, do a push
    if (newConfig.enabled && newConfig.binId) {
      const pulled = await pullFromJsonBin();
      if (!pulled) {
        // If pull failed (maybe new bin), push current local data to it
        await pushToJsonBin();
      }
    }

    res.json(newConfig);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/jsonbin/sync", async (req, res) => {
  try {
    const { action } = req.body; // "pull" or "push"
    if (action === "pull") {
      const success = await pullFromJsonBin();
      res.json({ success });
    } else {
      const success = await pushToJsonBin();
      res.json({ success });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite or Static Assets handling
async function initServer() {
  // Try connecting to MongoDB on startup (falls back gracefully)
  connectDB().catch((err) => console.error("Initial database connection error:", err));

  // Sync with JSONBin on startup if enabled
  const jsonBinConfig = getJsonBinConfig();
  if (jsonBinConfig.enabled && jsonBinConfig.masterKey) {
    if (!jsonBinConfig.binId) {
      console.log("JSONBin integration enabled but no Bin ID found. Automatically creating a new cloud bin...");
      createJsonBin(jsonBinConfig.masterKey)
        .then((createdId) => {
          if (createdId) {
            console.log(`Successfully created a new JSONBin.io cloud bin: ${createdId}`);
            saveJsonBinConfig({
              ...jsonBinConfig,
              binId: createdId
            });
            // Initial push
            return pushToJsonBin();
          } else {
            console.error("Failed to automatically create a new JSONBin.io cloud bin.");
          }
        })
        .then((success) => {
          if (success) {
            console.log("Initial push of catalog to the new JSONBin.io cloud bin completed successfully!");
          }
        })
        .catch((err) => console.error("Error during JSONBin auto-provisioning:", err));
    } else {
      console.log("JSONBin integration enabled. Syncing data on startup...");
      pullFromJsonBin()
        .then((success) => {
          if (success) {
            console.log("Successfully synchronized local database with JSONBin.io cloud on boot!");
          } else {
            console.log("Could not pull from JSONBin.io on boot. Using local storage.");
          }
        })
        .catch((err) => console.error("Error during JSONBin.io startup sync:", err));
    }
  }

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
