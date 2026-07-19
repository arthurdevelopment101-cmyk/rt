import React from "react";
import {
  Trash2,
  Plus,
  Edit2,
  Check,
  RotateCcw,
  PlusCircle,
  FileImage,
  Info,
  Layers,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Tag,
  AlignLeft,
  X,
  RefreshCw,
  Search,
  ShieldCheck,
  Lock,
  Unlock,
  Upload,
  Package,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  Link2,
  Gift,
  Database,
  Cloud,
  CloudDownload,
  CloudUpload,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, PromoCode, Reward } from "../types";
import { CATEGORIES } from "../data";
import { googleSignIn, logout as googleLogout, initAuth } from "../lib/googleAuth";
import { createOrdersSpreadsheet, appendOrdersToSheet, getSyncedOrderIds, SpreadsheetInfo } from "../lib/sheetsService";

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onResetDatabase: () => void;
  onClose?: () => void;
  orders?: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  promos?: PromoCode[];
  setPromos?: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  rewards?: Reward[];
  setRewards?: React.Dispatch<React.SetStateAction<Reward[]>>;
}

// Preset luxury images for easy selection by the user
const PRESET_IMAGES = [
  {
    name: "Golden Classic Ring",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAddIhaoIoctIr0SZvOxl2amgoVXs5GW4AyMZuYqzRetb-PH8shfjL6df3_PiwyH1Hq439E0Lx2BbcFBHSvkTXKFeVAyN92YRXuBaqw5zNRh1EeGjfO57TlVuURTAiBXcnB5JXznCQbwsDIBHNH4A67hRHjmOnUwZMTbvAfO3y2yBNdTetjXHWJtoZ6VB_1S7MgOifVHC4W8P2FoG_bM4ak1sMXvZPk3gc-CSGh5MJoRqjQIgpDVA9Ml4wexbNyxsv5WZItb_S1I58",
  },
  {
    name: "Classic Leather Bangle",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX1p-uK0uxGwe-xPf4LECbNQnDpQJcqW5Jr2YX6Ra0MHk6ZdV47DDhFwL2t4uk-F03vVzVfNk88v-IYE043x2tQvF3X8Jj6qW9lkgQvcnmHfJpK5ybrDHJL6NZmzRIGQefgGFfHvSfLAXegiA3a5_s2x0bRJhjphz6rD0CEiJ7v01SWmhWJYNfQVRZCaL7fg7vqhNGHpiUImW4-5hst9s_FR3V1427zyirlzzqITw6CrhY-VSbVCahDYIUC6HF26HivG4KPS-2JWI",
  },
  {
    name: "Artisanal Timepiece",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2qzZ9-Ci55ZiMwGB8fudI_RR0HAUdvF20VU9LvhnWB024nsQ1AiUAuX5WPjX-QrxTLAXU9OHrxl-kyueIXrDx08qM_QgUhpXpgrFszL91bL1NaOaWoujJ0wlGu3E11Uvh2Zs6JGdMSasFktuL0bw2xagiuh8cTUdU9FgQ4a5Q4zezxTbNBtsJUqL-Xv3z9sszCiy18RBVOwkl2IoQ7XDbX4OMpHBNHfmlAizhiMESPgV1-jC25UnNXyIFVXZV19id6y1u95ZZlGo",
  },
  {
    name: "Hammered Gold Plaque",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsi9aeHhpg3RMBi01qh4k0jUy0jgoWSIttLzScTn8AvhKokeNaS1rWYj0ZdWgXiJYjomuT_PotZNM1fjCLkI_6wrpLziLe0B8OjjTE-KjfP4jtq13i35rUAqk762UXJCWnaHa26yvrpvtee77qbqz16wxmXSJvIk-lkEe9A2roHZxwd6PZkBGH6wYYgfv5b0RSV5FNmxblesK8DFdiSH6gPFZyJ3R4918rMtNpbrQ_bCod0_jTJPCpYN4HTDG-eYfSGEBLzXYo-aY",
  },
  {
    name: "Luxury Calfskin Cardholder",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA55XK6inPikYx_KnduhFvjR4J4r-Fz_0_MZeirVYlQnJcPeo3B3yJbFLZxM2oUqj2K4hOYY0VewYoDXWp5MzATq0mNes3bavvaIuwaKC-v7bFmUPeG5D1UbHy40cYoAniwy7x5OMf602l7xaIr3pzsyO28iOD8e4hdSxVOIQPeN0U8dossai-1QVPhtz7XRb9b0NxL8vjc5GglkDdH37aQtDOcZHbyQ7h9Ad-kMAtUcJAOHqIhAi6YLgg8Dcgt8eQGSeia3zX9Wl0",
  },
];

