import { renderHome } from './pages/Home.js';
import { renderOrder } from './pages/Order.js';
import { renderDetail } from './pages/Detail.js';
import { renderAbout } from './pages/About.js';
import { renderReceipt } from './pages/Receipt.js';
import { renderAdminLogin } from './pages/AdminLogin.js';
import { renderAdmin } from './pages/Admin.js';

export const router = () => {
  const container = document.getElementById('app-container');
  const hash = window.location.hash || '#/';

  // Clear container
  container.innerHTML = '';

  switch (hash) {
    case '#/':
      container.appendChild(renderHome());
      break;
    case '#/pesan':
      container.appendChild(renderOrder());
      break;
    case '#/detail':
      container.appendChild(renderDetail());
      break;
    case '#/receipt':
      container.appendChild(renderReceipt());
      break;
    case '#/about':
      container.appendChild(renderAbout());
      break;
    case '#/admin-login':
      container.appendChild(renderAdminLogin());
      break;
    case '#/admin':
      container.appendChild(renderAdmin());
      break;
    default:
      container.appendChild(renderHome());
  }
  
  // Clean up floating bar if we are not on the order page
  if (hash !== '#/pesan') {
    const floatingBar = document.getElementById('global-floating-bar');
    if (floatingBar) floatingBar.remove();
  }
  
  // Close mobile menu if open when route changes
  const navLinks = document.getElementById('nav-links');
  if (navLinks && navLinks.classList.contains('active')) {
    navLinks.classList.remove('active');
  }
};
