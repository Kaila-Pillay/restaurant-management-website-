
function setupStartingData() {

  
  var currentMenuVersion = "2";
  if (localStorage.getItem("menu") === null || localStorage.getItem("menuVersion") !== currentMenuVersion) {
    var startingMenu = [
      // Sandwiches
      { id: 1, name: "Cheese and Tomato", desc: "Classic toasted sandwich", price: 25, category: "Sandwiches", available: true },
      { id: 2, name: "Chicken and Mayo", desc: "Shredded chicken with creamy mayo", price: 32, category: "Sandwiches", available: true },
      { id: 3, name: "Spicy Chips", desc: "Crispy chips with a spicy seasoning", price: 30, category: "Sandwiches", available: true },

      // Light Meals
      { id: 4, name: "Grilled Chicken and Quinoa Salad", desc: "Refreshing grilled chicken over quinoa salad", price: 45, category: "Light Meals", available: true },
      { id: 5, name: "Veg Taco Wrap with Chips", desc: "Vegetable taco wrap served with chips", price: 45, category: "Light Meals", available: true },

      // Main Meals
      { id: 6, name: "Chicken Burrito Bowl", desc: "Colourful chicken burrito bowl", price: 50, category: "Main Meals", available: true },
      { id: 7, name: "Veg Lasagne with Fresh Salad", desc: "Veg lasagne served with a fresh salad", price: 50, category: "Main Meals", available: true },

      // Dessert
      { id: 8, name: "Chocolate Cake", desc: "Delectable chocolate cake", price: 38, category: "Dessert", available: true },
      { id: 9, name: "Carrot Cake", desc: "Moist and spicy carrot cake", price: 45, category: "Dessert", available: true },

      // Drinks
      { id: 10, name: "Coke", desc: "Ice-cold Coca-Cola", price: 18, category: "Drinks", available: true },
      { id: 11, name: "Fanta", desc: "Ice-cold Fanta", price: 18, category: "Drinks", available: true },
      { id: 12, name: "Tea", desc: "Freshly brewed tea", price: 16, category: "Drinks", available: true },
      { id: 13, name: "Coffee", desc: "Freshly brewed coffee", price: 15, category: "Drinks", available: true },
      { id: 14, name: "Mixed Fruit Juice", desc: "Blend of fresh fruit juices", price: 18, category: "Drinks", available: true },
      { id: 15, name: "Water", desc: "Still bottled water", price: 14, category: "Drinks", available: true }
    ];
    localStorage.setItem("menu", JSON.stringify(startingMenu));
    localStorage.setItem("menuVersion", currentMenuVersion);
  }

//if staff acc exists
  if (localStorage.getItem("staffAccounts") === null) {
    var startingStaff = [
      { email: "admin@rendezvous.co.za", password: "admin123", name: "Admin User", role: "admin" },
      { email: "staff@rendezvous.co.za", password: "staff123", name: "Staff Member", role: "staff" }
    ];
    localStorage.setItem("staffAccounts", JSON.stringify(startingStaff));
  }

  // Empty starting lists 
  if (localStorage.getItem("customers") === null) localStorage.setItem("customers", JSON.stringify([]));
  if (localStorage.getItem("orders") === null) localStorage.setItem("orders", JSON.stringify([]));
  if (localStorage.getItem("reservations") === null) localStorage.setItem("reservations", JSON.stringify([]));
  if (localStorage.getItem("cart") === null) localStorage.setItem("cart", JSON.stringify([]));
  if (localStorage.getItem("nextOrderNumber") === null) localStorage.setItem("nextOrderNumber", "1025");
  if (localStorage.getItem("nextReservationNumber") === null) localStorage.setItem("nextReservationNumber", "2034");
}


setupStartingData();


function getListFromStorage(key) {
  var text = localStorage.getItem(key);
  var value = null;
  try {
    value = JSON.parse(text);
  } catch (e) {
    value = null;
  }
  if (Array.isArray(value) === false) {
    value = [];
    localStorage.setItem(key, JSON.stringify(value)); // repair it for next time
  }
  return value;
}




