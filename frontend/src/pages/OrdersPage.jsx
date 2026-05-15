import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api/api';
import { toast } from '../components/Toast';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from '../components/Modal';
import './OrdersPage.css';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (dt) => {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const statusBadge = (status) => {
  if (status === null || status === undefined) return <span className="badge badge-warning">⏳ BELUM BAYAR</span>;
  const s = status.toString().toLowerCase();
  if (s === 'paid' || s === '1') return <span className="badge badge-success">✅ SELESAI</span>;
  if (s === 'cancelled' || s === 'cancel' || s === 'failed' || s === '2') return <span className="badge badge-danger">❌ BATAL</span>;
  return <span className="badge badge-warning">⏳ BELUM BAYAR</span>;
};

export default function OrdersPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
    // Check if redirected from successful payment
    if (location.state?.paymentSuccess) {
      setShowSuccess(true);
      // Clear state so modal doesn't reappear on refresh
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = isAdmin()
        ? await orderAPI.getAll()
        : await orderAPI.getByUser(user?.id || 1);
      setOrders(res.data);
    } catch {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pesanan ini?')) return;
    try {
      await orderAPI.delete(id);
      setOrders(prev => prev.filter(o => o.idOrder !== id));
      toast.success('Pesanan dihapus');
    } catch {
      toast.error('Gagal menghapus pesanan');
    }
  };

  const handleDownloadReceipt = (id) => {
    window.open(orderAPI.getReceipt(id), '_blank');
  };

  return (
    <div style={{position:'relative',zIndex:1,paddingBottom:60}}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📋 {isAdmin() ? 'Semua Pesanan' : 'Pesanan Saya'}</h1>
          <p className="page-subtitle">{orders.length} pesanan ditemukan</p>
        </div>

        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-title">Belum ada pesanan</p>
            <p className="empty-desc">Buat pesanan pertamamu dari menu!</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/menu')}>Lihat Menu →</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.idOrder} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-number">{order.orderNumber || `ORD-${order.idOrder}`}</span>
                    <div className="order-meta">
                      🪑 Meja {order.tableId?.tableNumber || order.tableId?.id || '-'} &nbsp;·&nbsp;
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {statusBadge(order.status)}
                    { (order.status?.toString().toLowerCase() !== 'paid' && order.status?.toString() !== '1') ? (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/payment/${order.idOrder}`, { state: { order, total: order.totalPrice } })}
                      >
                        💳 Bayar
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownloadReceipt(order.idOrder)}
                        style={{borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)'}}
                      >
                        📄 Download PDF
                      </button>
                    )}
                    {isAdmin() && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(order.idOrder)}>🗑️</button>
                    )}
                  </div>
                </div>
                
                {order.items && order.items.length > 0 && (
                  <div className="order-items-summary">
                    {order.items.map(item => (
                      <div key={item.id_item_Order} className="order-item-row">
                        <span>{item.productId?.name || 'Produk'}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="order-footer">
                  <span>Total: <strong className="order-total">{formatRupiah(order.totalPrice)}</strong></span>
                  {isAdmin() && order.userId && (
                    <span className="order-user">👤 {order.userId.username}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Payment Modal */}
      <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="🎉 Pembayaran Berhasil!">
        <div style={{textAlign: 'center', padding: '20px 0'}}>
          <div style={{fontSize: '4rem', marginBottom: '20px'}}>✅</div>
          <h2 style={{color: 'var(--success)', marginBottom: '10px'}}>Transaksi Berhasil</h2>
          <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>
            Terima kasih! Pembayaran Anda telah kami terima. 
            Pesanan Anda sekarang berstatus <strong>SELESAI</strong>.
          </p>
          <button className="btn btn-primary btn-full" onClick={() => setShowSuccess(false)}>
            Oke, Lihat Pesanan
          </button>
        </div>
      </Modal>
    </div>
  );
}
