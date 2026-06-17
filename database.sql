-- MySQL Database Structure for Thirdwave
-- Compatible with XAMPP phpMyAdmin and AwardSpace Hosting
-- No CREATE DATABASE or USE statements included

-- 1. admin Table
CREATE TABLE `admin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `fullname` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. categories Table
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. products Table
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10,2) NOT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` VARCHAR(25) NOT NULL DEFAULT 'Available',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. orders Table
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `quantity` INT NOT NULL,
  `total_price` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. sell_requests Table
CREATE TABLE `sell_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `component_name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `expected_price` DECIMAL(10,2) NOT NULL,
  `component_condition` VARCHAR(50) NOT NULL,
  `description` TEXT,
  `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. contact_messages Table
CREATE TABLE `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Admin (Password: admin123 is stored in plain text as requested)
INSERT INTO `admin` (`id`, `username`, `password`, `fullname`) VALUES
(1, 'admin', 'admin123', 'Thirdwave Administrator');

-- Insert Sample Categories
INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Processors'),
(2, 'Graphics Cards'),
(3, 'RAM'),
(4, 'Storage'),
(5, 'Motherboards'),
(6, 'Power Supplies'),
(7, 'Accessories');

-- Insert Sample Products (At least 8 as requested)
INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `stock_quantity`, `image`, `status`) VALUES
(1, 1, 'Intel Core i5 Processor', 'Intel Core i5-12400F 6-Core processor, up to 4.4 GHz, LGA1700 socket.', 149.99, 10, 'cpu.jpg', 'Available'),
(2, 1, 'AMD Ryzen 5 Processor', 'AMD Ryzen 5 5600X 6-Core, 12-Thread unlocked desktop processor.', 159.00, 15, 'cpu.jpg', 'Available'),
(3, 2, 'NVIDIA GTX 1660 Graphics Card', 'GeForce GTX 1660 Super Overclocked 6GB Dual-Fan edition. Great for 1080p gaming.', 219.99, 5, 'gpu.jpg', 'Available'),
(4, 3, 'Kingston 16GB DDR4 RAM', 'Kingston FURY Beast 16GB (2x8GB) 3200MHz DDR4 CL16 Desktop Memory Kit.', 45.50, 25, 'ram.jpg', 'Available'),
(5, 4, 'Samsung 1TB SSD', 'Samsung 980 Pro NVMe M.2 SSD, PCIe Gen 4 x4, speeds up to 7000 MB/s.', 89.99, 20, 'ssd.jpg', 'Available'),
(6, 5, 'ASUS B450 Motherboard', 'ASUS Prime B450M-A II Micro ATX motherboard with M.2 support, HDMI/DVI/D-Sub, USB 3.2 Gen 2.', 79.99, 8, 'motherboard.jpg', 'Available'),
(7, 6, 'Corsair 550W Power Supply', 'Corsair CX550 550 Watt 80 Plus Bronze Certified Non-Modular Power Supply.', 59.99, 12, 'psu.jpg', 'Available'),
(8, 7, 'Mechanical Gaming Keyboard', 'Redragon K552 Mechanical Keyboard with Rainbow LED backlighting, Cherry MX Blue equivalent switches.', 34.99, 18, 'keyboard.jpg', 'Available');
