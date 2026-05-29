import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin({ formatRupiah }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('tonggo_jwt');
    if (!token) {
      navigate('/admin-login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/orders/list', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('tonggo_jwt');
          navigate('/admin-login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setOrders(data.map(o => ({
            id: o.idOrder,
            queueNumber: o.queueNumber || o.orderNumber || `A-${o.idOrder}`,
            tableNumber: o.tableId ? o.tableId.tableNumber : '-',
            totalPrice: o.totalPrice,
            status: o.status === 'paid' || o.status === 'PAID' ? 'PAID' : 'UNPAID',
            isDelivered: o.isDelivered,
            timestamp: o.createdAt || new Date().toLocaleString(),
            itemsSummary: 'Lihat detail backend...' 
          })));
        }
      } catch (err) {
        console.error('Error fetching admin orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Optional: Auto refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tonggo_jwt');
    navigate('/');
  };

  const handleMarkPaid = async (id) => {
    try {
      const response = await fetch(`http://localhost:9090/api/orders/${id}/status?status=paid`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tonggo_jwt')}`
        }
      });
      if (!response.ok) alert('Gagal mengubah status pesanan');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      const response = await fetch(`http://localhost:9090/api/orders/${id}/delivery?delivered=true`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tonggo_jwt')}`
        }
      });
      if (!response.ok) alert('Gagal mengubah status antar');
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetQueue = async () => {
    if (!window.confirm('Yakin ingin mereset antrian ke angka 1? (Biasanya dilakukan di pagi hari)')) return;
    try {
      const response = await fetch(`http://localhost:9090/api/orders/reset-queue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tonggo_jwt')}`
        }
      });
      if (response.ok) alert('Antrian berhasil direset!');
      else alert('Gagal mereset antrian');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container" style={{maxWidth:'1000px'}}>
      <div className="admin-header">
        <div>
          <h3 className="section-subtitle" style={{textAlign:'left', fontSize:'1.5rem'}}>Admin Access</h3>
          <h2 style={{fontSize:'2rem', margin:0}}>Dashboard Kasir (Live)</h2>
        </div>
        <div className="admin-header-actions">
          <button className="btn-primary rounded" onClick={handleResetQueue} style={{background:'#d32f2f', color:'#fff'}}>Reset Antrian</button>
          <button className="btn-primary rounded" onClick={() => navigate('/admin-menu')}>Manajemen Menu</button>
          <button className="btn-primary rounded" onClick={() => navigate('/admin-tables')}>Manajemen Meja</button>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding: '3rem 0'}}>
          <p style={{color:'var(--text-light)', fontSize:'1.2rem'}}>Memuat daftar pesanan dari server...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{textAlign:'center', padding: '3rem 0'}}>
          <p style={{color:'var(--text-light)', fontSize:'1.2rem'}}>Belum ada pesanan yang masuk hari ini.</p>
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
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
              {orders.map(order => {
                const isPaid = order.status === 'PAID';
                return (
                  <tr key={order.id}>
                    <td data-label="Antrian"><strong style={{fontSize:'1.2rem', color:'var(--primary-dark)'}}>{order.queueNumber}</strong></td>
                    <td data-label="Meja" style={{fontWeight:600}}>{order.tableNumber}</td>
                    <td data-label="Detail" style={{fontSize:'0.9rem'}}>
                       <div style={{color:'var(--text-light)', marginBottom:'0.3rem'}}>{order.timestamp}</div>
                       <div>{order.itemsSummary}</div>
                    </td>
                    <td data-label="Total" style={{fontWeight:'bold', fontSize:'1.1rem'}}>{formatRupiah(order.totalPrice)}</td>
                    <td data-label="Status">
                      <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                        <span className={isPaid ? 'badge paid' : 'badge unpaid'} style={{textAlign:'center'}}>
                          {isPaid ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                        <span className={order.isDelivered ? 'badge paid' : 'badge unpaid'} style={{textAlign:'center'}}>
                          {order.isDelivered ? 'DIANTAR' : 'BELUM DIANTAR'}
                        </span>
                      </div>
                    </td>
                    <td data-label="Aksi">
                      <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
                        {!isPaid && (
                          <button className="btn-primary" onClick={() => handleMarkPaid(order.id)} style={{padding:'0.4rem 1rem', fontSize:'0.85rem'}}>
                            Tandai Lunas
                          </button>
                        )}
                        {!order.isDelivered && (
                          <button className="btn-outline" onClick={() => handleMarkDelivered(order.id)} style={{padding:'0.4rem 1rem', fontSize:'0.85rem'}}>
                            Tandai Diantar
                          </button>
                        )}
                        {isPaid && order.isDelivered && (
                          <span style={{color:'var(--text-light)', fontWeight:600}}>Selesai</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
