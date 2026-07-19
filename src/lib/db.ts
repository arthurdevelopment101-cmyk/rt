import mongoose, { Schema } from "mongoose";
import fs from "fs";
import path from "path";
import { PRODUCTS } from "../data.ts";

const DB_FILE = path.join(process.cwd(), "products-db.json");
const ORDERS_FILE = path.join(process.cwd(), "orders-db.json");
const PROMOS_FILE = path.join(process.cwd(), "promos-db.json");
const REWARDS_FILE = path.join(process.cwd(), "rewards-db.json");
const CONFIG_FILE = path.join(process.cwd(), "db-config.json");
const JSONBIN_CONFIG_FILE = path.join(process.cwd(), "jsonbin-config.json");

export interface DbConfig {
  useRailwayDb: boolean;
  railwayUrl: string;
}

const DEFAULT_CONFIG: DbConfig = {
  useRailwayDb: false,
  railwayUrl: "https://er-production-7d2a.up.railway.app"
};

export interface JsonBinConfig {
  masterKey: string;
  binId: string;
  enabled: boolean;
}

const DEFAULT_JSONBIN_CONFIG: JsonBinConfig = {
  masterKey: "",
  binId: "",
  enabled: false
};

export function getJsonBinConfig(): JsonBinConfig {
  try {
    if (fs.existsSync(JSONBIN_CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(JSONBIN_CONFIG_FILE, "utf-8"));
      return { ...DEFAULT_JSONBIN_CONFIG, ...data };
    }
  } catch (err) {
    console.error("Error reading jsonbin-config.json:", err);
  }
  return DEFAULT_JSONBIN_CONFIG;
}

export function saveJsonBinConfig(config: JsonBinConfig) {
  try {
    fs.writeFileSync(JSONBIN_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving jsonbin-config.json:", err);
  }
}

export async function createJsonBin(masterKey: string): Promise<string | null> {
  const data = {
    products: getProductsFromDisk(),
    orders: getOrdersFromDisk(),
    promos: getPromosFromDisk(),
    rewards: getRewardsFromDisk()
  };

  try {
    const res = await fetch("https://api.jsonbin.io/v3/b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey,
        "X-Bin-Name": "Vero_Accessories_Store_DB",
        "X-Bin-Private": "true"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`JSONBin creation returned status ${res.status}`);
    }

    const resJson: any = await res.json();
    if (resJson && resJson.metadata && resJson.metadata.id) {
      return resJson.metadata.id;
    }
  } catch (err) {
    console.error("Error creating JSONBin:", err);
  }
  return null;
}

export async function pushToJsonBin(): Promise<boolean> {
  const config = getJsonBinConfig();
  if (!config.enabled || !config.masterKey || !config.binId) return false;

  const data = {
    products: getProductsFromDisk(),
    orders: getOrdersFromDisk(),
    promos: getPromosFromDisk(),
    rewards: getRewardsFromDisk()
  };

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": config.masterKey
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`JSONBin returned status ${res.status}`);
    }
    return true;
  } catch (err) {
    console.error("Error pushing to JSONBin:", err);
    return false;
  }
}

