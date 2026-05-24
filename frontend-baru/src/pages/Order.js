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

  // Re-render items if store finishes fetching async
  store.subscribe(renderItems);

  // Event delegation for Add buttons
  div.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-btn')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      const item = store.menuItems.find(i => i.idProduct === id);
      store.addToCart(item);
      showToast(`${item.name} ditambahkan!`);
      renderFloatingBar();
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
