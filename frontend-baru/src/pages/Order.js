import { store, formatRupiah } from '../store.js';

const showToast = (message) => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.background = 'var(--primary-color)';
  toast.style.color = '#000';
  toast.style.padding = '1rem 2rem';
  toast.style.borderRadius = '30px';
  toast.style.fontWeight = 'bold';
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '9999';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, 3000);
};

export const renderOrder = () => {
  const div = document.createElement('div');
  div.className = 'menu-section';
  
  div.innerHTML = `
    <h3 class="section-subtitle">Fresh and healthy dishes</h3>
    <h2 class="section-title">Our Mouth Watering Menus</h2>
    <div class="menu-grid" id="menu-grid">
      <!-- Menus injected here -->
    </div>
  `;

  // Render menu items
  const renderItems = () => {
    const grid = div.querySelector('#menu-grid');
    grid.innerHTML = '';
    
    if (store.menuItems.length === 0) {
      grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Memuat menu dari database...</p>';
      return;
    }

    store.menuItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-item';
      card.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="menu-item-img">
        <div class="menu-item-content">
          <div class="menu-item-header">
            <h3 class="menu-item-title">${item.name}</h3>
          </div>
          <p class="menu-item-desc">${item.description}</p>
          <div style="display:flex; justify-content:space-between; align-items:center;">
             <button class="btn-outline menu-item-btn add-btn" data-id="${item.id}">Order Now</button>
             <span class="menu-item-price">${formatRupiah(item.price)}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  renderItems();

  // Re-render items if store finishes fetching async
  store.subscribe(renderItems);

  // Event delegation for Add buttons
  div.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      const item = store.menuItems.find(i => i.id === id);
      if(item) {
        store.addToCart(item);
        showToast(`${item.name} ditambahkan!`);
        renderFloatingBar();
      }
    }
  });

  setTimeout(renderFloatingBar, 100);

  return div;
};

export const renderFloatingBar = () => {
  let floatingBar = document.getElementById('global-floating-bar');
  const totalItems = store.getTotalItems();
  
  if (totalItems === 0) {
    if (floatingBar) floatingBar.remove();
    return;
  }

  if (!floatingBar) {
    floatingBar = document.createElement('div');
    floatingBar.id = 'global-floating-bar';
    floatingBar.className = 'floating-cart';
    document.body.appendChild(floatingBar);
  }

  floatingBar.innerHTML = `
    <div>
      <p style="color:var(--text-light); margin:0;">${totalItems} Item(s)</p>
      <div class="cart-total">${formatRupiah(store.getTotalPrice())}</div>
    </div>
    <a href="#/detail" class="btn-primary rounded">Lihat Keranjang</a>
  `;
};
