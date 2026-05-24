import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const response = await fetch('http://localhost:9090/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        if (!response.ok) throw new Error('Email atau password salah');
        
        const data = await response.json();
        localStorage.setItem('tonggo_jwt', data.jwt);
        navigate('/admin');
        
      } else {
        const response = await fetch('http://localhost:9090/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: formData.username, email: formData.email, password: formData.password })
        });
        
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText);
        }
        
        setSuccessMsg('Berhasil mendaftar! Silakan login.');
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{textAlign:'center', maxWidth:'500px'}}>
      <h3 className="section-subtitle">{isLogin ? 'Staff Only' : 'Join Team'}</h3>
      <h2 className="section-title" style={{marginBottom:'1rem'}}>{isLogin ? 'Admin Login' : 'Daftar Admin'}</h2>
      <p style={{color:'var(--text-light)', marginBottom:'2rem'}}>
        {isLogin ? 'Silakan login dengan akun yang terdaftar.' : 'Buat akun admin baru.'}
      </p>

      <form onSubmit={handleAuth} style={{display:'flex', flexDirection:'column', gap:'1.2rem'}}>
        {!isLogin && (
          <input 
            type="text" name="username" placeholder="Username" required 
            value={formData.username} onChange={handleChange}
            style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
          />
        )}
        <input 
          type="email" name="email" placeholder="Email" required 
          value={formData.email} onChange={handleChange}
          style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
        />
        <input 
          type="password" name="password" placeholder="Password" required 
          value={formData.password} onChange={handleChange}
          style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
        />
        
        {errorMsg && <p style={{color:'#d32f2f', fontWeight:600, margin:0}}>{errorMsg}</p>}
        {successMsg && <p style={{color:'#2e7d32', fontWeight:600, margin:0}}>{successMsg}</p>}
        
        <button type="submit" className="btn-primary rounded" disabled={loading} style={{padding:'1rem', fontSize:'1.1rem'}}>
          {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
        </button>
      </form>

      <p style={{marginTop:'2rem', color:'var(--text-light)'}}>
        {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <span 
          onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); setSuccessMsg(''); }} 
          style={{color:'var(--primary-dark)', fontWeight:'bold', cursor:'pointer'}}
        >
          {isLogin ? 'Daftar di sini' : 'Login di sini'}
        </span>
      </p>
    </div>
  );
}

export default AdminLogin;
