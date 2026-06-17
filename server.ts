import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Mock Database State representing thirdwave_db mysql tables
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image: string;
  status: string;
}

interface Order {
  id: number;
  product_id: number;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

interface SellRequest {
  id: number;
  seller_name: string;
  email: string;
  phone: string;
  component_name: string;
  category: string;
  expected_price: number;
  component_condition: string;
  description: string;
  status: string;
  created_at: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

// Global In-Memory Database Seeded State
let categories: Category[] = [
  { id: 1, name: "Processors" },
  { id: 2, name: "Graphics Cards" },
  { id: 3, name: "RAM" },
  { id: 4, name: "Storage" },
  { id: 5, name: "Motherboards" },
  { id: 6, name: "Power Supplies" },
  { id: 7, name: "Accessories" }
];

let products: Product[] = [
  {
    id: 1,
    category_id: 1,
    name: "Intel Core i5 Processor",
    description: "Intel Core i5-12400F 6-Core processor, up to 4.4 GHz, LGA1700 socket.",
    price: 149.99,
    stock_quantity: 10,
    image: "cpu.jpg",
    status: "Available"
  },
  {
    id: 2,
    category_id: 1,
    name: "AMD Ryzen 5 Processor",
    description: "AMD Ryzen 5 5600X 6-Core, 12-Thread unlocked desktop processor.",
    price: 159.00,
    stock_quantity: 15,
    image: "cpu.jpg",
    status: "Available"
  },
  {
    id: 3,
    category_id: 2,
    name: "NVIDIA GTX 1660 Graphics Card",
    description: "GeForce GTX 1660 Super Overclocked 6GB Dual-Fan edition. Great for 1080p gaming.",
    price: 219.99,
    stock_quantity: 5,
    image: "gpu.jpg",
    status: "Available"
  },
  {
    id: 4,
    category_id: 3,
    name: "Kingston 16GB DDR4 RAM",
    description: "Kingston FURY Beast 16GB (2x8GB) 3200MHz DDR4 CL16 Desktop Memory Kit.",
    price: 45.50,
    stock_quantity: 25,
    image: "ram.jpg",
    status: "Available"
  },
  {
    id: 5,
    category_id: 4,
    name: "Samsung 1TB SSD",
    description: "Samsung 980 Pro NVMe M.2 SSD, PCIe Gen 4 x4, speeds up to 7000 MB/s.",
    price: 89.99,
    stock_quantity: 20,
    image: "ssd.jpg",
    status: "Available"
  },
  {
    id: 6,
    category_id: 5,
    name: "ASUS B450 Motherboard",
    description: "ASUS Prime B450M-A II Micro ATX motherboard with M.2 support, HDMI/DVI/D-Sub, USB 3.2 Gen 2.",
    price: 79.99,
    stock_quantity: 8,
    image: "motherboard.jpg",
    status: "Available"
  },
  {
    id: 7,
    category_id: 6,
    name: "Corsair 550W Power Supply",
    description: "Corsair CX550 550 Watt 80 Plus Bronze Certified Non-Modular Power Supply.",
    price: 59.99,
    stock_quantity: 12,
    image: "psu.jpg",
    status: "Available"
  },
  {
    id: 8,
    category_id: 7,
    name: "Mechanical Gaming Keyboard",
    description: "Redragon K552 Mechanical Keyboard with Rainbow LED backlighting, Cherry MX Blue equivalent switches.",
    price: 34.99,
    stock_quantity: 18,
    image: "keyboard.jpg",
    status: "Available"
  }
];

let orders: Order[] = [
  {
    id: 1,
    product_id: 4,
    customer_name: "Faraz Ahmed",
    email: "afaraz37475@gmail.com",
    phone: "+1 (555) 0124",
    address: "123 Silicon Boulevard, Apartment 4B, New York",
    quantity: 2,
    total_price: 91.00,
    status: "Delivered",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    product_id: 5,
    customer_name: "Sarah Jenkins",
    email: "sarahj@example.com",
    phone: "+1 (555) 9876",
    address: "88 Main Street, Suite 210, Boston, MA",
    quantity: 1,
    total_price: 89.99,
    status: "Processing",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

let sellRequests: SellRequest[] = [
  {
    id: 1,
    seller_name: "David Vance",
    email: "dvance@example.com",
    phone: "+1 (555) 7811",
    component_name: "EVGA NVIDIA RTX 3080 FTW3 Ultra 10GB",
    category: "Graphics Cards",
    expected_price: 499.00,
    component_condition: "Excellent",
    description: "Used primarily for MS Flight Simulator. Thermal-pasted last year. Standard clean fan blades, complete with original box.",
    status: "Reviewed",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let contactMessages: ContactMessage[] = [
  {
    id: 1,
    name: "Toby McGuire",
    email: "tobym@example.com",
    subject: "AMD Threadripper compatibilities",
    message: "Hello! Do you have any ASUS TRX40 motherboards currently in transit? I've been looking for one to pair with a 3970X. Thank you!",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let productCounter = 9;
let orderCounter = 3;
let sellCounter = 2;
let messageCounter = 2;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Backend Routes for Interactive Simulated Sandbox Experience
  app.get("/api/overview", (req, res) => {
    res.json({
      total_products: products.length,
      total_orders: orders.length,
      total_sell_requests: sellRequests.length,
      total_messages: contactMessages.length
    });
  });

  // Cat entries
  app.get("/api/categories", (req, res) => {
    res.json(categories);
  });

  // Products CRUD
  app.get("/api/products", (req, res) => {
    const list = products.map(p => {
      const cat = categories.find(c => c.id === p.category_id);
      return {
        ...p,
        category_name: cat ? cat.name : "Unassigned"
      };
    });
    res.json(list);
  });

  app.post("/api/products", (req, res) => {
    const { name, category_id, price, stock_quantity, description, status, image } = req.body;
    const newProduct: Product = {
      id: productCounter++,
      name: name || "Unnamed Hardware component",
      category_id: Number(category_id) || 7,
      price: Number(price) || 0,
      stock_quantity: Number(stock_quantity) || 0,
      description: description || "",
      status: status || "Available",
      image: image || ""
    };
    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const pid = Number(req.params.id);
    const index = products.findIndex(p => p.id === pid);
    if (index !== -1) {
      const { name, category_id, price, stock_quantity, description, status, image } = req.body;
      products[index] = {
        ...products[index],
        name: name !== undefined ? name : products[index].name,
        category_id: category_id !== undefined ? Number(category_id) : products[index].category_id,
        price: price !== undefined ? Number(price) : products[index].price,
        stock_quantity: stock_quantity !== undefined ? Number(stock_quantity) : products[index].stock_quantity,
        description: description !== undefined ? description : products[index].description,
        status: status !== undefined ? status : products[index].status,
        image: image !== undefined ? image : products[index].image
      };
      res.json(products[index]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  app.delete("/api/products/:id", (req, res) => {
    const pid = Number(req.params.id);
    const index = products.findIndex(p => p.id === pid);
    if (index !== -1) {
      const deleted = products.splice(index, 1);
      // Clean orders with missing products
      orders = orders.filter(o => o.product_id !== pid);
      res.json(deleted[0]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  });

  // Client Orders list & checkout
  app.get("/api/orders", (req, res) => {
    const list = orders.map(o => {
      const p = products.find(prod => prod.id === o.product_id);
      return {
        ...o,
        product_name: p ? p.name : "Archived Component",
        unit_price: p ? p.price : 0
      };
    });
    res.json(list);
  });

  app.post("/api/orders", (req, res) => {
    const { product_id, customer_name, email, phone, address, quantity } = req.body;
    const pid = Number(product_id);
    const qty = Number(quantity) || 1;
    const targetProduct = products.find(p => p.id === pid);

    if (!targetProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (qty > targetProduct.stock_quantity) {
      return res.status(400).json({ error: "Insufficient inventory stock!" });
    }

    // Deduct stock levels
    targetProduct.stock_quantity -= qty;

    const total_price = targetProduct.price * qty;
    const newOrder: Order = {
      id: orderCounter++,
      product_id: pid,
      customer_name: customer_name || "Unknown Customer",
      email: email || "",
      phone: phone || "",
      address: address || "",
      quantity: qty,
      total_price,
      status: "Pending",
      created_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.put("/api/orders/:id", (req, res) => {
    const ordID = Number(req.params.id);
    const index = orders.findIndex(o => o.id === ordID);
    if (index !== -1) {
      const { status } = req.body;
      const oldStatus = orders[index].status;
      
      if (status === "Cancelled" && oldStatus !== "Cancelled") {
        // Return stock
        const targetProduct = products.find(p => p.id === orders[index].product_id);
        if (targetProduct) {
          targetProduct.stock_quantity += orders[index].quantity;
        }
      }

      orders[index].status = status || orders[index].status;
      res.json(orders[index]);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  app.delete("/api/orders/:id", (req, res) => {
    const ordID = Number(req.params.id);
    const index = orders.findIndex(o => o.id === ordID);
    if (index !== -1) {
      const deleted = orders.splice(index, 1);
      res.json(deleted[0]);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  });

  // Client Sell Component Requests
  app.get("/api/sell-requests", (req, res) => {
    res.json(sellRequests);
  });

  app.post("/api/sell-requests", (req, res) => {
    const { seller_name, email, phone, component_name, category, expected_price, component_condition, description } = req.body;
    const newRequest: SellRequest = {
      id: sellCounter++,
      seller_name: seller_name || "Unknown Seller",
      email: email || "",
      phone: phone || "",
      component_name: component_name || "Hardware component model",
      category: category || "Accessories",
      expected_price: Number(expected_price) || 0,
      component_condition: component_condition || "Good",
      description: description || "",
      status: "Pending",
      created_at: new Date().toISOString()
    };
    sellRequests.unshift(newRequest);
    res.status(201).json(newRequest);
  });

  app.put("/api/sell-requests/:id", (req, res) => {
    const reqID = Number(req.params.id);
    const index = sellRequests.findIndex(r => r.id === reqID);
    if (index !== -1) {
      const { status } = req.body;
      sellRequests[index].status = status || sellRequests[index].status;
      res.json(sellRequests[index]);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  });

  app.delete("/api/sell-requests/:id", (req, res) => {
    const reqID = Number(req.params.id);
    const index = sellRequests.findIndex(r => r.id === reqID);
    if (index !== -1) {
      const deleted = sellRequests.splice(index, 1);
      res.json(deleted[0]);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  });

  // Contact Support Desk Messages
  app.get("/api/messages", (req, res) => {
    res.json(contactMessages);
  });

  app.post("/api/messages", (req, res) => {
    const { name, email, subject, message } = req.body;
    const newMessage: ContactMessage = {
      id: messageCounter++,
      name: name || "Anonymous User",
      email: email || "",
      subject: subject || "Help ticket",
      message: message || "",
      created_at: new Date().toISOString()
    };
    contactMessages.unshift(newMessage);
    res.status(201).json(newMessage);
  });

  app.delete("/api/messages/:id", (req, res) => {
    const msgId = Number(req.params.id);
    const index = contactMessages.findIndex(m => m.id === msgId);
    if (index !== -1) {
      const deleted = contactMessages.splice(index, 1);
      res.json(deleted[0]);
    } else {
      res.status(404).json({ error: "Message not found" });
    }
  });

  // Simple Auth Checking endpoint
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "admin123") {
      res.json({
        success: true,
        admin: "admin",
        fullname: "Thirdwave Administrator"
      });
    } else {
      res.status(401).json({ success: false, error: "Incorrect admin username or password!" });
    }
  });


  // Active Vite rendering or static production serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
    console.log(`Server executing securely on http://localhost:${PORT}`);
  });
}

startServer();
