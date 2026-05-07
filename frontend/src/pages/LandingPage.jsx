import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const features = [
  { icon: '🍜', title: 'Menu Lengkap', desc: 'Berbagai pilihan makanan & minuman tersedia setiap hari' },
  { icon: '🛒', title: 'Pesan Mudah', desc: 'Tambahkan ke keranjang dan checkout dalam hitungan detik' },
  { icon: '💳', title: 'Bayar Aman', desc: 'Transaksi aman dengan Midtrans Payment Gateway' },
  { icon: '📋', title: 'Lacak Pesanan', desc: 'Pantau status pesanan Anda secara real-time' },
];

export default function LandingPage() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-circles">
          <div className="circle c1" />
          <div className="circle c2" />
          <div className="circle c3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span>🔥</span> Sistem Pemesanan Modern
          </div>
          <h1 className="hero-title">
            Pesan Makanan<br />
            <span className="gradient-text">Lebih Mudah & Cepat</span>
          </h1>
          <p className="hero-desc">
            TongGo menghadirkan pengalaman memesan makanan yang seamless.<br />
            Dari memilih menu hingga pembayaran, semua dalam satu platform.
          </p>
          <div className="hero-actions">
            {isLoggedIn() ? (
              <Link to="/menu" className="btn btn-primary btn-lg">
                🍽️ Lihat Menu
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Mulai Sekarang →
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Masuk
                </Link>
              </>
            )}
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">50+</span>
              <span className="stat-label">Menu Tersedia</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">1000+</span>
              <span className="stat-label">Transaksi Berhasil</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">99%</span>
              <span className="stat-label">Kepuasan Pelanggan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Kenapa Memilih TongGo?</h2>
            <p>Platform transaksi elektronik terpercaya untuk kebutuhan restoran Anda</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-glow" />
            <h2>Siap Memulai?</h2>
            <p>Daftar sekarang dan nikmati kemudahan pemesanan digital</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Daftar Gratis →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
