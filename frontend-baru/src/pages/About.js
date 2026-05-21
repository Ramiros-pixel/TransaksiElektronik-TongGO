export const renderAbout = () => {
  const div = document.createElement('div');
  div.className = 'about-container';
  div.innerHTML = `
    <h2>Tentang Kantin Saung Mangga</h2>
    <p>Kantin Saung Mangga menyajikan berbagai hidangan nusantara dengan resep turun-temurun. Kami menggunakan bahan-bahan segar berkualitas untuk memberikan pengalaman kuliner terbaik bagi Anda.</p>
    
    <h2 style="margin-top: 3rem;">Tim Kami</h2>
    <p>Sistem pemesanan digital ini dikembangkan oleh tim kami untuk memudahkan pelanggan Kantin Saung Mangga dalam melakukan pemesanan tanpa harus antre lama. Kami berdedikasi untuk memberikan solusi teknologi terbaik.</p>
    
    <!-- Secret Admin Link -->
    <button class="admin-secret-btn" onclick="window.location.hash='#/admin-login'">
      Staff Only
    </button>
  `;
  return div;
};
