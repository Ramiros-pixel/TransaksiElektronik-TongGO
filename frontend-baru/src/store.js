// State Management
export const store = {
  cart: [],
  tableNumber: null,
  tableId: null,
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
    this.jwtToken = null;
    localStorage.removeItem('tonggo_jwt');
  },

  // Admin Dashboard Functions
  async fetchAdminOrders() {
    if (!this.jwtToken) return;
    try {
      const response = await fetch(`${this.API_URL}/orders/list`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        this.orders = data.map(o => ({
          id: o.idOrder,
          queueNumber: o.orderNumber || `A-${o.idOrder}`,
          tableNumber: o.tableId ? o.tableId.tableNumber : '-',
          totalPrice: o.totalPrice,
          status: o.status === 'paid' ? 'PAID' : 'UNPAID',
          rawStatus: o.status,
          timestamp: o.createdAt ? new Date(o.createdAt).toLocaleString() : new Date().toLocaleString(),
          itemsSummary: o.items && o.items.length > 0 ? o.items.map(i => `${i.productId?.name || 'Produk'} x${i.quantity}`).join(', ') : 'Belum ada item yang ditambahkan.'
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    }
  },

  async updateOrderStatus(orderId, status) {
    if (!this.jwtToken) throw new Error('Admin tidak terautentikasi');
    const response = await fetch(`${this.API_URL}/orders/${orderId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.jwtToken}`
      }
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Gagal memperbarui status order');
    }
    return response.json();
  },

  async fetchAdminProducts() {
    try {
      const response = await fetch(`${this.API_URL}/products/display`);
      if (!response.ok) throw new Error('Gagal memuat produk');
      return await response.json();
    } catch (error) {
      console.error('Failed to load admin products', error);
      return [];
    }
  },

  async createProduct(product) {
    if (!this.jwtToken) throw new Error('Admin tidak terautentikasi');
    const response = await fetch(`${this.API_URL}/products/tambah`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.jwtToken}`
      },
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Gagal menambahkan produk');
    }
    return await response.json();
  },

  async updateProduct(id, product) {
    if (!this.jwtToken) throw new Error('Admin tidak terautentikasi');
    const response = await fetch(`${this.API_URL}/products/ubah/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.jwtToken}`
      },
      body: JSON.stringify(product)
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Gagal memperbarui produk');
    }
  },

  async deleteProduct(id) {
    if (!this.jwtToken) throw new Error('Admin tidak terautentikasi');
    const response = await fetch(`${this.API_URL}/products/hapus/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.jwtToken}`
      }
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || 'Gagal menghapus produk');
    }
  },

  // Customer Functions
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

  async checkoutAPI() {
    if (this.cart.length === 0) return null;
    
    // We use dummy userId=1 and tableId=1 for anonymous buyers
    // If tableNumber from URL is a number, we can use it, else default to 1
    let tId = parseInt(this.tableNumber);
    if (isNaN(tId)) tId = 1;
    
    try {
      // 1. Create Order
      const initResp = await fetch(`${this.API_URL}/orders/init?userId=1&tableId=${tId}`, {
        method: 'POST'
      });
      
      if (!initResp.ok) {
        throw new Error('Gagal membuat pesanan (Pastikan userId=1 dan tableId=1 ada di database backend Anda)');
      }
      
      const orderData = await initResp.json();
      const orderId = orderData.idOrder;
      const orderNum = orderData.orderNumber || `A-${orderId}`;
      
      // 2. Add Items to Keranjang
      for (const item of this.cart) {
        await fetch(`${this.API_URL}/keranjang/tambah`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            productId: item.id,
            quantity: item.qty
          })
        });
      }
      
      const orderSummary = {
        queueNumber: orderNum,
        tableNumber: this.tableNumber,
        items: [...this.cart],
        totalPrice: this.getTotalPrice()
      };
      
      this.cart = [];
      this.notifyListeners();
      return orderSummary;

    } catch (err) {
      console.error(err);
      // Fallback if backend fails, just to let the demo continue smoothly
      alert("Error menghubungi backend: " + err.message + "\\n\\nMenggunakan Mode Offline Sementara.");
      
      const orderSummary = {
        queueNumber: `A-999 (Offline)`,
        tableNumber: this.tableNumber,
        items: [...this.cart],
        totalPrice: this.getTotalPrice()
      };
      this.cart = [];
      return orderSummary;
    }
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
