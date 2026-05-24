import { store, formatRupiah } from '../store.js';
import { router } from '../router.js';

export const renderDetail = () => {
  const div = document.createElement('div');
  div.className = 'detail-container';

  if (store.cart.length === 0) {
    div.innerHTML = `
      <h2 class="detail-title">Detail Pesanan</h2>
      <p style="text-align:center; color:#555; margin: 3rem 0; font-size:1.3rem;">Belum ada pesanan.</p>
      <div style="text-align:center;"><a href="#/pesan" class="btn-primary">Kembali ke Menu</a></div>
    `;
    return div;
  }

  let html = `<h2 class="detail-title">Detail Pesanan</h2>`;
  
  store.cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    html += `
      <div class="order-item">
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-qty-price">${item.qty} x ${formatRupiah(item.price)}</div>
          <div class="qty-controls">
             <button class="qty-btn dec-btn" data-id="${item.idProduct}">-</button>
             <span>${item.qty}</span>
             <button class="qty-btn inc-btn" data-id="${item.idProduct}">+</button>
          </div>
        </div>
        <div class="item-total">${formatRupiah(itemTotal)}</div>
      </div>
    `;
  });

  html += `
    <div class="table-info">
      <p>Nomor Meja Anda:</p>
      <h3>${store.tableNumber}</h3>
      <small style="color:#555;">(Berdasarkan scan QR Code / Mandiri)</small>
    </div>
    
    <div class="checkout-section">
      <div>
        <div style="font-size:1.1rem; color:#555; font-weight:bold;">Total Pembayaran:</div>
        <div class="grand-total">${formatRupiah(store.getTotalPrice())}</div>
      </div>
      <button class="btn-primary confirm-btn">Konfirmasi Pesanan</button>
    </div>
  `;

  div.innerHTML = html;

  div.addEventListener('click', (e) => {
    if (e.target.classList.contains('inc-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      store.updateQty(id, 1);
      router();
    }
    if (e.target.classList.contains('dec-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      store.updateQty(id, -1);
      router();
    }
    if (e.target.classList.contains('confirm-btn')) {
      const order = store.checkout();
      if (order) {
        window.lastOrder = order; // temporary variable for the receipt page to read
        window.location.hash = '#/receipt';
      }
    }
  });

  return div;
};
