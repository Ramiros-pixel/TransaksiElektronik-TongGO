import { store, formatRupiah } from '../store.js';
import { router } from '../router.js';

export const renderDetail = () => {
  const div = document.createElement('div');
  div.className = 'page-container';

  if (store.cart.length === 0) {
    div.innerHTML = `
      <div style="text-align:center; padding: 3rem 0;">
        <h2 class="section-title">Keranjang Kosong</h2>
        <p style="color:var(--text-light); margin-bottom: 2rem;">Anda belum memilih hidangan apapun.</p>
        <a href="#/pesan" class="btn-primary rounded">Lihat Menu</a>
      </div>
    `;
    return div;
  }

  let html = `<h2 class="section-subtitle">Your Order</h2><h2 class="section-title" style="margin-bottom:1rem;">Pesanan Anda</h2>`;
  
  html += `<div class="order-list">`;
  store.cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    html += `
      <div class="order-row">
        <div>
          <h3 style="font-size:1.1rem; margin-bottom:0.3rem;">${item.name}</h3>
          <p style="color:var(--text-light); font-size:0.9rem; margin:0;">${item.qty} x ${formatRupiah(item.price)}</p>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
          <strong style="font-size:1.1rem;">${formatRupiah(itemTotal)}</strong>
          <div class="qty-controls">
             <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
             <span style="font-weight:bold;">${item.qty}</span>
             <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  html += `
    <div style="background:var(--bg-light); padding:1.5rem; border-radius:10px; margin-bottom:2rem;">
      <p style="color:var(--text-light); margin:0;">Nomor Meja Anda:</p>
      <h3 style="color:var(--primary-dark); font-size:1.5rem; margin:0;">${store.tableNumber}</h3>
    </div>
    
    <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #eee; padding-top:1.5rem;">
      <div>
        <p style="color:var(--text-light); margin:0;">Total Pembayaran</p>
        <h2 style="font-size:1.8rem; margin:0;">${formatRupiah(store.getTotalPrice())}</h2>
      </div>
      <button class="btn-primary rounded confirm-btn" style="padding:1rem 2rem; font-size:1.1rem;">Konfirmasi Pesanan</button>
    </div>
  `;

  div.innerHTML = html;

  div.addEventListener('click', async (e) => {
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
      e.target.disabled = true;
      e.target.textContent = 'Menyambungkan ke Server...';
      e.target.style.opacity = '0.7';
      
      const orderSummary = await store.checkoutAPI();
      
      if (orderSummary) {
        window.lastOrder = orderSummary;
        window.location.hash = '#/receipt';
      } else {
        e.target.disabled = false;
        e.target.textContent = 'Konfirmasi Pesanan';
        e.target.style.opacity = '1';
      }
    }
  });

  return div;
};