export async function pullFromJsonBin(): Promise<boolean> {
  const config = getJsonBinConfig();
  if (!config.enabled || !config.masterKey || !config.binId) return false;

  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${config.binId}/latest`, {
      method: "GET",
      headers: {
        "X-Master-Key": config.masterKey,
        "X-Bin-Meta": "false"
      }
    });

    if (!res.ok) {
      throw new Error(`JSONBin returned status ${res.status}`);
    }

    const data: any = await res.json();
    if (data) {
      if (Array.isArray(data.products)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data.products, null, 2), "utf-8");
      }
      if (Array.isArray(data.orders)) {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(data.orders, null, 2), "utf-8");
      }
      if (Array.isArray(data.promos)) {
        fs.writeFileSync(PROMOS_FILE, JSON.stringify(data.promos, null, 2), "utf-8");
      }
      if (Array.isArray(data.rewards)) {
        fs.writeFileSync(REWARDS_FILE, JSON.stringify(data.rewards, null, 2), "utf-8");
      }
      return true;
    }
  } catch (err) {
    console.error("Error pulling from JSONBin:", err);
  }
  return false;
}

export function getDbConfig(): DbConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (err) {
    console.error("Error reading db-config.json:", err);
  }
  return DEFAULT_CONFIG;
}

export function saveDbConfig(config: DbConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving db-config.json:", err);
  }
}

export async function queryRailway(endpoint: string, method: string = "GET", body: any = null) {
  const config = getDbConfig();
  const url = `${config.railwayUrl.replace(/\/$/, "")}${endpoint}`;
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Railway server returned status ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error(`Error querying Railway endpoint ${endpoint}:`, err.message);
    throw err;
  }
}


const DEFAULT_PROMOS = [
  { id: "promo-1", code: "WELCOME10", discountPercentage: 10, isActive: true },
  { id: "promo-2", code: "VERO", discountPercentage: 15, isActive: true }
];

const DEFAULT_REWARDS: any[] = [];

// Helper to load fallback products from disk
function getProductsFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading products database from disk:", err);
  }
  return PRODUCTS;
}

// Helper to save fallback products to disk
function saveProductsToDisk(products: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), "utf-8");
    pushToJsonBin().catch((err) => console.error("Auto-push to JSONBin failed:", err));
  } catch (err) {
    console.error("Error saving products database to disk:", err);
  }
}

// Helper to load fallback orders from disk
function getOrdersFromDisk() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(ORDERS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading orders database from disk:", err);
  }
  return [];
}

// Helper to save fallback orders to disk
function saveOrdersToDisk(orders: any[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
    pushToJsonBin().catch((err) => console.error("Auto-push to JSONBin failed:", err));
  } catch (err) {
    console.error("Error saving orders database to disk:", err);
  }
}

// Helper to load fallback promos from disk
function getPromosFromDisk() {
  try {
    if (fs.existsSync(PROMOS_FILE)) {
      return JSON.parse(fs.readFileSync(PROMOS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading promos database from disk:", err);
  }
  return DEFAULT_PROMOS;
}

// Helper to save fallback promos to disk
function savePromosToDisk(promos: any[]) {
  try {
    fs.writeFileSync(PROMOS_FILE, JSON.stringify(promos, null, 2), "utf-8");
    pushToJsonBin().catch((err) => console.error("Auto-push to JSONBin failed:", err));
  } catch (err) {
    console.error("Error saving promos database to disk:", err);
  }
}

// Helper to load fallback rewards from disk
function getRewardsFromDisk() {
  try {
    if (fs.existsSync(REWARDS_FILE)) {
      return JSON.parse(fs.readFileSync(REWARDS_FILE, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading rewards database from disk:", err);
  }
  return DEFAULT_REWARDS;
}

// Helper to save fallback rewards to disk
function saveRewardsToDisk(rewards: any[]) {
  try {
    fs.writeFileSync(REWARDS_FILE, JSON.stringify(rewards, null, 2), "utf-8");
    pushToJsonBin().catch((err) => console.error("Auto-push to JSONBin failed:", err));
  } catch (err) {
    console.error("Error saving rewards database to disk:", err);
  }
}


// Setup Schemas
const ProductSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  categoryName: { type: String, required: true },
  categoryId: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  secondaryImages: { type: [String], default: [] },
  tagline: { type: String },
  description: { type: String },
  isNew: { type: Boolean },
  materialOptions: { type: [String], default: [] },
  sizeOptions: { type: [String], default: [] },
  details: { type: [String], default: [] },
  craftsmanship: { type: String },
  stock: { type: Number }
}, { timestamps: true });

const OrderItemSchema = new Schema({
  product: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    categoryName: { type: String, required: true }
  },
  quantity: { type: Number, required: true },
  selectedMaterial: { type: String },
  selectedSize: { type: String }
}, { _id: false });

const OrderSchema = new Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: String, required: true },
  total: { type: Number, required: true },
  status: { type: String, required: true },
  shippingName: { type: String, required: true },
  shippingEmail: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  shippingCity: { type: String, required: true },
  shippingZip: { type: String },
  shippingPhone: { type: String },
  items: { type: [OrderItemSchema], default: [] }
}, { timestamps: true });

const ProductModel = (mongoose.models.Product || mongoose.model("Product", ProductSchema)) as any;
const OrderModel = (mongoose.models.Order || mongoose.model("Order", OrderSchema)) as any;

const PromoSchema = new Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true },
  isActive: { type: Boolean, required: true, default: true }
}, { timestamps: true });

const PromoModel = (mongoose.models.Promo || mongoose.model("Promo", PromoSchema)) as any;

const RewardSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleEn: { type: String, required: true },
  description: { type: String },
  cost: { type: Number, required: true },
  code: { type: String, required: true },
  discountPercentage: { type: Number }
}, { timestamps: true });

const RewardModel = (mongoose.models.Reward || mongoose.model("Reward", RewardSchema)) as any;

// Prevent unhandled mongoose connection errors from crashing the process
mongoose.connection.on("error", (err) => {
  // Silent in production or disabled mode
});

let isConnected = false;
let connectionPromise: Promise<boolean> | null = null;
let lastFailureTime = 0;
const RETRY_COOLDOWN_MS = 60000; // 1-minute cooldown before retrying connection to prevent blocking API requests

export async function connectDB(): Promise<boolean> {
  // MongoDB is disabled to avoid connection errors, forcing use of local disk storage.
  return false;
}

// DB Manager implementing unified operations
export const DB = {
  isMongoConnected: () => isConnected,

  getProducts: async () => {
    if (getDbConfig().useRailwayDb) {
      try {
        return await queryRailway("/api/products");
      } catch (err) {
        console.error("Railway getProducts failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const products = await ProductModel.find().lean();
        return products;
      } catch (err) {
        console.error("MongoDB getProducts failed, falling back to disk:", err);
      }
    }
    return getProductsFromDisk();
  },

  createProduct: async (product: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway("/api/products", "POST", product);
        return await queryRailway("/api/products");
      } catch (err) {
        console.error("Railway createProduct failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const newProd = new ProductModel(product);
        await newProd.save();
        return await DB.getProducts();
      } catch (err) {
        console.error("MongoDB createProduct failed, falling back to disk:", err);
      }
    }
    const products = getProductsFromDisk();
    products.unshift(product);
    saveProductsToDisk(products);
    return products;
  },

  updateProduct: async (id: string, updatedFields: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/products/${id}`, "PUT", updatedFields);
        return await queryRailway("/api/products");
      } catch (err) {
        console.error("Railway updateProduct failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await ProductModel.findOneAndUpdate({ id }, { $set: updatedFields });
        return await DB.getProducts();
      } catch (err) {
        console.error("MongoDB updateProduct failed, falling back to disk:", err);
      }
    }
    const products = getProductsFromDisk();
    const index = products.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedFields };
      saveProductsToDisk(products);
    }
    return products;
  },

  deleteProduct: async (id: string) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/products/${id}`, "DELETE");
        return await queryRailway("/api/products");
      } catch (err) {
        console.error("Railway deleteProduct failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await ProductModel.findOneAndDelete({ id });
        return await DB.getProducts();
      } catch (err) {
        console.error("MongoDB deleteProduct failed, falling back to disk:", err);
      }
    }
    const products = getProductsFromDisk();
    const filtered = products.filter((p: any) => p.id !== id);
    saveProductsToDisk(filtered);
    return filtered;
  },

  resetProducts: async () => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway("/api/products/reset", "POST");
        return await queryRailway("/api/products");
      } catch (err) {
        console.error("Railway resetProducts failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await ProductModel.deleteMany({});
        await ProductModel.insertMany(PRODUCTS);
        return await DB.getProducts();
      } catch (err) {
        console.error("MongoDB resetProducts failed, falling back to disk:", err);
      }
    }
    saveProductsToDisk(PRODUCTS);
    return PRODUCTS;
  },

  getOrders: async () => {
    if (getDbConfig().useRailwayDb) {
      try {
        return await queryRailway("/api/orders");
      } catch (err) {
        console.error("Railway getOrders failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const orders = await OrderModel.find().sort({ createdAt: -1 }).lean();
        return orders;
      } catch (err) {
        console.error("MongoDB getOrders failed, falling back to disk:", err);
      }
    }
    return getOrdersFromDisk();
  },

  createOrder: async (order: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway("/api/orders", "POST", order);
        return await queryRailway("/api/orders");
      } catch (err) {
        console.error("Railway createOrder failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const newOrder = new OrderModel(order);
        await newOrder.save();
        return await DB.getOrders();
      } catch (err) {
        console.error("MongoDB createOrder failed, falling back to disk:", err);
      }
    }
    const orders = getOrdersFromDisk();
    orders.unshift(order);
    saveOrdersToDisk(orders);
    return orders;
  },

  updateOrder: async (id: string, updatedFields: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        return await queryRailway(`/api/orders/${id}`, "PUT", updatedFields);
      } catch (err) {
        console.error("Railway updateOrder failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const updated = await OrderModel.findOneAndUpdate({ id }, { $set: updatedFields }, { new: true }).lean();
        if (updated) return updated;
      } catch (err) {
        console.error("MongoDB updateOrder failed, falling back to disk:", err);
      }
    }
    const orders = getOrdersFromDisk();
    const index = orders.findIndex((o: any) => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updatedFields };
      saveOrdersToDisk(orders);
      return orders[index];
    }
    return null;
  },

  deleteOrder: async (id: string) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/orders/${id}`, "DELETE");
        return await queryRailway("/api/orders");
      } catch (err) {
        console.error("Railway deleteOrder failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await OrderModel.findOneAndDelete({ id });
        return await DB.getOrders();
      } catch (err) {
        console.error("MongoDB deleteOrder failed, falling back to disk:", err);
      }
    }
    const orders = getOrdersFromDisk();
    const filtered = orders.filter((o: any) => o.id !== id);
    saveOrdersToDisk(filtered);
    return filtered;
  },

  getPromos: async () => {
    if (getDbConfig().useRailwayDb) {
      try {
        return await queryRailway("/api/promos");
      } catch (err) {
        console.error("Railway getPromos failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const promos = await PromoModel.find().lean();
        return promos;
      } catch (err) {
        console.error("MongoDB getPromos failed, falling back to disk:", err);
      }
    }
    return getPromosFromDisk();
  },

  getRewards: async () => {
    if (getDbConfig().useRailwayDb) {
      try {
        return await queryRailway("/api/rewards");
      } catch (err) {
        console.error("Railway getRewards failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const rewards = await RewardModel.find().lean();
        return rewards;
      } catch (err) {
        console.error("MongoDB getRewards failed, falling back to disk:", err);
      }
    }
    return getRewardsFromDisk();
  },

  createReward: async (reward: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway("/api/rewards", "POST", reward);
        return await queryRailway("/api/rewards");
      } catch (err) {
        console.error("Railway createReward failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const newReward = new RewardModel(reward);
        await newReward.save();
        return await DB.getRewards();
      } catch (err) {
        console.error("MongoDB createReward failed, falling back to disk:", err);
      }
    }
    const rewards = getRewardsFromDisk();
    rewards.unshift(reward);
    saveRewardsToDisk(rewards);
    return rewards;
  },

  updateReward: async (id: string, updatedFields: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/rewards/${id}`, "PUT", updatedFields);
        return await queryRailway("/api/rewards");
      } catch (err) {
        console.error("Railway updateReward failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await RewardModel.findOneAndUpdate({ id }, { $set: updatedFields });
        return await DB.getRewards();
      } catch (err) {
        console.error("MongoDB updateReward failed, falling back to disk:", err);
      }
    }
    const rewards = getRewardsFromDisk();
    const index = rewards.findIndex((r: any) => r.id === id);
    if (index !== -1) {
      rewards[index] = { ...rewards[index], ...updatedFields };
      saveRewardsToDisk(rewards);
    }
    return rewards;
  },

  deleteReward: async (id: string) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/rewards/${id}`, "DELETE");
        return await queryRailway("/api/rewards");
      } catch (err) {
        console.error("Railway deleteReward failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await RewardModel.findOneAndDelete({ id });
        return await DB.getRewards();
      } catch (err) {
        console.error("MongoDB deleteReward failed, falling back to disk:", err);
      }
    }
    const rewards = getRewardsFromDisk();
    const filtered = rewards.filter((r: any) => r.id !== id);
    saveRewardsToDisk(filtered);
    return filtered;
  },

  createPromo: async (promo: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway("/api/promos", "POST", promo);
        return await queryRailway("/api/promos");
      } catch (err) {
        console.error("Railway createPromo failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        const newPromo = new PromoModel(promo);
        await newPromo.save();
        return await DB.getPromos();
      } catch (err) {
        console.error("MongoDB createPromo failed, falling back to disk:", err);
      }
    }
    const promos = getPromosFromDisk();
    promos.unshift(promo);
    savePromosToDisk(promos);
    return promos;
  },

  updatePromo: async (id: string, updatedFields: any) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/promos/${id}`, "PUT", updatedFields);
        return await queryRailway("/api/promos");
      } catch (err) {
        console.error("Railway updatePromo failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await PromoModel.findOneAndUpdate({ id }, { $set: updatedFields });
        return await DB.getPromos();
      } catch (err) {
        console.error("MongoDB updatePromo failed, falling back to disk:", err);
      }
    }
    const promos = getPromosFromDisk();
    const index = promos.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      promos[index] = { ...promos[index], ...updatedFields };
      savePromosToDisk(promos);
    }
    return promos;
  },

  deletePromo: async (id: string) => {
    if (getDbConfig().useRailwayDb) {
      try {
        await queryRailway(`/api/promos/${id}`, "DELETE");
        return await queryRailway("/api/promos");
      } catch (err) {
        console.error("Railway deletePromo failed, falling back:", err);
      }
    }
    const connected = await connectDB();
    if (connected) {
      try {
        await PromoModel.findOneAndDelete({ id });
        return await DB.getPromos();
      } catch (err) {
        console.error("MongoDB deletePromo failed, falling back to disk:", err);
      }
    }
    const promos = getPromosFromDisk();
    const filtered = promos.filter((p: any) => p.id !== id);
    savePromosToDisk(filtered);
    return filtered;
  },

  pullFromRailway: async () => {
    try {
      console.log("Pulling products, orders, promos, and rewards from Railway...");
      const remoteProducts = await queryRailway("/api/products");
      const remoteOrders = await queryRailway("/api/orders");
      const remotePromos = await queryRailway("/api/promos");
      const remoteRewards = await queryRailway("/api/rewards").catch(() => []);

      // Save to local disk fallbacks
      saveProductsToDisk(remoteProducts);
      saveOrdersToDisk(remoteOrders);
      savePromosToDisk(remotePromos);
      saveRewardsToDisk(remoteRewards);

      // Save to local MongoDB if connected
      const connected = await connectDB();
      if (connected) {
        await ProductModel.deleteMany({});
        if (remoteProducts.length > 0) await ProductModel.insertMany(remoteProducts);

        await OrderModel.deleteMany({});
        if (remoteOrders.length > 0) await OrderModel.insertMany(remoteOrders);

        await PromoModel.deleteMany({});
        if (remotePromos.length > 0) await PromoModel.insertMany(remotePromos);

        await RewardModel.deleteMany({});
        if (remoteRewards.length > 0) await RewardModel.insertMany(remoteRewards);
      }
      return {
        success: true,
        productsCount: remoteProducts.length,
        ordersCount: remoteOrders.length,
        promosCount: remotePromos.length,
        rewardsCount: remoteRewards.length
      };
    } catch (err: any) {
      console.error("Failed to pull from Railway:", err);
      throw err;
    }
  },

  pushToRailway: async () => {
    try {
      console.log("Pushing products, orders, promos, and rewards to Railway...");
      const localProducts = getProductsFromDisk();
      const localOrders = getOrdersFromDisk();
      const localPromos = getPromosFromDisk();
      const localRewards = getRewardsFromDisk();

      // Fetch what is on Railway first to avoid duplicates
      const remoteProducts = await queryRailway("/api/products").catch(() => []);
      const remoteOrders = await queryRailway("/api/orders").catch(() => []);
      const remotePromos = await queryRailway("/api/promos").catch(() => []);
      const remoteRewards = await queryRailway("/api/rewards").catch(() => []);

      const remoteProdIds = new Set(remoteProducts.map((p: any) => p.id));
      const remoteOrderIds = new Set(remoteOrders.map((o: any) => o.id));
      const remotePromoIds = new Set(remotePromos.map((p: any) => p.id));
      const remoteRewardIds = new Set(remoteRewards.map((r: any) => r.id));

      let productsPushed = 0;
      let ordersPushed = 0;
      let promosPushed = 0;
      let rewardsPushed = 0;

      for (const prod of localProducts) {
        if (!remoteProdIds.has(prod.id)) {
          await queryRailway("/api/products", "POST", prod).catch(console.error);
          productsPushed++;
        }
      }

      for (const ord of localOrders) {
        if (!remoteOrderIds.has(ord.id)) {
          await queryRailway("/api/orders", "POST", ord).catch(console.error);
          ordersPushed++;
        }
      }

      for (const promo of localPromos) {
        if (!remotePromoIds.has(promo.id)) {
          await queryRailway("/api/promos", "POST", promo).catch(console.error);
          promosPushed++;
        }
      }

      for (const reward of localRewards) {
        if (!remoteRewardIds.has(reward.id)) {
          await queryRailway("/api/rewards", "POST", reward).catch(console.error);
          rewardsPushed++;
        }
      }

      return {
        success: true,
        productsPushed,
        ordersPushed,
        promosPushed,
        rewardsPushed
      };
    } catch (err: any) {
      console.error("Failed to push to Railway:", err);
      throw err;
    }
  }
};
