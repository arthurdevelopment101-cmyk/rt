import React from "react";
import {
  Database,
  Server,
  Wifi,
  WifiOff,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Settings,
  Link2,
} from "lucide-react";
import { Product, Order, PromoCode } from "../types";

interface DatabaseSyncViewProps {
  ordersCount: number;
  productsCount: number;
  promosCount: number;
  rewardsCount: number;
  triggerNotification: (text: string, type?: "success" | "error") => void;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  setPromos?: React.Dispatch<React.SetStateAction<PromoCode[]>>;
}

export default function DatabaseSyncView({
  ordersCount,
  productsCount,
  promosCount,
  rewardsCount,
  triggerNotification,
  setProducts,
  setOrders,
  setPromos,
}: DatabaseSyncViewProps) {
  const [config, setConfig] = React.useState({
    useRailwayDb: false,
    railwayUrl: "https://er-production-7d2a.up.railway.app"
  });
  const [status, setStatus] = React.useState({
    mongoConnected: false,
    railwayConnected: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isTesting, setIsTesting] = React.useState(false);
  const [isPulling, setIsPulling] = React.useState(false);
  const [isPushing, setIsPushing] = React.useState(false);

  // Stats from Railway
  const [railwayStats, setRailwayStats] = React.useState<{
    products: number;
    orders: number;
    promos: number;
    rewards: number;
  } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/db-config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setStatus(data.status);

        if (data.status.railwayConnected) {
          fetchRailwayStats(data.config.railwayUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching db config:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRailwayStats = async (url: string) => {
    try {
      const cleanUrl = url.replace(/\/$/, "");
      const [prodRes, ordRes, promoRes, rewardRes] = await Promise.all([
        fetch(`${cleanUrl}/api/products`).then(r => r.json()).catch(() => []),
        fetch(`${cleanUrl}/api/orders`).then(r => r.json()).catch(() => []),
        fetch(`${cleanUrl}/api/promos`).then(r => r.json()).catch(() => []),
        fetch(`${cleanUrl}/api/rewards`).then(r => r.json()).catch(() => [])
      ]);

      setRailwayStats({
        products: Array.isArray(prodRes) ? prodRes.length : 0,
        orders: Array.isArray(ordRes) ? ordRes.length : 0,
        promos: Array.isArray(promoRes) ? promoRes.length : 0,
        rewards: Array.isArray(rewardRes) ? rewardRes.length : 0
      });
    } catch (e) {
      console.error("Error fetching railway stats:", e);
    }
  };

  React.useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggleMode = async (enabled: boolean) => {
    try {
      const res = await fetch("/api/db-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useRailwayDb: enabled, railwayUrl: config.railwayUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        triggerNotification(
          enabled 
            ? "Successfully toggled direct Railway DB Proxy Mode! / تم تفعيل المزامنة المباشرة لقاعدة بيانات ريلواي!"
            : "Switched back to local database. / تم العودة لقاعدة البيانات المحلية.",
          "success"
        );
        // Refresh local UI states
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      triggerNotification("Failed to update database mode.", "error");
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/db-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useRailwayDb: config.useRailwayDb, railwayUrl: config.railwayUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        triggerNotification("Railway URL updated successfully! / تم تحديث عنوان ريلواي بنجاح!", "success");
        handleTestConnection();
      }
    } catch (err) {
      triggerNotification("Failed to save URL.", "error");
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const cleanUrl = config.railwayUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanUrl}/api/products`);
      if (res.ok) {
        setStatus(prev => ({ ...prev, railwayConnected: true }));
        fetchRailwayStats(config.railwayUrl);
        triggerNotification("Connection to Railway DB is successful! / تم الاتصال بقاعدة بيانات ريلواي بنجاح!", "success");
      } else {
        setStatus(prev => ({ ...prev, railwayConnected: false }));
        triggerNotification("Railway server returned an error.", "error");
      }
    } catch (err) {
      setStatus(prev => ({ ...prev, railwayConnected: false }));
      triggerNotification("Could not reach Railway server. Check URL.", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const handlePull = async () => {
    const confirmPull = window.confirm(
      "Warning: This will overwrite your local database (Disk/MongoDB) with products, orders, and promos from Railway. Proceed? \n\nتحذير: سيقوم هذا الإجراء باستبدال كافة البيانات المحلية ببيانات ريلواي. هل تريد الاستمرار؟"
    );
    if (!confirmPull) return;

    setIsPulling(true);
    try {
      const res = await fetch("/api/db-sync/pull", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        triggerNotification(
          `Successfully pulled ${data.productsCount} products, ${data.ordersCount} orders, and ${data.promosCount} promos from Railway! / تم سحب ومزامنة البيانات بنجاح!`,
          "success"
        );
        // Reload products and other states
        setTimeout(() => window.location.reload(), 1500);
      } else {
        triggerNotification("Failed to pull remote data.", "error");
      }
    } catch (err) {
      triggerNotification("Sync network error occurred.", "error");
    } finally {
      setIsPulling(false);
    }
  };

  const handlePush = async () => {
    const confirmPush = window.confirm(
      "This will upload any local products, orders, and promos to Railway that are not already present there. Proceed? \n\nسيقوم هذا الإجراء بإرسال البيانات المحلية غير الموجودة على خادم ريلواي. هل تريد الاستمرار؟"
    );
    if (!confirmPush) return;

    setIsPushing(true);
    try {
      const res = await fetch("/api/db-sync/push", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        triggerNotification(
          `Pushed successfully! Pushed: ${data.productsPushed} products, ${data.ordersPushed} orders, ${data.promosPushed} promos. / تم دفع ومزامنة البيانات بنجاح!`,
          "success"
        );
        fetchRailwayStats(config.railwayUrl);
      } else {
        triggerNotification("Failed to push local data.", "error");
      }
    } catch (err) {
      triggerNotification("Sync network error occurred.", "error");
    } finally {
      setIsPushing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-gold mb-3" />
        <p className="text-xs text-brand-outline">جاري تحميل إعدادات قاعدة البيانات... / Loading Database settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="bg-brand-linen/5 border border-brand-outline-variant/20 rounded-sm p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-brand-gold" />
            <h3 className="font-serif text-lg text-brand-umber font-normal">
              إدارة ومزامنة قاعدة البيانات / Database Management & Sync
            </h3>
          </div>
          <p className="text-xs text-brand-outline font-light leading-relaxed">
            اربط المتجر بقاعدة بيانات الإنتاج على ريلواي (<code className="font-mono text-brand-gold select-all">er-production-7d2a.up.railway.app</code>) لمزامنة الكتالوج، الطلبات، والأكواد الترويجية فوراً. يمكنك سحب (Pull) أو دفع (Push) البيانات أو التبديل إلى وضع قاعدة البيانات المباشرة.
          </p>
        </div>

        {/* Connection status card */}
        <div className="shrink-0 flex flex-col gap-2">
          <div className="bg-white border border-brand-outline-variant/15 rounded px-4 py-2.5 flex items-center gap-3">
            <Server className="w-4 h-4 text-brand-gold" />
            <div>
              <div className="text-[9px] font-bold text-brand-outline uppercase tracking-wider">Local MongoDB (fallback)</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${status.mongoConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="text-[10px] font-mono text-brand-umber">
                  {status.mongoConnected ? "MongoDB Active" : "Disk Fallback Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-brand-outline-variant/15 rounded px-4 py-2.5 flex items-center gap-3">
            <Globe className="w-4 h-4 text-brand-gold" />
            <div>
              <div className="text-[9px] font-bold text-brand-outline uppercase tracking-wider">Production Railway DB</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${status.railwayConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-[10px] font-mono text-brand-umber">
                  {status.railwayConnected ? "Online / متصل" : "Offline / غير متصل"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Connection URL and Proxy switch */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-outline-variant/20 rounded-sm p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-brand-outline-variant/15 pb-3">
              <Settings className="w-4 h-4 text-brand-gold" />
              <h4 className="font-serif text-sm font-semibold text-brand-umber">إعدادات الاتصال / Connection Settings</h4>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-brand-outline block">
                  رابط خادم الإنتاج / Production Railway URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://er-production-7d2a.up.railway.app"
                    value={config.railwayUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, railwayUrl: e.target.value }))}
                    className="flex-1 bg-white border border-brand-outline-variant/45 rounded-sm text-xs px-3 py-2 outline-none focus:border-brand-gold text-brand-umber font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-brand-umber text-white hover:bg-brand-gold text-xs font-semibold px-4 py-2 rounded-sm transition-all cursor-pointer"
                  >
                    حفظ / Save
                  </button>
                </div>
              </div>
            </form>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex-1 border border-brand-outline-variant/35 text-brand-umber hover:bg-brand-linen/10 text-xs font-semibold py-2.5 rounded-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                <span>فحص الاتصال / Test Connection</span>
              </button>
            </div>

            {/* Direct Proxy Mode Switch */}
            <div className="border-t border-brand-outline-variant/15 pt-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold block">
                    ★ وضع قاعدة البيانات المباشرة / Live Proxy Mode
                  </span>
                  <h5 className="font-serif text-brand-umber text-sm font-medium">استخدام قاعدة بيانات ريلواي مباشرة</h5>
                  <p className="text-[11px] text-brand-outline leading-relaxed font-light">
                    عند التفعيل، سيقوم هذا المتجر بتحميل وحفظ كافة المنتجات، الطلبات، والخصومات مباشرة من/إلى خادم ريلواي في الوقت الفعلي بدلاً من الملفات المحلية.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleToggleMode(!config.useRailwayDb)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.useRailwayDb ? "bg-brand-gold" : "bg-brand-outline-variant"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.useRailwayDb ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {config.useRailwayDb && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-800 rounded p-3 flex items-start gap-2.5 text-[11px] font-light leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    وضع المزامنة المباشرة نشط الآن! المتجر يستعلم من خادم ريلواي مباشرة.
                    <span className="block mt-0.5 text-[10px] text-brand-outline">
                      Direct proxy mode is active! All actions write to Railway database.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Sync Actions / Push & Pull */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-outline-variant/20 rounded-sm p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-brand-outline-variant/15 pb-3">
              <RefreshCw className="w-4 h-4 text-brand-gold" />
              <h4 className="font-serif text-sm font-semibold text-brand-umber">المزامنة اليدوية / Manual Sync</h4>
            </div>

            {/* Compare stats */}
            <div className="bg-brand-linen/15 border border-brand-outline-variant/15 rounded p-4 text-xs font-light leading-relaxed space-y-2">
              <h5 className="font-medium text-brand-umber uppercase tracking-wider text-[10px]">مقارنة محتويات قواعد البيانات / DB Stats Comparison</h5>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono text-[11px]">
                <div>
                  <span className="block text-[9px] text-brand-outline uppercase font-sans">النوع / Type</span>
                  <span className="block mt-1 font-sans text-brand-umber font-semibold border-b border-brand-outline-variant/10 pb-1">المحلي (Local)</span>
                  <span className="block mt-1">منتجات: {productsCount}</span>
                  <span className="block">طلبات: {ordersCount}</span>
                  <span className="block">خصومات: {promosCount}</span>
                  <span className="block">جوائز: {rewardsCount}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <span className="block text-[9px] text-brand-outline uppercase font-sans">ريلواي (Railway)</span>
                  <span className="block mt-1 font-sans text-brand-umber font-semibold border-b border-brand-outline-variant/10 pb-1">البعيد (Remote)</span>
                  {railwayStats ? (
                    <>
                      <span className="block mt-1">منتجات: {railwayStats.products}</span>
                      <span className="block">طلبات: {railwayStats.orders}</span>
                      <span className="block">خصومات: {railwayStats.promos}</span>
                      <span className="block">جوائز: {railwayStats.rewards}</span>
                    </>
                  ) : (
                    <span className="block mt-4 text-brand-outline text-[10px] font-sans">فحص مطلوب / Test required</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pull action */}
            <div className="space-y-3">
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-brand-umber flex items-center gap-1.5 uppercase tracking-wide">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-brand-gold" />
                  <span>سحب البيانات من ريلواي / Pull from Railway</span>
                </h5>
                <p className="text-[11px] text-brand-outline font-light leading-relaxed">
                  قم بتحميل كافة المنتجات، الطلبات، والخصومات من خادم ريلواي وحفظها محلياً. سيعمل هذا على الكتابة فوق نسختك المحلية.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePull}
                disabled={isPulling || !status.railwayConnected}
                className="w-full border border-brand-gold hover:bg-brand-gold hover:text-white text-brand-gold text-xs font-semibold py-2.5 rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <ArrowDownLeft className={`w-4 h-4 ${isPulling ? "animate-pulse" : ""}`} />
                <span>{isPulling ? "جاري السحب والمزامنة... / Pulling..." : "سحب البيانات وتحديث المحلي / Pull Remote Data"}</span>
              </button>
            </div>

            {/* Push action */}
            <div className="space-y-3 border-t border-brand-outline-variant/15 pt-5">
              <div className="space-y-1">
                <h5 className="text-xs font-semibold text-brand-umber flex items-center gap-1.5 uppercase tracking-wide">
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-gold" />
                  <span>دفع البيانات إلى ريلواي / Push to Railway</span>
                </h5>
                <p className="text-[11px] text-brand-outline font-light leading-relaxed">
                  أرسل كافة المنتجات، الطلبات، والرموز المحلية الجديدة إلى خادم ريلواي. يكتشف النظام العناصر المكررة تلقائياً لمنع الأخطاء.
                </p>
              </div>

              <button
                type="button"
                onClick={handlePush}
                disabled={isPushing || !status.railwayConnected}
                className="w-full bg-brand-gold hover:bg-brand-umber text-white text-xs font-semibold py-2.5 rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <ArrowUpRight className={`w-4 h-4 ${isPushing ? "animate-pulse" : ""}`} />
                <span>{isPushing ? "جاري الإرسال والمزامنة... / Pushing..." : "دفع البيانات الجديدة للخارج / Push New Data"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory warning notice */}
      <div className="bg-amber-500/5 border border-amber-500/20 text-amber-900 rounded p-4 flex gap-3 text-xs font-light leading-relaxed max-w-4xl mx-auto">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-semibold text-amber-950">إرشادات هامة حول الاستخدام / Usage Safety Notice</h5>
          <p>
            تضمن المزامنة الذكية عدم حدوث تكرار للطلبات أو المنتجات ذات المعرفات (IDs) المشتركة. نوصي بفحص الاتصال للتأكد من حالة الخادم البعيد قبل بدء عمليات النقل اليدوية الكبرى.
          </p>
          <span className="block text-[10px] text-brand-outline font-mono">
            Smart Sync relies on consistent unique IDs. Verify connection health before performing bulk migrations.
          </span>
        </div>
      </div>
    </div>
  );
}
