import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminTable() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    tableNumber: '',
    qrIdentify: '',
    isActive: true
  });

  const fetchTables = async () => {
    const token = localStorage.getItem('tonggo_jwt');
    try {
      const response = await fetch('http://localhost:9090/api/tables', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('tonggo_jwt');
    if (!token) {
      navigate('/admin-login');
      return;
    }
    fetchTables();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tonggo_jwt');
    navigate('/');
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ tableNumber: '', qrIdentify: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setIsEditing(true);
    setCurrentId(t.idTable);
    setFormData({
      tableNumber: t.tableNumber,
      qrIdentify: t.qrIdentify || '',
      isActive: t.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus meja ini?')) return;
    const token = localStorage.getItem('tonggo_jwt');
    try {
      const response = await fetch(`http://localhost:9090/api/tables/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchTables();
      } else {
        alert('Gagal menghapus meja. Pastikan meja tidak sedang memiliki pesanan aktif.');
      }
    } catch (err) {
      console.error(err);
      alert('Error koneksi backend');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tonggo_jwt');
    
    const payload = {
      tableNumber: parseInt(formData.tableNumber),
      qrIdentify: formData.qrIdentify.trim(),
      isActive: formData.isActive
    };

    try {
      let url = 'http://localhost:9090/api/tables';
      let method = 'POST';

      if (isEditing) {
        url = `http://localhost:9090/api/tables/${currentId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        fetchTables();
      } else {
        alert('Gagal menyimpan meja');
      }
    } catch (err) {
      console.error(err);
      alert('Error koneksi backend');
    }
  };

  return (
    <div className="page-container" style={{maxWidth:'1000px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem'}}>
        <div>
          <h3 className="section-subtitle" style={{textAlign:'left', fontSize:'1.5rem'}}>Admin Access</h3>
          <h2 style={{fontSize:'2rem', margin:0}}>Manajemen Meja</h2>
        </div>
        <div style={{display:'flex', gap:'1rem'}}>
          <Link to="/admin" className="btn-outline" style={{padding: '0.5rem 1.5rem'}}>Kembali ke Pesanan</Link>
          <button className="btn-outline" onClick={handleLogout} style={{padding: '0.5rem 1.5rem'}}>Logout</button>
        </div>
      </div>

      <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
        <button className="btn-primary rounded" onClick={openAddModal} style={{padding: '0.8rem 1.5rem'}}>+ Tambah Meja</button>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding: '3rem 0'}}>
          <p style={{color:'var(--text-light)'}}>Memuat daftar meja...</p>
        </div>
      ) : tables.length === 0 ? (
        <div style={{textAlign:'center', padding: '3rem 0'}}>
          <p style={{color:'var(--text-light)'}}>Belum ada meja di database.</p>
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nomor Meja</th>
                <th>Kode QR (QR Identify)</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(t => (
                <tr key={t.idTable}>
                  <td>{t.idTable}</td>
                  <td style={{fontWeight:600}}>Meja {t.tableNumber}</td>
                  <td style={{fontFamily:'monospace', color:'var(--primary-dark)'}}>{t.qrIdentify}</td>
                  <td>
                    <span className={t.isActive ? 'badge paid' : 'badge unpaid'}>
                      {t.isActive ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.85rem', marginRight:'0.5rem'}} onClick={() => openEditModal(t)}>Edit</button>
                    <button className="btn-primary" style={{padding:'0.4rem 0.8rem', fontSize:'0.85rem', background:'#d32f2f'}} onClick={() => handleDelete(t.idTable)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD */}
      {showModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'#fff', padding:'2rem', borderRadius:'10px', width:'100%', maxWidth:'400px'}}>
            <h3 style={{marginBottom:'1.5rem', fontSize:'1.5rem'}}>{isEditing ? 'Edit Meja' : 'Tambah Meja Baru'}</h3>
            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              
              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Nomor Meja</label>
                <input type="number" required value={formData.tableNumber} onChange={e => setFormData({...formData, tableNumber: e.target.value})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px'}} placeholder="Contoh: 1" />
              </div>

              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Kode QR (Opsional)</label>
                <input type="text" value={formData.qrIdentify} onChange={e => setFormData({...formData, qrIdentify: e.target.value})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px'}} placeholder="Biarkan kosong agar di-generate otomatis" />
              </div>

              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Status Aktif</label>
                <select value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px'}}>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>

              <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'1rem'}}>
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)} style={{padding:'0.8rem 1.5rem'}}>Batal</button>
                <button type="submit" className="btn-primary rounded" style={{padding:'0.8rem 1.5rem'}}>Simpan</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminTable;
