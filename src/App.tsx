import { useState, useEffect } from "react";
import { 
  Cpu, LayoutDashboard, Database, Receipt, 
  Handshake, Mail, LogOut, User, Menu, X, ShieldAlert 
} from "lucide-react";
import FrontStore from "./components/FrontStore";
import AdminPanel from "./components/AdminPanel";
import { Product, Category } from "./types";

export default function App() {
  const [page, setPage] = useState<string>("home");
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [adminUser, setAdminUser] = useState<any>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize catalogs
  const loadInitialData = async () => {
    try {
      const resProds = await fetch("/api/products");
      if (resProds.ok) {
        setProducts(await resProds.json());
      }
      
      const resCats = await fetch("/api/categories");
      if (resCats.ok) {
        setCategories(await resCats.json());
      }
    } catch (e) {
      console.error("Initial catalog fetching error:", e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSignOut = () => {
    setAdminUser(null);
    setPage("home");
  };

  const isAdminTab = [
    "admin-dash", "manage-products", "add-product", 
    "edit-product", "manage-orders", "sell-requests", "messages"
  ].includes(page);

  return (
    <div className="min-h-screen bg-[#070a13] text-[#f8fafc] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* HEADER BANNER */}
      <header className="sticky top-0 z-40 bg-[#090d19]/90 backdrop-blur-md border-b border-[#212c45]/50 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => { setPage("home"); isAdminTab && handleSignOut(); }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-2 bg-blue-600 rounded-lg text-white group-hover:bg-blue-700 transition duration-150">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white block">
                THIRDWAVE
              </span>
              <span className="text-[9px] text-[#38bdf8] tracking-widest block uppercase font-bold -mt-0.5">
                Pc Marketplace
              </span>
            </div>
          </div>

          {/* DESKTOP WINDOW MENU NAVIGATION */}
          {!adminUser ? (
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
              <button 
                onClick={() => setPage("home")}
                className={`transition hover:text-white ${page === "home" ? "text-blue-500 font-bold" : ""}`}
              >
                Home
              </button>
              <button 
                onClick={() => setPage("about")}
                className={`transition hover:text-white ${page === "about" ? "text-blue-500 font-bold" : ""}`}
              >
                About Us
              </button>
              <button 
                onClick={() => setPage("products")}
                className={`transition hover:text-white ${page === "products" ? "text-blue-500 font-bold" : ""}`}
              >
                Products
              </button>
              <button 
                onClick={() => setPage("sell")}
                className={`transition hover:text-white ${page === "sell" ? "text-blue-500 font-bold" : ""}`}
              >
                Sell Parts
              </button>
              <button 
                onClick={() => setPage("contact")}
                className={`transition hover:text-white ${page === "contact" ? "text-blue-500 font-bold" : ""}`}
              >
                Help Desk
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-5 text-xs font-bold text-slate-300">
              <button 
                onClick={() => setPage("admin-dash")}
                className={`flex items-center gap-1.5 transition hover:text-white uppercase ${page === "admin-dash" ? "text-blue-500" : ""}`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
              </button>
              <button 
                onClick={() => setPage("manage-products")}
                className={`flex items-center gap-1.5 transition hover:text-white uppercase ${["manage-products", "add-product", "edit-product"].includes(page) ? "text-blue-500" : ""}`}
              >
                <Database className="h-3.5 w-3.5" /> Inventory
              </button>
              <button 
                onClick={() => setPage("manage-orders")}
                className={`flex items-center gap-1.5 transition hover:text-white uppercase ${page === "manage-orders" ? "text-[#10b981]" : ""}`}
              >
                <Receipt className="h-3.5 w-3.5" /> Orders
              </button>
              <button 
                onClick={() => setPage("sell-requests")}
                className={`flex items-center gap-1.5 transition hover:text-white uppercase ${page === "sell-requests" ? "text-[#f59e0b]" : ""}`}
              >
                <Handshake className="h-3.5 w-3.5" /> Appraisals
              </button>
              <button 
                onClick={() => setPage("messages")}
                className={`flex items-center gap-1.5 transition hover:text-white uppercase ${page === "messages" ? "text-[#8b5cf6]" : ""}`}
              >
                <Mail className="h-3.5 w-3.5" /> Inbox
              </button>
            </nav>
          )}

          {/* ACTION ACCOUNT BUTTONS */}
          <div className="hidden md:flex items-center gap-3">
            {!adminUser ? (
              <button 
                onClick={() => setPage("login")}
                className="btn btn-secondary border border-[#212c45] text-xs font-bold text-slate-300 hover:text-white px-4 py-2 hover:bg-[#141b2d] rounded-lg transition flex items-center gap-1"
              >
                <User className="h-3.5 w-3.5" /> Admin Panel
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-[#212c45] px-2.5 py-1 rounded">
                  {adminUser.fullname}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="btn btn-danger bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLER */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center text-slate-300 hover:text-white focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER SCREEN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-[#212c45] px-6 py-5 space-y-4">
          {!adminUser ? (
            <div className="flex flex-col gap-3 font-semibold text-slate-300">
              <button onClick={() => { setPage("home"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Home</button>
              <button onClick={() => { setPage("about"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">About Us</button>
              <button onClick={() => { setPage("products"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Products Catalog</button>
              <button onClick={() => { setPage("sell"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Sell Parts</button>
              <button onClick={() => { setPage("contact"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Help Desk</button>
              <button 
                onClick={() => { setPage("login"); setMobileMenuOpen(false); }} 
                className="mt-2 text-center text-xs font-semibold py-2.5 bg-blue-600 text-white rounded flex items-center justify-center gap-1.5"
              >
                <User className="h-4 w-4" /> Admin Terminal
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 font-semibold text-slate-400">
              <span className="text-[10px] text-center font-bold text-emerald-400 block pb-1 border-b border-[#212c45]/50">ADMIN CONTROLS PORTAL</span>
              <button onClick={() => { setPage("admin-dash"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Dashboard</button>
              <button onClick={() => { setPage("manage-products"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Inventory</button>
              <button onClick={() => { setPage("manage-orders"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Orders</button>
              <button onClick={() => { setPage("sell-requests"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Appraisals</button>
              <button onClick={() => { setPage("messages"); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-white border-b border-[#212c45]/20">Inbox Messages</button>
              <button 
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} 
                className="mt-2 text-center text-xs font-semibold py-2.5 bg-red-600 text-white rounded flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}

      {/* CORE FRAME CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:px-8">
        
        {/* WARNING BAR IN IFRAME IF LOGGED IN ADRESSED TO ADMIN */}
        {adminUser && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500 text-blue-400 text-xs rounded-lg p-3.5 flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-blue-400 shrink-0" />
            <span>
              <strong>Administrative Mode:</strong> You are logged into the preview telemetry engine. Edits are processed and saved in local Express state dynamically! Go upstream to the PHP folder structure to view template script blocks.
            </span>
          </div>
        )}

        {/* Dynamic component routing based on state splits */}
        {isAdminTab ? (
          <AdminPanel 
            adminTab={page}
            setAdminTab={setPage}
            products={products}
            setProducts={setProducts}
            categories={categories}
          />
        ) : (
          <FrontStore 
            page={page}
            setPage={setPage}
            selectedProductId={selectedProductId}
            setSelectedProductId={setSelectedProductId}
            adminUser={adminUser}
            setAdminUser={setAdminUser}
            products={products}
            setProducts={setProducts}
            categories={categories}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#04060c] border-t border-[#212c45]/30 py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-500" />
            <span>&copy; {new Date().getFullYear()} <strong>Thirdwave Pc Marketplace</strong>. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setPage("home")} className="hover:text-slate-300">Home</button>
            <span>&bull;</span>
            <button onClick={() => setPage("about")} className="hover:text-slate-300">About US</button>
            <span>&bull;</span>
            <button onClick={() => setPage("products")} className="hover:text-slate-300">Products Catalogue</button>
            <span>&bull;</span>
            <button onClick={() => setPage("contact")} className="hover:text-slate-300">Help Desk</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
