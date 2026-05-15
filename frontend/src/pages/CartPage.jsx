import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI, cartAPI } from '../api/api';
import { toast } from '../components/Toast';
import './CartPage.css';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const FOOD_EMOJIS = ['🍜', '🍛', '🍱', '🍣', '🥗', '🍔', '🌮', '🍝', '🥘', '🍲'];

export default function CartPage() {
  const { cartItems, removeFromCart, updateQty, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tableId, setTableId] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) { toast.error('Keranjang masih kosong!'); return; }
    if (!tableId || isNaN(tableId)) { toast.error('Nomor meja tidak valid'); return; }
    setLoading(true);
    try {
      // 1. Create order first
      if (!user?.id) {
        toast.error('Sesi login tidak valid atau kadaluarsa. Silakan Logout dan Login kembali.');
        return;
      }
      const orderRes = await orderAPI.create(user.id, parseInt(tableId));
      const order = orderRes.data;

      // 2. Add items to the created order
      for (const item of cartItems) {
        await cartAPI.add({ 
          orderId: order.idOrder, 
          productId: item.idProduct, 
          quantity: item.qty 
        });
      }

      toast.success('Pesanan berhasil dibuat! 🎉');
      clearCart();
      
      // Meneruskan data order dan total harga ke halaman pembayaran
      navigate(`/payment/${order.idOrder}`, { state: { order, total: totalPrice } });
    } catch (err) {
      toast.error(err.response?.data || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{position:'relative',zIndex:1}}>
        <div className="container">
          <div className="empty-state" style={{paddingTop: 100}}>
            <div className="empty-icon">🛒</div>
            <p className="empty-title">Keranjang Kosong</p>
            <p className="empty-desc">Belum ada item yang ditambahkan</p>
            <button className="btn btn-primary mt-4" onClick={() => navigate('/menu')}>
              Lihat Menu →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{position:'relative',zIndex:1}}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🛒 Keranjang</h1>
          <p className="page-subtitle">{totalItems} item dipilih</p>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map(item => {
              const emoji = FOOD_EMOJIS[item.idProduct % FOOD_EMOJIS.length];
              return (
                <div key={item.idProduct} className="cart-item">
                  <div className="cart-item-img">{emoji}</div>
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <span className="cart-item-price">{formatRupiah(item.price)}</span>
                  </div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.idProduct, item.qty - 1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.idProduct, item.qty + 1)}>+</button>
                  </div>
                  <div className="cart-item-subtotal">
                    {formatRupiah(item.price * item.qty)}
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.idProduct)}>🗑️</button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>Ringkasan Pesanan</h3>
            <div className="summary-rows">
              {cartItems.map(item => (
                <div key={item.idProduct} className="summary-row">
                  <span>{item.name} ×{item.qty}</span>
                  <span>{formatRupiah(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <span className="total-price">{formatRupiah(totalPrice)}</span>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">🪑 Nomor Meja</label>
              <input
                id="table-id"
                type="number"
                className="form-input"
                value={tableId}
                onChange={e => setTableId(e.target.value)}
                min="1"
                placeholder="Masukkan nomor meja..."
              />
            </div>

            <button
              id="btn-checkout"
              className="btn btn-primary btn-full btn-lg mt-4"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Memproses...' : '💳 Lanjut ke Pembayaran'}
            </button>
            <button className="btn btn-ghost btn-full mt-2" onClick={() => clearCart()}>
              Kosongkan Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
