import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../api/api';
import { toast } from '../components/Toast';
import './PaymentPage.css';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const statusInfo = {
  pending:    { icon: '⏳', label: 'Menunggu Pembayaran', cls: 'warning' },
  settlement: { icon: '✅', label: 'Pembayaran Berhasil', cls: 'success' },
  expire:     { icon: '⌛', label: 'Kadaluarsa', cls: 'danger' },
  cancel:     { icon: '❌', label: 'Dibatalkan', cls: 'danger' },
  failed:     { icon: '❌', label: 'Gagal', cls: 'danger' },
};

export default function PaymentPage() {
  const { orderId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const total = state?.total || 0;

  useEffect(() => {
    if (orderId) fetchStatus();
  }, [orderId]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getStatus(orderId);
      setPayment(res.data);
    } catch {
      // no payment yet — that's OK
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await paymentAPI.process({
        orderId: parseInt(orderId),
        amount: total,
        customerName: 'Guest',
        customerEmail: 'guest@tonggo.id',
        paymentType: 'snap',
      });
      const { redirectUrl, snapToken } = res.data;

      if (redirectUrl) {
        toast.success('Mengarahkan ke halaman pembayaran...');
        window.open(redirectUrl, '_blank');
      } else if (snapToken && window.snap) {
        window.snap.pay(snapToken, {
          onSuccess: () => { toast.success('Pembayaran berhasil! 🎉'); navigate('/orders'); },
          onPending: () => toast.info('Pembayaran sedang diproses'),
          onError: () => toast.error('Pembayaran gagal'),
          onClose: () => toast.info('Jendela pembayaran ditutup'),
        });
      } else {
        toast.info('Transaksi diproses. Silakan cek status di halaman pesanan.');
        navigate('/orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const st = payment ? (statusInfo[payment.paymentStatus] || statusInfo.pending) : null;

  return (
    <div className="payment-page" style={{position:'relative',zIndex:1}}>
      <div className="container">
        <div className="payment-wrap">
          {/* Header */}
          <div className="payment-header">
            <h1>💳 Pembayaran</h1>
            <p className="page-subtitle">Order #{orderId}</p>
          </div>

          {/* Status Card (if payment exists) */}
          {loading && <div className="loading-center"><div className="spinner" /></div>}

          {payment && st && (
            <div className={`status-card status-${st.cls}`}>
              <span className="status-icon">{st.icon}</span>
              <div>
                <div className="status-label">{st.label}</div>
                {payment.paymentType && <div className="status-meta">via {payment.paymentType}</div>}
              </div>
            </div>
          )}

          {/* Payment Box */}
          <div className="payment-box">
            <div className="payment-amount-label">Total Pembayaran</div>
            <div className="payment-amount">{formatRupiah(total)}</div>

            <div className="payment-info-rows">
              <div className="info-row">
                <span>Order ID</span>
                <span className="mono">#{orderId}</span>
              </div>
              {payment?.midtransId && (
                <div className="info-row">
                  <span>Midtrans ID</span>
                  <span className="mono">{payment.midtransId}</span>
                </div>
              )}
              {payment?.paymentMethod && (
                <div className="info-row">
                  <span>Metode</span>
                  <span>{payment.paymentMethod}</span>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            {!payment || payment.paymentStatus === 'pending' ? (
              <>
                <div className="payment-methods">
                  <div className="pm-card pm-active">💳 Kartu Kredit</div>
                  <div className="pm-card">🏦 Transfer Bank</div>
                  <div className="pm-card">📱 E-Wallet</div>
                  <div className="pm-card">🏪 Minimarket</div>
                </div>
                <button
                  id="btn-pay"
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handlePay}
                  disabled={processing}
                  style={{marginTop: 24}}
                >
                  {processing ? 'Memproses...' : '🔒 Bayar Sekarang'}
                </button>
              </>
            ) : (
              <button className="btn btn-outline btn-full mt-4" onClick={() => navigate('/orders')}>
                Lihat Pesanan Saya
              </button>
            )}

            <button className="btn btn-ghost btn-full" style={{marginTop:10}} onClick={() => navigate('/orders')}>
              ← Kembali ke Pesanan
            </button>
          </div>

          <p className="payment-note">
            🔒 Transaksi aman diproses oleh Midtrans Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );
}
