export const renderHome = () => {
  const div = document.createElement('div');
  
  div.innerHTML = `
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Good Food For<br>Good Health</h1>
        <p>Nikmati hidangan lezat dan sehat yang disiapkan khusus untuk Anda. Pesan sekarang tanpa perlu mengantre lama di kasir!</p>
        <div class="hero-buttons">
          <a href="#/pesan" class="btn-primary rounded">Order Now</a>
          <a href="#about-section" class="btn-outline">About Us</a>
        </div>
        <div class="hero-features">
          <div class="hero-feature">
            <div class="hero-feature-icon">🛵</div>
            <div>
              <strong>Fast Delivery</strong><br>
              <small>Ke meja Anda segera</small>
            </div>
          </div>
          <div class="hero-feature">
            <div class="hero-feature-icon">🍽️</div>
            <div>
              <strong>Dine In</strong><br>
              <small>Nikmati selagi panas</small>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-image-wrapper">
        <div class="hero-shape"></div>
        <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Healthy Food" class="hero-img">
      </div>
    </section>

    <!-- About Section -->
    <section id="about-section" class="about-section">
      <div class="about-images">
        <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Food 1" class="about-img">
        <img src="https://images.unsplash.com/photo-1498837167922-41c53bbf03f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Food 2" class="about-img" style="height:200px">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" alt="Food 3" class="about-img" style="height:200px">
      </div>
      <div class="about-content">
        <h3 class="section-subtitle">About our bistro</h3>
        <h2 class="section-title" style="text-align:left; margin-bottom:1rem;">We Are Kantin Saung Mangga</h2>
        <h4 style="margin-bottom:1rem; color:var(--text-light);">The Delicious Story</h4>
        <p style="color:var(--text-light); margin-bottom:2rem;">Kantin Saung Mangga menyajikan berbagai hidangan sehat dengan resep turun-temurun. Sistem pemesanan digital ini dikembangkan untuk memudahkan Anda dalam memesan hidangan dari meja Anda.</p>
        <a href="#/pesan" class="btn-primary rounded">Read More</a>
      </div>
    </section>

    <!-- Services Section -->
    <section id="services-section" class="services-section">
      <div class="service-card">
        <div class="service-icon">📋</div>
        <h3>Your Order</h3>
        <p style="color:var(--text-light); margin-top:1rem;">Pesan makanan dengan mudah melalui sistem scan QR meja.</p>
      </div>
      <div class="service-card">
        <div class="service-icon">🛵</div>
        <h3>We Deliver</h3>
        <p style="color:var(--text-light); margin-top:1rem;">Makanan akan langsung diantarkan oleh pelayan ke meja Anda.</p>
      </div>
      <div class="service-card">
        <div class="service-icon">🍔</div>
        <h3>Enjoy Fresh Food</h3>
        <p style="color:var(--text-light); margin-top:1rem;">Nikmati hidangan yang dimasak segar dan berkualitas tinggi.</p>
      </div>
    </section>
  `;
  return div;
};
