IF DB_ID('RendezvousDB') IS NULL
BEGIN
    CREATE DATABASE RendezvousDB;
END
GO

USE RendezvousDB;
GO

-- Drop old objects if re-running this script during development
-- IMPORTANT: Do NOT execute this script against your current working database.
IF OBJECT_ID('order_item', 'U') IS NOT NULL DROP TABLE order_item;
IF OBJECT_ID('reservation', 'U') IS NOT NULL DROP TABLE reservation;
IF OBJECT_ID('[order]', 'U') IS NOT NULL DROP TABLE [order];
IF OBJECT_ID('stock', 'U') IS NOT NULL DROP TABLE stock;
IF OBJECT_ID('menu_item', 'U') IS NOT NULL DROP TABLE menu_item;
IF OBJECT_ID('category', 'U') IS NOT NULL DROP TABLE category;
IF OBJECT_ID('[user]', 'U') IS NOT NULL DROP TABLE [user];
GO


-- 1. USER TABLE
CREATE TABLE [user] (
    user_id      INT IDENTITY(1,1) PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL,
    password     VARCHAR(255) NOT NULL,
    phone        VARCHAR(15),
    role         VARCHAR(10) NOT NULL
);
GO


-- 2. CATEGORY TABLE
CREATE TABLE category (
    category_id   INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);
GO


-- 3. MENU ITEM TABLE
CREATE TABLE menu_item (
    item_id       INT IDENTITY(1,1) PRIMARY KEY,
    category_id   INT NOT NULL,
    item_name     VARCHAR(100) NOT NULL,
    description   VARCHAR(255),
    price         DECIMAL(8,2) NOT NULL,
    availability  BIT
);
GO


-- 4. STOCK TABLE
CREATE TABLE stock (
    stock_id            INT IDENTITY(1,1) PRIMARY KEY,
    item_id             INT NOT NULL,
    quantity_available  INT NOT NULL,
    reorder_level       INT,
    last_update         DATETIME
);
GO


-- 5. ORDER TABLE
CREATE TABLE [order] (
    order_id       INT IDENTITY(1,1) PRIMARY KEY,
    user_id        INT NOT NULL,
    order_date     DATETIME,
    pickup_time    DATETIME,
    order_status   VARCHAR(20),
    total_amount   DECIMAL(10,2),
    pickup_date    DATE
);
GO


-- 6. ORDER ITEM TABLE
CREATE TABLE order_item (
    order_id     INT NOT NULL,
    item_id      INT NOT NULL,
    quantity     INT NOT NULL,
    unit_price   DECIMAL(8,2) NOT NULL
);
GO


-- 7. RESERVATION TABLE
CREATE TABLE reservation (
    reservation_id    INT IDENTITY(1,1) PRIMARY KEY,
    user_id           INT NOT NULL,
    reservation_date  DATE NOT NULL,
    reservation_time  TIME NOT NULL,
    party_size        INT NOT NULL,
    table_number      INT NOT NULL,
    status            VARCHAR(20)
);
GO


-- SAMPLE USERS
INSERT INTO [user]
(first_name, last_name, email, phone, password, role)
VALUES
('Admin', 'User', 'admin@rendezvous.co.za', NULL, '$2b$10$placeholderHashAdmin', 'admin'),
('Staff', 'Member', 'staff@rendezvous.co.za', NULL, '$2b$10$placeholderHashStaff', 'staff'),
('Kaila', 'Pillay', 'kaila@dut.ac.za', '0821111111', '$2b$10$placeholderHashKaila', 'customer');
GO


-- CATEGORIES
INSERT INTO category (category_name) VALUES
('Sandwiches'),
('Light Meals'),
('Main Meals'),
('Dessert'),
('Drinks');
GO


-- MENU ITEMS
INSERT INTO menu_item
(category_id, item_name, description, price, availability)
VALUES
((SELECT category_id FROM category WHERE category_name = 'Sandwiches'),
 'Cheese and Tomato',
 'Classic toasted sandwich',
 25.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Sandwiches'),
 'Chicken and Mayo',
 'Shredded chicken with creamy mayo',
 32.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Sandwiches'),
 'Spicy Chips',
 'Crispy chips with a spicy seasoning',
 30.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Light Meals'),
 'Grilled Chicken and Quinoa Salad',
 'Refreshing grilled chicken over quinoa salad',
 45.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Light Meals'),
 'Veg Taco Wrap with Chips',
 'Vegetable taco wrap served with chips',
 45.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Main Meals'),
 'Chicken Burrito Bowl',
 'Colourful chicken burrito bowl',
 50.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Main Meals'),
 'Veg Lasagne with Fresh Salad',
 'Veg lasagne served with a fresh salad',
 50.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Dessert'),
 'Chocolate Cake',
 'Delectable chocolate cake',
 38.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Dessert'),
 'Carrot Cake',
 'Moist and spicy carrot cake',
 45.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Drinks'),
 'Coke',
 'Ice-cold Coca-Cola',
 18.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Drinks'),
 'Fanta',
 'Ice-cold Fanta',
 18.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Drinks'),
 'Tea',
 'Freshly brewed tea',
 16.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Drinks'),
 'Coffee',
 'Freshly brewed coffee',
 15.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Drinks'),
 'Mixed Fruit Juice',
 'Blend of fresh fruit juices',
 18.00, 1),

((SELECT category_id FROM category WHERE category_name = 'Drinks'),
 'Water',
 'Still bottled water',
 14.00, 1);
GO


-- STOCK
INSERT INTO stock
(item_id, quantity_available, reorder_level)
SELECT
    item_id,
    25,
    5
FROM menu_item;
GO


-- VIEW DATA
SELECT * FROM [user];
SELECT * FROM category;
SELECT * FROM menu_item;
SELECT * FROM stock;
SELECT * FROM [order];
SELECT * FROM order_item;
SELECT * FROM reservation;