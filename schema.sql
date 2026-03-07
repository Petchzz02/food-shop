-- ตาราง User
CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'USER',
  points INT DEFAULT 0,
  createdAt DATETIME DEFAULT NOW()
);

-- ตาราง Product
CREATE TABLE IF NOT EXISTS Product (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  stock INT DEFAULT 0,
  image VARCHAR(500)
);

-- ตาราง Order
CREATE TABLE IF NOT EXISTS `Order` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total INT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  slipUrl VARCHAR(500),
  userId INT,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- ตาราง OrderItem
CREATE TABLE IF NOT EXISTS OrderItem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  FOREIGN KEY (orderId) REFERENCES `Order`(id),
  FOREIGN KEY (productId) REFERENCES Product(id)
);

-- ตาราง Address
CREATE TABLE IF NOT EXISTS Address (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  recipientName VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  isDefault BOOLEAN DEFAULT false,
  createdAt DATETIME DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- ตาราง Favorite
CREATE TABLE IF NOT EXISTS Favorite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  createdAt DATETIME DEFAULT NOW(),
  UNIQUE KEY uniq_fav (userId, productId),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
);

-- ตาราง NotificationSetting
CREATE TABLE IF NOT EXISTS NotificationSetting (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT UNIQUE NOT NULL,
  promoNotif BOOLEAN DEFAULT true,
  orderNotif BOOLEAN DEFAULT true,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- ตาราง Review
CREATE TABLE IF NOT EXISTS Review (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  createdAt DATETIME DEFAULT NOW(),
  UNIQUE KEY uniq_user_product (userId, productId)
);
