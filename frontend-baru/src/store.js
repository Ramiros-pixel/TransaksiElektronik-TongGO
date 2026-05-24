export const store = {
  cart: [],
  tableNumber: null,
  orders: [],
  isAdminLoggedIn: false,
  jwtToken: null,
  menuItems: [],

  // Configuration for API
  API_URL: 'http://localhost:9090/api',

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const meja = urlParams.get('meja');
    if (meja) {
      this.tableNumber = meja;
    } else {
      this.tableNumber = 'Pesan Mandiri';
    }

    const savedToken = localStorage.getItem('tonggo_jwt');
    if (savedToken) {
      this.jwtToken = savedToken;
      this.isAdminLoggedIn = true;
    }

    await this.fetchProducts();
  },

  async fetchProducts() {
    try {
      const response = await fetch(`${this.API_URL}/products/display`);
      if (response.ok) {
        const data = await response.json();
        this.menuItems = data.map(item => ({
          id: item.idProduct,
          name: item.name,
          price: item.price,
          description: item.description || 'Hidangan lezat dari bahan pilihan terbaik.',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
        }));
      } else {
        throw new Error('Gagal memuat dari backend');
      }
    } catch (error) {
      console.error('Backend tidak tersedia, menggunakan data dummy:', error);
      this.menuItems = [
        { id: 1, name: 'Fresh Salad Bowl', price: 45000, description: 'Salad segar dengan potongan ayam dan saus spesial.', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
        { id: 2, name: 'Muffins', price: 20000, description: 'Muffin coklat lembut panggang sempurna.', img: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }
      ];
    }
    this.notifyListeners();
  },

  // Auth Functions
  async loginAdmin(email, password) {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Email atau password salah');
      
      const data = await response.json();
      this.jwtToken = data.jwt;
      this.isAdminLoggedIn = true;
      localStorage.setItem('tonggo_jwt', data.jwt);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  
  async registerAdmin(username, email, password) {
    try {
      const response = await fetch(`${this.API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
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
