import { store, formatRupiah } from '../store.js';
import { router } from '../router.js';

export const renderAdmin = () => {
  const div = document.createElement('div');
  
  if (!store.isAdminLoggedIn) {
    window.location.hash = '#/admin-login';
    return div;
  }

  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
      <h2 class="detail-title" style="margin:0; border:none; padding:0;">Dashboard Kasir</h2>
      <button class="btn-primary" id="logout-btn" style="padding: 0.5rem 1rem; font-size: 1rem;">Logout</button>
    </div>
  `;

  if (store.orders.length === 0) {
    div.innerHTML += `<p style="font-size:1.2rem; color:#555;">Belum ada pesanan yang masuk.</p>`;
  } else {
    let rowsHtml = '';
    store.orders.forEach(order => {
      const isPaid = order.status === 'PAID';
      const badgeClass = isPaid ? 'badge paid' : 'badge unpaid';
      const statusText = isPaid ? 'LUNAS' : 'BELUM BAYAR';
      const actionBtn = isPaid 
        ? `<span style="color:#aaa;">Selesai</span>` 
        : `<button class="action-btn mark-paid-btn" data-id="${order.id}">Tandai Lunas</button>`;
      
      // Calculate total items summary
      const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');

      rowsHtml += `
        <tr>
          <td><strong style="font-size:1.2rem;">${order.queueNumber}</strong></td>
          <td>${order.tableNumber}</td>
          <td style="font-size:0.9rem;">${order.timestamp}<br/><small style="color:#666;">${itemsSummary}</small></td>
          <td style="font-weight:bold;">${formatRupiah(order.totalPrice)}</td>
          <td><span class="${badgeClass}">${statusText}</span></td>
          <td>${actionBtn}</td>
        </tr>
      `;
    });

    div.innerHTML += `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Antrian</th>
              <th>Meja</th>
              <th>Waktu & Pesanan</th>
              <th>Total Harga</th>
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

  div.addEventListener('click', (e) => {
    if (e.target.id === 'logout-btn') {
      store.logoutAdmin();
      window.location.hash = '#/';
    }
    
    if (e.target.classList.contains('mark-paid-btn')) {
      const id = e.target.getAttribute('data-id');
      if (confirm('Tandai pesanan ini sebagai LUNAS?')) {
        store.markOrderAsPaid(id);
        router(); // Refresh view
      }
    }
  });

  return div;
};
