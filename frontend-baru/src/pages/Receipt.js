import { formatRupiah } from '../store.js';

export const renderReceipt = () => {
  const div = document.createElement('div');
  div.className = 'page-container';
  div.style.textAlign = 'center';

  const order = window.lastOrder;
  if (!order) {
    div.innerHTML = `
      <p style="color:var(--text-light); margin-bottom: 2rem;">Data pesanan tidak ditemukan.</p>
      <a href="#/" class="btn-primary rounded">Kembali ke Beranda</a>
    `;
    return div;
  }

  let itemsHtml = '';
  order.items.forEach(i => {
     itemsHtml += `
     <div style="display:flex; justify-content:space-between; margin: 0.8rem 0; font-size: 1rem;">
       <span>${i.qty}x ${i.name}</span>
       <span style="font-weight:600;">${formatRupiah(i.qty * i.price)}</span>
     </div>`;
  });

  div.innerHTML = `
    <h2 class="section-subtitle">Thank You!</h2>
    <h2 class="section-title" style="margin-bottom:2rem;">Pesanan Berhasil Dicatat</h2>
    
    <div class="receipt-queue">
       <p style="font-weight:600; margin:0;">NOMOR ANTRIAN ANDA</p>
       <h1>${order.queueNumber}</h1>
       <div style="background:#fff; display:inline-block; padding:0.5rem 1.5rem; border-radius:30px; font-weight:600; color:var(--text-dark);">
         Meja: ${order.tableNumber}
       </div>
    </div>
    
    <div style="text-align: left; background: var(--bg-light); padding: 2rem; border-radius: 10px; margin-bottom: 2rem;">
       <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 1rem; margin-bottom: 1rem;">Rincian Kwitansi</h3>
       ${itemsHtml}
       <div style="border-top: 1px solid #ddd; margin-top: 1.5rem; padding-top: 1.5rem; display: flex; justify-content: space-between; align-items:center;">
         <span style="font-weight:700;">TOTAL BAYAR</span>
         <h2 style="margin:0; color:var(--primary-dark);">${formatRupiah(order.totalPrice)}</h2>
       </div>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 1.5rem; color: #856404; font-weight: 500; border-radius: 10px; margin-bottom:3rem;">
       ⚠️ PENTING: Silakan tunjukkan layar ini dan lakukan pembayaran ke Kasir agar pesanan segera diproses.
    </div>
    
    <a href="#/" class="btn-outline">Selesai (Kembali ke Beranda)</a>
  `;
  
  return div;
};
