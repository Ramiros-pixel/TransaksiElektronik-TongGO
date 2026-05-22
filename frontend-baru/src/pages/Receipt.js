import { formatRupiah } from '../store.js';

export const renderReceipt = () => {
  const div = document.createElement('div');
  div.className = 'detail-container';
  div.style.textAlign = 'center';

  const order = window.lastOrder;
  if (!order) {
    div.innerHTML = `
      <p style="font-size: 1.2rem; margin-bottom: 2rem;">Data pesanan tidak ditemukan atau sesi telah berakhir.</p>
      <a href="#/" class="btn-primary">Kembali ke Beranda</a>
    `;
    return div;
  }

  let itemsHtml = '';
  order.items.forEach(i => {
     itemsHtml += `
     <div style="display:flex; justify-content:space-between; margin: 0.5rem 0; font-size: 1.1rem;">
       <span>${i.qty}x ${i.name}</span>
       <span>${formatRupiah(i.qty * i.price)}</span>
     </div>`;
  });

  div.innerHTML = `
    <h2 style="color: #000; font-size: 2.5rem; margin-bottom: 0.5rem; text-shadow: 2px 2px 0px var(--primary-color);">Terima Kasih!</h2>
    <p style="font-size: 1.3rem; margin-bottom: 2rem;">Pesanan Anda telah dicatat.</p>
    
    <div style="background: var(--primary-color); border: 2px solid #000; padding: 2rem; border-radius: 8px; box-shadow: 6px 6px 0px #000; display: inline-block; width: 100%; max-width: 400px; margin-bottom: 2rem;">
       <p style="font-weight: bold; font-size: 1.2rem; margin-bottom: 0.5rem;">NOMOR ANTRIAN ANDA</p>
       <h1 style="font-size: 4rem; margin: 0; background: #fff; border: 2px solid #000; display: inline-block; padding: 0.5rem 2rem; transform: rotate(-2deg); box-shadow: 3px 3px 0px #000;">${order.queueNumber}</h1>
       <p style="margin-top: 1.5rem; font-size: 1.3rem; font-weight: bold; background: #fff; display: inline-block; padding: 0.2rem 1rem; border: 2px solid #000;">Meja: ${order.tableNumber}</p>
    </div>
    
    <div style="text-align: left; background: #fafafa; padding: 1.5rem; border: 2px dashed #000; margin-bottom: 2rem;">
       <h3 style="border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 1.5rem;">Kwitansi Pemesanan</h3>
       ${itemsHtml}
       <div style="border-top: 2px solid #000; margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; font-weight: bold; font-size: 1.4rem;">
         <span>TOTAL BAYAR</span>
         <span style="background: var(--primary-color); padding: 0 0.5rem; border: 1px solid #000;">${formatRupiah(order.totalPrice)}</span>
       </div>
    </div>
    
    <div style="background: #ffebee; border: 2px solid #cc0000; padding: 1rem; color: #cc0000; font-weight: bold; font-size: 1.2rem; box-shadow: 4px 4px 0px #cc0000; transform: rotate(1deg);">
       ⚠️ PENTING: Silakan tunjukkan layar ini dan lakukan pembayaran ke Kasir agar pesanan segera diproses.
    </div>
    
    <div style="margin-top: 3.5rem;">
      <a href="#/" class="btn-primary">Selesai (Kembali ke Beranda)</a>
    </div>
  `;
  
  return div;
};
