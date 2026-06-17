# Thirdwave – Computer Components Buy and Sell Hub

Thirdwave is a responsive, highly polished dynamic computer components marketplace web application. It allows hardware builders and gamers to view computer parts and accessories, place purchase orders, submit sell/trade-in requests for their used components, and communicate with the website's administrative team.

## Concept Overview
PC components frequently shift in market size, value, and integration. Thirdwave bridges custom builders with immediate inventory access and provides instant appraised liquidations for older parts. The platform is designed with a sleek, dark technology/e-commerce layout, prioritizing clear usability, clean accessibility, and fast responsiveness.

---

## Technical Specifications
- **Core backend**: Core PHP (Procedural & OO architecture with secure prepared statements)
- **Database Storage**: MySQL Database (built using pure standard `mysqli`)
- **Frontend Layer**: Standard semantic HTML5, clean CSS3 (in `css/style.css` using modern Inter and Space Grotesk fonts), and dynamic client-side JavaScript for interface loaders
- **Icon Suite**: Lucide Web SVGs (rendered through an active web unpkg CDN link)
- **Admin Security**: PHP Session tracking with lazy checks as gating guards

---

## Key Features

### 1. Storefront Interface
- **Dynamic Portal (`index.php`)**: Hero display card introducing buying/trading workflows with rapid visual action buttons and dynamic featured products list.
- **Store Catalog (`products.php`)**: Instant catalog queries displaying categories, specs, unit prices, and live stock tags. Supports keyword search and category filters.
- **Checkout Sheet (`order.php`)**: Interactive shopping cart invoice checkout. Confirms real-time stock limits, calculates price aggregates dynamically, and records transactions in DB, automatically updating products' stock count.
- **Used Component Appraisal (`sell.php`)**: Trade-in form where clients can list components for evaluation, indicating model labels, condition metrics, descriptions, and expected prices.
- **Help Desk Portal (`contact.php`)**: Detailed inquiry tickets saved persistently in DB for admin staff review.
- **Detailed About Desk (`about.php`)**: Platform introduction, testing guarantees, and dynamic component registries.

### 2. Administrative Control Suite
- **Secure Gate (`login.php`)**: Admin authentication gate secured via PHP Sessions.
- **Main Terminal (`admin/dashboard.php`)**: Displays critical telemetry widgets listing total catalog products, customer orders, trade offers, and messages in inbox.
- **Inventory CRUD Portal (`admin/manage_products.php`)**: Tabular catalog manager allowing total product management (Name, Category, Price, Stock, Description, upload new photos).
- **Listing Editors (`admin/add_product.php` & `admin/edit_product.php`)**: Dynamic creators and editors supporting local image uploads on server folders. Saves new files and cleans removed graphic assets from filesystem automatically.
- **Buyer Log Manager (`admin/manage_orders.php`)**: Lists purchase orders detailing buyer contact info, units bought, address coordinates, and price totals. Includes dynamic progress status forms (Pending, Confirmed, Processing, Delivered, Cancelled) with cancellation stock refunding.
- **Trader Board Manager (`admin/sell_requests.php`)**: Tabular appraisal cards detailing client trade offers. Helps review and tag statuses or reject/approve options.
- **Inbox Ticket log (`admin/messages.php`)**: Read custom inquiries, configuration tickets, and suggestions. Delete completed logs easily.
- **Log out (`admin/logout.php`)**: Standard session cleaner redirecting safely to public portal views.

---

## Folder Directory Structure
```text
thirdwave/
│
├── admin/
│   ├── dashboard.php
│   ├── manage_products.php
│   ├── add_product.php
│   ├── edit_product.php
│   ├── delete_product.php
│   ├── manage_orders.php
│   ├── sell_requests.php
│   ├── messages.php
│   └── logout.php
│
├── css/
│   └── style.css
│
├── includes/
│   ├── db.php
│   ├── header.php
│   └── footer.php
│
├── uploads/              <-- Dynamically generated folder for product images
│
├── index.php
├── about.php
├── products.php
├── order.php
├── sell.php
├── contact.php
├── login.php
├── database.sql
└── README.md
```

---

## Local Setup Instructions (XAMPP / Localhost)

To run this project on any standard XAMPP localhost installation, follow these sequence steps:

1. **Locate htdocs**: Navigate to your XAMPP installation directory (normally `C:\xampp\htdocs\` on Windows or `/Applications/XAMPP/htdocs/` on macOS).
2. **Move files**: Create a folders directory named `thirdwave` inside your `htdocs` folder and copy all the directory contents there so paths map correctly.
3. **Boot XAMPP Servers**: Open the **XAMPP Control Panel** and start both **Apache** and **MySQL** modules.
4. **Create Database**: Open your web browser and navigate directly to **phpMyAdmin** via [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
   - Press **New** in the left navigation sidebar.
   - Set the database name to: **`thirdwave_db`**.
   - Choose collation standard **`utf8mb4_general_ci`** and click **Create**.
5. **Import Schema**: Click the newly created database `thirdwave_db` in the sidebar, open the **Import** tab on the top menu, click **Browse**, select `database.sql` from your project folders, and click **Import/Go**. This will initialize the tables and populate sample processors, graphics cards, RAM kits, SSDs, and keyboards.
6. **Deploy App**: Open your browser and navigate to:
   [http://localhost/thirdwave/](http://localhost/thirdwave/)

---

## Online Setup Instructions (AwardSpace Hosting Deployment)

To deploy Thirdwave to a free hosting service like AwardSpace:

1. **Log in to AwardSpace**: Navigate to your AwardSpace control panel.
2. **Create MySQL Database**: Go to **Database Manager** > **MySQL Databases**, create a database (AwardSpace will prepend a prefix to the database name, e.g. `123456_thirdwave_db`), and note the new Database Name, Username, Host, and Password.
3. **Import SQL**: Click **phpMyAdmin** in AwardSpace Database settings, select your database, click **Import**, select `database.sql`, and run the file (Note: standard table rules are preserved, no extra database commands are passed).
4. **Deploy Files**: In AwardSpace, open the **File Manager** (usually under `/dxxx.awardspace.net/` or public html folders) and upload all files.
5. **Configure Connection**: Edit `/includes/db.php` on the server using the online File Manager and change database connection constants to match AwardSpace variables:
   - `$db_host` = "your-awardspace-mysql-hostname";
   - `$db_user` = "your-awardspace-mysql-username";
   - `$db_pass` = "your-awardspace-mysql-password";
   - `$db_name` = "your-awardspace-mysql-dbname";
   - `$db_port` = 3306;

----

## Default Admin Login Credentials (Academic Testing)
- **Gate URL**: http://thirdwave.onlinewebshop.net/index.php
- **Administrative Username**: `admin`
- **Administrative Password**: `admin123`