export default function AdminPanel({
  products,
  setProducts,
  onResetDatabase,
  onClose,
  orders = [],
  setOrders,
  promos = [],
  setPromos,
  rewards = [],
  setRewards,
}: AdminPanelProps) {
   const [activeSubTab, setActiveSubTab] = React.useState<"catalog" | "add" | "analytics" | "orders" | "rewards" | "promos" | "jsonbin">("orders");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  // Promo code manager form state
  const [newPromoCode, setNewPromoCode] = React.useState("");
  const [newPromoDiscount, setNewPromoDiscount] = React.useState(10);
  const [promoSubmitting, setPromoSubmitting] = React.useState(false);
  const [promoMsg, setPromoMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reward manager form state
  const [newRewardTitle, setNewRewardTitle] = React.useState("");
  const [newRewardTitleEn, setNewRewardTitleEn] = React.useState("");
  const [newRewardDescription, setNewRewardDescription] = React.useState("");
  const [newRewardCost, setNewRewardCost] = React.useState(100);
  const [newRewardCode, setNewRewardCode] = React.useState("");
  const [newRewardDiscountPercentage, setNewRewardDiscountPercentage] = React.useState<number>(15);
  const [rewardSubmitting, setRewardSubmitting] = React.useState(false);
  const [rewardMsg, setRewardMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // JSONBin.io Cloud States
  const [jsonBinKey, setJsonBinKey] = React.useState("");
  const [jsonBinId, setJsonBinId] = React.useState("");
  const [jsonBinEnabled, setJsonBinEnabled] = React.useState(false);
  const [jsonBinLoading, setJsonBinLoading] = React.useState(false);
  const [jsonBinSyncing, setJsonBinSyncing] = React.useState(false);
  const [jsonBinMsg, setJsonBinMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [jsonBinLogs, setJsonBinLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetch("/api/jsonbin/config")
      .then((res) => res.json())
      .then((config) => {
        if (config) {
          setJsonBinKey(config.masterKey || "");
          setJsonBinId(config.binId || "");
          setJsonBinEnabled(!!config.enabled);
        }
      })
      .catch((err) => console.error("Error fetching JSONBin config:", err));
  }, []);

  const handleSaveJsonBinConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setJsonBinLoading(true);
    setJsonBinMsg(null);
    setJsonBinLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Saving configuration...`]);

    try {
      const res = await fetch("/api/jsonbin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          masterKey: jsonBinKey,
          binId: jsonBinId,
          enabled: jsonBinEnabled
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server responded with ${res.status}`);
      }

      const updated = await res.json();
      setJsonBinKey(updated.masterKey || "");
      setJsonBinId(updated.binId || "");
      setJsonBinEnabled(!!updated.enabled);
      setJsonBinMsg({ type: "success", text: "تم حفظ وتحديث إعدادات السحابة بنجاح! / Cloud configuration updated successfully!" });
      setJsonBinLogs((prev) => [
        ...prev, 
        `[${new Date().toLocaleTimeString()}] Config saved successfully. Active Bin: ${updated.binId || "Auto-creating on save..."}`
      ]);
    } catch (err: any) {
      setJsonBinMsg({ type: "error", text: `خطأ أثناء الحفظ: ${err.message}` });
      setJsonBinLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${err.message}`]);
    } finally {
      setJsonBinLoading(false);
    }
  };

  const handleJsonBinSync = async (action: "pull" | "push") => {
    setJsonBinSyncing(true);
    setJsonBinMsg(null);
    const actionLabelAr = action === "pull" ? "تنزيل البيانات" : "رفع البيانات";
    const actionLabelEn = action === "pull" ? "Pulling data" : "Pushing data";
    setJsonBinLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Starting ${actionLabelEn}...`]);

    try {
      const res = await fetch("/api/jsonbin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const result = await res.json();
      if (result.success) {
        setJsonBinMsg({ 
          type: "success", 
          text: `اكتملت عملية ${actionLabelAr} بنجاح! / Cloud ${action} completed successfully!` 
        });
        setJsonBinLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${action} finished successfully.`]);
        
        if (action === "pull") {
          setJsonBinLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Reloading to apply synced data...`]);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        throw new Error("Synchronization reported unsuccessful status.");
      }
    } catch (err: any) {
      setJsonBinMsg({ type: "error", text: `فشلت المزامنة: ${err.message}` });
      setJsonBinLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Sync error: ${err.message}`]);
    } finally {
      setJsonBinSyncing(false);
    }
  };

  // Google Sheets Integration States
  const [googleUser, setGoogleUser] = React.useState<any>(null);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [linkedSheet, setLinkedSheet] = React.useState<SpreadsheetInfo | null>(() => {
    const saved = localStorage.getItem("vero_linked_sheet");
    if (saved) return JSON.parse(saved);
    // Use the spreadsheet provided by the user as default
    return {
      id: "115IWRh0izitoKlNy9QRwNWM988smcqGtXJ9Pdklg2LY",
      title: "Vero Luxury Boutique - Orders Database",
      url: "https://docs.google.com/spreadsheets/d/115IWRh0izitoKlNy9QRwNWM988smcqGtXJ9Pdklg2LY/edit?usp=sharing"
    };
  });
  const [customSheetId, setCustomSheetId] = React.useState("");
  const [isCreatingSheet, setIsCreatingSheet] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncedOrderIds, setSyncedOrderIds] = React.useState<Set<string>>(new Set());

  // Initialize auth state listener. Call this on app load.
  React.useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        // Load synced orders if sheet exists
        if (linkedSheet) {
          getSyncedOrderIds(token, linkedSheet.id)
            .then(setSyncedOrderIds)
            .catch(console.error);
        }
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, [linkedSheet]);

  // Background Auto-sync Effect
  React.useEffect(() => {
    if (!accessToken || !linkedSheet || orders.length === 0) return;

    const runAutoSync = async () => {
      try {
        const currentSynced = await getSyncedOrderIds(accessToken, linkedSheet.id);
        const toSync = orders.filter(o => !currentSynced.has(o.id));
        
        if (toSync.length > 0) {
          await appendOrdersToSheet(accessToken, linkedSheet.id, toSync);
          const updatedSynced = new Set([...currentSynced, ...toSync.map(o => o.id)]);
          setSyncedOrderIds(updatedSynced);
          triggerNotification(`Auto-synced ${toSync.length} new order(s) to Google Sheets! / تم مزامنة ${toSync.length} طلبات جديدة تلقائياً!`, "success");
        }
      } catch (err) {
        console.error("Background auto-sync failed:", err);
      }
    };

    // Run after a short delay to avoid rate limits during rapid state updates
    const timer = setTimeout(runAutoSync, 3000);
    return () => clearTimeout(timer);
  }, [accessToken, linkedSheet, orders]);

  const handleSyncOrders = async () => {
    if (!accessToken || !linkedSheet) {
      triggerNotification("Please connect Google Sheets first.", "error");
      return;
    }
    setIsSyncing(true);
    try {
      // Find orders that are not already synced
      const currentSynced = await getSyncedOrderIds(accessToken, linkedSheet.id);
      const toSync = orders.filter(o => !currentSynced.has(o.id));
      
      if (toSync.length === 0) {
        triggerNotification("All orders are already synced to Google Sheets! / جميع الطلبات متزامنة بالفعل!", "success");
        setIsSyncing(false);
        return;
      }

      await appendOrdersToSheet(accessToken, linkedSheet.id, toSync);
      const updatedSynced = new Set([...currentSynced, ...toSync.map(o => o.id)]);
      setSyncedOrderIds(updatedSynced);

      triggerNotification(`Successfully synced ${toSync.length} new orders to your Google Sheet! / تم بنجاح مزامنة ${toSync.length} طلبات جديدة!`, "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Sync failed: ${err.message || err}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      triggerNotification("Please log in first.", "error");
      return;
    }
    setIsCreatingSheet(true);
    try {
      const sheetInfo = await createOrdersSpreadsheet(accessToken, "Vero Luxury Boutique - Orders Database");
      setLinkedSheet(sheetInfo);
      localStorage.setItem("vero_linked_sheet", JSON.stringify(sheetInfo));
      triggerNotification("Brand new Google Sheet created & linked successfully! / تم إنشاء وربط جدول البيانات الجديد بنجاح!", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Failed to create sheet: ${err.message || err}`, "error");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleLinkCustomSheet = async () => {
    if (!customSheetId.trim()) {
      triggerNotification("Please enter a valid spreadsheet ID / الرجاء إدخل معرف صالح.", "error");
      return;
    }
    const cleanId = customSheetId.trim().split("/d/")?.[1]?.split("/")?.[0] || customSheetId.trim();
    const sheetInfo: SpreadsheetInfo = {
      id: cleanId,
      title: "Linked Custom Google Sheet",
      url: `https://docs.google.com/spreadsheets/d/${cleanId}/edit`
    };
    setLinkedSheet(sheetInfo);
    localStorage.setItem("vero_linked_sheet", JSON.stringify(sheetInfo));
    triggerNotification("Google Sheet linked successfully! / تم ربط جدول البيانات بنجاح!", "success");
    setCustomSheetId("");
  };

  const handleDisconnectSheet = () => {
    const confirmDis = window.confirm("Are you sure you want to unlink this Google Sheet? / هل أنت متأكد من إلغاء ربط جدول البيانات؟");
    if (!confirmDis) return;
    setLinkedSheet(null);
    localStorage.removeItem("vero_linked_sheet");
    setSyncedOrderIds(new Set());
    triggerNotification("Google Sheet unlinked. / تم إلغاء ربط جدول البيانات.", "success");
  };

  // Orders Sub-tab States
  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderStatusFilter, setOrderStatusFilter] = React.useState("all");
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<string | null>(null);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        if (setOrders) {
          setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
        }
        setSelectedOrder(updatedOrder);
        setNotification({
          text: `Order status successfully updated to "${newStatus}"! Broadcasted in real-time.`,
          type: "success",
        });
      } else {
        setNotification({ text: "Failed to update order status.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setNotification({ text: "Network error updating order.", type: "error" });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (setOrders) {
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
        }
        setSelectedOrder(null);
        setNotification({
          text: "Order successfully deleted! Archive updated in real-time.",
          type: "success",
        });
      } else {
        setNotification({ text: "Failed to delete order.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setNotification({ text: "Error connecting to server.", type: "error" });
    }
  };

  const filteredOrders = React.useMemo(() => {
    return orders.filter((order) => {
      // 1. Search filter
      const searchLower = orderSearch.toLowerCase();
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.shippingName?.toLowerCase().includes(searchLower) ||
        order.shippingEmail?.toLowerCase().includes(searchLower) ||
        order.shippingAddress?.toLowerCase().includes(searchLower) ||
        order.shippingCity?.toLowerCase().includes(searchLower) ||
        order.shippingPhone?.toLowerCase().includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower);

      // 2. Status filter
      if (!matchesSearch) return false;
      if (orderStatusFilter === "all") return true;
      
      const statusLower = order.status?.toLowerCase() || "";
      if (orderStatusFilter === "pending") return statusLower.includes("pending") || statusLower.includes("انتظار");
      if (orderStatusFilter === "processing") return statusLower.includes("processing") || statusLower.includes("تحضير");
      if (orderStatusFilter === "transit") return statusLower.includes("transit") || statusLower.includes("شحن");
      if (orderStatusFilter === "delivered") return statusLower.includes("delivered") || statusLower.includes("توصيل") || statusLower.includes("complete");
      if (orderStatusFilter === "cancelled") return statusLower.includes("cancelled") || statusLower.includes("إلغاء") || statusLower.includes("cancel");

      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Security Lock State
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem("vero_admin_authenticated") === "true";
  });
  const [passwordAttempt, setPasswordAttempt] = React.useState("");
  const [passwordError, setPasswordError] = React.useState("");
  
  // Ref to hold the callback prevents any React function state update quirks or closure issues
  const pendingCallbackRef = React.useRef<(() => void) | null>(null);
  const [showLockModal, setShowLockModal] = React.useState(false);

  // Custom Confirmation Dialogs State
  const [productToDelete, setProductToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [orderToDelete, setOrderToDelete] = React.useState<{ id: string; orderNumber: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const verifyAction = (callback: () => void) => {
    if (isAuthenticated) {
      callback();
    } else {
      pendingCallbackRef.current = callback;
      setShowLockModal(true);
    }
  };

  const handleLogoutAdmin = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("vero_admin_authenticated");
    triggerNotification("Logged out from Curator mode.", "success");
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMsg(null);
    const code = newPromoCode.trim().toUpperCase();
    if (!code) {
      setPromoMsg({ type: "error", text: "Please enter a coupon code / الرجاء إدخل كود كوبون." });
      return;
    }
    if (newPromoDiscount < 1 || newPromoDiscount > 100) {
      setPromoMsg({ type: "error", text: "Discount percentage must be between 1 and 100 / نسبة الخصم يجب أن تكون بين 1 و 100." });
      return;
    }

    verifyAction(async () => {
      setPromoSubmitting(true);
      try {
        const res = await fetch("/api/promos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, discountPercentage: Number(newPromoDiscount), isActive: true }),
        });
        if (res.ok) {
          const created = await res.json();
          if (setPromos) {
            setPromos((prev) => [...prev, created]);
          }
          setNewPromoCode("");
          setNewPromoDiscount(10);
          setPromoMsg({ type: "success", text: `Promo code ${created.code} created successfully / تم إنشاء كود الخصم ${created.code} بنجاح!` });
          triggerNotification(`Created coupon: ${created.code}`, "success");
        } else {
          const errData = await res.json().catch(() => ({}));
          setPromoMsg({ type: "error", text: errData.error || "Failed to create promo code." });
        }
      } catch (err) {
        console.error("Error creating promo:", err);
        setPromoMsg({ type: "error", text: "Network error occurred / حدث خطأ في الاتصال بالشبكة." });
      } finally {
        setPromoSubmitting(false);
      }
    });
  };

  const handleTogglePromoActive = async (id: string, currentActive: boolean) => {
    verifyAction(async () => {
      try {
        const res = await fetch(`/api/promos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentActive }),
        });
        if (res.ok) {
          const updated = await res.json();
          if (setPromos) {
            setPromos((prev) => prev.map((p) => (p.id === id ? updated : p)));
          }
          triggerNotification(`Coupon ${updated.code} is now ${updated.isActive ? "active" : "inactive"}.`, "success");
        } else {
          triggerNotification("Failed to update coupon status.", "error");
        }
      } catch (err) {
        console.error("Error toggling promo status:", err);
        triggerNotification("Network error occurred.", "error");
      }
    });
  };

  const handleDeletePromo = async (id: string, code: string) => {
    verifyAction(async () => {
      try {
        const res = await fetch(`/api/promos/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          if (setPromos) {
            setPromos((prev) => prev.filter((p) => p.id !== id));
          }
          triggerNotification(`Coupon ${code} has been deleted.`, "success");
        } else {
          triggerNotification("Failed to delete coupon.", "error");
        }
      } catch (err) {
        console.error("Error deleting promo:", err);
        triggerNotification("Network error occurred.", "error");
      }
    });
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newRewardTitle.trim();
    const titleEn = newRewardTitleEn.trim();
    const description = newRewardDescription.trim();
    const cost = Number(newRewardCost);
    const code = newRewardCode.trim();
    const discountPercentage = Number(newRewardDiscountPercentage);

    if (!title || !titleEn || !code || isNaN(cost) || cost <= 0 || isNaN(discountPercentage) || discountPercentage < 1 || discountPercentage > 100) {
      setRewardMsg({ type: "error", text: "Please fill all required fields correctly / الرجاء ملء جميع الحقول المطلوبة بشكل صحيح!" });
      return;
    }

    verifyAction(async () => {
      setRewardSubmitting(true);
      try {
        const res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, titleEn, description, cost, code, discountPercentage }),
        });
        if (res.ok) {
          const updatedRewards = await res.json();
          if (setRewards) {
            setRewards(updatedRewards);
          }
          setNewRewardTitle("");
          setNewRewardTitleEn("");
          setNewRewardDescription("");
          setNewRewardCost(100);
          setNewRewardCode("");
          setNewRewardDiscountPercentage(15);
          setRewardMsg({ type: "success", text: `Reward "${titleEn}" created successfully / تم إنشاء الجائزة "${title}" بنجاح!` });
          triggerNotification(`Created reward: ${titleEn}`, "success");
        } else {
          const errData = await res.json().catch(() => ({}));
          setRewardMsg({ type: "error", text: errData.error || "Failed to create reward." });
        }
      } catch (err) {
        console.error("Error creating reward:", err);
        setRewardMsg({ type: "error", text: "Network error occurred / حدث خطأ في الاتصال بالشبكة." });
      } finally {
        setRewardSubmitting(false);
      }
    });
  };

  const handleDeleteReward = async (id: string, titleEn: string) => {
    verifyAction(async () => {
      try {
        const res = await fetch(`/api/rewards/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          const updatedRewards = await res.json();
          if (setRewards) {
            setRewards(updatedRewards);
          }
          triggerNotification(`Reward "${titleEn}" has been deleted.`, "success");
        } else {
          triggerNotification("Failed to delete reward.", "error");
        }
      } catch (err) {
        console.error("Error deleting reward:", err);
        triggerNotification("Network error occurred.", "error");
      }
    });
  };

  // Form Fields
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("fine-jewelry");
  const [price, setPrice] = React.useState<number | "">("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [additionalImages, setAdditionalImages] = React.useState<string[]>([]);
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isNew, setIsNew] = React.useState(false);
  const [materialOptions, setMaterialOptions] = React.useState<string>("#E5D5BC, #E5E4E2");
  const [sizeOptions, setSizeOptions] = React.useState<string>("06, 07, 08, 09");
  const [details, setDetails] = React.useState<string>("18k Solid Recycled Gold, Hand-finished matte satin luster");
  const [craftsmanship, setCraftsmanship] = React.useState("");
  const [stock, setStock] = React.useState<number | "">("");

  // Feedback notifications
  const [notification, setNotification] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const triggerNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategoryId(editingProduct.categoryId);
      setPrice(editingProduct.price);
      setImageUrl(editingProduct.image);
      
      // Parse secondary/additional images (exclude primary image if duplicate)
      if (editingProduct.secondaryImages && editingProduct.secondaryImages.length > 0) {
        const primary = editingProduct.image;
        const others = editingProduct.secondaryImages.filter((img) => img !== primary);
        setAdditionalImages(others);
      } else {
        setAdditionalImages([]);
      }

      setTagline(editingProduct.tagline);
      setDescription(editingProduct.description);
      setIsNew(!!editingProduct.isNew);
      setMaterialOptions(editingProduct.materialOptions?.join(", ") || "");
      setSizeOptions(editingProduct.sizeOptions?.join(", ") || "");
      setDetails(editingProduct.details?.join(", ") || "");
      setCraftsmanship(editingProduct.craftsmanship || "");
      setStock(editingProduct.stock !== undefined ? editingProduct.stock : "");
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setName("");
    setCategoryId("fine-jewelry");
    setPrice("");
    setImageUrl("");
    setAdditionalImages([]);
    setTagline("");
    setDescription("");
    setIsNew(false);
    setMaterialOptions("#E5D5BC, #E5E4E2");
    setSizeOptions("06, 07, 08, 09");
    setDetails("18k Solid Recycled Gold, Hand-finished matte-satin luster");
    setCraftsmanship("");
    setStock("");
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      triggerNotification("Product name is required.", "error");
      return;
    }
    if (!price || Number(price) <= 0) {
      triggerNotification("Please enter a valid price.", "error");
      return;
    }
    if (!imageUrl.trim()) {
      triggerNotification("Please enter or select an image URL.", "error");
      return;
    }

    const selectedCategoryObj = CATEGORIES.find((cat) => cat.id === categoryId);
    const categoryName = selectedCategoryObj ? selectedCategoryObj.name : "Fine Jewelry";

    const productData: Product = {
      id: editingProduct ? editingProduct.id : `custom-${Date.now()}`,
      name: name.trim(),
      categoryId,
      categoryName,
      price: Number(price),
      image: imageUrl.trim(),
      secondaryImages: [imageUrl.trim(), ...additionalImages.map((img) => img.trim()).filter(Boolean)],
      tagline: tagline.trim() || `"${name.trim()} by VERO Boutique"`,
      description: description.trim() || "An authentic quiet luxury piece hand-finished with exceptional Italian craftsmanship.",
      isNew,
      materialOptions: materialOptions.split(",").map((s) => s.trim()).filter(Boolean),
      sizeOptions: sizeOptions.split(",").map((s) => s.trim()).filter(Boolean),
      details: details.split(",").map((s) => s.trim()).filter(Boolean),
      craftsmanship: craftsmanship.trim() || undefined,
      stock: stock === "" ? undefined : Number(stock),
    };

    const proceed = () => {
      if (editingProduct) {
        // Edit mode
        setProducts((prev) =>
          prev.map((prod) => (prod.id === editingProduct.id ? productData : prod))
        );
        triggerNotification(`"${name}" updated successfully.`);
        setEditingProduct(null);
      } else {
        // Create mode
        setProducts((prev) => [productData, ...prev]);
        triggerNotification(`"${name}" created successfully.`);
      }

      resetForm();
      setActiveSubTab("catalog");
    };

    verifyAction(proceed);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;
    verifyAction(() => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      triggerNotification(`"${name}" has been removed from the boutique.`);
      setProductToDelete(null);
    });
  };

  const handleToggleNewArrival = (productId: string) => {
    verifyAction(() => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isNew: !p.isNew } : p))
      );
      triggerNotification("Updated product badge.");
    });
  };

  const filteredCatalog = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.price.toString().includes(q)
    );
  });

  // Simple diagnostics stats
  const totalItems = products.length;
  const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / (totalItems || 1));
  const newArrivalsCount = products.filter((p) => p.isNew).length;

  return (
    <div className="bg-white border border-brand-outline-variant/30 rounded-sm overflow-hidden shadow-sm select-text font-sans">
      {/* Admin Panel Header */}
      <div className="bg-brand-umber text-brand-linen p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-gold/20 text-brand-gold text-[10px] uppercase tracking-[0.2em] font-semibold px-2 py-0.5 rounded border border-brand-gold/30">
              Admin Control Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-light tracking-wide">
            Boutique Catalog Manager
          </h2>
          <p className="text-xs text-brand-linen/60 font-light">
            Live local database overrides. Add, remove, or modify VERO's catalog instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-sm text-xs font-mono">
              <Unlock className="w-3.5 h-3.5" />
              <span>المشرف نشط / Curator Mode Active</span>
              <button
                onClick={handleLogoutAdmin}
                className="hover:text-white underline text-[10px] ml-1.5 font-sans animate-pulse"
                title="Lock Curator Mode"
              >
                (قفل / Lock)
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                verifyAction(() => {
                  triggerNotification("Curator mode authorized.", "success");
                });
              }}
              className="flex items-center gap-1.5 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>فتح وضع المشرف / Unlock Admin</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowResetConfirm(true);
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-gold hover:text-white border border-brand-gold/30 hover:border-white/50 px-4 py-2.5 rounded-sm transition-all bg-brand-gold/5 cursor-pointer"
            title="Reset Catalog to Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Curator Reset</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 bg-brand-linen/10 hover:bg-brand-linen/20 rounded text-brand-linen transition-colors"
              aria-label="Close Admin Panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Internal Tabs Navigation */}
      <div className="border-b border-brand-outline-variant/20 bg-brand-linen/20 px-6 md:px-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-3">
        <div className="flex flex-wrap items-center gap-1 border border-brand-outline-variant/20 rounded p-0.5 bg-white w-fit">
          <button
            onClick={() => {
              setActiveSubTab("orders");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] flex items-center gap-1.5 ${
              activeSubTab === "orders"
                ? "bg-brand-gold text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab("catalog");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] ${
              activeSubTab === "catalog" && !editingProduct
                ? "bg-brand-umber text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            Product Catalog ({totalItems})
          </button>
          <button
            onClick={() => {
              setActiveSubTab("add");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] flex items-center gap-1 ${
              activeSubTab === "add" || editingProduct
                ? "bg-brand-umber text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingProduct ? "Edit Product" : "Add Product"}</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab("analytics");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] ${
              activeSubTab === "analytics"
                ? "bg-brand-umber text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            System Status
          </button>
          <button
            onClick={() => {
              setActiveSubTab("rewards");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] flex items-center gap-1.5 ${
              activeSubTab === "rewards"
                ? "bg-brand-gold text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Rewards (الجوائز)</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab("promos");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] flex items-center gap-1.5 ${
              activeSubTab === "promos"
                ? "bg-brand-gold text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promo Codes</span>
          </button>
          <button
            onClick={() => {
              setActiveSubTab("jsonbin");
              setEditingProduct(null);
            }}
            className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all rounded-[2px] flex items-center gap-1.5 ${
              activeSubTab === "jsonbin"
                ? "bg-brand-gold text-white"
                : "text-brand-outline hover:text-brand-umber"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>JSONBin Cloud (السحابة)</span>
          </button>
        </div>

        {activeSubTab === "catalog" && !editingProduct && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-outline/60" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-brand-outline-variant/40 text-xs px-10 py-2 rounded-sm outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 w-full sm:w-60 text-brand-umber"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-outline hover:text-brand-umber text-[10px]"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Panel Content Body */}
      <div className="p-6 md:p-8">
        {/* Dynamic feedback notification block */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded border text-xs font-medium flex items-center gap-2.5 shadow-sm ${
                notification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-rose-50 text-rose-800 border-rose-200"
              }`}
            >
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{notification.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {activeSubTab === "orders" && (
          <div className="space-y-6 animate-fadeIn text-left">
            {/* Stats Header Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-4 rounded-sm">
                <span className="text-[10px] text-brand-outline font-bold uppercase tracking-widest block">Total Orders</span>
                <span className="text-2xl font-serif text-brand-umber mt-1 block">{orders.length}</span>
              </div>
              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-4 rounded-sm">
                <span className="text-[10px] text-brand-outline font-bold uppercase tracking-widest block">Total Revenue</span>
                <span className="text-2xl font-serif text-brand-gold mt-1 block">EGP {orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</span>
              </div>
              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-4 rounded-sm">
                <span className="text-[10px] text-brand-outline font-bold uppercase tracking-widest block">Pending / قيد الانتظار</span>
                <span className="text-2xl font-serif text-amber-600 mt-1 block">
                  {orders.filter(o => o.status?.toLowerCase().includes("pending") || o.status?.includes("انتظار")).length}
                </span>
              </div>
              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-4 rounded-sm">
                <span className="text-[10px] text-brand-outline font-bold uppercase tracking-widest block">Delivered / تم التوصيل</span>
                <span className="text-2xl font-serif text-emerald-600 mt-1 block">
                  {orders.filter(o => o.status?.toLowerCase().includes("delivered") || o.status?.includes("توصيل") || o.status?.toLowerCase().includes("complete")).length}
                </span>
              </div>
            </div>

            {/* Filtering Controls */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-outline/60" />
                <input
                  type="text"
                  placeholder="البحث بالاسم، الرقم، الإيميل أو العنوان..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="bg-white border border-brand-outline-variant/40 text-xs px-10 py-2.5 rounded-sm outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20 w-full text-brand-umber"
                />
                {orderSearch && (
                  <button
                    onClick={() => setOrderSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-outline hover:text-brand-umber text-[10px]"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-brand-outline uppercase tracking-wider font-semibold shrink-0">Filter:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-brand-outline-variant/40 text-xs px-3 py-2.5 rounded-sm text-brand-umber outline-none focus:border-brand-gold"
                >
                  <option value="all">All Statuses / كل الحالات</option>
                  <option value="pending">Pending / قيد الانتظار</option>
                  <option value="processing">Processing / قيد التحضير</option>
                  <option value="transit">In Transit / قيد الشحن</option>
                  <option value="delivered">Delivered / تم التوصيل</option>
                  <option value="cancelled">Cancelled / تم الإلغاء</option>
                </select>
              </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Side: Order List */}
              <div className="lg:col-span-2 space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-brand-outline-variant/30 rounded bg-brand-linen/10 space-y-3">
                    <ShoppingBag className="w-10 h-10 text-brand-outline/40 mx-auto animate-pulse" />
                    <p className="text-xs text-brand-outline font-light">No orders match the criteria / لا توجد طلبات تطابق الفلتر</p>
                  </div>
                ) : (
                  <div className="bg-white border border-brand-outline-variant/25 rounded overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-brand-linen/10 border-b border-brand-outline-variant/20 text-brand-outline uppercase tracking-wider text-[10px] font-bold">
                            <th className="p-4">Order Num / الرقم</th>
                            <th className="p-4">Customer / العميل</th>
                            <th className="p-4">Date / التاريخ</th>
                            <th className="p-4">Total / الإجمالي</th>
                            <th className="p-4">Status / الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-outline-variant/10">
                          {filteredOrders.map((order) => {
                            const isSelected = selectedOrder?.id === order.id;
                            let badgeClass = "bg-amber-50 text-amber-700 border-amber-200/50";
                            const statusLower = order.status?.toLowerCase() || "";
                            if (statusLower.includes("delivered") || statusLower.includes("توصيل") || statusLower.includes("completed")) {
                              badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                            } else if (statusLower.includes("cancelled") || statusLower.includes("إلغاء") || statusLower.includes("cancel")) {
                              badgeClass = "bg-rose-50 text-rose-700 border-rose-200/50";
                            } else if (statusLower.includes("transit") || statusLower.includes("شحن")) {
                              badgeClass = "bg-cyan-50 text-cyan-700 border-cyan-200/50";
                            } else if (statusLower.includes("processing") || statusLower.includes("تحضير")) {
                              badgeClass = "bg-blue-50 text-blue-700 border-blue-200/50";
                            }

                            return (
                              <tr
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className={`cursor-pointer transition-colors hover:bg-brand-linen/5 ${
                                  isSelected ? "bg-brand-linen/15 font-semibold" : ""
                                }`}
                              >
                                <td className="p-4 font-mono font-bold text-brand-gold">
                                  #{order.orderNumber}
                                </td>
                                <td className="p-4">
                                  <div className="font-medium text-brand-umber">{order.shippingName}</div>
                                  <div className="text-[10px] text-brand-outline/80 font-light">{order.shippingCity}</div>
                                </td>
                                <td className="p-4 text-brand-outline/90 font-light">{order.date}</td>
                                <td className="p-4 font-semibold text-brand-umber">EGP {order.total?.toLocaleString()}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium border ${badgeClass}`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Order Detail Drawer Panel */}
              <div className="lg:col-span-1">
                <AnimatePresence mode="wait">
                  {selectedOrder ? (
                    <motion.div
                      key={selectedOrder.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="bg-brand-linen/5 border border-brand-gold/25 rounded p-5 space-y-6 text-left"
                    >
                      <div className="flex justify-between items-center border-b border-brand-outline-variant/20 pb-3">
                        <div>
                          <h3 className="font-serif text-base text-brand-umber font-bold">
                            Order #{selectedOrder.orderNumber}
                          </h3>
                          <p className="text-[10px] text-brand-outline font-light mt-0.5">
                            Placed on {selectedOrder.date}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-brand-outline hover:text-brand-umber text-xs uppercase font-bold tracking-widest"
                        >
                          Deselect
                        </button>
                      </div>

                      {/* Customer Summary details */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-brand-outline">Customer Details / العميل</h4>
                        <div className="text-xs space-y-1.5 text-brand-umber font-light">
                          <p><strong className="font-medium">Name:</strong> {selectedOrder.shippingName}</p>
                          <p><strong className="font-medium">Email:</strong> {selectedOrder.shippingEmail}</p>
                          <p><strong className="font-medium">Phone / الهاتف:</strong> {selectedOrder.shippingPhone || "Not Provided / غير متوفر"}</p>
                          <p><strong className="font-medium">Address:</strong> {selectedOrder.shippingAddress}</p>
                          <p><strong className="font-medium">City:</strong> {selectedOrder.shippingCity}</p>
                          {selectedOrder.shippingZip && <p><strong className="font-medium">ZIP:</strong> {selectedOrder.shippingZip}</p>}
                        </div>
                      </div>

                      {/* Status Control Switcher */}
                      <div className="space-y-3 bg-white p-3 border border-brand-outline-variant/15 rounded-sm">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] uppercase font-bold tracking-wider text-brand-outline">Update Status / تحديث الحالة</label>
                          {updatingOrderId === selectedOrder.id && (
                            <span className="text-[9px] text-brand-gold animate-pulse font-medium">Saving...</span>
                          )}
                        </div>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                          className="w-full bg-brand-linen/5 border border-brand-outline-variant/40 rounded-sm text-xs p-2 text-brand-umber font-semibold outline-none focus:border-brand-gold"
                        >
                          <option value="Pending / قيد الانتظار">Pending / قيد الانتظار</option>
                          <option value="Processing / قيد التحضير">Processing / قيد التحضير</option>
                          <option value="In Transit from Florence / قيد الشحن من فلورنسا">In Transit / قيد الشحن</option>
                          <option value="Delivered / تم التوصيل">Delivered / تم التوصيل</option>
                          <option value="Cancelled / تم الإلغاء">Cancelled / تم الإلغاء</option>
                        </select>

                        {/* WhatsApp Communication Prompt */}
                        <a
                          href={`https://wa.me/201026040845?text=${encodeURIComponent(
                            `مرحباً ${selectedOrder.shippingName}،\nيسعدنا إخطاركم بأن حالة طلبكم رقم #${selectedOrder.orderNumber} لدى Vero Boutique هي الآن: *${selectedOrder.status}*.\n\nتفاصيل الطلب:\nالقيمة الإجمالية: EGP ${selectedOrder.total?.toLocaleString()}\nالعنوان: ${selectedOrder.shippingAddress}، ${selectedOrder.shippingCity}\n\nشكراً لتسوقكم معنا!`
                          )}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="mt-2.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[11px] font-semibold py-2 px-3 text-center transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                          </svg>
                          <span>Send WhatsApp Update</span>
                        </a>
                      </div>

                      {/* Items Ordered */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-brand-outline">Items Ordered / المنتجات المطلوبة</h4>
                        <div className="divide-y divide-brand-outline-variant/10">
                          {selectedOrder.items?.map((item, idx) => (
                            <div key={idx} className="py-2 flex gap-3 items-center text-xs">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-10 h-10 object-cover rounded bg-brand-linen/10 shrink-0 border border-brand-outline-variant/10"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-brand-umber truncate">{item.product.name}</p>
                                <p className="text-[10px] text-brand-outline font-light">
                                  Size: {item.selectedSize} | Mat: {item.selectedMaterial}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-semibold text-brand-umber">{item.quantity}x</p>
                                <p className="text-[10px] text-brand-outline">EGP {item.product.price?.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Danger Zone: Delete Order */}
                      <div className="border-t border-brand-outline-variant/20 pt-4 flex justify-between items-center">
                        <span className="text-[10px] text-brand-outline/80 font-light">Clear order archive:</span>
                        <button
                          onClick={() => {
                            setOrderToDelete({ id: selectedOrder.id, orderNumber: selectedOrder.orderNumber });
                          }}
                          className="text-[10px] text-red-600 hover:text-red-700 hover:underline font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Delete Order
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="border border-dashed border-brand-outline-variant/20 rounded p-12 text-center text-brand-outline font-light text-xs bg-brand-linen/5 space-y-2">
                      <p>Select an order from the list to view complete shipping info, items breakdown, and issue real-time status updates.</p>
                      <p className="text-[10px] text-brand-gold font-medium">انقر على أي طلب لعرض التفاصيل وتحديث حالته فوراً.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "catalog" && !editingProduct && (
          <div className="space-y-6 animate-fadeIn">
            {filteredCatalog.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-brand-outline-variant/30 rounded bg-brand-linen/10 space-y-3">
                <ShoppingBag className="w-10 h-10 text-brand-outline/40 mx-auto" />
                <h3 className="font-serif text-lg text-brand-umber font-light">No items found</h3>
                <p className="text-xs text-brand-outline/80 font-light max-w-sm mx-auto">
                  Try clearing your search keyword or add a beautiful brand-new luxury accessory to get started.
                </p>
                <button
                  onClick={() => setActiveSubTab("add")}
                  className="bg-brand-gold text-white text-xs font-semibold py-2.5 px-6 uppercase tracking-wider rounded-sm hover:bg-brand-umber transition-colors"
                >
                  Create New Item
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto border border-brand-outline-variant/20 rounded">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-brand-linen/40 text-brand-outline uppercase tracking-wider text-[10px] border-b border-brand-outline-variant/20">
                      <th className="py-4 px-6 font-semibold">Product Detail</th>
                      <th className="py-4 px-4 font-semibold">Category</th>
                      <th className="py-4 px-4 font-semibold">Price</th>
                      <th className="py-4 px-4 font-semibold text-center">الكمية / Stock</th>
                      <th className="py-4 px-4 font-semibold text-center">Arrival Status</th>
                      <th className="py-4 px-6 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-outline-variant/10">
                    {filteredCatalog.map((product) => (
                      <tr key={product.id} className="hover:bg-brand-linen/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded border border-brand-outline-variant/20 overflow-hidden bg-brand-linen/20 shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-semibold text-brand-umber text-sm block">
                                {product.name}
                              </span>
                              <span className="text-[10px] text-brand-outline font-mono block">
                                ID: {product.id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-brand-outline font-medium">
                          {product.categoryName}
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-brand-umber text-sm">
                          EGP {product.price.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {product.stock !== undefined ? (
                            product.stock === 0 ? (
                              <span className="inline-block text-rose-600 bg-rose-50 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-rose-200">
                                Out of Stock
                              </span>
                            ) : (
                              <span className="inline-block text-brand-umber bg-brand-gold/10 px-2.5 py-1 rounded text-[10px] font-bold border border-brand-gold/20 font-mono">
                                {product.stock} pcs
                              </span>
                            )
                          ) : (
                            <span className="inline-block text-brand-outline bg-brand-linen/50 px-2.5 py-1 rounded text-[10px] font-medium italic">
                              Unlimited
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleNewArrival(product.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-semibold tracking-wider uppercase transition-all border ${
                              product.isNew
                                ? "bg-brand-gold/10 text-brand-gold border-brand-gold/30 shadow-sm"
                                : "bg-brand-linen/35 text-brand-outline/60 border-brand-outline-variant/20 hover:border-brand-outline-variant/50"
                            }`}
                            title="Toggle New Arrival tag"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{product.isNew ? "New Arrival" : "Standard"}</span>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-brand-outline hover:text-brand-umber hover:bg-brand-linen/30 rounded transition-colors border border-transparent hover:border-brand-outline-variant/20"
                              title="Edit product specs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-2 text-rose-500 hover:text-white hover:bg-rose-500 rounded transition-all border border-transparent hover:border-rose-600"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {(activeSubTab === "add" || editingProduct) && (
          <form onSubmit={handleSaveProduct} className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="bg-brand-linen/15 border border-brand-outline-variant/10 p-5 rounded-sm space-y-1 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-brand-gold uppercase tracking-wider block">
                  Quick Suggestion
                </span>
                <p className="text-xs text-brand-outline font-light leading-relaxed">
                  Avoid searching external sites for photo links. You can click on any of the VERO premium preset high-fidelity lifestyle photo URLs below to populate the image form field immediately!
                </p>
              </div>
            </div>

            {/* Premium Images preset selection drawer */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-brand-outline uppercase tracking-widest block">
                VERO High-End Asset presets (Click to select)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESET_IMAGES.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      triggerNotification(`Loaded preset: "${preset.name}"`);
                    }}
                    className={`p-2 rounded border text-left text-[10px] font-medium transition-all flex flex-col gap-1.5 ${
                      imageUrl === preset.url
                        ? "border-brand-gold bg-brand-gold/5 ring-1 ring-brand-gold/30"
                        : "border-brand-outline-variant/20 bg-white hover:border-brand-gold/50"
                    }`}
                  >
                    <div className="aspect-square rounded overflow-hidden bg-brand-linen/10">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-brand-umber truncate block w-full">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-brand-outline-variant/10 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Product Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Florentine Aurelia Earrings"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium"
                />
              </div>

              {/* Product Price */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Price (USD) *</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 1450"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium font-mono"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Boutique Collection *</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium"
                >
                  {CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-brand-outline" />
                  <span>كمية المخزون / Stock Quantity</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10 (أتركه فارغاً ليكون غير محدود)"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-medium font-mono"
                />
              </div>

              {/* Product Image Selection & Upload */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-brand-outline" />
                  <span>صورة المنتج / Product Image *</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-brand-linen/5 p-4 border border-brand-outline-variant/20 rounded-sm">
                  {/* Left part: preview + File Selector */}
                  <div className="md:col-span-5 flex items-center gap-3 bg-white p-3 border border-dashed border-brand-outline-variant/30 rounded-sm">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded border border-brand-outline-variant/30 shrink-0 bg-white"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded border border-dashed border-brand-outline-variant/30 flex items-center justify-center bg-brand-linen/10 text-brand-outline/40 shrink-0">
                        <FileImage className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-outline block mb-1">
                        رفع صورة من جهازك / Upload Local Image
                      </span>
                      <label className="inline-flex items-center gap-1.5 bg-brand-umber hover:bg-brand-gold text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-2 rounded cursor-pointer transition-colors">
                        <Upload className="w-3 h-3 text-brand-gold" />
                        <span>اختر ملف / Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === "string") {
                                  setImageUrl(reader.result);
                                  triggerNotification("تم تحميل الصورة بنجاح! / Image loaded successfully!");
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Middle separator */}
                  <div className="md:col-span-1 text-center font-serif text-[10px] uppercase tracking-widest text-brand-outline/50 my-1 md:my-0">
                    أو / OR
                  </div>

                  {/* Right part: URL input */}
                  <div className="md:col-span-6 space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-outline block">
                      رابط صورة مباشر / Direct Image URL
                    </span>
                    <input
                      type="url"
                      placeholder="Paste direct HTTPS photo URL or select preset above"
                      value={imageUrl.startsWith("data:") ? "" : imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber"
                    />
                    {imageUrl.startsWith("data:") && (
                      <span className="text-[9px] text-emerald-600 block font-medium">
                        ✓ تم رفع صورة من جهازك بنجاح ونشطة حالياً / Local uploaded image is currently active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Product Images */}
              <div className="space-y-4 md:col-span-2 bg-brand-linen/5 p-4 border border-brand-outline-variant/20 rounded-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5 text-brand-gold" />
                    <span>صور إضافية للمنتج / Additional Product Images</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setAdditionalImages([...additionalImages, ""])}
                    className="inline-flex items-center gap-1 bg-brand-gold hover:bg-brand-umber text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة صورة / Add Image</span>
                  </button>
                </div>

                {additionalImages.length === 0 ? (
                  <p className="text-[11px] text-brand-outline italic leading-relaxed">
                    لا توجد صور إضافية حالياً. سيتم عرض الصورة الأساسية فقط. / No additional images added yet. Only the main image will be displayed.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {additionalImages.map((imgUrl, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-brand-outline-variant/20 rounded-sm">
                        {/* Preview thumbnail */}
                        <div className="w-10 h-10 rounded border border-brand-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0 bg-brand-linen/10">
                          {imgUrl ? (
                            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <FileImage className="w-4 h-4 text-brand-outline/40" />
                          )}
                        </div>

                        {/* Input URL */}
                        <div className="flex-1">
                          <input
                            type="url"
                            placeholder="Paste additional image URL or upload below..."
                            value={imgUrl.startsWith("data:") ? "" : imgUrl}
                            onChange={(e) => {
                              const updated = [...additionalImages];
                              updated[idx] = e.target.value;
                              setAdditionalImages(updated);
                            }}
                            className="w-full bg-brand-linen/5 border border-brand-outline-variant/40 rounded-sm text-xs px-3 py-2 outline-none focus:border-brand-gold text-brand-umber"
                          />
                          {imgUrl.startsWith("data:") && (
                            <span className="text-[8px] text-emerald-600 block font-medium mt-0.5">
                              ✓ تم رفع الصورة بنجاح / Uploaded successfully
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* File Upload Button */}
                          <label className="p-2 bg-brand-linen hover:bg-brand-gold hover:text-white text-brand-umber rounded cursor-pointer transition-colors border border-brand-outline-variant/30">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    if (typeof reader.result === "string") {
                                      const updated = [...additionalImages];
                                      updated[idx] = reader.result;
                                      setAdditionalImages(updated);
                                      triggerNotification("تم تحميل الصورة بنجاح! / Image loaded successfully!");
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {/* Delete Row button */}
                          <button
                            type="button"
                            onClick={() => {
                              setAdditionalImages(additionalImages.filter((_, i) => i !== idx));
                            }}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded border border-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tagline */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Sensory Tagline (Aesthetic quotation)</span>
                </label>
                <input
                  type="text"
                  placeholder='e.g. "Hammered golden loops framing your collar with delicate, sustainable grace."'
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-light italic"
                />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-brand-outline" />
                  <span>Brand Description</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the materials, design philosophy, and fine elements of this accessory..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs p-4 outline-none focus:border-brand-gold text-brand-umber font-light leading-relaxed"
                />
              </div>

              {/* Material Custom selection tags */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Material Swatches (Comma separated colors/codes)
                </label>
                <input
                  type="text"
                  placeholder="e.g. #E5D5BC, #E5E4E2, #B76E79"
                  value={materialOptions}
                  onChange={(e) => setMaterialOptions(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-mono"
                />
                <span className="text-[10px] text-brand-outline font-light block">
                  Provide hex codes or text names representing luxury swatches.
                </span>
              </div>

              {/* Sizes available */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Size Options (Comma separated tags)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Small, Medium, Large, One Size"
                  value={sizeOptions}
                  onChange={(e) => setSizeOptions(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber font-mono"
                />
                <span className="text-[10px] text-brand-outline font-light block">
                  Tags displayed on checkout selection drawers.
                </span>
              </div>

              {/* Detailed specs */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Fine Specifications list (Comma separated details)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 18k solid gold plated, Freshwater pearls, Florentine casting"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs px-4 py-3 outline-none focus:border-brand-gold text-brand-umber"
                />
              </div>

              {/* Craftsmanship */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                  Artisanal Craftsmanship note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hand-carved inside historic ateliers of Milan by fourth-generation casting master technicians."
                  value={craftsmanship}
                  onChange={(e) => setCraftsmanship(e.target.value)}
                  className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-xs p-4 outline-none focus:border-brand-gold text-brand-umber font-light"
                />
              </div>

              {/* Is New Arrival checkbox */}
              <div className="md:col-span-2 py-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 text-brand-gold focus:ring-brand-gold border-brand-outline-variant rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-brand-umber uppercase tracking-wider block">
                      Tag as New Arrival
                    </span>
                    <span className="text-[10px] text-brand-outline font-light block">
                      Enables a "Seasonal / New Arrival" badge and lists item in the landing page carousel.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="pt-6 border-t border-brand-outline-variant/20 flex flex-col sm:flex-row justify-end items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setActiveSubTab("catalog");
                }}
                className="text-xs font-semibold uppercase tracking-wider text-brand-outline hover:text-brand-umber py-2.5 px-6"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-brand-gold text-white text-xs font-semibold py-3.5 px-10 uppercase tracking-[0.2em] hover:bg-brand-umber transition-all shadow-md w-full sm:w-auto"
              >
                {editingProduct ? "Save Changes" : "Forge Product Access"}
              </button>
            </div>
          </form>
        )}

        {activeSubTab === "analytics" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Bento Grid Diagnostic Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm text-left space-y-1">
                <span className="text-brand-outline uppercase tracking-widest text-[9.5px] font-bold block">
                  Total Managed Catalog
                </span>
                <span className="font-serif text-3xl text-brand-umber font-normal block">
                  {totalItems} Accessories
                </span>
                <span className="text-[10px] text-brand-outline/80 block">
                  Active in current browsing local state.
                </span>
              </div>

              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm text-left space-y-1">
                <span className="text-brand-outline uppercase tracking-widest text-[9.5px] font-bold block">
                  Average Luxury Price
                </span>
                <span className="font-serif text-3xl text-brand-umber font-normal block">
                  EGP {avgPrice.toLocaleString()}
                </span>
                <span className="text-[10px] text-brand-outline/80 block">
                  Calculated dynamically across active items.
                </span>
              </div>

              <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm text-left space-y-1">
                <span className="text-brand-outline uppercase tracking-widest text-[9.5px] font-bold block">
                  New Arrival Spotlights
                </span>
                <span className="font-serif text-3xl text-brand-umber font-normal block">
                  {newArrivalsCount} spotmarked
                </span>
                <span className="text-[10px] text-brand-outline/80 block">
                  Aesthetic badges active on product listings.
                </span>
              </div>
            </div>

            {/* General Database specs block */}
            <div className="bg-brand-linen/15 border border-brand-outline-variant/20 rounded-sm p-6 md:p-8 text-left space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-lg text-brand-umber font-normal">
                  How persistence operates
                </h3>
              </div>
              <p className="text-xs text-brand-outline font-light leading-relaxed max-w-2xl">
                Any luxury accessories added or removed through this manager are automatically synchronized to your local container sandbox's client state storage. That means they will persist securely across browser refreshes so you can test complete end-to-end purchasing, detail checks, and filters!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowResetConfirm(true);
                  }}
                  className="bg-brand-umber text-white text-[11px] font-semibold tracking-wider uppercase py-3 px-6 rounded-sm hover:bg-brand-gold transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restore Original Curated Lines</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeSubTab === "promos" && (
          <div className="space-y-8 animate-fadeIn text-left">
            {/* Header / Intro */}
            <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-lg text-brand-umber font-normal">
                  إدارة كوبونات الخصم / Promo Codes Manager
                </h3>
              </div>
              <p className="text-xs text-brand-outline font-light leading-relaxed max-w-2xl">
                أضف أو عطل أو احذف كوبونات الخصم لعملائك ديناميكياً. سيقوم نظام السلة بالتحقق من هذه الأكواد وتطبيقها تلقائياً.
                <br />
                <span className="text-[10px] text-brand-gold font-mono block mt-1">
                  Dynamically manage active coupons. The cart system automatically validates codes from your live repository.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Create Coupon Form */}
              <div className="bg-[#fffdfb] border border-brand-outline-variant/25 p-6 rounded-sm shadow-sm space-y-6 h-fit">
                <h4 className="font-serif text-md text-brand-umber font-medium border-b border-brand-outline-variant/10 pb-2">
                  إنشاء كوبون جديد / Create Coupon
                </h4>
                <form onSubmit={handleCreatePromo} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-brand-outline uppercase tracking-wider">
                      كود الخصم / Coupon Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SUMMER20"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value)}
                      className="w-full bg-white border border-brand-outline-variant/30 rounded-sm py-2.5 px-3 text-xs uppercase tracking-wider font-semibold focus:border-brand-gold focus:outline-none transition-colors"
                      maxLength={30}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-brand-outline uppercase tracking-wider">
                      نسبة الخصم % / Discount Percentage
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={newPromoDiscount}
                        onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                        className="flex-grow accent-brand-gold h-1.5 bg-brand-linen rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-sm font-bold text-brand-umber shrink-0 bg-brand-linen/40 px-2.5 py-1 rounded border border-brand-outline-variant/20">
                        {newPromoDiscount}%
                      </span>
                    </div>
                  </div>

                  {promoMsg && (
                    <div
                      className={`p-3 rounded-sm text-xs ${
                        promoMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {promoMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={promoSubmitting}
                    className="w-full bg-brand-gold text-white text-xs font-semibold py-3.5 uppercase tracking-wider hover:bg-brand-umber transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {promoSubmitting ? (
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    <span>إضافة الكوبون / Forge Coupon</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Active Promo Codes Directory */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-md text-brand-umber font-medium">
                    الكوبونات النشطة / Live Coupon Directory
                  </h4>
                  <span className="text-[10px] font-mono text-brand-outline bg-brand-linen/30 px-2 py-1 border border-brand-outline-variant/15 rounded-sm">
                    {promos.length} codes listed
                  </span>
                </div>

                {promos.length === 0 ? (
                  <div className="bg-brand-linen/10 border border-dashed border-brand-outline-variant/30 rounded-sm p-12 text-center text-brand-outline space-y-2">
                    <Tag className="w-8 h-8 text-brand-gold/40 mx-auto animate-pulse" />
                    <p className="text-sm font-light">لا توجد كوبونات خصم حالياً</p>
                    <p className="text-[10px] font-mono font-light text-brand-outline/80">No registered promo codes found in the database. Use the form to forge one.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-brand-outline-variant/15 rounded-sm overflow-hidden divide-y divide-brand-outline-variant/10">
                    {promos.map((promo) => (
                      <div
                        key={promo.id || promo.code}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-brand-linen/5 transition-colors"
                      >
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-brand-umber bg-brand-linen/50 border border-brand-outline-variant/25 px-2.5 py-0.5 rounded tracking-wider select-all">
                              {promo.code}
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-full font-mono">
                              {promo.discountPercentage}% OFF
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-brand-outline font-light">
                            ID: {promo.id} • Registered via Live Connection
                          </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          {/* Toggle Active switch */}
                          <button
                            onClick={() => handleTogglePromoActive(promo.id!, promo.isActive)}
                            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all border ${
                              promo.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                                : "bg-zinc-100 text-zinc-500 border-zinc-300 hover:bg-zinc-200"
                            }`}
                          >
                            {promo.isActive ? "فعال / Active" : "معطل / Inactive"}
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDeletePromo(promo.id!, promo.code)}
                            className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
             {/* Main Area Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Create Reward Form */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-brand-outline-variant/20 rounded-sm p-6 shadow-sm">
                  <h4 className="font-serif text-sm font-medium text-brand-umber mb-4 border-b border-brand-outline-variant/15 pb-2 uppercase tracking-wider">
                    أضف جائزة جديدة / Add New Reward
                  </h4>

                  <form onSubmit={handleAddReward} className="space-y-4">
                    {/* Arabic Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                        عنوان الجائزة (عربي) *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: خصم 15% على الكتالوج"
                        value={newRewardTitle}
                        onChange={(e) => setNewRewardTitle(e.target.value)}
                        className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2.5 outline-none focus:border-brand-gold text-brand-umber font-light"
                        required
                      />
                    </div>

                    {/* English Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block font-mono">
                        Reward Title (English) *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15% Catalog Discount Voucher"
                        value={newRewardTitleEn}
                        onChange={(e) => setNewRewardTitleEn(e.target.value)}
                        className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2.5 outline-none focus:border-brand-gold text-brand-umber font-light"
                        required
                      />
                    </div>

                    {/* Discount Percentage Selection */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                        نسبة الخصم للجائزة % / Reward Discount Percentage
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={newRewardDiscountPercentage}
                          onChange={(e) => setNewRewardDiscountPercentage(Number(e.target.value))}
                          className="flex-grow accent-brand-gold"
                        />
                        <span className="text-xs font-mono font-semibold text-brand-gold w-8 text-right">
                          {newRewardDiscountPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                        الوصف / Description
                      </label>
                      <textarea
                        rows={2}
                        placeholder="وصف تفصيلي للجائزة وشروط استخدامها..."
                        value={newRewardDescription}
                        onChange={(e) => setNewRewardDescription(e.target.value)}
                        className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2 outline-none focus:border-brand-gold text-brand-umber font-light resize-none"
                      />
                    </div>

                    {/* Cost and Code (Grid) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                          التكلفة بالنقاط *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={newRewardCost}
                          onChange={(e) => setNewRewardCost(Number(e.target.value))}
                          className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2.5 outline-none focus:border-brand-gold text-brand-umber font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                          كود الخصم *
                        </label>
                        <input
                          type="text"
                          placeholder="VERO15"
                          value={newRewardCode}
                          onChange={(e) => setNewRewardCode(e.target.value.toUpperCase())}
                          className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2.5 outline-none focus:border-brand-gold text-brand-umber font-mono uppercase"
                          required
                        />
                      </div>
                    </div>

                    {rewardMsg && (
                      <div
                        className={`p-3 rounded-sm text-xs ${
                          rewardMsg.type === "success"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-800"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-800"
                        }`}
                      >
                        {rewardMsg.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={rewardSubmitting}
                      className="w-full bg-brand-gold text-white text-xs font-semibold py-3 px-6 uppercase tracking-widest hover:bg-brand-umber transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {rewardSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>إضافة الجائزة / Add Reward</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Existing Rewards List */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-brand-outline-variant/20 rounded-sm p-6 shadow-sm min-h-[300px] flex flex-col">
                  <h4 className="font-serif text-sm font-medium text-brand-umber mb-4 border-b border-brand-outline-variant/15 pb-2 uppercase tracking-wider">
                    الجوائز المتاحة حالياً / Current Rewards Storefront ({rewards.length})
                  </h4>

                  <div className="flex-grow space-y-4">
                    {rewards.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-brand-gold/5 border border-brand-gold/25 flex items-center justify-center">
                          <Gift className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-brand-umber">لا توجد جوائز في المتجر حالياً</p>
                          <p className="text-[11px] text-brand-outline font-light">استخدم النموذج المجاور لإضافة جوائز جديدة وسهلة الاسترداد للعملاء.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="divide-y divide-brand-outline-variant/15 max-h-[500px] overflow-y-auto pr-1">
                        {rewards.map((reward) => (
                          <div key={reward.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-brand-umber">{reward.title}</span>
                                <span className="text-[10px] font-mono text-brand-gold bg-[#c5a880]/10 px-1.5 py-0.5 rounded-sm">
                                  {reward.cost} PTS
                                </span>
                                {reward.discountPercentage !== undefined && (
                                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm">
                                    {reward.discountPercentage}% OFF
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-outline font-mono uppercase">{reward.titleEn}</p>
                              {reward.description && (
                                <p className="text-[11px] text-brand-outline font-light leading-relaxed">{reward.description}</p>
                              )}
                              <p className="text-[10px] text-brand-outline font-mono">
                                Coupon Code: <strong className="text-brand-umber font-bold">{reward.code}</strong>
                              </p>
                            </div>

                            <button
                              onClick={() => handleDeleteReward(reward.id, reward.titleEn)}
                              className="p-2 text-brand-outline/60 hover:text-rose-600 hover:bg-rose-50/50 rounded-full transition-colors shrink-0"
                              title="حذف الجائزة / Delete Reward"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "jsonbin" && (
          <div className="space-y-8 animate-fadeIn text-left">
            {/* Header / Intro */}
            <div className="bg-brand-linen/10 border border-brand-outline-variant/20 p-6 rounded-sm space-y-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-brand-gold" />
                <h3 className="font-serif text-lg text-brand-umber font-normal">
                  إعدادات السحابة الحية والنسخ الاحتياطي / Cloud Persistence & JSONBin.io Integration
                </h3>
              </div>
              <p className="text-xs text-brand-outline font-light leading-relaxed max-w-3xl">
                اربط متجر <strong>VERO Luxury Boutique</strong> بسحابة <strong>JSONBin.io</strong> لتخزين كتالوج المنتجات، الطلبات، الكوبونات والجوائز بأمان في السحابة. هذا يضمن حماية بيانات متجرك بالكامل وبقاءها حية عبر خوادم السحاب حتى لو تم إعادة تشغيل الخادم.
                <br />
                <span className="text-[10px] text-brand-gold font-mono block mt-1">
                  Connect your boutique store with JSONBin.io cloud database. This synchronizes your catalog, order database, coupon codes, and loyalty reward tiers to a resilient cloud database that survives server restarts.
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Config Form */}
              <div className="bg-[#fffdfb] border border-brand-outline-variant/25 p-6 rounded-sm shadow-sm space-y-6 h-fit">
                <h4 className="font-serif text-md text-brand-umber font-medium border-b border-brand-outline-variant/10 pb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand-gold" />
                  <span>تكوين السحابة / Cloud Configuration</span>
                </h4>

                {jsonBinMsg && (
                  <div className={`p-4 text-xs rounded-sm ${
                    jsonBinMsg.type === "success" 
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}>
                    {jsonBinMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveJsonBinConfig} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                      المفتاح الرئيسي / Master Key *
                    </label>
                    <input
                      type="password"
                      placeholder="e.g. $2a$10$..."
                      value={jsonBinKey}
                      onChange={(e) => setJsonBinKey(e.target.value)}
                      className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2.5 outline-none focus:border-brand-gold text-brand-umber font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-brand-umber block">
                      معرف الصندوق السحابي / Bin ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 64bfd..."
                      value={jsonBinId}
                      onChange={(e) => setJsonBinId(e.target.value)}
                      className="w-full bg-brand-linen/10 border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2.5 outline-none focus:border-brand-gold text-brand-umber font-mono"
                    />
                    <p className="text-[9px] text-brand-outline/80 leading-relaxed mt-1">
                      * اتركه فارغاً وسيتم إنشاء صندوق سحابي جديد لمتجرك تلقائياً وتعبئته بالمنتجات الحالية!
                      <br />
                      <span className="text-brand-gold font-mono block">
                        Leave blank to auto-provision a new bin populated with current data.
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="jsonBinEnabled"
                      checked={jsonBinEnabled}
                      onChange={(e) => setJsonBinEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-brand-outline-variant text-brand-gold focus:ring-brand-gold"
                    />
                    <label htmlFor="jsonBinEnabled" className="text-xs text-brand-umber font-medium cursor-pointer select-none">
                      تفعيل المزامنة التلقائية السحابية / Enable Cloud Sync
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={jsonBinLoading}
                    className="w-full bg-brand-umber text-white text-[11px] font-semibold tracking-wider uppercase py-3 rounded-sm hover:bg-brand-gold transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {jsonBinLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>حفظ وتطبيق / Save & Apply Cloud Config</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Actions and Logs */}
              <div className="lg:col-span-2 space-y-6">
                {/* Connection Status Card */}
                <div className="bg-white border border-brand-outline-variant/20 rounded-sm p-6 shadow-sm space-y-4">
                  <h4 className="font-serif text-xs font-semibold text-brand-umber uppercase tracking-wider">
                    حالة الاتصال السحابي / Cloud Sync Status
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className={`relative flex h-3.5 w-3.5`}>
                      {jsonBinEnabled && jsonBinId ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                        </>
                      ) : (
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-zinc-300"></span>
                      )}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-brand-umber block">
                        {jsonBinEnabled && jsonBinId ? "نشط ومتصل / CONNECTED" : "معطل / OFFLINE"}
                      </span>
                      <span className="text-[10px] text-brand-outline font-mono block">
                        {jsonBinId ? `Bin ID: ${jsonBinId}` : "No cloud database linked"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => handleJsonBinSync("push")}
                      disabled={jsonBinSyncing || !jsonBinId}
                      className="bg-brand-linen/40 border border-brand-outline-variant/30 text-brand-umber text-[10px] font-semibold tracking-wider uppercase py-2.5 rounded-sm hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      {jsonBinSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CloudUpload className="w-3.5 h-3.5" />
                      )}
                      <span>رفع للسحابة / Push</span>
                    </button>

                    <button
                      onClick={() => handleJsonBinSync("pull")}
                      disabled={jsonBinSyncing || !jsonBinId}
                      className="bg-brand-linen/40 border border-brand-outline-variant/30 text-brand-umber text-[10px] font-semibold tracking-wider uppercase py-2.5 rounded-sm hover:bg-brand-gold hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
                    >
                      {jsonBinSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CloudDownload className="w-3.5 h-3.5" />
                      )}
                      <span>تنزيل / Pull</span>
                    </button>
                  </div>
                </div>

                {/* Developer Sync Logs Console */}
                <div className="bg-[#1c1714] border border-[#2e2621] rounded-sm p-5 shadow-inner space-y-3">
                  <div className="flex items-center justify-between border-b border-[#2e2621] pb-2">
                    <div className="flex items-center gap-1.5 text-brand-gold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                      </span>
                      <h4 className="text-[10px] font-mono uppercase tracking-wider font-bold">
                        Synchronizer Logs (سجل العمليات)
                      </h4>
                    </div>
                    <button
                      onClick={() => setJsonBinLogs([])}
                      className="text-[9px] font-mono text-[#a88a65] hover:text-brand-gold transition-colors"
                    >
                      CLEAR
                    </button>
                  </div>

                  <div className="h-40 overflow-y-auto font-mono text-[10px] text-[#dac1a3] space-y-1.5 scrollbar-thin scrollbar-thumb-brand-gold text-left leading-relaxed">
                    {jsonBinLogs.length === 0 ? (
                      <p className="text-zinc-600 italic">No cloud sync activities logged yet...</p>
                    ) : (
                      jsonBinLogs.map((log, i) => (
                        <p key={i} className="whitespace-pre-wrap">{log}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Verification Overlay Modal */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 bg-brand-umber/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fff8f3] border border-brand-outline-variant/35 p-6 md:p-8 max-w-md w-full shadow-2xl rounded-sm space-y-6 text-brand-umber font-sans text-right"
              dir="rtl"
            >
              <div className="text-center space-y-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 mb-2 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h3 className="font-serif text-xl tracking-wide font-normal text-center">
                  تفويض المشرف مطلوب
                </h3>
                <p className="text-xs text-brand-outline font-light leading-relaxed text-center">
                  تعديل الكتالوج محمي بكلمة سر. الرجاء إدخال الرمز لتأكيد الإجراء.
                  <br />
                  <span className="text-[10px] text-brand-gold font-mono block mt-1">
                    Enter password to authorize modification
                  </span>
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordAttempt === "vero2026") {
                    setIsAuthenticated(true);
                    localStorage.setItem("vero_admin_authenticated", "true");
                    setPasswordError("");
                    const callback = pendingCallbackRef.current;
                    pendingCallbackRef.current = null;
                    setShowLockModal(false);
                    setPasswordAttempt("");
                    if (callback) {
                      callback();
                    }
                  } else {
                    setPasswordError("كلمة السر غير صحيحة. حاول مرة أخرى.");
                  }
                }}
                className="space-y-4 text-center"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-outline block text-center">
                    كلمة المرور / Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordAttempt}
                    onChange={(e) => {
                      setPasswordAttempt(e.target.value);
                      setPasswordError("");
                    }}
                    className="w-full bg-white border border-brand-outline-variant/40 rounded-sm text-center font-mono py-3 outline-none focus:border-brand-gold text-brand-umber text-sm"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-[10px] font-semibold text-rose-500 text-center animate-pulse">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      pendingCallbackRef.current = null;
                      setShowLockModal(false);
                      setPasswordAttempt("");
                      setPasswordError("");
                    }}
                    className="flex-1 border border-brand-outline-variant/30 text-brand-outline hover:text-brand-umber text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-colors bg-white text-center"
                  >
                    إلغاء / Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-gold hover:bg-brand-umber text-white text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-all shadow-sm text-center"
                  >
                    تأكيد / Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Overlay Modal */}
      <AnimatePresence>
        {productToDelete && (
          <div className="fixed inset-0 bg-brand-umber/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fff8f3] border border-brand-outline-variant/35 p-6 md:p-8 max-w-md w-full shadow-2xl rounded-sm space-y-6 text-brand-umber font-sans text-right"
              dir="rtl"
            >
              <div className="text-center space-y-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2 mx-auto">
                  <Trash2 className="w-6 h-6" />
                </span>
                <h3 className="font-serif text-xl tracking-wide font-normal text-center">
                  تأكيد حذف المنتج
                </h3>
                <p className="text-xs text-brand-outline font-light leading-relaxed text-center">
                  هل أنت متأكد أنك تريد حذف منتج <strong className="font-semibold text-brand-umber">"{productToDelete.name}"</strong> من الكتالوج نهائياً؟
                  <br />
                  <span className="text-[10px] text-brand-gold font-mono block mt-1">
                    Are you sure you want to permanently delete this product?
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 border border-brand-outline-variant/30 text-brand-outline hover:text-brand-umber text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-colors bg-white text-center animate-pulse-none"
                >
                  إلغاء / Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-all shadow-sm text-center"
                >
                  حذف / Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Order Confirmation Overlay Modal */}
      <AnimatePresence>
        {orderToDelete && (
          <div className="fixed inset-0 bg-brand-umber/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fff8f3] border border-brand-outline-variant/35 p-6 md:p-8 max-w-md w-full shadow-2xl rounded-sm space-y-6 text-brand-umber font-sans text-right"
              dir="rtl"
            >
              <div className="text-center space-y-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 mb-2 mx-auto">
                  <Trash2 className="w-6 h-6" />
                </span>
                <h3 className="font-serif text-xl tracking-wide font-normal text-center">
                  تأكيد حذف الطلب
                </h3>
                <p className="text-xs text-brand-outline font-light leading-relaxed text-center">
                  هل أنت متأكد أنك تريد حذف الطلب رقم <strong className="font-semibold text-brand-umber">"#{orderToDelete.orderNumber}"</strong> من السجل نهائياً؟
                  <br />
                  <span className="text-[10px] text-brand-gold font-mono block mt-1">
                    Are you sure you want to permanently delete this order from history?
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="flex-1 border border-brand-outline-variant/30 text-brand-outline hover:text-brand-umber text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-colors bg-white text-center"
                >
                  إلغاء / Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifyAction(() => {
                      handleDeleteOrder(orderToDelete.id);
                      setOrderToDelete(null);
                    });
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-all shadow-sm text-center animate-pulse-none"
                >
                  حذف / Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restore Database Confirmation Overlay Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-brand-umber/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#fff8f3] border border-brand-outline-variant/35 p-6 md:p-8 max-w-md w-full shadow-2xl rounded-sm space-y-6 text-brand-umber font-sans text-right"
              dir="rtl"
            >
              <div className="text-center space-y-2">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 mb-2 mx-auto">
                  <RefreshCw className="w-6 h-6" />
                </span>
                <h3 className="font-serif text-xl tracking-wide font-normal text-center">
                  تأكيد إعادة ضبط المتجر
                </h3>
                <p className="text-xs text-brand-outline font-light leading-relaxed text-center">
                  هل أنت متأكد أنك تريد إعادة تعيين المتجر إلى المنتجات والخطوط المنسقة الأصلية؟ سيتم تجاهل كافة التغييرات المخصصة.
                  <br />
                  <span className="text-[10px] text-brand-gold font-mono block mt-1">
                    Reset boutique back to curated defaults? All custom additions will be lost.
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 border border-brand-outline-variant/30 text-brand-outline hover:text-brand-umber text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-colors bg-white text-center"
                >
                  إلغاء / Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifyAction(() => {
                      onResetDatabase();
                      triggerNotification("Restored standard product lines.");
                      setShowResetConfirm(false);
                    });
                  }}
                  className="flex-1 bg-brand-gold hover:bg-brand-umber text-white text-xs font-semibold py-3 uppercase tracking-wider rounded-sm transition-all shadow-sm text-center"
                >
                  إعادة تعيين / Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
