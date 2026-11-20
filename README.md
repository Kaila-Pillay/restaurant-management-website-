# Restaurant Management Website

A full-stack restaurant management system developed for the DUT Rendezvous restaurant using HTML, CSS, JavaScript, Node.js, Express.js and Microsoft SQL Server.

The application provides an integrated platform connecting customers and restaurant staff, allowing reservations, takeaway orders and restaurant operations to be managed digitally.

## Project Overview

### The Problem

The restaurant traditionally relies on phone calls and emails to manage customer reservations and takeaway orders. These requests are relayed to a secretary located separately from the restaurant.

This manual process can result in communication delays, misplaced reservations, difficulties tracking orders and inefficient restaurant management.

The aim of this project was to address these challenges by developing a centralised digital platform that connects customers, restaurant staff and the database.

### The Solution

The website consists of two interconnected portals: a customer portal and a staff management portal.

Both portals communicate with the backend and Microsoft SQL Server database, ensuring that information is stored and updated across the system.

## Main Features

### 1. Customer Portal

Customers can create an account, log in and interact with the restaurant through the website.

Features include:

- Customer registration and login.
- Viewing restaurant information and the menu.
- Adding menu items to a shopping cart.
- Proceeding to checkout and placing takeaway orders.
- Making restaurant reservations.
- Viewing existing orders and reservations.
- Tracking order and reservation statuses.

Customer registration details, orders and reservations are stored in the database.

### 2. Staff Management Portal

Restaurant staff have their own login credentials and access to a separate management interface.

Staff can:

- View incoming customer orders.
- Manage restaurant reservations.
- Update order statuses.
- Update reservation statuses.
- Monitor and manage customer requests.

Order statuses can be updated as orders progress, including pending, ready, completed and cancelled.

### 3. Integrated Database Management

The application is connected to a Microsoft SQL Server database.

The database stores and manages information including:

- Customer registration details.
- Customer orders and their associated items.
- Restaurant reservations.
- Order and reservation statuses.
- Other relevant application data.

When customers register, place orders or make reservations, the information is stored in the database.

Changes made by restaurant staff are reflected in the database and communicated back to the customer portal, allowing both customers and staff to track the progress of the respective orders and reservations.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML | Website structure |
| CSS | Styling and layout |
| JavaScript | Front-end interactivity and backend application logic |
| Node.js | Server-side development |
| Express.js | Backend framework handling routes and requests|
| Microsoft SQL Server | Database management |
| SQL | Database queries and operations |
| Visual Studio Code | Development environment |

## My Contribution

This was a group academic project based on an idea I originally proposed.

I took primary responsibility for the development and integration of the majority of the application.

My contributions included:

- Developing and improving front-end components using HTML, CSS and JavaScript.
- Implementing backend functionality using Node.js and Express.js.
- Working with Microsoft SQL Server to manage application data.
- Integrating the customer and staff portals with the backend.
- Connecting application functionality to the database.
- Reviewing, correcting and improving project components.
- Testing application functionality and resolving errors.

## Installation and Setup

To run this project locally:

**1. Clone the repository**

```bash
git clone https://github.com/Kaila-Pillay/restaurant-management-website-.git
```

**2. Navigate to the project folder**

```bash
cd restaurant-management-website-
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure the database**

- Set up Microsoft SQL Server.
- Review the provided SQL script.
- Create and configure the required database.
- Check the database connection settings in `db.js`.

**5. Start the application**

```bash
node server.js
```

**6. Open the application**

Navigate to:

`http://localhost:3000`

**Note:** This application was developed as an academic project and requires a locally configured SQL Server database. Review the SQL setup script before executing it, as it contains commands that may delete and recreate existing tables.

## Project Status

Developed as an academic group project to demonstrate practical application of full-stack web development, backend programming, database integration and system functionality.
