import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { toast } from '../components/Toast';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { toast.error('Isi semua field!'); return; }
    if (form.password.length < 6) { toast.error('Password minimal 6 karakter'); return; }
    setLoading(true);
    try {
      await authAPI.register({ ...form, role: 'USER' });
      toast.success('Registrasi berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data || 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow" />
      <div className="auth-card" style={{maxWidth: 440}}>
        <div className="auth-logo">🍜 TongGo</div>
        <h2 className="auth-title">Buat Akun Baru</h2>
        <p className="auth-sub">Mulai perjalanan kuliner Anda</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input id="reg-username" name="username" type="text" className="form-input"
              placeholder="Pilih username unik..." value={form.username} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="reg-email" name="email" type="email" className="form-input"
              placeholder="email@contoh.com" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" name="password" type="password" className="form-input"
              placeholder="Minimal 6 karakter..." value={form.password} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="btn-register">
            {loading ? 'Memproses...' : 'Daftar Sekarang →'}
          </button>
        </form>

        <div className="divider">atau</div>
        <p className="auth-footer">
          Sudah punya akun? <Link to="/login" className="auth-link">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}
