import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Package, ShoppingCart, Coins, MessagesSquare, Box, 
  Receipt, Handshake, Mail, PlusCircle, Trash2, Edit3, 
  ChevronRight, Save, Image as ImageIcon, Inbox, Archive, Award, FolderOpen, AlertCircle
} from "lucide-react";
import { Product, Order, SellRequest, ContactMessage, OverviewStats, Category } from "../types";

interface AdminPanelProps {
  adminTab: string;
  setAdminTab: (tab: string) => void;
  products: Product[];
  setProducts: (prods: Product[]) => void;
  categories: Category[];
}

export default function AdminPanel({
  adminTab,
  setAdminTab,
  products,
  setProducts,
  categories
}: AdminPanelProps) {
  // Stats
  const [stats, setStats] = useState<OverviewStats>({
    total_products: 0,
    total_orders: 0,
    total_sell_requests: 0,
    total_messages: 0
  });

  // DB listing arrays
  const [orders, setOrders] = useState<Order[]>([]);
  const [tradingRequests, setTradingRequests] = useState<SellRequest[]>([]);
  const [tickets, setTickets] = useState<ContactMessage[]>([]);

  // Alerts
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Product adding / editing states
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category_id: 1,
    price: "",
    stock_quantity: "",
    description: "",
    status: "Available"
  });

  // Fetch telemetry overview counts
  const fetchTelemetryOverview = async () => {
    try {
      const res = await fetch("/api/overview");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Telemetry query failed:", e);
    }
  };

  // Fetch orders, tickets, sell requests
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {}
  };

  const fetchTradingRequests = async () => {
    try {
      const res = await fetch("/api/sell-requests");
      if (res.ok) {
        const data = await res.json();
        setTradingRequests(data);
      }
    } catch {}
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch {}
  };

  const loadAllAdminData = () => {
    fetchTelemetryOverview();
    fetchOrders();
    fetchTradingRequests();
    fetchTickets();
  };

  useEffect(() => {
    loadAllAdminData();
  }, [adminTab]);

  // Product CRUD Handlers
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!productForm.name.trim()) return setErrorMsg("Product name required.");
    if (Number(productForm.price) <= 0) return setErrorMsg("Price must be a valid positive rate.");
    if (Number(productForm.stock_quantity) < 0) return setErrorMsg("Stock levels cannot be negative.");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          stock_quantity: Number(productForm.stock_quantity)
        })
      });

      if (res.ok) {
        setProductForm({ name: "", category_id: 1, price: "", stock_quantity: "", description: "", status: "Available" });
        setSuccessMsg("Product added successfully to catalog!");
        setAdminTab("manage-products");
      } else {
        setErrorMsg("Failed to add component.");
      }
    } catch {
      setErrorMsg("Connection failure writing component.");
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (editingProductId === null) return;
    if (!productForm.name.trim()) return setErrorMsg("Name is required.");
    if (Number(productForm.price) <= 0) return setErrorMsg("Price must be positive.");

    try {
      const res = await fetch(`/api/products/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          stock_quantity: Number(productForm.stock_quantity)
        })
      });

      if (res.ok) {
        setEditingProductId(null);
        setSuccessMsg("Product updated successfully!");
        setAdminTab("manage-products");
      } else {
        setErrorMsg("Failed to edit component details.");
      }
    } catch {
      setErrorMsg("Network failure modifying details.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? It will void any matching active customer order logs!")) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Component listing completely deleted.");
        // Refresh master catalog list
        const resList = await fetch("/api/products");
        if (resList.ok) {
          const list = await resList.json();
          setProducts(list);
        }
        loadAllAdminData();
      } else {
        setErrorMsg("Server error deleting component.");
      }
    } catch {
      setErrorMsg("Connection error deleting item.");
    }
  };

  // Orders status changer
  const handleUpdateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuccessMsg(`InvoiceTW-${id} status adjusted to ${status}.`);
        fetchOrders();
      } else {
        setErrorMsg("Failed to adjust order status.");
      }
    } catch {
      setErrorMsg("Network error saving order status.");
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm("Remove order invoice TW-" + id + " permanently from system logs?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Customer invoice record deleted.");
        fetchOrders();
      }
    } catch {}
  };

  // Sell Requests appraisals states
  const handleUpdateTradingRequestStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/sell-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSuccessMsg(`Trade TW-TR${id} appraisal tagged as ${status}.`);
        fetchTradingRequests();
      }
    } catch {}
  };

  const handleDeleteTradingRequest = async (id: number) => {
    if (!confirm("Delete used components offer TW-TR" + id + " from logboard?")) return;
    try {
      const res = await fetch(`/api/sell-requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Appraisal proposal cleared.");
        fetchTradingRequests();
      }
    } catch {}
  };

  // Help Desk Tickets archiver
  const handleDeleteTicket = async (id: number) => {
    if (!confirm("Archive and delete support ticket TW-MSG" + id + " ?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccessMsg("Support ticket archived and log purged.");
        fetchTickets();
      }
    } catch {}
  };

  return (
    <div className="w-full">
      {/* Messages banner */}
      {successMsg && (
        <div className="alert alert-success bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-xs rounded-lg p-3 mb-6">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger bg-red-500/10 border border-red-500 text-red-500 text-xs rounded-lg p-3 mb-6">
          {errorMsg}
        </div>
      )}

      {/* ADMIN LEVEL TAB CONTENT SPLITTING */}
      
      {/* 1. MAIN ADMINISTRATION OVERVIEW */}
      {adminTab === "admin-dash" && (
        <div className="w-full">
          <div className="mb-8">
            <span className="admin-badge">Superuser Terminal</span>
            <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Superuser Dashboard</h1>
            <p className="page-subtitle text-slate-400 text-xs mt-1">Manage database catalogs, checkout invoices, appraise used hardware trades, and satisfy ticketing logs.</p>
          </div>

          <div className="dashboard-grid grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="dashboard-stat-card rounded-xl border border-[#212c45] bg-[#141b2d] p-5 flex items-center gap-4">
              <div className="stat-icon p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                <Box className="h-6 w-6" />
              </div>
              <div className="stat-info">
                <span className="stat-val font-display text-2xl font-bold text-white block">{stats.total_products}</span>
                <span className="stat-lbl text-[11px] text-slate-400 block uppercase">Active Products</span>
              </div>
            </div>

            <div className="dashboard-stat-card rounded-xl border border-[#212c45] bg-[#141b2d] p-5 flex items-center gap-4">
              <div className="stat-icon p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div className="stat-info">
                <span className="stat-val font-display text-2xl font-bold text-white block">{stats.total_orders}</span>
                <span className="stat-lbl text-[11px] text-slate-400 block uppercase">Total Orders</span>
              </div>
            </div>

            <div className="dashboard-stat-card rounded-xl border border-[#212c45] bg-[#141b2d] p-5 flex items-center gap-4">
              <div className="stat-icon p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <Coins className="h-6 w-6" />
              </div>
              <div className="stat-info">
                <span className="stat-val font-display text-2xl font-bold text-white block">{stats.total_sell_requests}</span>
                <span className="stat-lbl text-[11px] text-slate-400 block uppercase">Sell Requests</span>
              </div>
            </div>

            <div className="dashboard-stat-card rounded-xl border border-[#212c45] bg-[#141b2d] p-5 flex items-center gap-4">
              <div className="stat-icon p-3 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                <MessagesSquare className="h-6 w-6" />
              </div>
              <div className="stat-info">
                <span className="stat-val font-display text-2xl font-bold text-white block">{stats.total_messages}</span>
                <span className="stat-lbl text-[11px] text-slate-400 block uppercase">Inquiries</span>
              </div>
            </div>
          </div>

          <h2 className="text-[17px] font-semibold text-white border-b border-[#212c45] pb-2 mb-6 flex items-center gap-2">
            Management Services
          </h2>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="feature-card border border-[#212c45] bg-[#141b2d] rounded-xl p-5 shrink-0">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 w-fit mb-4">
                <Box className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Catalog Manager</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Add hardware components, adjust prices, edit models, and control listing parameters.</p>
              <button onClick={() => setAdminTab("manage-products")} className="btn btn-primary w-full text-xs font-semibold py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
                Open Catalog Portal
              </button>
            </div>

            <div className="feature-card border border-[#212c45] bg-[#141b2d] rounded-xl p-5 shrink-0">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 w-fit mb-4">
                <Receipt className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Customer Orders</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Track orders, alter delivery progress statuses, and review shipping location logs.</p>
              <button onClick={() => setAdminTab("manage-orders")} className="btn btn-primary w-full text-xs font-semibold py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded">
                View Customer Invoices
              </button>
            </div>

            <div className="feature-card border border-[#212c45] bg-[#141b2d] rounded-xl p-5 shrink-0">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 w-fit mb-4">
                <Handshake className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Trade Appraisals</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Appraise hardware uploads submitted by traders, tag states, and email quotes.</p>
              <button onClick={() => setAdminTab("sell-requests")} className="btn btn-primary w-full text-xs font-semibold py-2 bg-amber-500 hover:bg-amber-600 text-white rounded">
                Manage Trade Requests
              </button>
            </div>

            <div className="feature-card border border-[#212c45] bg-[#141b2d] rounded-xl p-5 shrink-0">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 w-fit mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white text-base mb-1">Tickets Inbox</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">Read custom suggestions, system help ticketing logs, configuration queries, & reviews.</p>
              <button onClick={() => setAdminTab("messages")} className="btn btn-primary w-full text-xs font-semibold py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
                Read Ticket Inbox
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANAGE HARDWARE INVENTORY */}
      {adminTab === "manage-products" && (
        <div className="w-full">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <span className="admin-badge">Inventory Engine</span>
              <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Manage Products</h1>
              <p className="page-subtitle text-slate-400 text-xs mt-1">Inject components, edit listings, adjust stock levels, & manage active statuses.</p>
            </div>
            <button 
              onClick={() => {
                setProductForm({ name: "", category_id: 1, price: "", stock_quantity: "", description: "", status: "Available" });
                setEditingProductId(null);
                setAdminTab("add-product");
              }}
              className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5"
            >
              <PlusCircle className="h-4.5 w-4.5" /> Add Component
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[80px]">ID</th>
                  <th className="w-[100px]">Visual</th>
                  <th>Component Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th className="text-center w-[90px]">Stock</th>
                  <th>Status</th>
                  <th className="text-center w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map(p => (
                    <tr key={p.id}>
                      <td className="font-mono text-slate-500 text-xs">#TW-P{p.id}</td>
                      <td>
                        <div className="w-12 h-12 rounded border border-[#212c45] bg-[#1a2236] flex items-center justify-center overflow-hidden shrink-0">
                          <ImageIcon className="h-5 w-5 text-slate-500" />
                        </div>
                      </td>
                      <td>
                        <strong className="text-slate-100 text-[13px] block">{p.name}</strong>
                        <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5" title={p.description}>{p.description}</span>
                      </td>
                      <td>
                        <span className="category-tag text-[10px] px-1.5 py-0.5 text-blue-400 border border-blue-500/20 bg-blue-500/5 rounded">
                          {categories.find(c => c.id === p.category_id)?.name || "Accessories"}
                        </span>
                      </td>
                      <td className="font-mono text-[13px] font-semibold text-blue-400">${p.price.toFixed(2)}</td>
                      <td className="font-mono text-center text-xs text-slate-200">{p.stock_quantity}</td>
                      <td>
                        <span className={`badge text-[10px] items-center rounded px-2 py-0.5 font-bold ${
                          p.stock_quantity > 0 ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border border-red-500/20 text-red-500"
                        }`}>
                          {p.stock_quantity > 0 ? "Available" : "Sold Out"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1.5 justify-center">
                          <button 
                            onClick={() => {
                              setEditingProductId(p.id);
                              setProductForm({
                                name: p.name,
                                category_id: p.category_id,
                                price: String(p.price),
                                stock_quantity: String(p.stock_quantity),
                                description: p.description,
                                status: p.status
                              });
                              setAdminTab("edit-product");
                            }}
                            className="btn btn-secondary border border-[#212c45] text-slate-300 hover:text-white px-2.5 py-1 text-xs font-semibold flex items-center gap-1 shrink-0 rounded"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="btn btn-danger bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white px-2.5 py-1 text-xs font-semibold flex items-center gap-1 shrink-0 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm font-light">
                      <FolderOpen className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                      No components found in active catalog. Press <strong>Add Component</strong> above to seed listings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ADD PRODUCT VIEW */}
      {adminTab === "add-product" && (
        <div className="w-full">
          <div className="mb-6">
            <span className="admin-badge">Admin Console</span>
            <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Add New Component</h1>
            <p className="page-subtitle text-slate-400 text-xs mt-1">Register new computer parts, processors, boards, controllers inside storefront catalogue.</p>
          </div>

          <div className="bg-[#141b2d] border border-[#212c45] rounded-xl p-6 max-w-2xl mx-auto">
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label text-xs">Component Label Name</label>
                <input 
                  type="text" required placeholder="e.g. Intel Core i7-13700K Desktop Processor"
                  value={productForm.name}
                  onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                  className="form-control w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Core Category</label>
                  <select 
                    value={productForm.category_id}
                    onChange={(e) => setProductForm(p => ({ ...p, category_id: Number(e.target.value) }))}
                    className="form-control w-full text-xs"
                    required
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Listing Status</label>
                  <select 
                    value={productForm.status}
                    onChange={(e) => setProductForm(p => ({ ...p, status: e.target.value }))}
                    className="form-control w-full text-xs"
                    required
                  >
                    <option value="Available">Available (Listed online)</option>
                    <option value="Unavailable">Unavailable (Hide list)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Unit Selling Price ($)</label>
                  <input 
                    type="number" step="0.01" required min="0.01" placeholder="199.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                    className="form-control w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Initial Stock Quota</label>
                  <input 
                    type="number" required min="0" placeholder="10"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm(p => ({ ...p, stock_quantity: e.target.value }))}
                    className="form-control w-full"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Technical Details & Specifications</label>
                <textarea 
                  required placeholder="Describe microarchitecture, core clocks, benchmark levels, compatibility scopes, power ratios..."
                  value={productForm.description}
                  onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                  className="form-control w-full"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#212c45]">
                <button 
                  type="button" onClick={() => setAdminTab("manage-products")}
                  className="btn btn-secondary border border-[#212c45] px-4 py-2 text-xs font-semibold text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. EDIT PRODUCT VIEW */}
      {adminTab === "edit-product" && (
        <div className="w-full">
          <div className="mb-6">
            <span className="admin-badge">Admin Console</span>
            <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Edit Component Details</h1>
            <p className="page-subtitle text-slate-400 text-xs mt-1">Adjust metadata specifications, prices, availability levels, and stockpiles.</p>
          </div>

          <div className="bg-[#141b2d] border border-[#212c45] rounded-xl p-6 max-w-2xl mx-auto">
            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label text-xs">Component Label Name</label>
                <input 
                  type="text" required
                  value={productForm.name}
                  onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                  className="form-control w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Category</label>
                  <select 
                    value={productForm.category_id}
                    onChange={(e) => setProductForm(p => ({ ...p, category_id: Number(e.target.value) }))}
                    className="form-control w-full text-xs"
                    required
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Availability Listing Status</label>
                  <select 
                    value={productForm.status}
                    onChange={(e) => setProductForm(p => ({ ...p, status: e.target.value }))}
                    className="form-control w-full text-xs"
                    required
                  >
                    <option value="Available">Available (Listed online)</option>
                    <option value="Unavailable">Unavailable (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Unit Price ($)</label>
                  <input 
                    type="number" step="0.01" required min="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                    className="form-control w-full"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label text-xs">Stock Quota</label>
                  <input 
                    type="number" required min="0"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm(p => ({ ...p, stock_quantity: e.target.value }))}
                    className="form-control w-full"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Technical Details & Specifications</label>
                <textarea 
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                  className="form-control w-full"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#212c45]">
                <button 
                  type="button" onClick={() => setAdminTab("manage-products")}
                  className="btn btn-secondary border border-[#212c45] px-4 py-2 text-xs font-semibold text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-semibold rounded flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" /> Save Component Adjustments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CUSTOMER BILLINGS / ORDERS */}
      {adminTab === "manage-orders" && (
        <div className="w-full">
          <div className="mb-6">
            <span className="admin-badge">Logistics Desk</span>
            <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Customer Orders</h1>
            <p className="page-subtitle text-slate-400 text-xs mt-1">Interact with customer transactions invoice sheets, coordinate shipments, & alter progress states.</p>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[80px]">Inv ID</th>
                  <th>Buyer Details</th>
                  <th>Component Selected</th>
                  <th className="text-center w-[60px]">Qty</th>
                  <th>Invoice Total</th>
                  <th>Current Status</th>
                  <th className="w-[160px]">Alter Status</th>
                  <th className="text-center w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono text-slate-500 text-xs">#TW-{o.id}</td>
                      <td>
                        <strong className="text-slate-100 text-[13px] block">{o.customer_name}</strong>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Email: {o.email}</span>
                        <span className="text-[11px] text-slate-400 block">Phone: {o.phone}</span>
                        <span className="text-[10px] text-slate-400 font-light block italic mt-1 bg-slate-900/10 border-l-2 border-blue-500/40 pl-1.5 max-w-xs">{o.address}</span>
                      </td>
                      <td>
                        <span className="text-slate-100 text-[13px] font-semibold block">{o.product_name}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">Unit value: ${o.unit_price?.toFixed(2)}</span>
                      </td>
                      <td className="text-center font-mono font-bold text-sm text-slate-200">{o.quantity}</td>
                      <td className="font-mono text-[13px] font-bold text-blue-400">${o.total_price.toFixed(2)}</td>
                      <td>
                        <span className={`badge text-[10px] items-center rounded px-2.5 py-0.5 font-bold border ${
                          o.status === "Pending" ? "bg-amber-500/10 border-amber-500/25 text-amber-500" :
                          o.status === "Confirmed" ? "bg-blue-500/10 border-blue-500/25 text-blue-500" :
                          o.status === "Processing" ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400" :
                          o.status === "Delivered" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500" :
                          "bg-red-500/10 border-red-500/25 text-red-500"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                          className="form-control text-xs py-1 px-2.5 bg-slate-950/40 border border-[#212c45] rounded"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleDeleteOrder(o.id)}
                          className="btn btn-danger bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white p-1.5 shrink-0 rounded"
                          title="Purge Invoice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm font-light">
                      <Inbox className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                      No client checkout invoices recorded. Orders will appear here as users check out.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. USED HARDWARE TRADE APPRAISALS */}
      {adminTab === "sell-requests" && (
        <div className="w-full">
          <div className="mb-6">
            <span className="admin-badge">Appraisals Center</span>
            <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Component Trade Offers</h1>
            <p className="page-subtitle text-slate-400 text-xs mt-1">Appraise hardware submissions listed for liquidation, tag statuses, and coordinate trade payouts.</p>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[80px]">ID</th>
                  <th>Submitter Details</th>
                  <th>Hardware Component Spec</th>
                  <th>Expected & Condition</th>
                  <th>Trade Status</th>
                  <th className="w-[160px]">Update</th>
                  <th className="text-center w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {tradingRequests.length > 0 ? (
                  tradingRequests.map(r => (
                    <tr key={r.id}>
                      <td className="font-mono text-slate-500 text-xs text-center">#TW-TR{r.id}</td>
                      <td>
                        <strong className="text-slate-100 text-[13px] block">{r.seller_name}</strong>
                        <span className="text-[11px] text-slate-400 block mt-0.5">Email: {r.email}</span>
                        <span className="text-[11px] text-slate-400 block">Phone: {r.phone}</span>
                      </td>
                      <td>
                        <strong className="text-slate-100 text-[13px] block">{r.component_name}</strong>
                        <span className="category-tag text-[9px] px-1.5 py-0.5 border border-blue-500/20 bg-blue-500/10 rounded inline-block mt-1 font-semibold text-blue-400">{r.category}</span>
                        <div className="bg-slate-900/15 border border-[#212c45] text-slate-400 text-[11px] p-2.5 rounded mt-2 leading-relaxed max-w-sm font-light">
                          <strong>Seller History:</strong> {r.description}
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-blue-400 font-bold text-base">${r.expected_price.toFixed(2)}</span>
                        <span className="text-[11px] text-slate-400 block mt-1.5 leading-none">Declared:<br /><strong className="text-white text-xs block mt-1">{r.component_condition}</strong></span>
                      </td>
                      <td>
                        <span className={`badge text-[10px] items-center rounded px-2 py-0.5 border font-semibold ${
                          r.status === "Pending" ? "bg-amber-500/10 border-amber-500/25 text-amber-500" :
                          r.status === "Reviewed" ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400" :
                          r.status === "Accepted" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500" :
                          "bg-red-500/10 border-red-500/25 text-red-500"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          value={r.status}
                          onChange={(e) => handleUpdateTradingRequestStatus(r.id, e.target.value)}
                          className="form-control text-xs py-1 px-2.5 bg-slate-950/40 border border-[#212c45] rounded"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Reviewed">Reviewed</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleDeleteTradingRequest(r.id)}
                          className="btn btn-danger bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white p-1.5 shrink-0 rounded"
                          title="Purge Offer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 text-sm font-light">
                      <Award className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                      No client trading proposals submitted yet. Used components offers will list here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. SUPPORT LOGS INBOX */}
      {adminTab === "messages" && (
        <div className="w-full">
          <div className="mb-6">
            <span className="admin-badge">Inbox Center</span>
            <h1 className="page-title font-display text-2xl font-bold text-white mt-1">Help Desk Tickets</h1>
            <p className="page-subtitle text-slate-400 text-xs mt-1">Read incoming suggestions, specification requests, help tickets, & general submissions.</p>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-[80px]">ID</th>
                  <th className="w-[200px]">Sender Details</th>
                  <th>Ticket Content</th>
                  <th className="w-[150px]">Received</th>
                  <th className="text-center w-[80px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length > 0 ? (
                  tickets.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-slate-500 text-xs">#TW-MSG{t.id}</td>
                      <td>
                        <strong className="text-slate-100 text-[13px] block">{t.name}</strong>
                        <a href={"mailto:" + t.email} className="text-blue-400 hover:underline text-xs block mt-1 font-light break-all">{t.email}</a>
                      </td>
                      <td>
                        <strong className="text-slate-100 text-[13px] block mb-2">Subject: {t.subject}</strong>
                        <div className="bg-slate-900/20 border border-[#212c45] p-3 rounded font-light text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                          {t.message}
                        </div>
                      </td>
                      <td className="text-xs text-slate-400 font-light">
                        {new Date(t.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleDeleteTicket(t.id)}
                          className="btn btn-danger bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-amber-600 hover:text-white p-1.5 shrink-0 rounded"
                          title="Archive Ticket"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-sm font-light">
                      <Mail className="mx-auto h-10 w-10 text-slate-500 mb-2" />
                      Your help desk inbox is clean. No active ticketing requests logged!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
