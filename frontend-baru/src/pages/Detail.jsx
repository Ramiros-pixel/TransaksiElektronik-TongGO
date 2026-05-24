import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Detail({ cart, updateQty, clearCart, tableNumber, formatRupiah, setLastOrder }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    let tId = parseInt(tableNumber);
    if (isNaN(tId)) tId = 1;

    try {
      // 1. Create Order
      const initResp = await fetch(`http://localhost:9090/api/orders/init?tableId=${tId}`, {
        method: 'POST'
      });
      
      if (!initResp.ok) throw new Error('Meja tidak valid atau belum terdaftar di database Admin. Silakan hubungi Kasir.');
      
      const orderData = await initResp.json();
      const orderId = orderData.idOrder;
      const orderNum = orderData.queueNumber || orderData.orderNumber || `A-${orderId}`;
      
      // 2. Add Items
      for (const item of cart) {
        await fetch(`http://localhost:9090/api/keranjang/tambah`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
            productId: item.id,
            quantity: item.qty
          })
        });
      }
      
      setLastOrder({
        queueNumber: orderNum,
        tableNumber: tableNumber,
        items: [...cart],
        totalPrice: totalPrice
      });
      
      clearCart();
      navigate('/receipt');

    } catch (err) {
      console.error(err);
      alert("Error menghubungi backend: " + err.message + "\\n\\nMenggunakan Mode Offline Sementara.");
      
      setLastOrder({
        queueNumber: `A-999 (Offline)`,
        tableNumber: tableNumber,
        items: [...cart],
        totalPrice: totalPrice
      });
      clearCart();
      navigate('/receipt');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page-container" style={{textAlign:'center', padding:'3rem 0'}}>
        <h2 className="section-title">Keranjang Kosong</h2>
        <p style={{color:'var(--text-light)', marginBottom: '2rem'}}>Anda belum memilih hidangan apapun.</p>
        <Link to="/pesan" className="btn-primary rounded">Lihat Menu</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="section-subtitle">Your Order</h2>
      <h2 className="section-title" style={{marginBottom:'1rem'}}>Pesanan Anda</h2>
      
      <div className="order-list">
        {cart.map(item => (
          <div key={item.id} className="order-row">
            <div>
              <h3 style={{fontSize:'1.1rem', marginBottom:'0.3rem'}}>{item.name}</h3>
              <p style={{color:'var(--text-light)', fontSize:'0.9rem', margin:0}}>
                {item.qty} x {formatRupiah(item.price)}
              </p>
            </div>
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem'}}>
              <strong style={{fontSize:'1.1rem'}}>{formatRupiah(item.price * item.qty)}</strong>
              <div className="qty-controls">
                 <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                 <span style={{fontWeight:'bold'}}>{item.qty}</span>
                 <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'var(--bg-light)', padding:'1.5rem', borderRadius:'10px', marginBottom:'2rem'}}>
        <p style={{color:'var(--text-light)', margin:0}}>Nomor Meja Anda:</p>
        <h3 style={{color:'var(--primary-dark)', fontSize:'1.5rem', margin:0}}>{tableNumber}</h3>
      </div>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'2px solid #eee', paddingTop:'1.5rem'}}>
        <div>
          <p style={{color:'var(--text-light)', margin:0}}>Total Pembayaran</p>
          <h2 style={{fontSize:'1.8rem', margin:0}}>{formatRupiah(totalPrice)}</h2>
        </div>
        <button 
          className="btn-primary rounded" 
          style={{padding:'1rem 2rem', fontSize:'1.1rem', opacity: isProcessing ? 0.7 : 1}} 
          onClick={handleCheckout}
          disabled={isProcessing}
        >
          {isProcessing ? 'Memproses API...' : 'Konfirmasi Pesanan'}
        </button>
      </div>
    </div>
  );
}

export default Detail;
