const STORE_KEY = "lazada_app_v1";

const defaultData = {
  customer: { authMethod: "", email: "", password: "", profile: {} },
  seller: { 
    profile: { name: "Official Lazada Store", address: "Manila, Philippines", picture: "https://logos-world.net/wp-content/uploads/2022/05/Lazada-Logo.png" }, 
    verified: true, 
    products: [
      { id: "p1", name: "Premium Smartphone 5G", quantity: 10, price: 25000, category: "mobiles", image: "phone_listing_1778253541739.png" },
      { id: "p2", name: "Cotton Crew Neck T-Shirt", quantity: 50, price: 499, category: "men tshirts", image: "tshirt_listing_1778253730908.png" },
      { id: "p3", name: "Wireless Pro Noise Cancelling Buds", quantity: 20, price: 3500, category: "wireless buds", image: "earbuds_listing_1778253822186.png" }
    ] 
  },
  rider: { profile: {}, available: false, assignments: [] },
  admin: { announcements: [] },
  orders: [],
  notifications: []
};

function getData() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return structuredClone(defaultData);
  try {
    return { ...structuredClone(defaultData), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function id(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function el(idName) {
  return document.getElementById(idName);
}

function renderList(containerId, items, renderItem) {
  const container = el(containerId);
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `<div class="empty">No transactions yet. Submit inputs to create records.</div>`;
    return;
  }
  container.innerHTML = items.map(renderItem).join("");
}

function pushNotification(data, role, message) {
  data.notifications.push({ id: id("n"), role, message, at: new Date().toLocaleString() });
}

function renderNotifications(containerId, role, data) {
  const notes = data.notifications
    .filter((n) => n.role === role)
    .slice()
    .reverse();
  renderList(containerId, notes, (n) => `
    <div class="item">
      <div>${n.message}</div>
      <div class="meta">${n.at}</div>
    </div>
  `);
}

function checkoutCart(data, cartItems) {
  if (!Array.isArray(cartItems) || !cartItems.length) {
    return { ok: false, message: "Cart is empty." };
  }
  cartItems.forEach((item) => {
    data.orders.push({
      id: id("order"),
      productId: item.productId,
      productName: item.name,
      price: Number(item.price),
      status: "customer_checkout",
      sellerAccepted: false,
      adminApproved: false,
      riderId: "",
      riderAccepted: false,
      delivered: false,
      receivedByCustomer: false,
      review: null
    });
  });
  pushNotification(data, "seller", "New customer order needs seller action.");
  saveData(data);
  return { ok: true, message: "Checkout submitted. Seller can now accept or decline orders." };
}
