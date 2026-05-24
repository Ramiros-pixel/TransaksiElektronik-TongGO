import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Good Food For<br />Good Health</h1>
          <p>Nikmati hidangan lezat dan sehat yang disiapkan khusus untuk Anda. Pesan sekarang tanpa perlu mengantre lama di kasir!</p>
          <div className="hero-buttons">
            <Link to="/pesan" className="btn-primary rounded">Order Now</Link>
            <a href="#about-section" className="btn-outline">About Us</a>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon">🛵</div>
              <div>
                <strong>Fast Delivery</strong><br />
                <small>Ke meja Anda segera</small>
              </div>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon">🍽️</div>
              <div>
                <strong>Dine In</strong><br />
                <small>Nikmati selagi panas</small>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <div className="hero-shape"></div>
          <img src="https://img.freepik.com/free-vector/floating-burger-cartoon-vector-icon-illustration-food-object-icon-concept-isolated-premium-vector-flat-cartoon-style_138676-4235.jpg?w=800" alt="Cartoon Food" className="hero-img" style={{mixBlendMode: 'multiply'}} />
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="about-section">
        <div className="about-images" style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <img src="https://img.freepik.com/free-vector/flying-slice-pizza-cartoon-vector-illustration-fast-food-concept-isolated-vector-flat-cartoon-style_138676-1934.jpg?w=400" alt="Food 1" className="about-img" style={{mixBlendMode: 'multiply'}} />
          <img src="https://img.freepik.com/free-vector/cute-french-fries-cartoon-vector-icon-illustration-food-object-icon-concept-isolated-premium-flat_138676-6468.jpg?w=400" alt="Food 2" className="about-img" style={{ height: '200px', mixBlendMode: 'multiply' }} />
          <img src="https://img.freepik.com/free-vector/cute-hot-dog-cartoon-vector-icon-illustration-food-object-icon-concept-isolated-premium-flat_138676-5972.jpg?w=400" alt="Food 3" className="about-img" style={{ height: '200px', mixBlendMode: 'multiply' }} />
        </div>
        <div className="about-content">
          <h3 className="section-subtitle">About our bistro</h3>
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>We Are Kantin Saung Mangga</h2>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>The Delicious Story</h4>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Kantin Saung Mangga menyajikan berbagai hidangan sehat dengan resep turun-temurun. Sistem pemesanan digital ini dikembangkan untuk memudahkan Anda dalam memesan hidangan dari meja Anda.</p>
          <Link to="/pesan" className="btn-primary rounded">Read More</Link>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="services-section">
        <div className="service-card">
          <div className="service-icon">📋</div>
          <h3>Your Order</h3>
          <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Pesan makanan dengan mudah melalui sistem scan QR meja.</p>
        </div>
        <div className="service-card">
          <div className="service-icon">🛵</div>
          <h3>We Deliver</h3>
          <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Makanan akan langsung diantarkan oleh pelayan ke meja Anda.</p>
        </div>
        <div className="service-card">
          <div className="service-icon">🍔</div>
          <h3>Enjoy Fresh Food</h3>
          <p style={{ color: 'var(--text-light)', marginTop: '1rem' }}>Nikmati hidangan yang dimasak segar dan berkualitas tinggi.</p>
        </div>
      </section>
    </>
  );
}

export default Home;
