import { store } from '../store.js';

export const renderAdminLogin = () => {
  const div = document.createElement('div');
  div.className = 'page-container';
  div.style.textAlign = 'center';
  div.style.maxWidth = '500px';

  if (store.isAdminLoggedIn) {
    window.location.hash = '#/admin';
    return div;
  }

  const renderForm = (isLogin) => {
    let formHtml = '';
    
    if (isLogin) {
      formHtml = `
        <h3 class="section-subtitle">Staff Only</h3>
        <h2 class="section-title" style="margin-bottom:1rem;">Admin Login</h2>
        <p style="color:var(--text-light); margin-bottom:2rem;">Silakan login dengan akun yang terdaftar.</p>
        
        <div style="display:flex; flex-direction:column; gap:1.2rem;">
          <input type="email" id="login-email" placeholder="Email" class="auth-input">
          <input type="password" id="login-password" placeholder="Password" class="auth-input">
          <p id="auth-error" style="color: #d32f2f; display: none; font-weight: 600; margin:0;"></p>
          <button class="btn-primary rounded" id="btn-submit-login" style="padding:1rem; font-size:1.1rem;">Masuk</button>
        </div>
        <p style="margin-top:2rem; color:var(--text-light);">Belum punya akun? <a href="javascript:void(0)" id="toggle-register" style="color:var(--primary-dark); font-weight:bold;">Daftar di sini</a></p>
      `;
    } else {
      formHtml = `
        <h3 class="section-subtitle">Join Team</h3>
        <h2 class="section-title" style="margin-bottom:1rem;">Daftar Admin</h2>
        
        <div style="display:flex; flex-direction:column; gap:1.2rem;">
          <input type="text" id="reg-username" placeholder="Username" class="auth-input">
          <input type="email" id="reg-email" placeholder="Email" class="auth-input">
          <input type="password" id="reg-password" placeholder="Password" class="auth-input">
          <p id="auth-error" style="color: #d32f2f; display: none; font-weight: 600; margin:0;"></p>
          <p id="auth-success" style="color: #2e7d32; display: none; font-weight: 600; margin:0;"></p>
          <button class="btn-primary rounded" id="btn-submit-register" style="padding:1rem; font-size:1.1rem;">Daftar</button>
        </div>
        <p style="margin-top:2rem; color:var(--text-light);">Sudah punya akun? <a href="javascript:void(0)" id="toggle-login" style="color:var(--primary-dark); font-weight:bold;">Login di sini</a></p>
      `;
    }
    
    div.innerHTML = `
      <style>
        .auth-input {
          padding: 1rem; border: 2px solid #ddd; border-radius: 10px; font-size: 1.1rem; outline: none; transition: border 0.3s; width: 100%;
        }
        .auth-input:focus { border-color: var(--primary-color); }
      </style>
      ${formHtml}
    `;

    // Attach Listeners
    if (isLogin) {
      div.querySelector('#toggle-register').addEventListener('click', () => renderForm(false));
      div.querySelector('#btn-submit-login').addEventListener('click', async () => {
        const email = div.querySelector('#login-email').value;
        const pass = div.querySelector('#login-password').value;
        const errEl = div.querySelector('#auth-error');
        
        const btn = div.querySelector('#btn-submit-login');
        btn.textContent = "Loading..."; btn.disabled = true;
        
        const res = await store.loginAdmin(email, pass);
        if (res.success) {
          window.location.hash = '#/admin';
        } else {
          errEl.textContent = res.message || "Gagal login!";
          errEl.style.display = 'block';
          btn.textContent = "Masuk"; btn.disabled = false;
        }
      });
    } else {
      div.querySelector('#toggle-login').addEventListener('click', () => renderForm(true));
      div.querySelector('#btn-submit-register').addEventListener('click', async () => {
        const user = div.querySelector('#reg-username').value;
        const email = div.querySelector('#reg-email').value;
        const pass = div.querySelector('#reg-password').value;
        const errEl = div.querySelector('#auth-error');
        const succEl = div.querySelector('#auth-success');
        
        errEl.style.display = 'none';
        succEl.style.display = 'none';
        
        const btn = div.querySelector('#btn-submit-register');
        btn.textContent = "Loading..."; btn.disabled = true;
        
        const res = await store.registerAdmin(user, email, pass);
        if (res.success) {
          succEl.textContent = "Berhasil daftar! Silakan login.";
          succEl.style.display = 'block';
          setTimeout(() => renderForm(true), 2000);
        } else {
          errEl.textContent = res.message || "Gagal register!";
          errEl.style.display = 'block';
          btn.textContent = "Daftar"; btn.disabled = false;
        }
      });
    }
  };

  renderForm(true); // Start with Login view

  return div;
};