// Returns the full list of menu items as a normal JavaScript array
function getMenu() {
  return getListFromStorage("menu");
}




function getCart() {
  return getListFromStorage("cart");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCountOnScreen();
}

function addToCart(itemId) {
  var menu = getMenu();
  var itemToAdd = null;

  for (var i = 0; i < menu.length; i++) {
    if (menu[i].id === itemId) {
      itemToAdd = menu[i];
    }
  }

  if (itemToAdd === null || itemToAdd.available === false) {
    return;
  }

  var cart = getCart();
  var alreadyInCart = false;

  for (var j = 0; j < cart.length; j++) {
    if (cart[j].id === itemId) {
      cart[j].quantity = cart[j].quantity + 1;
      alreadyInCart = true;
    }
  }

  if (alreadyInCart === false) {
    cart.push({
      id: itemToAdd.id,
      name: itemToAdd.name,
      price: itemToAdd.price,
      quantity: 1
    });
  }

  saveCart(cart);
  showMessage(itemToAdd.name + " added to your order");
}

// Change the quantity of one item in the cart by +1 or -1
function changeCartQuantity(itemId, amount) {
  var cart = getCart();
  var newCart = [];

  for (var i = 0; i < cart.length; i++) {
    var line = cart[i];
    if (line.id === itemId) {
      line.quantity = line.quantity + amount;
    }
    // Only keep the item if quantity is still above 0
    if (line.quantity > 0) {
      newCart.push(line);
    }
  }

  saveCart(newCart);
}

function removeFromCart(itemId) {
  var cart = getCart();
  var newCart = [];
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id !== itemId) {
      newCart.push(cart[i]);
    }
  }
  saveCart(newCart);
}

// Adds up price x quantity for every item in the cart
function getCartTotal() {
  var cart = getCart();
  var total = 0;
  for (var i = 0; i < cart.length; i++) {
    total = total + (cart[i].price * cart[i].quantity);
  }
  return total;
}

// Adds up how many items are in the cart (counting quantities)
function getCartItemCount() {
  var cart = getCart();
  var count = 0;
  for (var i = 0; i < cart.length; i++) {
    count = count + cart[i].quantity;
  }
  return count;
}

function emptyCart() {
  saveCart([]);
}

// Updates the little number badge next to the cart icon in the navbar
function updateCartCountOnScreen() {
  var badge = document.getElementById("cartCount");
  if (badge !== null) {
    badge.textContent = getCartItemCount();
  }
}




// Returns true/false and saves the new customer if everything is OK
function registerNewCustomer(fullName, email, phone, password) {
  var customers = getListFromStorage("customers");

  // Check if this email is already used
  for (var i = 0; i < customers.length; i++) {
    if (customers[i].email.toLowerCase() === email.toLowerCase()) {
      return { success: false, message: "An account with that email already exists." };
    }
  }

  customers.push({ fullName: fullName, email: email, phone: phone, password: password });
  localStorage.setItem("customers", JSON.stringify(customers));
  return { success: true };
}

function loginCustomer(email, password) {
  var customers = getListFromStorage("customers");

  for (var i = 0; i < customers.length; i++) {
    if (customers[i].email.toLowerCase() === email.toLowerCase() && customers[i].password === password) {
      // Save who is logged in
      sessionStorage.setItem("loggedInCustomer", JSON.stringify({ name: customers[i].fullName, email: customers[i].email }));
      return { success: true };
    }
  }
  return { success: false, message: "Incorrect email or password." };
}

// Returns the logged-in customer's details, or null if nobody is logged in
function getLoggedInCustomer() {
  var data = sessionStorage.getItem("loggedInCustomer");
  if (data === null) return null;
  return JSON.parse(data);
}

