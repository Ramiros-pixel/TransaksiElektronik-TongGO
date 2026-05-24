import { Link } from 'react-router-dom';

function Receipt({ lastOrder, formatRupiah }) {
  if (!lastOrder) {
    return (
      <div className="page-container" style={{textAlign:'center'}}>
        <p style={{color:'var(--text-light)', marginBottom: '2rem'}}>Data pesanan tidak ditemukan.</p>
        <Link to="/" className="btn-primary rounded">Kembali ke Beranda</Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{textAlign:'center'}}>
      <h2 className="section-subtitle">Thank You!</h2>
      <h2 className="section-title" style={{marginBottom:'2rem'}}>Pesanan Berhasil Dicatat</h2>
      
      <div className="receipt-queue">
         <p style={{fontWeight:600, margin:0}}>NOMOR ANTRIAN ANDA</p>
         <h1>{lastOrder.queueNumber}</h1>
         <div style={{background:'#fff', display:'inline-block', padding:'0.5rem 1.5rem', borderRadius:'30px', fontWeight:600, color:'var(--text-dark)'}}>
           Meja: {lastOrder.tableNumber}
         </div>
      </div>
      
      <div style={{textAlign: 'left', background: 'var(--bg-light)', padding: '2rem', borderRadius: '10px', marginBottom: '2rem'}}>
         <h3 style={{borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem'}}>Rincian Kwitansi</h3>
         
         {lastOrder.items.map((i, idx) => (
           <div key={idx} style={{display:'flex', justifyContent:'space-between', margin: '0.8rem 0', fontSize: '1rem'}}>
             <span>{i.qty}x {i.name}</span>
             <span style={{fontWeight:600}}>{formatRupiah(i.qty * i.price)}</span>
           </div>
         ))}
         
         <div style={{borderTop: '1px solid #ddd', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems:'center'}}>
           <span style={{fontWeight:700}}>TOTAL BAYAR</span>
           <h2 style={{margin:0, color:'var(--primary-dark)'}}>{formatRupiah(lastOrder.totalPrice)}</h2>
         </div>
      </div>
      
      <div style={{background: '#fff3cd', border: '1px solid #ffeeba', padding: '1.5rem', color: '#856404', fontWeight: 500, borderRadius: '10px', marginBottom:'3rem'}}>
         ⚠️ PENTING: Silakan tunjukkan layar ini dan lakukan pembayaran ke Kasir agar pesanan segera diproses.
      </div>
      
      <Link to="/" className="btn-outline">Selesai (Kembali ke Beranda)</Link>
    </div>
  );
}

export default Receipt;
