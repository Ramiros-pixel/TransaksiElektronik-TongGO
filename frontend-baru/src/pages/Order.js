import { store, formatRupiah } from '../store.js';

const showToast = (message) => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, 3000);
};

export const renderOrder = () => {
  const div = document.createElement('div');
  
  const title = document.createElement('h2');
  title.textContent = 'Menu Kami';
  title.style.marginBottom = '0.5rem';
  title.style.color = 'var(--primary-color)';
  div.appendChild(title);

  if (store.tableNumber) {
    const tableInfo = document.createElement('p');
    tableInfo.style.cssText = 'margin-bottom:1.5rem; font-weight:600; color:green;';
    tableInfo.textContent = `🪑 Meja ${store.tableNumber} terdeteksi`;
    div.appendChild(tableInfo);
  }

  const grid = document.createElement('div');
  grid.className = 'menu-grid';

  store.menuItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-img">🍽️</div>
      <div class="menu-info">
        <h3 class="menu-name">${item.name}</h3>
        <p class="menu-price">${formatRupiah(item.price)}</p>
        <button class="add-btn" data-id="${item.idProduct}">Tambah Pesanan</button>
      </div>
    `;
    grid.appendChild(card);
  });

  div.appendChild(grid);

  // Event delegation for Add buttons
  grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      const item = store.menuItems.find(i => i.idProduct === id);
      store.addToCart(item);
      showToast(`${item.name} ditambahkan!`);
      renderFloatingBar();
    }
  });

  // Initial render of floating bar if cart has items
  setTimeout(renderFloatingBar, 0);

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
    floatingBar.className = 'floating-bar';
    document.body.appendChild(floatingBar);
  }

  floatingBar.innerHTML = `
    <div class="floating-info">
      <span class="floating-label">${totalItems} Item(s) ditambahkan</span>
      <span class="floating-total">${formatRupiah(store.getTotalPrice())}</span>
    </div>
    <a href="#/detail" class="btn-primary" style="padding: 0.5rem 1.5rem;">Lihat Detail</a>
  `;
};
