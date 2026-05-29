import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Order from './pages/Order.jsx'
import Detail from './pages/Detail.jsx'
import Receipt from './pages/Receipt.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import Admin from './pages/Admin.jsx'
import AdminMenu from './pages/AdminMenu.jsx'
import AdminTable from './pages/AdminTable.jsx'

function App() {
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('Pesan Mandiri');
  const [lastOrder, setLastOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = ['/admin-login', '/admin', '/admin-menu', '/admin-tables'].includes(location.pathname);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('active');
  };

  const handleHome = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('active');
  };

  const handleLogout = () => {
    localStorage.removeItem('tonggo_jwt');
    navigate('/admin-login');
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const meja = urlParams.get('meja');
    if (meja) setTableNumber(meja);
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const mapped = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
      return mapped.filter(i => i.qty > 0);
    });
  };

  const clearCart = () => setCart([]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  useEffect(() => {
    const navLinks = document.getElementById('nav-links');
    if (navLinks && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
    }
  }, [location]);

  const toggleMenu = () => {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.toggle('active');
  };

  return (
    <>
      <header className="navbar">
        <div className="logo">
          <a href="/" onClick={handleHome} className="brand-name">Kantin Saung Mangga</a>
        </div>

        {!isAdminPage && (
          <button className="menu-toggle" id="mobile-menu-btn" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        )}

        {!isAdminPage && (
          <nav className="nav-links" id="nav-links">
            <a href="/" onClick={handleHome} className="nav-link">Home</a>
            <a href="#about-section" onClick={(e) => handleScrollTo(e, 'about-section')} className="nav-link">About</a>
            <a href="#services-section" onClick={(e) => handleScrollTo(e, 'services-section')} className="nav-link">Services</a>
            <Link to="/pesan" className="nav-link" onClick={() => document.getElementById('nav-links')?.classList.remove('active')}>Menu</Link>
          </nav>
        )}

        <div className="nav-actions">
          {isAdminPage && location.pathname !== '/admin-login' ? (
            <button className="btn-outline" onClick={handleLogout} style={{padding:'0.5rem 1.5rem'}}>Logout</button>
          ) : !isAdminPage ? (
            <Link to="/pesan" className="btn-primary rounded">Pesan Sekarang</Link>
          ) : null}
        </div>
      </header>

      <main id="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pesan" element={
            <Order
              addToCart={addToCart}
              cart={cart}
              formatRupiah={formatRupiah}
            />
          } />
          <Route path="/detail" element={
            <Detail
              cart={cart}
              updateQty={updateQty}
              clearCart={clearCart}
              tableNumber={tableNumber}
              setTableNumber={setTableNumber}
              formatRupiah={formatRupiah}
              setLastOrder={setLastOrder}
            />
          } />
          <Route path="/receipt" element={
            <Receipt
              lastOrder={lastOrder}
              formatRupiah={formatRupiah}
            />
          } />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin formatRupiah={formatRupiah} />} />
          <Route path="/admin-menu" element={<AdminMenu />} />
          <Route path="/admin-tables" element={<AdminTable />} />
        </Routes>
      </main>

      {location.pathname === '/pesan' && cart.length > 0 && (
        <div className="floating-cart" style={{ animation: 'slideUp 0.3s' }}>
          <div>
            <p style={{ color: 'var(--text-light)', margin: 0 }}>
              {cart.reduce((sum, i) => sum + i.qty, 0)} Item(s)
            </p>
            <div className="cart-total">
              {formatRupiah(cart.reduce((sum, i) => sum + (i.price * i.qty), 0))}
            </div>
          </div>
          <Link to="/detail" className="btn-primary rounded">Lihat Keranjang</Link>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h2 className="brand-name">Kantin Saung Mangga</h2>
            <p>Hidangan sehat dan lezat siap dihidangkan segar setiap hari.</p>
          </div>
          <div className="footer-contact">
            <h3>Hubungi Kami</h3>
            <p>📞 0812-3456-7890</p>
            <p>📍 Jl. Saung Mangga No. 1</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Kantin Saung Mangga. All rights reserved.</p>
        </div>
      </footer>
    </>
  )
}

export default App
