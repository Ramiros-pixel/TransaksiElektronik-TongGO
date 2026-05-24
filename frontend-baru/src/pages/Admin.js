import { store, formatRupiah } from '../store.js';

export const renderAdmin = () => {
  const div = document.createElement('div');
  div.className = 'page-container';
  div.style.maxWidth = '1000px';

  if (!store.isAdminLoggedIn) {
    window.location.hash = '#/admin-login';
    return div;
  }

  let activeTab = 'orders';
  let products = [];
  let feedbackMessage = '';

  const loadOrders = async () => {
    await store.fetchAdminOrders();
    renderDashboard();
  };

  const loadProducts = async () => {
    products = await store.fetchAdminProducts();
    renderDashboard();
  };

  const setFeedback = (message) => {
    feedbackMessage = message;
    renderDashboard();
    setTimeout(() => {
      feedbackMessage = '';
      renderDashboard();
    }, 4000);
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      await store.updateOrderStatus(orderId, 'paid');
      setFeedback('Status pembayaran berhasil diperbarui.');
      await loadOrders();
    } catch (error) {
      setFeedback(error.message || 'Gagal memperbarui status pembayaran');
    }
  };

  const handleAddProduct = async () => {
    const name = prompt('Nama produk:');
    if (!name) return;
    const price = prompt('Harga produk (angka):');
    if (!price || isNaN(price)) {
      alert('Harga tidak valid');
      return;
    }
    const description = prompt('Deskripsi produk:');

    try {
      await store.createProduct({ name, price: parseFloat(price), description });
      setFeedback('Produk berhasil ditambahkan.');
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || 'Gagal menambahkan produk');
    }
  };

  const handleEditProduct = async (product) => {
    const name = prompt('Nama produk:', product.name);
    if (!name) return;
    const price = prompt('Harga produk (angka):', product.price);
    if (!price || isNaN(price)) {
      alert('Harga tidak valid');
      return;
    }
    const description = prompt('Deskripsi produk:', product.description || '');

    try {
      await store.updateProduct(product.idProduct, { name, price: parseFloat(price), description });
      setFeedback('Produk berhasil diperbarui.');
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || 'Gagal memperbarui produk');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await store.deleteProduct(id);
      setFeedback('Produk berhasil dihapus.');
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || 'Gagal menghapus produk');
    }
  };

  const renderDashboard = () => {
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
        <div>
          <h3 class="section-subtitle" style="text-align:left; font-size:1.5rem;">Admin Access</h3>
          <h2 style="font-size:2rem; margin:0;">Dashboard Kasir</h2>
        </div>
        <button class="btn-outline" id="logout-btn" style="padding: 0.5rem 1.5rem;">Logout</button>
      </div>
      <div style="display:flex; gap:0.75rem; margin-bottom: 1.5rem;">
        <button class="btn-primary ${activeTab === 'orders' ? 'active' : ''}" id="tab-orders">Pesanan</button>
        <button class="btn-primary ${activeTab === 'products' ? 'active' : ''}" id="tab-products">Produk</button>
      </div>
      ${feedbackMessage ? `<div style="margin-bottom:1rem; padding:1rem; border-radius:12px; background:#e6f4ea; color:#1b5e20;">${feedbackMessage}</div>` : ''}
    `;

    if (activeTab === 'orders') {
      if (store.orders.length === 0) {
        div.innerHTML += `
          <div style="text-align:center; padding: 3rem 0;">
            <p style="color:var(--text-light); font-size:1.2rem;">Belum ada pesanan yang masuk atau sedang memuat...</p>
          </div>
        `;
      } else {
        let rowsHtml = '';
        store.orders.forEach(order => {
          const isPaid = order.status === 'PAID';
          const badgeClass = isPaid ? 'badge paid' : 'badge unpaid';
          const statusText = isPaid ? 'LUNAS' : 'BELUM BAYAR';
          const actionBtn = isPaid
            ? `<span style="color:var(--text-light); font-weight:600;">Selesai</span>`
            : `<button class="btn-primary mark-paid-btn" style="padding:0.4rem 1rem; font-size:0.85rem;" data-id="${order.id}">Mark Paid</button>`;

          rowsHtml += `
            <tr>
              <td><strong style="font-size:1.2rem; color:var(--primary-dark);">${order.queueNumber}</strong></td>
              <td style="font-weight:600;">${order.tableNumber}</td>
              <td style="font-size:0.9rem;">
                <div style="color:var(--text-light); margin-bottom:0.3rem;">${order.timestamp}</div>
                <div>${order.itemsSummary}</div>
              </td>
              <td style="font-weight:bold; font-size:1.1rem;">${formatRupiah(order.totalPrice || 0)}</td>
              <td><span class="${badgeClass}">${statusText}</span></td>
              <td>${actionBtn}</td>
            </tr>
          `;
        });

        div.innerHTML += `
          <div style="overflow-x:auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Antrian</th>
                  <th>Meja</th>
                  <th>Detail Pesanan</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      }
    } else {
      div.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div>
            <h3 class="section-subtitle" style="text-align:left; font-size:1.1rem; margin:0;">Kelola Produk</h3>
            <p style="color:var(--text-light); margin:0.5rem 0 0 0;">Tambah, ubah, atau hapus produk yang akan tampil di halaman pemesanan.</p>
          </div>
          <button class="btn-primary" id="add-product-btn" style="padding:0.8rem 1.5rem;">Tambah Produk</button>
        </div>
      `;

      if (products.length === 0) {
        div.innerHTML += `
          <div style="text-align:center; padding: 3rem 0;">
            <p style="color:var(--text-light); font-size:1.2rem;">Belum ada produk terdaftar.</p>
          </div>
        `;
      } else {
        let productRows = '';
        products.forEach(product => {
          productRows += `
            <tr>
              <td>${product.idProduct}</td>
              <td>${product.name}</td>
              <td>${product.description || '-'}</td>
              <td>${formatRupiah(product.price || 0)}</td>
              <td>
                <button class="btn-primary edit-product-btn" data-id="${product.idProduct}" style="margin-right:0.5rem;">Edit</button>
                <button class="btn-danger delete-product-btn" data-id="${product.idProduct}">Hapus</button>
              </td>
            </tr>
          `;
        });

        div.innerHTML += `
          <div style="overflow-x:auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Deskripsi</th>
                  <th>Harga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${productRows}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    div.querySelector('#logout-btn')?.addEventListener('click', () => {
      store.logoutAdmin();
      window.location.hash = '#/';
    });

    div.querySelector('#tab-orders')?.addEventListener('click', async () => {
      activeTab = 'orders';
      await loadOrders();
    });

    div.querySelector('#tab-products')?.addEventListener('click', async () => {
      activeTab = 'products';
      await loadProducts();
    });

    div.querySelector('#add-product-btn')?.addEventListener('click', handleAddProduct);

    div.querySelectorAll('.mark-paid-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        await handleUpdateStatus(id);
      });
    });

    div.querySelectorAll('.edit-product-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        const product = products.find(p => p.idProduct.toString() === id);
        if (product) await handleEditProduct(product);
      });
    });

    div.querySelectorAll('.delete-product-btn').forEach(button => {
      button.addEventListener('click', async () => {
        await handleDeleteProduct(button.dataset.id);
      });
    });
  };

  loadOrders();

  store.subscribe(() => {
    if (activeTab === 'orders') renderDashboard();
  });

  return div;
};