function logoutCustomer() {
  sessionStorage.removeItem("loggedInCustomer");
}

// Call this at the top of any "my account" style page (account.html,
// my-orders.html, my-reservations.html). If nobody is logged in as a
// customer, send them to the login page instead.
function protectCustomerPage() {
  var customer = getLoggedInCustomer();
  if (customer === null) {
    window.location.href = "login.html";
  }
  return customer;
}




function loginStaff(email, password) {
  var staffAccounts = getListFromStorage("staffAccounts");

  for (var i = 0; i < staffAccounts.length; i++) {
    if (staffAccounts[i].email.toLowerCase() === email.toLowerCase() && staffAccounts[i].password === password) {
      localStorage.setItem("loggedInStaff", JSON.stringify({
        name: staffAccounts[i].name,
        email: staffAccounts[i].email,
        role: staffAccounts[i].role
      }));
      return { success: true, role: staffAccounts[i].role };
    }
  }
  return { success: false, message: "Incorrect email or password." };
}

function getLoggedInStaff() {
  var data = localStorage.getItem("loggedInStaff");
  if (data === null) return null;
  return JSON.parse(data);
}

function logoutStaff() {
  localStorage.removeItem("loggedInStaff");
}

// Call this at the top of every staff-only page.
// If nobody is logged in as staff, send them to the staff login page.
function protectStaffPage() {
  var staff = getLoggedInStaff();
  if (staff === null) {
    window.location.href = "staff-login.html";
  }
  return staff;
}




function placeOrder(customerName, pickupDate, pickupTime) {
  var cart = getCart();
  if (cart.length === 0) {
    return { success: false, message: "Your cart is empty." };
  }

  // Build a friendly order number like ORD1025
  var orderNumber = localStorage.getItem("nextOrderNumber");
  localStorage.setItem("nextOrderNumber", (parseInt(orderNumber) + 1).toString());

  // If a customer is logged in, tag the order with their email so it can
  // be found again later on my-orders.html. Guest orders get an empty string.
  var loggedInCustomer = getLoggedInCustomer();
  var customerEmail = (loggedInCustomer !== null) ? loggedInCustomer.email : "";

  var newOrder = {
    id: "ORD" + orderNumber,
    customerName: customerName,
    customerEmail: customerEmail,
    items: cart,
    itemCount: getCartItemCount(),
    total: getCartTotal(),
    pickupDate: pickupDate,
    pickupTime: pickupTime,
    status: "Pending"
  };

  var orders = getListFromStorage("orders");
  orders.unshift(newOrder); // unshift = add to the FRONT of the list, so newest shows first
  localStorage.setItem("orders", JSON.stringify(orders));

  emptyCart();
  return { success: true, order: newOrder };
}

function getAllOrders() {
  return getListFromStorage("orders");
}

// Returns only the orders that belong to one customer's email address.
// Used by my-orders.html so a customer only sees their own orders.
function getOrdersForCustomer(email) {
  var allOrders = getAllOrders();
  var matchingOrders = [];
  for (var i = 0; i < allOrders.length; i++) {
    if (allOrders[i].customerEmail === email) {
      matchingOrders.push(allOrders[i]);
    }
  }
  return matchingOrders;
}

function updateOrderStatus(orderId, newStatus) {
  var orders = getAllOrders();
  for (var i = 0; i < orders.length; i++) {
    if (orders[i].id === orderId) {
      orders[i].status = newStatus;
    }
  }
  localStorage.setItem("orders", JSON.stringify(orders));
}




