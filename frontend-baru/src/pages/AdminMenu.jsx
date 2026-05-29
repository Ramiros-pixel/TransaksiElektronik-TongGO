import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function AdminMenu() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: 'READY'
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/products/display');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
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
    fetchProducts();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('tonggo_jwt');
    navigate('/');
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ name: '', price: '', description: '', stock: 'READY' });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setIsEditing(true);
    setCurrentId(p.idProduct);
    
    let desc = p.description || '';
    let stock = 'READY';
    if (desc.includes('||')) {
      const parts = desc.split('||');
      desc = parts[0].trim();
      stock = parts[1].trim().toUpperCase();
    }

    setFormData({
      name: p.name,
      price: p.price,
      description: desc,
      stock: stock
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus menu ini?')) return;
    const token = localStorage.getItem('tonggo_jwt');
    try {
      const response = await fetch(`http://localhost:9090/api/products/hapus/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchProducts();
      } else {
        alert('Gagal menghapus produk');
      }
    } catch (err) {
      console.error(err);
      alert('Error koneksi backend');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tonggo_jwt');
    
    // Encode stock into description
    const payloadDesc = `${formData.description.trim()} || ${formData.stock}`;
    
    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      description: payloadDesc
    };

    try {
      let url = 'http://localhost:9090/api/products/tambah';
      let method = 'POST';

      if (isEditing) {
        url = `http://localhost:9090/api/products/ubah/${currentId}`;
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
        fetchProducts();
      } else {
        alert('Gagal menyimpan produk');
      }
    } catch (err) {
      console.error(err);
      alert('Error koneksi backend');
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  return (
    <div className="page-container" style={{maxWidth:'1000px'}}>
      <div className="admin-header">
        <div>
          <h3 className="section-subtitle" style={{textAlign:'left', fontSize:'1.5rem'}}>Admin Access</h3>
          <h2 style={{fontSize:'2rem', margin:0}}>Manajemen Menu</h2>
        </div>
        <div className="admin-header-actions">
          <Link to="/admin" className="btn-outline">Kembali ke Pesanan</Link>
        </div>
      </div>

      <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end'}}>
        <button className="btn-primary rounded" onClick={openAddModal} style={{padding: '0.8rem 1.5rem'}}>+ Tambah Menu</button>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding: '3rem 0'}}>
          <p style={{color:'var(--text-light)'}}>Memuat daftar menu...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{textAlign:'center', padding: '3rem 0'}}>
          <p style={{color:'var(--text-light)'}}>Belum ada menu di database.</p>
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Menu</th>
                <th>Harga</th>
                <th>Status Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                let desc = p.description || '';
                let stockStatus = 'READY';
                if (desc.includes('||')) {
                  stockStatus = desc.split('||')[1].trim().toUpperCase();
                }

                return (
                  <tr key={p.idProduct}>
                    <td data-label="ID">{p.idProduct}</td>
                    <td data-label="Nama" style={{fontWeight:600}}>{p.name}</td>
                    <td data-label="Harga" style={{fontWeight:'bold'}}>{formatRupiah(p.price)}</td>
                    <td data-label="Stok">
                      <span className={stockStatus === 'READY' ? 'badge paid' : 'badge unpaid'}>
                        {stockStatus}
                      </span>
                    </td>
                    <td data-label="Aksi">
                      <button className="btn-outline" style={{padding:'0.4rem 0.8rem', fontSize:'0.85rem', marginRight:'0.5rem'}} onClick={() => openEditModal(p)}>Edit</button>
                      <button className="btn-primary" style={{padding:'0.4rem 0.8rem', fontSize:'0.85rem', background:'#d32f2f'}} onClick={() => handleDelete(p.idProduct)}>Hapus</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD */}
      {showModal && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'#fff', padding:'2rem', borderRadius:'10px', width:'100%', maxWidth:'500px'}}>
            <h3 style={{marginBottom:'1.5rem', fontSize:'1.5rem'}}>{isEditing ? 'Edit Menu' : 'Tambah Menu Baru'}</h3>
            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              
              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Nama Menu</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px'}} />
              </div>

              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Harga (Rp)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px'}} />
              </div>

              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Deskripsi</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px', minHeight:'80px'}} />
              </div>

              <div>
                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:600}}>Status Stok</label>
                <select value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={{width:'100%', padding:'0.8rem', border:'1px solid #ddd', borderRadius:'8px'}}>
                  <option value="READY">Ready Stock</option>
                  <option value="HABIS">Habis</option>
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

export default AdminMenu;
