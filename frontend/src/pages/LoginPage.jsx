import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Isi semua field!'); return; }
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { jwt, id, username, role } = res.data;
      login(jwt, { id, username, role });
      toast.success(`Selamat datang, ${username}! 👋`);
      navigate(role === 'ADMIN' ? '/admin' : '/menu');
    } catch (err) {
      toast.error(err.response?.data || 'Login gagal. Periksa email & password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">🍜 TongGo</div>
        <h2 className="auth-title">Masuk ke Akun</h2>
        <p className="auth-sub">Selamat datang kembali!</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Masukkan email..."
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Masukkan password..."
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="btn-login">
            {loading ? <><span className="spinner" style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'white'}} /> Memproses...</> : 'Masuk →'}
          </button>
        </form>

        <div className="divider">atau</div>
        <p className="auth-footer">
          Belum punya akun? <Link to="/register" className="auth-link">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
