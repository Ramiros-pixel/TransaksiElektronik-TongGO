import { useEffect, useState } from 'react';
import { productAPI } from '../api/api';
import ProductCard from '../components/ProductCard';
import { toast } from '../components/Toast';
import './MenuPage.css';

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch {
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="menu-page" style={{position:'relative',zIndex:1}}>
      <div className="container">
        <div className="page-header">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
            <div>
              <h1 className="page-title">🍽️ Menu Kami</h1>
              <p className="page-subtitle">{products.length} menu tersedia — pilih favoritmu!</p>
            </div>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                id="menu-search"
                type="text"
                className="form-input search-input"
                placeholder="Cari menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p className="empty-title">Menu tidak ditemukan</p>
            <p className="empty-desc">Coba kata kunci yang lain</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(p => (
              <ProductCard key={p.idProduct} product={p} isAdmin={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
