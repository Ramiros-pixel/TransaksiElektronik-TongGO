import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍜</span>
          <span className="logo-text">Tong<span className="logo-accent">Go</span></span>
        </Link>

        {/* Nav Links */}
        {isLoggedIn() && (
          <div className="navbar-links">
            <Link to="/menu" className={isActive('/menu')}>Menu</Link>
            {isAdmin() && <Link to="/admin" className={isActive('/admin')}>Dashboard</Link>}
            <Link to="/orders" className={isActive('/orders')}>Pesanan</Link>
          </div>
        )}

        {/* Right Section */}
        <div className="navbar-right">
          {isLoggedIn() ? (
            <>
              {!isAdmin() && (
                <Link to="/cart" className="cart-btn">
                  🛒
                  {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                </Link>
              )}
              <div className="user-pill">
                {user?.imageUrl ? (
                  <img className="user-avatar-img" src={user.imageUrl} alt={user?.username} />
                ) : (
                  <span className="user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
                )}
                <span className="user-name">{user?.username}</span>
                {isAdmin() && <span className="badge badge-orange" style={{fontSize:'0.65rem'}}>ADMIN</span>}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Keluar</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Masuk</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
