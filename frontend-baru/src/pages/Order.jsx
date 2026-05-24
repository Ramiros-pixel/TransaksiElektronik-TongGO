import { useState, useEffect } from 'react';

function Order({ addToCart, formatRupiah }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/products/display');
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data.map(item => {
            // Parse description to extract stock status if exists
            let desc = item.description || '';
            let stockStatus = 'READY';
            if (desc.includes('||')) {
              const parts = desc.split('||');
              desc = parts[0].trim();
              stockStatus = parts[1].trim().toUpperCase();
            }

            return {
              id: item.idProduct,
              name: item.name,
              price: item.price,
              description: desc,
              stock: stockStatus
            };
          }));
        } else {
          throw new Error('Gagal memuat dari backend');
        }
      } catch (err) {
        console.error('Menggunakan data dummy', err);
        setMenuItems([
          { id: 1, name: 'Fresh Salad Bowl', price: 45000, description: 'Salad segar dengan ayam.', stock: 'READY' },
          { id: 2, name: 'Muffins', price: 20000, description: 'Muffin coklat lembut.', stock: 'HABIS' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenu();
  }, []);

  const handleAdd = (item) => {
    addToCart(item);
    const container = document.getElementById('toast-container');
    if(container) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.style.background = 'var(--primary-color)';
      toast.style.color = '#000';
      toast.style.padding = '1rem 2rem';
      toast.style.borderRadius = '30px';
      toast.style.fontWeight = 'bold';
      toast.style.position = 'fixed';
      toast.style.bottom = '80px';
      toast.style.right = '20px';
      toast.style.zIndex = '9999';
      toast.textContent = `${item.name} ditambahkan!`;
      container.appendChild(toast);
      setTimeout(() => container.contains(toast) && container.removeChild(toast), 3000);
    }
  };

  return (
    <div className="menu-section">
      <h3 className="section-subtitle">Fresh and healthy dishes</h3>
      <h2 className="section-title">Our Mouth Watering Menus</h2>
      
      {loading ? (
        <p style={{textAlign:'center'}}>Memuat menu dari database...</p>
      ) : (
        <div className="menu-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {menuItems.map(item => {
            const isHabis = item.stock === 'HABIS';
            return (
              <div key={item.id} className="menu-item" style={{ padding: '1.5rem', opacity: isHabis ? 0.6 : 1 }}>
                <div className="menu-item-content" style={{ padding: 0 }}>
                  <div className="menu-item-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="menu-item-title" style={{ margin: 0, fontSize: '1.3rem' }}>{item.name}</h3>
                    {isHabis && (
                      <span style={{ background: '#d32f2f', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        HABIS
                      </span>
                    )}
                  </div>
                  <p className="menu-item-desc" style={{ minHeight: '3rem', marginBottom: '1.5rem' }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <button 
                       className="btn-outline menu-item-btn" 
                       onClick={() => handleAdd(item)}
                       disabled={isHabis}
                       style={{ opacity: isHabis ? 0.5 : 1, cursor: isHabis ? 'not-allowed' : 'pointer' }}
                     >
                       {isHabis ? 'Sold Out' : 'Order Now'}
                     </button>
                     <span className="menu-item-price" style={{ fontSize: '1.2rem' }}>{formatRupiah(item.price)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Order;
