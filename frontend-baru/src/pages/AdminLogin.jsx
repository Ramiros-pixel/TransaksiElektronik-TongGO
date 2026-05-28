import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AdminLogin() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    token: '',
    newPassword: ''
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const modeParam = searchParams.get('mode');
    if (tokenParam && modeParam === 'reset') {
      setMode('reset');
      setFormData(prev => ({ ...prev, token: tokenParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        const response = await fetch('http://localhost:9090/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        if (!response.ok) throw new Error('Email atau password salah');
        
        const data = await response.json();
        localStorage.setItem('tonggo_jwt', data.jwt);
        navigate('/admin');
        
      } else if (mode === 'register') {
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
        setTimeout(() => setMode('login'), 2000);

      } else if (mode === 'forgot') {
        const response = await fetch('http://localhost:9090/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText);
        }

        const data = await response.json();
        if (data.token) {
          // SMTP is not configured on local env, output token for testing
          setSuccessMsg(`${data.message} Gunakan Token: ${data.token}`);
          setFormData(prev => ({ ...prev, token: data.token }));
        } else {
          setSuccessMsg(data.message);
        }

      } else if (mode === 'reset') {
        const response = await fetch('http://localhost:9090/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: formData.token, newPassword: formData.newPassword })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText);
        }

        const data = await response.json();
        setSuccessMsg(data.message);
        setTimeout(() => setMode('login'), 2500);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{textAlign:'center', maxWidth:'500px'}}>
      <h3 className="section-subtitle">
        {mode === 'login' && 'Staff Only'}
        {mode === 'register' && 'Join Team'}
        {mode === 'forgot' && 'Recovery'}
        {mode === 'reset' && 'Create New'}
      </h3>
      <h2 className="section-title" style={{marginBottom:'1rem'}}>
        {mode === 'login' && 'Admin Login'}
        {mode === 'register' && 'Daftar Admin'}
        {mode === 'forgot' && 'Lupa Password'}
        {mode === 'reset' && 'Reset Password'}
      </h2>
      <p style={{color:'var(--text-light)', marginBottom:'2rem'}}>
        {mode === 'login' && 'Silakan login dengan akun yang terdaftar.'}
        {mode === 'register' && 'Buat akun admin baru.'}
        {mode === 'forgot' && 'Masukkan email terdaftar untuk menerima token reset password.'}
        {mode === 'reset' && 'Masukkan token reset dan password baru Anda.'}
      </p>

      <form onSubmit={handleAuth} style={{display:'flex', flexDirection:'column', gap:'1.2rem'}}>
        {mode === 'register' && (
          <input 
            type="text" name="username" placeholder="Username" required 
            value={formData.username} onChange={handleChange}
            style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
          />
        )}
        
        {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
          <input 
            type="email" name="email" placeholder="Email" required 
            value={formData.email} onChange={handleChange}
            style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
          />
        )}

        {(mode === 'login' || mode === 'register') && (
          <input 
            type="password" name="password" placeholder="Password" required 
            value={formData.password} onChange={handleChange}
            style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
          />
        )}

        {mode === 'reset' && (
          <>
            <input 
              type="text" name="token" placeholder="Token Reset Password" required 
              value={formData.token} onChange={handleChange}
              style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
            />
            <input 
              type="password" name="newPassword" placeholder="Password Baru" required 
              value={formData.newPassword} onChange={handleChange}
              style={{padding:'1rem', border:'2px solid #ddd', borderRadius:'10px', fontSize:'1.1rem'}} 
            />
          </>
        )}
        
        {errorMsg && <p style={{color:'#d32f2f', fontWeight:600, margin:0}}>{errorMsg}</p>}
        {successMsg && <p style={{color:'#2e7d32', fontWeight:600, margin:0}}>{successMsg}</p>}
        
        <button type="submit" className="btn-primary rounded" disabled={loading} style={{padding:'1rem', fontSize:'1.1rem'}}>
          {loading ? 'Memproses...' : (
            mode === 'login' ? 'Masuk' : 
            mode === 'register' ? 'Daftar' : 
            mode === 'forgot' ? 'Kirim Token Reset' : 'Simpan Password Baru'
          )}
        </button>
      </form>

      <div style={{marginTop:'2rem', display:'flex', flexDirection:'column', gap:'0.8rem', alignItems:'center'}}>
        {mode === 'login' && (
          <>
            <span 
              onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{color:'var(--primary-dark)', fontWeight:'bold', cursor:'pointer', fontSize:'0.95rem'}}
            >
              Lupa Password?
            </span>
            <p style={{margin:0, color:'var(--text-light)'}}>
              Belum punya akun?{' '}
              <span 
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }} 
                style={{color:'var(--primary-dark)', fontWeight:'bold', cursor:'pointer'}}
              >
                Daftar di sini
              </span>
            </p>
          </>
        )}

        {mode === 'register' && (
          <p style={{margin:0, color:'var(--text-light)'}}>
            Sudah punya akun?{' '}
            <span 
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{color:'var(--primary-dark)', fontWeight:'bold', cursor:'pointer'}}
            >
              Login di sini
            </span>
          </p>
        )}

        {mode === 'forgot' && (
          <>
            <span 
              onClick={() => { setMode('reset'); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{color:'var(--primary-dark)', fontWeight:'bold', cursor:'pointer', fontSize:'0.95rem'}}
            >
              Punya token reset? Masukkan token di sini
            </span>
            <span 
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} 
              style={{color:'var(--text-light)', cursor:'pointer', fontSize:'0.95rem', textDecoration:'underline'}}
            >
              Kembali ke Login
            </span>
          </>
        )}

        {mode === 'reset' && (
          <span 
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} 
            style={{color:'var(--text-light)', cursor:'pointer', fontSize:'0.95rem', textDecoration:'underline'}}
          >
            Kembali ke Login
          </span>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
