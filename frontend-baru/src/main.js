import './style.css';
import { store } from './store.js';
import { router } from './router.js';

// Initialize state
store.init();

// Listen to hash changes for routing
window.addEventListener('hashchange', router);

// Setup Mobile Hamburger Menu
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});

// Initial route
router();
