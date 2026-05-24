// State Management
const API_BASE = 'http://localhost:8080';

export const api = {
  get: (url) => fetch(API_BASE + url).then(r => r.json()),
};

export const store = {
  cart: [],
  tableNumber: null,
  tableId: null,
  orders: [],
  isAdminLoggedIn: false,
  menuItems: [],

  async init() {
    // 1. Baca QR dari URL ?table=QR-XXXX
    const urlParams = new URLSearchParams(window.location.search);
    const qrCode = urlParams.get('table');
    if (qrCode) {
      try {
        const res = await fetch(`${API_BASE}/api/tables/qr/${qrCode}`);
        if (res.ok) {
          const table = await res.json();
          this.tableId = table.idTable;
          this.tableNumber = table.tableNumber;
          localStorage.setItem('tonggo_table_id', table.idTable);
          localStorage.setItem('tonggo_table_number', table.tableNumber);
        }
      } catch (e) {
        console.error('Gagal resolve QR meja', e);
      }
    } else {
      // Ambil dari localStorage kalau sudah pernah scan
      const savedId = localStorage.getItem('tonggo_table_id');
      const savedNum = localStorage.getItem('tonggo_table_number');
      if (savedId) { this.tableId = savedId; this.tableNumber = savedNum; }
    }

    // 2. Load menu dari backend
    try {
      this.menuItems = await api.get('/api/products/display');
    } catch {
      this.menuItems = [];
    }

    // 3. Load orders & auth dari localStorage
    const savedOrders = localStorage.getItem('tonggo_orders');
    if (savedOrders) this.orders = JSON.parse(savedOrders);
    const adminAuth = localStorage.getItem('tonggo_admin_auth');
    if (adminAuth === 'true') this.isAdminLoggedIn = true;
  },

  loginAdmin(pin) {
    if (pin === '1234') { // Simple dummy PIN
      this.isAdminLoggedIn = true;
      localStorage.setItem('tonggo_admin_auth', 'true');
      return true;
    }
    return false;
  },
  
  logoutAdmin() {
    this.isAdminLoggedIn = false;
    localStorage.removeItem('tonggo_admin_auth');
  },

  addToCart(item) {
    const existing = this.cart.find(i => i.idProduct === item.idProduct);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({ ...item, qty: 1 });
    }
    this.notifyListeners();
  },

  updateQty(idProduct, delta) {
    const item = this.cart.find(i => i.idProduct === idProduct);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) this.cart = this.cart.filter(i => i.idProduct !== idProduct);
      this.notifyListeners();
    }
  },

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + (item.price * item.qty), 0);
  },
  
  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.qty, 0);
  },

  // Checkout process: generate queue, save order, clear cart
  checkout() {
    if (this.cart.length === 0) return null;
    
    // Generate Queue Number (e.g. A-001)
    const count = this.orders.length + 1;
    const queueNumber = `A-${count.toString().padStart(3, '0')}`;
    
    const newOrder = {
      id: Date.now().toString(),
      queueNumber: queueNumber,
      tableNumber: this.tableNumber,
      items: [...this.cart],
      totalPrice: this.getTotalPrice(),
      status: 'UNPAID', // UNPAID or PAID
      timestamp: new Date().toLocaleString()
    };
    
    this.orders.unshift(newOrder); // Add to beginning
    this._saveOrders();
    
    this.cart = []; // Empty cart
    this.notifyListeners();
    
    return newOrder;
  },
  
  markOrderAsPaid(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'PAID';
      this._saveOrders();
      this.notifyListeners();
    }
  },
  
  _saveOrders() {
    localStorage.setItem('tonggo_orders', JSON.stringify(this.orders));
  },

  listeners: [],
  subscribe(listener) {
    this.listeners.push(listener);
  },
  notifyListeners() {
    this.listeners.forEach(l => l());
  }
};

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};
