import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

function Detail({ cart, updateQty, clearCart, tableNumber, setTableNumber, formatRupiah, setLastOrder }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);

  const totalPrice = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  useEffect(() => {
    let html5QrCode = null;
    if (scanning) {
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode("reader");
          
          const qrCodeSuccessCallback = (decodedText) => {
            let tableNum = decodedText;
            try {
              if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                const parsedUrl = new URL(decodedText);
                const mejaParam = parsedUrl.searchParams.get('meja');
                if (mejaParam) {
                  tableNum = mejaParam;
                }
              }
            } catch (e) {
              console.error("Failed to parse URL from QR", e);
            }

            setTableNumber(tableNum);
            setScanning(false);
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().catch(err => console.error("Failed to stop scanning", err));
            }
          };

          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 220, height: 220 }
            },
            qrCodeSuccessCallback,
            (errorMessage) => {
              // Frame failures can be silently ignored
            }
          ).catch((err) => {
            console.error("Failed to start camera scan:", err);
          });
        } catch (e) {
          console.error("Error creating QR scanner:", e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          try {
            if (html5QrCode.isScanning) {
              html5QrCode.stop().catch(err => console.error("Failed to stop scanning on cleanup", err));
            }
          } catch (e) {
            console.error("Cleanup error:", e);
          }
        }
      };
    }
  }, [scanning, setTableNumber]);

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
      alert("Error menghubungi backend: " + err.message + "\n\nMenggunakan Mode Offline Sementara.");
      
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

      {/* Table Number Setup with Scan QR */}
      <div style={{background:'var(--bg-light)', padding:'1.5rem', borderRadius:'15px', marginBottom:'2rem', border:'1px solid #e2ebd5'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
          <div>
            <p style={{color:'var(--text-light)', margin:0, fontSize:'0.95rem'}}>Nomor Meja Anda:</p>
            <h3 style={{color:'var(--primary-dark)', fontSize:'1.6rem', margin:0, fontWeight:700}}>
              {tableNumber === 'Pesan Mandiri' ? 'Pesan Mandiri' : `Meja ${tableNumber}`}
            </h3>
          </div>
          <button 
            type="button" 
            className="btn-primary rounded" 
            onClick={() => setScanning(true)}
            style={{padding:'0.6rem 1.2rem', fontSize:'0.95rem', display:'flex', alignItems:'center', gap:'0.5rem'}}
          >
            📷 Scan QR Meja
          </button>
        </div>

        <div style={{borderTop:'1px solid #eee', paddingTop:'1rem', display:'flex', alignItems:'center', gap:'1rem'}}>
          <span style={{fontSize:'0.95rem', color:'var(--text-light)'}}>Atau input manual:</span>
          <input 
            type="text" 
            placeholder="No Meja" 
            value={tableNumber === 'Pesan Mandiri' ? '' : tableNumber}
            onChange={(e) => setTableNumber(e.target.value || 'Pesan Mandiri')}
            style={{width:'90px', padding:'0.5rem', border:'2px solid #ccc', borderRadius:'8px', fontSize:'1rem', textAlign:'center', fontWeight:'bold'}}
          />
        </div>
      </div>

      {/* Camera Scanning Overlay */}
      {scanning && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.8)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'1rem'}}>
          <div style={{background:'#fff', padding:'2rem', borderRadius:'15px', width:'100%', maxWidth:'420px', textAlign:'center', boxShadow:'0 10px 25px rgba(0,0,0,0.3)'}}>
            <h3 style={{marginBottom:'0.5rem', fontSize:'1.4rem'}}>Scan QR Code Meja</h3>
            <p style={{color:'var(--text-light)', fontSize:'0.9rem', marginBottom:'1.5rem'}}>Arahkan kamera Anda ke QR Code Meja yang tersedia</p>
            
            <div id="reader" style={{width:'100%', maxWidth:'320px', margin:'0 auto 1.5rem auto', borderRadius:'10px', overflow:'hidden', border:'2px solid var(--primary-dark)'}}></div>
            
            <button 
              type="button" 
              className="btn-outline" 
              onClick={() => setScanning(false)}
              style={{padding:'0.8rem 2rem', fontSize:'1rem', width:'100%', borderRadius:'10px'}}
            >
              Batal
            </button>
          </div>
        </div>
      )}
      
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
