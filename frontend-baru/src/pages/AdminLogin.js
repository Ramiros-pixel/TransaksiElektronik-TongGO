import { store } from '../store.js';

export const renderAdminLogin = () => {
  const div = document.createElement('div');
  div.className = 'detail-container';
  div.style.textAlign = 'center';

  // If already logged in, redirect to admin dashboard
  if (store.isAdminLoggedIn) {
    window.location.hash = '#/admin';
    return div;
  }

  div.innerHTML = `
    <h2 class="detail-title">Kasir / Admin Login</h2>
    <p style="font-size: 1.2rem; color: #555;">Silakan masukkan PIN untuk mengakses dashboard kasir.</p>
    
    <div class="login-form">
      <input type="password" id="admin-pin" placeholder="Masukkan PIN (1234)" autofocus>
      <button class="btn-primary" id="login-btn">Masuk</button>
    </div>
    <p id="login-error" style="color: red; display: none; font-weight: bold;">PIN Salah!</p>
  `;

  div.addEventListener('click', (e) => {
    if (e.target.id === 'login-btn') {
      const pin = div.querySelector('#admin-pin').value;
      const success = store.loginAdmin(pin);
      if (success) {
        window.location.hash = '#/admin';
      } else {
        div.querySelector('#login-error').style.display = 'block';
        div.querySelector('#admin-pin').value = '';
      }
    }
  });
  
  // Allow Enter key
  div.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'admin-pin') {
      div.querySelector('#login-btn').click();
    }
  });

  return div;
};
