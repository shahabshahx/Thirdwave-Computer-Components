import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShoppingCart, Sparkles, Package, ArrowRight, ShieldCheck, 
  Coins, Headset, CheckCircle2, Cpu, Zap, Layers, HardDrive, 
  Server, Plug, Monitor, Keyboard, Search, X, User, 
  ClipboardList, Send, ShieldAlert, Lock, LogIn, AlertCircle 
} from "lucide-react";
import { Product, Category } from "../types";

interface FrontStoreProps {
  page: string;
  setPage: (p: string) => void;
  selectedProductId: number;
  setSelectedProductId: (id: number) => void;
  adminUser: any;
  setAdminUser: (user: any) => void;
  products: Product[];
  setProducts: (prods: Product[]) => void;
  categories: Category[];
}

export default function FrontStore({
  page,
  setPage,
  selectedProductId,
  setSelectedProductId,
  adminUser,
  setAdminUser,
  products,
  setProducts,
  categories
}: FrontStoreProps) {
  // Products filter states
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(0);

  // Cart/Checkout state
  const [orderForm, setOrderForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1
  });
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [checkoutErrors, setCheckoutErrors] = useState<string[]>([]);

  // Sell Trade-In state
  const [sellForm, setSellForm] = useState({
    seller_name: "",
    email: "",
    phone: "",
    component_name: "",
    category: "",
    expected_price: "",
    component_condition: "",
    description: ""
  });
  const [sellSuccess, setSellSuccess] = useState(false);
  const [sellErrors, setSellErrors] = useState<string[]>([]);

  // Contact support state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactErrors, setContactErrors] = useState<string[]>([]);

  // Admin login credentials state
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Fetch updated catalog on load or tab change
  const refreshProductsList = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Error refreshing components:", e);
    }
  };

  useEffect(() => {
    refreshProductsList();
  }, [page]);

  // Order Quantity safety locks
  const handleQuantityChange = (qty: number) => {
    if (!selectedProduct) return;
    const maxStock = selectedProduct.stock_quantity;
    let finalQty = qty;
    if (qty < 1) finalQty = 1;
    if (qty > maxStock) finalQty = maxStock;
    setOrderForm(prev => ({ ...prev, quantity: finalQty }));
  };

  // Submit Order Invoice to Express Database Simulation
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutErrors([]);
    
    if (!selectedProduct) {
      setCheckoutErrors(["No product currently active in checkout workflow."]);
      return;
    }

    if (!orderForm.customer_name.trim()) return setCheckoutErrors(["Name is required."]);
    if (!orderForm.email.trim() || !orderForm.email.includes("@")) return setCheckoutErrors(["Please include a valid shipping Email address."]);
    if (!orderForm.phone.trim()) return setCheckoutErrors(["A contact Phone number is required for dispatch coordination."]);
    if (!orderForm.address.trim()) return setCheckoutErrors(["Shipping Address is required."]);
    if (orderForm.quantity <= 0) return setCheckoutErrors(["Selected units must be greater than zero."]);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          customer_name: orderForm.customer_name,
          email: orderForm.email,
          phone: orderForm.phone,
          address: orderForm.address,
          quantity: orderForm.quantity
        })
      });

      if (res.ok) {
        const data = await res.json();
        setOrderNumber(data.id);
        setOrderSuccess(true);
        // Refresh master catalog list state
        refreshProductsList();
      } else {
        const errData = await res.json();
        setCheckoutErrors([errData.error || "Order dispatch failure."]);
      }
    } catch {
      setCheckoutErrors(["An expected transaction error occurred."]);
    }
  };

  // Submit Sell Request to Express Database Simulation
  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellErrors([]);

    if (!sellForm.seller_name.trim()) return setSellErrors(["Name is required."]);
    if (!sellForm.email.trim() || !sellForm.email.includes("@")) return setSellErrors(["Valid Email required."]);
    if (!sellForm.phone.trim()) return setSellErrors(["Telephone contact required."]);
    if (!sellForm.component_name.trim()) return setSellErrors(["Component label & model label required."]);
    if (!sellForm.category || sellForm.category === "0") return setSellErrors(["Please assign is a category."]);
    if (!sellForm.expected_price || Number(sellForm.expected_price) <= 0) return setSellErrors(["Price expectation must be positive."]);
    if (!sellForm.component_condition) return setSellErrors(["Condition metric required."]);

    try {
      const res = await fetch("/api/sell-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellForm)
      });
      if (res.ok) {
        setSellSuccess(true);
      } else {
        setSellErrors(["Trade application compilation failure."]);
      }
    } catch {
      setSellErrors(["System failure saving offer."]);
    }
  };

  // Submit Help Ticket Support Message
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactErrors([]);

    if (!contactForm.name.trim()) return setContactErrors(["Full Name is required."]);
    if (!contactForm.email.trim() || !contactForm.email.includes("@")) return setContactErrors(["Valid reply Email required."]);
    if (!contactForm.subject.trim()) return setContactErrors(["Subject line is required."]);
    if (!contactForm.message.trim()) return setContactErrors(["Message details cannot be empty."]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm)
      });
      if (res.ok) {
        setContactSuccess(true);
      } else {
        setContactErrors(["Ticket dispatch failure."]);
      }
    } catch {
      setContactErrors(["Help desk connection error."]);
    }
  };

  // Admin Login processing
  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm)
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUser(data);
        setPage("admin-dash");
      } else {
        setLoginError("Access Denied! Incorrect username or password.");
      }
    } catch {
      setLoginError("Administrative verification service failed.");
    }
  };

  // Filter Catalog Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 0 || p.category_id === categoryFilter;
    const matchesStatus = p.status === "Available";
    return matchesSearch && matchesCat && matchesStatus;
  });

  const featuredComponents = products.filter(p => p.status === "Available").slice(0, 3);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: HOME PAGE */}
        {page === "home" && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="hero rounded-2xl border border-[#212c45] bg-[#0d1222] px-6 py-14 text-center md:px-12 md:py-20">
              <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                Buy & Sell <span className="text-blue-500">Computer Components</span> with Trust
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base font-light text-slate-400 md:text-lg">
                Welcome to Thirdwave – your premier tech marketplace. Upgrade your gaming or productivity rig with verified parts, or sell your used components for immediate payouts.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setPage("products")}
                  className="btn btn-primary flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <ShoppingCart className="h-5 w-5" /> View Products
                </button>
                <button 
                  onClick={() => setPage("sell")}
                  className="btn btn-secondary flex items-center gap-2 rounded-lg border border-[#212c45] px-6 py-3 font-semibold text-white transition hover:bg-[#212c45]"
                >
                  <Sparkles className="h-5 w-5 text-blue-400" /> Sell Component
                </button>
              </div>
            </div>

            <div className="mt-16 text-center">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white md:text-3xl">
                How It Works
              </h2>
            </div>

            <div className="features-grid mt-8">
              <div className="feature-card rounded-xl border border-[#212c45] bg-[#141b2d] p-8 transition hover:-translate-y-1 hover:border-blue-500">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">Secure Buying</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Browse our catalog of thoroughly inspected GPUs, CPUs, Motherboards, RAM, and more. Backed by stock verification and instant processing.
                </p>
              </div>

              <div className="feature-card rounded-xl border border-[#212c45] bg-[#141b2d] p-8 transition hover:-translate-y-1 hover:border-blue-500">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Coins className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">Instant Appraisals</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Submit details of your used parts. Enter your expected pricing, description, and condition to get quick offers from our review team.
                </p>
              </div>

              <div className="feature-card rounded-xl border border-[#212c45] bg-[#141b2d] p-8 transition hover:-translate-y-1 hover:border-blue-500">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Headset className="h-8 w-8" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">Premium Service</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  Dedicated staff support to guide your custom PC build specs or coordinate trades and shipments. We handle the complexity for you.
                </p>
              </div>
            </div>

            {/* Featured Hardware Section */}
            <div className="mt-16 border-t border-[#212c45] pt-12">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-white">Featured Components</h2>
                <button 
                  onClick={() => setPage("products")}
                  className="flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300"
                >
                  Explore Catalog <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="products-grid">
                {featuredComponents.map(p => (
                  <div key={p.id} className="product-card flex flex-col rounded-xl border border-[#212c45] bg-[#141b2d] overflow-hidden">
                    <div className="product-image-container relative flex h-48 items-center justify-center border-b border-[#212c45] bg-[#1a2236]">
                      <span className="category-tag absolute left-3 top-3 rounded-md border border-blue-500/30 bg-slate-950/85 px-2 py-1 text-[11px] font-semibold text-blue-400">
                        {categories.find(c => c.id === p.category_id)?.name || "Component"}
                      </span>
                      <span className="stock-status absolute right-3 top-3 rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-[11px] font-semibold text-emerald-500">
                        In Stock ({p.stock_quantity})
                      </span>
                      <div className="image-fallback flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#101524] to-[#1a233b] text-xs font-semibold uppercase text-slate-400">
                        <Cpu className="mb-2 h-10 w-10 opacity-60 text-blue-500" />
                        <span>{p.name}</span>
                      </div>
                    </div>
                    <div className="product-info flex flex-1 flex-col p-5">
                      <h3 className="product-name text-base font-semibold text-white">{p.name}</h3>
                      <p className="product-desc mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">{p.description}</p>
                      <div className="product-footer mt-5 flex items-center justify-between">
                        <span className="product-price font-display text-lg font-bold text-white">${p.price.toFixed(2)}</span>
                        <button 
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setOrderForm(prev => ({ ...prev, quantity: 1 }));
                            setOrderSuccess(false);
                            setCheckoutErrors([]);
                            setPage("order");
                          }}
                          className="btn btn-primary flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" /> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: ABOUT US */}
        {page === "about" && (
          <motion.div 
            key="about"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <div className="text-center mb-12">
              <h1 className="page-title font-display text-3xl font-bold text-white md:text-4xl">About <span className="text-blue-500">Thirdwave</span></h1>
              <p className="page-subtitle mt-2 text-slate-400 font-light">Pioneering a sustainable, premium marketplace for computer enthusiasts and builders.</p>
            </div>

            <div className="about-grid grid md:grid-cols-12 gap-12 items-center">
              <div className="about-text md:col-span-7">
                <h2 className="font-display text-xl font-semibold text-white mb-4">Our Mission</h2>
                <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
                  <p>Thirdwave was founded by custom PC hobbyists who grew tired of overpriced scalpers and unsafe marketplace transactions. We built this platform to provide a direct, reliable gateway where enthusiasts can easily refresh, buy, and trade components with absolute peace of mind.</p>
                  <p>We believe in custom computing accessibility. Every single item listed in our store undergoes meticulous testing. We check core frequencies, stress test temperatures under prime loads, verify silicon health, and benchmark visual outputs so that what you buy is guaranteed to perform as intended.</p>
                </div>
                
                <h3 className="font-display text-base font-semibold text-white mt-8 mb-4">Why Trade with Thirdwave?</h3>
                <ul className="about-features space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Guaranteed Integration:</strong> All processors, boards, and modules are pre-checked.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Zero-Risk Appraisals:</strong> We buy your old gear instantly at highly competitive rates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Reliable Shipping:</strong> Fast protective packaging so you can complete your build sooner.</span>
                  </li>
                </ul>
              </div>

              <div className="about-categories-bento md:col-span-5 rounded-2xl border border-[#212c45] bg-[#141b2d] p-6">
                <h3 className="font-display text-base font-semibold text-blue-400 text-center mb-2">Component Registry</h3>
                <p className="text-center text-[11px] text-slate-400 max-w-xs mx-auto mb-6">We dynamically support, buy, swap, and list all major component classes:</p>
                
                <div className="bento-items grid grid-cols-2 gap-3">
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Cpu className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> CPUs / Processors
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Zap className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> GPUs / Graphics Cards
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Layers className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> RAM / Memory
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <HardDrive className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> SSDs / Storage
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Server className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> Motherboards
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Plug className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> Power Supplies
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Monitor className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> Quad Displays
                  </div>
                  <div className="bento-item rounded-lg border border-[#212c45] bg-slate-950/20 p-3 text-center text-xs text-white">
                    <Keyboard className="mx-auto mb-1.5 h-5 w-5 text-blue-500" /> Input Keyboards
                  </div>
                </div>
              </div>
            </div>

            <div className="call-to-action mt-16 rounded-2xl border border-[#212c45] bg-[#141b2d] p-8 md:p-12 text-center">
              <h2 className="font-display text-2xl font-semibold text-white mb-2">Ready to Level Up Your Setup?</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">Our agents are ready to buy your current components or package your upcoming rig. Explore our verified listings or submit a sell request today.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setPage("products")} className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white roundedpx px-5 py-2.5 text-sm font-semibold">Browse Catalog</button>
                <button onClick={() => setPage("contact")} className="btn btn-secondary border border-[#212c45] hover:bg-[#212c45] text-white rounded px-5 py-2.5 text-sm font-semibold">Get Support Desk assistance</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: PRODUCTS PAGE */}
        {page === "products" && (
          <motion.div 
            key="products"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="page-title font-display text-3xl font-bold text-white">Verified <span className="text-blue-500">Components Catalog</span></h1>
              <p className="page-subtitle text-slate-400 font-light text-sm mt-1">Thoroughly inspected, cleaned, benchmarked, and ready for shipment.</p>
            </div>

            {/* Controls panel */}
            <div className="shop-controls flex flex-wrap gap-4 items-center bg-[#0d1222] p-4 rounded-xl border border-[#212c45] mb-8">
              <div className="flex-1 min-w-[260px] relative">
                <span className="absolute left-3 top-3 text-slate-400"><Search className="h-4 w-4" /></span>
                <input 
                  type="text" 
                  placeholder="Search components, CPUs, RAM..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control pl-10 w-full"
                />
              </div>

              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(Number(e.target.value))}
                className="form-control min-w-[180px]"
              >
                <option value={0}>All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {(search || categoryFilter !== 0) && (
                <button 
                  onClick={() => { setSearch(""); setCategoryFilter(0); }}
                  className="btn btn-secondary text-xs px-3 py-2 border border-[#212c45] flex items-center gap-1 font-medium text-slate-400 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" /> Clear Filters
                </button>
              )}
            </div>

            {/* Catalog Grid */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(p => (
                  <div key={p.id} className="product-card flex flex-col rounded-xl border border-[#212c45] bg-[#141b2d] overflow-hidden">
                    <div className="product-image-container relative flex h-48 items-center justify-center border-b border-[#212c45] bg-[#1a2236]">
                      <span className="category-tag absolute left-3 top-3 rounded-md border border-blue-500/30 bg-slate-950/85 px-2 py-1 text-[11px] font-semibold text-blue-400">
                        {categories.find(c => c.id === p.category_id)?.name || "Component"}
                      </span>
                      <span className={`stock-status absolute right-3 top-3 rounded-md border px-2 py-1 text-[11px] font-semibold ${
                        p.stock_quantity > 0 ? "border-emerald-500/30 bg-[#10b981]/15 text-[#10b981]" : "border-red-500/30 bg-red-500/15 text-red-500"
                      }`}>
                        {p.stock_quantity > 0 ? `In Stock (${p.stock_quantity})` : "Sold Out"}
                      </span>
                      <div className="image-fallback flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#101524] to-[#1a233b] text-xs font-semibold uppercase text-slate-400">
                        <Cpu className="mb-2 h-10 w-10 opacity-60 text-blue-500" />
                        <span>{p.name}</span>
                      </div>
                    </div>
                    <div className="product-info flex flex-1 flex-col p-5">
                      <h3 className="product-name text-base font-semibold text-white">{p.name}</h3>
                      <p className="product-desc mt-2 text-xs leading-relaxed text-slate-400 line-clamp-2">{p.description}</p>
                      <div className="product-footer mt-5 flex items-center justify-between">
                        <span className="product-price font-display text-lg font-bold text-white">${p.price.toFixed(2)}</span>
                        {p.stock_quantity > 0 ? (
                          <button 
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setOrderForm(prev => ({ ...prev, quantity: 1 }));
                              setOrderSuccess(false);
                              setCheckoutErrors([]);
                              setPage("order");
                            }}
                            className="btn btn-primary flex items-center gap-1 rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> Buy Now
                          </button>
                        ) : (
                          <button 
                            disabled 
                            className="btn btn-secondary border border-[#212c45] opacity-50 px-3.5 py-1.5 text-xs text-slate-400 cursor-not-allowed rounded"
                          >
                            Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#212c45] bg-[#141b2d] p-12 text-center">
                <Search className="mx-auto h-12 w-12 text-slate-400 opacity-60 mb-4" />
                <h3 className="font-display text-lg font-semibold text-white mb-1">No matching components</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">We couldn't find any listings matching your search parameters. Please adjusting filtering keywords.</p>
                <button                  onClick={() => { setSearch(""); setCategoryFilter(0); }}
                  className="btn btn-primary px-4 py-2 text-xs bg-blue-600 text-white rounded font-semibold"
                >
                  Reset Catalog view
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 4: ORDER SHEET */}
        {page === "order" && (
          <motion.div 
            key="order"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="page-title font-display text-3xl font-bold text-white">Assemble <span className="text-blue-500">Your Order</span></h1>
              <p className="page-subtitle text-slate-400 font-light text-sm mt-1">Verify details and submit. Our logistics desk will process it immediately.</p>
            </div>

            {orderSuccess ? (
              <div className="alert alert-success bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-center rounded-xl p-8 max-w-xl mx-auto">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Order Placed Successfully!</h2>
                <p className="text-slate-400 text-sm px-4 mb-6 leading-relaxed">
                  Thank you for shopping with Thirdwave. Your transaction has been registered under invoice <strong>#TW-{orderNumber}</strong>. We will coordinate shipment details via your email address.
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setPage("products")} className="btn btn-primary bg-blue-600 px-4 py-2 text-xs rounded text-white font-semibold">Explore More Parts</button>
                  <button onClick={() => setPage("home")} className="btn btn-secondary border border-[#212c45] px-4 py-2 text-xs rounded text-white font-semibold">Go to Homepage</button>
                </div>
              </div>
            ) : selectedProduct ? (
              <div className="grid-2col grid md:grid-cols-12 gap-8">
                {/* Form column */}
                <div className="md:col-span-7 bg-[#141b2d] border border-[#212c45] rounded-xl p-6 md:p-8">
                  <h2 className="text-[17px] font-semibold text-white border-b border-[#212c45] pb-3 mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" /> Shipping Information
                  </h2>

                  {checkoutErrors.length > 0 && (
                    <div className="alert alert-danger bg-red-500/10 border border-red-500 text-red-500 text-sm rounded-lg p-4 mb-6">
                      <strong className="block mb-1">Please correct issues:</strong>
                      <ul className="list-disc list-inside">
                        {checkoutErrors.map((e, index) => <li key={index}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  <form onSubmit={handleOrderSubmit} className="space-y-5">
                    <div className="form-group">
                      <label className="form-label text-xs">Full Customer Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe" 
                        value={orderForm.customer_name}
                        onChange={(e) => setOrderForm(p => ({ ...p, customer_name: e.target.value }))}
                        className="form-control form-control-block w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label text-xs">Email address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="johndoe@example.com" 
                          value={orderForm.email}
                          onChange={(e) => setOrderForm(p => ({ ...p, email: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                      <div className="form-group">
                        <label class="form-label text-xs">Contact Phone Number</label>
                        <input 
                          type="text" 
                          required
                          placeholder="+1 (555) 0199" 
                          value={orderForm.phone}
                          onChange={(e) => setOrderForm(p => ({ ...p, phone: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Delivery Shipping Address</label>
                      <textarea 
                        required
                        placeholder="Street, Building, Apartment, ZIP Code, City, Country" 
                        value={orderForm.address}
                        onChange={(e) => setOrderForm(p => ({ ...p, address: e.target.value }))}
                        className="form-control form-control-block w-full"
                        rows={3}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Quantity (Units available: {selectedProduct.stock_quantity})</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min={1} 
                          max={selectedProduct.stock_quantity}
                          value={orderForm.quantity}
                          onChange={(e) => handleQuantityChange(Number(e.target.value))}
                          className="form-control text-center text-slate-100 font-bold"
                          style={{ width: "90px" }}
                        />
                        <span className="text-xs text-slate-400">Total volume</span>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" /> Commit Order Invoice
                    </button>
                  </form>
                </div>

                {/* Summary column */}
                <div className="md:col-span-5">
                  <div className="order-summary-card bg-[#0d1222] border border-[#212c45] rounded-xl p-6 h-fit">
                    <h2 className="text-[17px] font-semibold text-white border-b border-[#212c45] pb-3 mb-6 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-blue-500" /> Order Invoice Summary
                    </h2>

                    <div className="text-center bg-[#141b2d] border border-[#212c45] rounded-lg p-5 mb-6">
                      <Cpu className="mx-auto h-12 w-12 text-blue-500 opacity-80 mb-3" />
                      <h3 className="font-semibold text-white text-sm">{selectedProduct.name}</h3>
                      <span className="mt-2 inline-block rounded-md bg-slate-950 border border-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                        {categories.find(c => c.id === selectedProduct.category_id)?.name || "Component"}
                      </span>
                    </div>

                    <div className="space-y-4 text-sm divide-y divide-[#212c45]">
                      <div className="flex justify-between items-center py-2 pt-0">
                        <span className="text-slate-400">Component Unit Price:</span>
                        <span className="text-white font-mono">${selectedProduct.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400">Selected Quantity:</span>
                        <span className="text-white font-mono">{orderForm.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400">Taxes & Handling:</span>
                        <span className="text-emerald-500 font-semibold text-[13px]">FREE</span>
                      </div>
                      <div className="flex justify-between items-center py-4 text-base font-bold text-white border-b-0">
                        <span className="text-blue-400">Grand Total:</span>
                        <span className="text-lg font-mono">${(selectedProduct.price * orderForm.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center bg-[#141b2d] border border-[#212c45] p-12 rounded-xl">
                <AlertCircle className="mx-auto h-12 w-12 text-blue-500 opacity-60 mb-3" />
                <h3 className="font-display text-lg font-semibold text-white mb-2">No Product Selected</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">In order to place an order, you must first select a product from our catalogue.</p>
                <button onClick={() => setPage("products")} className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold px-5 py-2.5">
                  Go to Products Catalogue
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 5: SELL COMPONENT PART */}
        {page === "sell" && (
          <motion.div 
            key="sell"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8">
              <h1 className="page-title font-display text-3xl font-bold text-white">Sell <span className="text-blue-500">Your Used Components</span></h1>
              <p className="page-subtitle text-slate-400 font-light text-sm mt-1">Submit details of computer parts you wish to sell. Our appraisal desk reviews all submissions daily.</p>
            </div>

            {sellSuccess ? (
              <div className="alert alert-success bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-center rounded-xl p-8 max-w-xl mx-auto">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Sell Request Submitted!</h2>
                <p className="text-slate-400 text-sm px-4 mb-6 leading-relaxed">
                  Thank you for submitting your hardware specs. Our verification specialists will analyze your component specifics and contact you with a direct payout quote within 24 working hours.
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setPage("home")} className="btn btn-primary bg-blue-600 px-4 py-2 text-xs rounded text-white font-semibold">Return to Home</button>
                  <button onClick={() => {
                    setSellSuccess(false);
                    setSellForm({
                      seller_name: "", email: "", phone: "", component_name: "",
                      category: "", expected_price: "", component_condition: "", description: ""
                    });
                  }} className="btn btn-secondary border border-[#212c45] px-4 py-2 text-xs rounded text-white font-semibold">Submit Another Component</button>
                </div>
              </div>
            ) : (
              <div className="grid-2col grid md:grid-cols-12 gap-8">
                {/* Form column */}
                <div className="md:col-span-7 bg-[#141b2d] border border-[#212c45] rounded-xl p-6 md:p-8">
                  <h2 className="text-[17px] font-semibold text-white border-b border-[#212c45] pb-3 mb-6 flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-400" /> Hardware Specifics Form
                  </h2>

                  {sellErrors.length > 0 && (
                    <div className="alert alert-danger bg-red-500/10 border border-red-500 text-red-500 text-sm rounded-lg p-4 mb-6">
                      <strong className="block mb-1">Please correct issues:</strong>
                      <ul className="list-disc list-inside">
                        {sellErrors.map((e, index) => <li key={index}>{e}</li>)}
                      </ul>
                    </div>
                  )}

                  <form onSubmit={handleSellSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label text-xs">Seller Name</label>
                        <input 
                          type="text" required placeholder="Your Name"
                          value={sellForm.seller_name}
                          onChange={(e) => setSellForm(p => ({ ...p, seller_name: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Contact Email</label>
                        <input 
                          type="email" required placeholder="name@example.com"
                          value={sellForm.email}
                          onChange={(e) => setSellForm(p => ({ ...p, email: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Callback Phone Number</label>
                      <input 
                        type="text" required placeholder="+1 (555) 7890"
                        value={sellForm.phone}
                        onChange={(e) => setSellForm(p => ({ ...p, phone: e.target.value }))}
                        className="form-control form-control-block w-full"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Component Label & Model Name</label>
                      <input 
                        type="text" required placeholder="e.g. Gigabyte NVIDIA RTX 3070 Gaming OC 8GB"
                        value={sellForm.component_name}
                        onChange={(e) => setSellForm(p => ({ ...p, component_name: e.target.value }))}
                        className="form-control form-control-block w-full"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="form-group">
                        <label className="form-label text-xs">Core Category</label>
                        <select 
                          value={sellForm.category}
                          onChange={(e) => setSellForm(p => ({ ...p, category: e.target.value }))}
                          className="form-control form-control-block w-full text-xs"
                          required
                        >
                          <option value="">Select</option>
                          <option value="Processors">Processors</option>
                          <option value="Graphics Cards">Graphics Cards</option>
                          <option value="RAM">RAM Modules</option>
                          <option value="Storage">Storage</option>
                          <option value="Motherboards">Motherboards</option>
                          <option value="Power Supplies">Power Supplies</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label text-xs">Condition</label>
                        <select 
                          value={sellForm.component_condition}
                          onChange={(e) => setSellForm(p => ({ ...p, component_condition: e.target.value }))}
                          className="form-control form-control-block w-full text-xs"
                          required
                        >
                          <option value="">Select</option>
                          <option value="New">New (Unopened)</option>
                          <option value="Like New">Like New</option>
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair / Scratches</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label text-xs">Expected ($)</label>
                        <input 
                          type="number" required placeholder="250.00"
                          value={sellForm.expected_price}
                          onChange={(e) => setSellForm(p => ({ ...p, expected_price: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Component History / Notes</label>
                      <textarea 
                        required placeholder="Include thermal benchmarks, how long it was active, box presence, functional reviews..."
                        value={sellForm.description}
                        onChange={(e) => setSellForm(p => ({ ...p, description: e.target.value }))}
                        className="form-control form-control-block w-full"
                        rows={3}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" /> Submit Hardware Trade Request
                    </button>
                  </form>
                </div>

                {/* Right side rules column */}
                <div className="md:col-span-5 bg-[#0d1222] border border-[#212c45] rounded-xl p-6 h-fit">
                  <h2 className="text-[17px] font-semibold text-white border-b border-[#212c45] pb-3 mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" /> Appraisal Criteria
                  </h2>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">To ensure a streamlined valuation and instant payouts, please align with our appraisal criteria specs:</p>

                  <div className="space-y-4 text-xs font-light">
                    <div className="flex gap-3">
                      <span className="text-blue-400 font-mono font-bold text-sm">01.</span>
                      <div>
                        <span className="text-slate-100 font-semibold block mb-0.5">Accurate Descriptions</span>
                        <span className="text-slate-400 leading-relaxed block">Be honest about thermal performance, dusty fan spaces, or minor cosmetic scratches. Truthful listings process 5x faster.</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-400 font-mono font-bold text-sm">02.</span>
                      <div>
                        <span className="text-slate-100 font-semibold block mb-0.5">Anti-Mining Disclosure</span>
                        <span className="text-slate-400 leading-relaxed block">Graphics GPUs heavily used for cryptocurrency mining should be explicitly declared. We benchmark stability ratios carefully.</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-400 font-mono font-bold text-sm">03.</span>
                      <div>
                        <span className="text-slate-100 font-semibold block mb-0.5">ESD Protective Packaging</span>
                        <span className="text-slate-400 leading-relaxed block">When our appraised price is accepted, ship components wrapped solidly inside antistatic shielding envelopes and protective boxes.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 6: CONTACT PORTAL */}
        {page === "contact" && (
          <motion.div 
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-8 font-light">
              <h1 className="page-title font-display text-3xl font-bold text-white">Contact <span className="text-blue-500">Support Desk</span></h1>
              <p className="page-subtitle text-slate-400 text-sm mt-1">Got build compatibility questions? Looking for a specific graphics card? Send us a ticket.</p>
            </div>

            {contactSuccess ? (
              <div className="alert alert-success bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-center rounded-xl p-8 max-w-xl mx-auto">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Message Sent Successfully!</h2>
                <p className="text-slate-400 text-sm px-4 mb-6 leading-relaxed">
                  Thank you for writing to us. Your ticket has been logged and forwarded directly to our support desk. One of our PC build specialists will reach out to you within 12 working hours.
                </p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setPage("products")} className="btn btn-primary bg-blue-600 px-4 py-2 text-xs rounded text-white font-semibold">Return to Catalog</button>
                  <button onClick={() => setPage("home")} className="btn btn-secondary border border-[#212c45] px-4 py-2 text-xs rounded text-white font-semibold">Go to Home</button>
                </div>
              </div>
            ) : (
              <div className="grid-2col grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7 bg-[#141b2d] border border-[#212c45] rounded-xl p-6 md:p-8">
                  <h2 className="text-[17px] font-semibold text-white border-b border-[#212c45] pb-3 mb-6 flex items-center gap-2">
                    Send Support Bulletin
                  </h2>

                  {contactErrors.length > 0 && (
                    <div className="alert alert-danger bg-red-500/10 border border-red-500 text-red-500 text-sm rounded-lg p-4 mb-6">
                      <strong>Re-verify:</strong>
                      <ul className="list-disc list-inside mt-1">{contactErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label text-xs">Name</label>
                        <input 
                          type="text" required placeholder="John Doe"
                          value={contactForm.name}
                          onChange={(e) => setContactForm(p => ({ ...p, name: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Email</label>
                        <input 
                          type="email" required placeholder="john@example.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm(p => ({ ...p, email: e.target.value }))}
                          className="form-control form-control-block w-full"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Subject</label>
                      <input 
                        type="text" required placeholder="e.g. Compatibility specs check or trade payouts"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm(p => ({ ...p, subject: e.target.value }))}
                        className="form-control form-control-block w-full"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Detailed Message</label>
                      <textarea 
                        required placeholder="Describe your question or parts inquiry meticulously..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm(p => ({ ...p, message: e.target.value }))}
                        className="form-control form-control-block w-full"
                        rows={4}
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" /> Dispatch Message
                    </button>
                  </form>
                </div>

                {/* Right side details columns */}
                <div className="md:col-span-5 space-y-4">
                  <div className="border border-[#212c45] bg-[#0d1222] rounded-xl p-5">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-2">Office Coordinates</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      <strong>Thirdwave Tech Center</strong><br />
                      882 Silicon Strip, Suite 400<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                  <div className="border border-[#212c45] bg-[#0d1222] rounded-xl p-5">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-2">Working Hours</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Monday – Friday: 9:00 AM – 6:00 PM EST<br />
                      Saturday: 10:00 AM – 4:00 PM EST<br />
                      Sunday: Closed (Logistics dispatch only)
                    </p>
                  </div>
                  <div className="border border-[#212c45] bg-[#0d1222] rounded-xl p-5">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-2">Support Coordinates</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Phone: +1 (212) 555-SPEC<br />
                      Email: support@thirdwavecomponents.com<br />
                      Trade appraisals: appraisals@thirdwavecomponents.com
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 7: LOGIN PANEL */}
        {page === "login" && (
          <motion.div 
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full flex items-center justify-center py-6"
          >
            <div className="bg-[#141b2d] border border-[#212c45] rounded-xl p-8 max-w-sm w-full shadow-lg">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 inline-flex items-center justify-center rounded-full mb-3">
                  <Lock className="h-6 w-6" />
                </div>
                <h1 className="font-display text-xl font-bold text-white">Admin Gateway</h1>
                <p className="text-xs text-slate-400 mt-1">Manage orders, catalog, messages, & trade requests.</p>
              </div>

              {loginError && (
                <div className="alert alert-danger bg-red-500/10 border border-red-500 text-red-500 text-xs rounded-lg p-3 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminVerify} className="space-y-4">
                <div className="form-group">
                  <label className="form-label text-xs">Username</label>
                  <input 
                    type="text" required placeholder="admin"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(p => ({ ...p, username: e.target.value }))}
                    className="form-control form-control-block w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Password</label>
                  <input 
                    type="password" required placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                    className="form-control form-control-block w-full"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold py-2.5 flex items-center justify-center gap-1.5 text-sm"
                >
                  <LogIn className="h-4 w-4" /> Authenticate Admin
                </button>
              </form>

              <div className="mt-8 pt-5 border-t border-[#212c45] text-center text-[10px] text-slate-400">
                <p>Default credentials (academic):<br />Username: <code className="text-slate-100 font-bold bg-slate-900 border border-[#212c45] px-1 py-0.5 rounded">admin</code> | Password: <code className="text-slate-100 font-bold bg-slate-900 border border-[#212c45] px-1 py-0.5 rounded">admin123</code></p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
