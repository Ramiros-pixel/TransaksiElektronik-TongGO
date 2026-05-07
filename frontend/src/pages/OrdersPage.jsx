import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../api/api';
import { toast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const formatDate = (dt) => {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
};

const statusBadge = (status) => {
  if (!status) return <span className="badge badge-warning">PENDING</span>;
  const s = status.toString().toUpperCase();
  if (s === 'PAID') return <span className="badge badge-success">✅ LUNAS</span>;
  return <span className="badge badge-warning">⏳ BELUM BAYAR</span>;
};

export default function OrdersPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
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
                    {order.status !== 'PAID' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/payment/${order.idOrder}`, { state: { order, total: order.totalPrice } })}
                      >
                        💳 Bayar
                      </button>
                    )}
                    {isAdmin() && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(order.idOrder)}>🗑️</button>
                    )}
                  </div>
                </div>
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
    </div>
  );
}
