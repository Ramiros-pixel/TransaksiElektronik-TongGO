// State Management
export const store = {
  cart: [],
  tableNumber: null,
  orders: [],
  isAdminLoggedIn: false,
  
  // Dummy Menu Data
  menuItems: [
    { id: 1, name: 'Nasi Goreng Spesial', price: 25000, img: 'Menu 1' },
    { id: 2, name: 'Mie Tek-Tek', price: 20000, img: 'Menu 2' },
    { id: 3, name: 'Ayam Penyet Saung', price: 30000, img: 'Menu 3' },
    { id: 4, name: 'Es Teh Manis', price: 5000, img: 'Menu 4' },
    { id: 5, name: 'Kopi Hitam', price: 10000, img: 'Menu 5' },
    { id: 6, name: 'Jus Mangga', price: 15000, img: 'Menu 6' }
  ],

  init() {
    // 1. Read table number from QR code (URL param ?meja=5)
    const urlParams = new URLSearchParams(window.location.search);
    const meja = urlParams.get('meja');
    if (meja) {
      this.tableNumber = meja;
    } else {
      this.tableNumber = 'Pesan Mandiri (Tanpa QR)';
    }

    // 2. Load orders and auth state from localStorage
    const savedOrders = localStorage.getItem('tonggo_orders');
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
    }
    
    const adminAuth = localStorage.getItem('tonggo_admin_auth');
    if (adminAuth === 'true') {
      this.isAdminLoggedIn = true;
    }
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
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += 1;
    } else {
      this.cart.push({ ...item, qty: 1 });
    }
    this.notifyListeners();
  },

  updateQty(id, delta) {
    const item = this.cart.find(i => i.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        this.cart = this.cart.filter(i => i.id !== id);
      }
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