function placeReservation(customerName, date, time, guests, notes) {
  var reservationNumber = localStorage.getItem("nextReservationNumber");
  localStorage.setItem("nextReservationNumber", (parseInt(reservationNumber) + 1).toString());

  // Same idea as placeOrder() — tag the reservation with the logged-in
  // customer's email (if any) so it can be looked up on my-reservations.html.
  var loggedInCustomer = getLoggedInCustomer();
  var customerEmail = (loggedInCustomer !== null) ? loggedInCustomer.email : "";

  var newReservation = {
    id: "RES" + reservationNumber,
    customerName: customerName,
    customerEmail: customerEmail,
    date: date,
    time: time,
    guests: Number(guests), 
    notes: notes,
    status: "Pending"
  };

  var reservations = getListFromStorage("reservations");
  reservations.unshift(newReservation);
  localStorage.setItem("reservations", JSON.stringify(reservations));

  return { success: true, reservation: newReservation };
}

function getAllReservations() {
  return getListFromStorage("reservations");
}

// Returns only the reservations that belong to one customer's email address.
function getReservationsForCustomer(email) {
  var allReservations = getAllReservations();
  var matchingReservations = [];
  for (var i = 0; i < allReservations.length; i++) {
    if (allReservations[i].customerEmail === email) {
      matchingReservations.push(allReservations[i]);
    }
  }
  return matchingReservations;
}

function updateReservationStatus(reservationId, newStatus) {
  var reservations = getAllReservations();
  for (var i = 0; i < reservations.length; i++) {
    if (reservations[i].id === reservationId) {
      reservations[i].status = newStatus;
    }
  }
  localStorage.setItem("reservations", JSON.stringify(reservations));

fetch("/api/reservations/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: customerEmail,
    reservation_date: date,
    reservation_time: time,
    party_size: Number(guests)
  }),
  keepalive: true
}).catch(function(error) {
  console.log("Database sync failed:", error);
});

return { success: true, reservation: newReservation };
}




// Shows a small popup message at the bottom of the screen for 2 seconds
function showMessage(text) {
  var box = document.getElementById("popupMessage");

  // Create the popup box the first time it's needed
  if (box === null) {
    box = document.createElement("div");
    box.id = "popupMessage";
    box.className = "toast";
    document.body.appendChild(box);
  }

  box.textContent = text;
  box.classList.add("show");

  setTimeout(function () {
    box.classList.remove("show");
  }, 2000);
}

function isValidEmail(email) {
  return email.indexOf("@") > 0 && email.indexOf(".") > 0;
}

// Turns an order's item list into readable HTML for staff to prepare,

function buildItemsListHtml(items) {
  var lines = [];
  for (var i = 0; i < items.length; i++) {
    lines.push(items[i].quantity + "x " + items[i].name);
  }
  return lines.join("<br>");
}

// This runs automatically once the page's HTML has finished loading
document.addEventListener("DOMContentLoaded", function () {
  updateCartCountOnScreen();
  highlightCurrentPageInMenu();
  setupLogoutButtons();
  updateNavForLoginStatus();
});

// Shows "My Account" instead of "Login" in the navbar when a customer
// is logged in. Both links already exist in the HTML — this function
// just hides one and shows the other.
function updateNavForLoginStatus() {
  var loginLink = document.getElementById("navLoginLink");
  var accountLink = document.getElementById("navAccountLink");
  if (loginLink === null || accountLink === null) {
    return;
  }

  var customer = getLoggedInCustomer();
  if (customer !== null) {
    loginLink.style.display = "none";
    accountLink.style.display = "inline";
    accountLink.textContent = customer.name;
  } else {
    loginLink.style.display = "inline";
    accountLink.style.display = "none";
  }
}

// Adds the "active" style to whichever nav link matches the current page
function highlightCurrentPageInMenu() {
  var currentPage = window.location.pathname.split("/").pop();
  var links = document.querySelectorAll(".nav-links a, .side-links a");
  for (var i = 0; i < links.length; i++) {
    if (links[i].getAttribute("href") === currentPage) {
      links[i].classList.add("active");
    }
  }
}

// Any element with data-logout will log the user out and go home
function setupLogoutButtons() {
  var buttons = document.querySelectorAll("[data-logout]");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", function () {
      logoutCustomer();
      logoutStaff();
      window.location.href = "index.html";
    });
  }
}