import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { productAPI, orderAPI, tableAPI, detectionAPI } from '../../api/api';
import ProductCard from '../../components/ProductCard';
import Modal from '../../components/Modal';
import { toast } from '../../components/Toast';
import './AdminDashboard.css';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

const emptyForm = { name: '', price: '', description: '' };

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadingP, setLoadingP] = useState(true);
  const [loadingO, setLoadingO] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  
  const [tableModal, setTableModal] = useState(false);
  const [editTableTarget, setEditTableTarget] = useState(null);
  const emptyTableForm = { tableNumber: '', qrIdentify: '', isActive: true };
  const [tableForm, setTableForm] = useState(emptyTableForm);

  const [qrModal, setQrModal] = useState(false);
  const [qrTable, setQrTable] = useState(null);

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [detectionLoading, setDetectionLoading] = useState(false);
  const [latestScan, setLatestScan] = useState(null);
  
  const [orderItemsModal, setOrderItemsModal] = useState(false);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentOrderNum, setCurrentOrderNum] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchTables();
  }, []);

  const fetchProducts = async () => {
    setLoadingP(true);
    try {
      const res = await productAPI.getAll();
      setProducts(res.data);
    } catch { toast.error('Gagal memuat produk'); }
    finally { setLoadingP(false); }
  };

  const fetchOrders = async () => {
    setLoadingO(true);
    try {
      const res = await orderAPI.getAll();
      setOrders(res.data);
    } catch { toast.error('Gagal memuat pesanan'); }
    finally { setLoadingO(false); }
  };

  const fetchTables = async () => {
    setLoadingT(true);
    try {
      const res = await tableAPI.getAll();
      setTables(res.data);
    } catch { toast.error('Gagal memuat meja'); }
    finally { setLoadingT(false); }
  };

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p) => { setEditTarget(p); setForm({ name: p.name, price: p.price, description: p.description }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) { toast.error('Isi semua field!'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editTarget) {
        await productAPI.update(editTarget.idProduct, payload);
        toast.success('Produk diperbarui!');
      } else {
        await productAPI.create(payload);
        toast.success('Produk ditambahkan!');
      }
      setModal(false);
      fetchProducts();
    } catch { toast.error('Gagal menyimpan produk'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus produk ini?')) return;
    try {
      await productAPI.delete(id);
      setProducts(prev => prev.filter(p => p.idProduct !== id));
      toast.success('Produk dihapus');
    } catch { toast.error('Gagal menghapus produk'); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Hapus pesanan ini?')) return;
    try {
      await orderAPI.delete(id);
      setOrders(prev => prev.filter(o => o.idOrder !== id));
      toast.success('Pesanan dihapus');
    } catch { toast.error('Gagal menghapus pesanan'); }
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    if (!tableForm.tableNumber) { toast.error('Nomor meja wajib diisi!'); return; }
    setSaving(true);
    try {
      const payload = { ...tableForm, tableNumber: parseInt(tableForm.tableNumber) };
      if (editTableTarget) {
        await tableAPI.update(editTableTarget.idTable, payload);
        toast.success('Meja diperbarui!');
      } else {
        await tableAPI.create(payload);
        toast.success('Meja ditambahkan!');
      }
      setTableModal(false);
      fetchTables();
    } catch (err) { 
      console.error("Table Save Error:", err);
      toast.error('Gagal: ' + (err.response?.data?.message || err.message || 'Error tidak diketahui')); 
    }
    finally { setSaving(false); }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Hapus meja ini?')) return;
    try {
      await tableAPI.delete(id);
      setTables(prev => prev.filter(t => t.idTable !== id));
      toast.success('Meja dihapus');
    } catch { toast.error('Gagal menghapus meja'); }
  };

  const handleShowDetails = async (order) => {
    setLoadingItems(true);
    setCurrentOrderNum(order.orderNumber || `ORD-${order.idOrder}`);
    setOrderItemsModal(true);
    try {
      const res = await orderAPI.getItems(order.idOrder);
      setSelectedOrderItems(res.data);
    } catch {
      toast.error('Gagal memuat detail pesanan');
    } finally {
      setLoadingItems(false);
    }
  };

  const openAddTable = () => { setEditTableTarget(null); setTableForm(emptyTableForm); setTableModal(true); };
  const openEditTable = (t) => { setEditTableTarget(t); setTableForm({ tableNumber: t.tableNumber, qrIdentify: t.qrIdentify || '', isActive: t.isActive }); setTableModal(true); };

  const totalRevenue = orders
    .filter(o => o.status?.toString().toLowerCase() === 'paid' || o.status?.toString() === '1')
    .reduce((s, o) => s + (o.totalPrice || 0), 0);

  const API_BASE = 'http://localhost:8080';

  const paidCount = orders.filter(o => o.status?.toString().toLowerCase() === 'paid' || o.status?.toString() === '1').length;
  const unpaidCount = orders.filter(o => o.status?.toString().toLowerCase() !== 'paid' && o.status?.toString() !== '1').length;

  return (
    <div className="admin-page" style={{ position: 'relative', zIndex: 1 }}>
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">⚙️ Admin Dashboard</h1>
          <p className="page-subtitle">Kelola produk dan pantau semua transaksi</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-primary)' }}>🍽️</div>
            <div className="stat-card-body">
              <div className="stat-card-num">{products.length}</div>
              <div className="stat-card-label">Total Produk</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>📋</div>
            <div className="stat-card-body">
              <div className="stat-card-num">{orders.length}</div>
              <div className="stat-card-label">Total Pesanan</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>✅</div>
            <div className="stat-card-body">
              <div className="stat-card-num">{paidCount}</div>
              <div className="stat-card-label">Pesanan Lunas</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon" style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--accent-gold)' }}>💰</div>
            <div className="stat-card-body">
              <div className="stat-card-num" style={{ fontSize: '1rem' }}>{formatRupiah(totalRevenue)}</div>
              <div className="stat-card-label">Total Pendapatan</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >🍽️ Produk ({products.length})</button>
          <button
            className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >🪑 Meja ({tables.length})</button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >📋 Pesanan ({orders.length})</button>
          <button
            className={`tab-btn ${activeTab === 'detection' ? 'active' : ''}`}
            onClick={() => setActiveTab('detection')}
          >🔍 Deteksi Uang</button>
          <button
            className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
            onClick={() => setActiveTab('income')}
          >💰 Penghasilan</button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="tab-action-bar">
              <h3>Daftar Produk</h3>
              <button id="btn-add-product" className="btn btn-primary" onClick={openAdd}>
                + Tambah Produk
              </button>
            </div>
            {loadingP ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p className="empty-title">Belum ada produk</p>
                <button className="btn btn-primary mt-4" onClick={openAdd}>Tambah Produk Pertama</button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(p => (
                  <ProductCard key={p.idProduct} product={p} isAdmin onEdit={openEdit} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <div>
            <div className="tab-action-bar">
              <h3>Daftar Meja & QR Code</h3>
              <button className="btn btn-primary" onClick={openAddTable}>
                + Tambah Meja
              </button>
            </div>
            {loadingT ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : tables.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🪑</div>
                <p className="empty-title">Belum ada data meja</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>No. Meja</th>
                      <th>Kode QR (QR Identify)</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map(t => (
                      <tr key={t.idTable}>
                        <td style={{ fontWeight: 600 }}>Meja {t.tableNumber}</td>
                        <td><code style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', color: 'var(--accent-secondary)' }}>{t.qrIdentify}</code></td>
                        <td>
                          {t.isActive 
                            ? <span className="badge badge-success">Aktif</span> 
                            : <span className="badge badge-warning">Tutup</span>}
                        </td>
                        <td>
                          <button className="btn btn-primary btn-sm" onClick={() => { setQrTable(t); setQrModal(true); }} style={{marginRight: '8px', background: 'transparent', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)'}}>📱 QR</button>
                          <button className="btn btn-primary btn-sm" onClick={() => openEditTable(t)} style={{marginRight: '8px', background: 'transparent', border: '1px solid var(--accent-primary)'}}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteTable(t.idTable)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="tab-action-bar">
              <h3>Semua Pesanan</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-success">Lunas: {paidCount}</span>
                <span className="badge badge-warning">Pending: {unpaidCount}</span>
              </div>
            </div>
            {loadingO ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📋</div><p className="empty-title">Belum ada pesanan</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>No. Pesanan</th>
                      <th>User</th>
                      <th>Meja</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Waktu</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.idOrder}>
                        <td><code style={{ color: 'var(--accent-primary)', fontSize: '0.82rem' }}>{order.orderNumber || `ORD-${order.idOrder}`}</code></td>
                        <td>{order.userId?.username || '-'}</td>
                        <td>#{order.tableId?.tableNumber || order.tableId?.id || '-'}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{formatRupiah(order.totalPrice)}</td>
                        <td>
                          { (order.status?.toString().toLowerCase() === 'paid' || order.status?.toString() === '1')
                            ? <span className="badge badge-success">✅ LUNAS</span>
                            : <span className="badge badge-warning">⏳ PENDING</span>}
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {order.createdAt ? new Date(order.createdAt).toLocaleString('id-ID') : '-'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary btn-sm" onClick={() => handleShowDetails(order)} style={{ background: 'transparent', border: '1px solid var(--accent-primary)' }}>👁️ Detail</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteOrder(order.idOrder)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detection Tab */}
        {activeTab === 'detection' && (
          <div className="detection-tab">
            <div className="tab-action-bar">
              <h3>Sistem Deteksi Uang Masuk</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Verifikasi keaslian uang fisik menggunakan Computer Vision</p>
            </div>
            
            <div className="detection-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px'}}>
              <div className="detection-control-card" style={{background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)'}}>
                <div style={{textAlign: 'center', marginBottom: '24px'}}>
                  <div style={{fontSize: '3rem', marginBottom: '16px'}}>📷</div>
                  <h4>Kontrol Kamera</h4>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px'}}>Klik tombol di bawah untuk membuka kamera deteksi pada komputer server.</p>
                  <button 
                    className="btn btn-primary btn-sm btn-full" 
                    onClick={async () => {
                      setDetectionLoading(true);
                      try {
                        const res = await detectionAPI.start();
                        toast.success(res.data.message);
                      } catch {
                        toast.error('Gagal membuka kamera deteksi');
                      } finally {
                        setDetectionLoading(false);
                      }
                    }}
                    disabled={detectionLoading}
                  >
                    {detectionLoading ? 'Membuka...' : '🚀 Buka Kamera Deteksi'}
                  </button>
                </div>
                
                <div className="detection-info" style={{borderTop: '1px solid var(--glass-border)', paddingTop: '16px'}}>
                  <h5 style={{marginBottom: '8px', fontSize: '0.9rem'}}>Instruksi Penggunaan:</h5>
                  <ul style={{fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '16px'}}>
                    <li>Pastikan kamera web terhubung.</li>
                    <li>Arahkan uang ke area kotak hijau di layar kamera.</li>
                    <li>Tekan tombol 'S' pada keyboard untuk memindai.</li>
                    <li>Hasil akan tersimpan secara otomatis.</li>
                  </ul>
                </div>
              </div>

              <div className="detection-result-card" style={{background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                  <h4>Hasil Scan Terakhir</h4>
                  <button className="btn btn-ghost btn-sm" onClick={() => setLatestScan(`${detectionAPI.getLatestScan()}?t=${Date.now()}`)}>🔄 Refresh</button>
                </div>
                
                <div className="result-preview" style={{width: '100%', height: '240px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px dashed var(--glass-border)'}}>
                  {latestScan ? (
                    <img src={latestScan} alt="Latest Scan" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                  ) : (
                    <div style={{textAlign: 'center', color: 'var(--text-muted)'}}>
                      <div style={{fontSize: '2rem'}}>🖼️</div>
                      <p style={{fontSize: '0.8rem'}}>Belum ada data scan</p>
                    </div>
                  )}
                </div>
                
                <div style={{marginTop: '16px'}}>
                  <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                    *Gambar di atas adalah hasil tangkapan layar terakhir dari proses deteksi.
                  </p>
                  <a 
                    href={`${API_BASE}/api/detection/latest-scan`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="auth-link"
                    style={{fontSize: '0.85rem', display: 'block', marginTop: '8px'}}
                  >
                    🖼️ Buka gambar resolusi penuh
                  </a>
                  <a 
                    href={detectionAPI.getLatestPdf()} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm btn-full"
                    style={{marginTop: '12px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)'}}
                  >
                    📄 Download Laporan PDF (Hasil Scan)
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="income-tab">
            <div className="tab-action-bar">
              <h3>💰 Pencatatan Penghasilan</h3>
              <div className="income-summary-badge">
                Total Pendapatan: <span style={{color: 'var(--success)', fontWeight: 700}}>{formatRupiah(totalRevenue)}</span>
              </div>
            </div>

            <div className="stats-grid" style={{marginBottom: '24px'}}>
              <div className="stat-card" style={{background: 'var(--bg-card)'}}>
                <div className="stat-card-body">
                  <div className="stat-card-label">Total Transaksi Lunas</div>
                  <div className="stat-card-num" style={{color: 'var(--success)'}}>{paidCount}</div>
                </div>
              </div>
              <div className="stat-card" style={{background: 'var(--bg-card)'}}>
                <div className="stat-card-body">
                  <div className="stat-card-label">Rata-rata per Transaksi</div>
                  <div className="stat-card-num">
                    {formatRupiah(paidCount > 0 ? totalRevenue / paidCount : 0)}
                  </div>
                </div>
              </div>
            </div>

            {orders.filter(o => o.status?.toString().toLowerCase() === 'paid').length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💰</div>
                <p className="empty-title">Belum ada penghasilan masuk</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>No. Pesanan</th>
                      <th>Pelanggan</th>
                      <th>Metode</th>
                      <th>Jumlah</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => o.status?.toString().toLowerCase() === 'paid')
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map(order => (
                        <tr key={order.idOrder}>
                          <td style={{fontSize: '0.85rem'}}>
                            {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td>
                            <code style={{color: 'var(--accent-primary)'}}>{order.orderNumber || `ORD-${order.idOrder}`}</code>
                          </td>
                          <td>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                              <span style={{fontWeight: 500}}>{order.userId?.username || 'Guest'}</span>
                              <small style={{color: 'var(--text-muted)'}}>Meja #{order.tableId?.tableNumber}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-info" style={{fontSize: '0.75rem'}}>
                              {order.payment?.paymentMethod || order.payment?.paymentType || 'Midtrans'}
                            </span>
                          </td>
                          <td style={{fontWeight: 600, color: 'var(--success)'}}>
                            {formatRupiah(order.totalPrice)}
                          </td>
                          <td>
                            <span className="badge badge-success">✅ PAID</span>
                          </td>
                          <td>
                            <button className="btn btn-primary btn-sm" onClick={() => handleShowDetails(order)} style={{ background: 'transparent', border: '1px solid var(--accent-primary)' }}>👁️ Detail</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editTarget ? '✏️ Edit Produk' : '➕ Tambah Produk'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Nama Produk</label>
            <input id="product-name" className="form-input" placeholder="cth. Nasi Goreng Spesial"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Harga (Rp)</label>
            <input id="product-price" type="number" className="form-input" placeholder="cth. 25000"
              value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} min="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea id="product-desc" className="form-input" placeholder="Deskripsi singkat produk..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Batal</button>
            <button type="submit" id="btn-save-product" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editTarget ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </Modal>
      {/* Add/Edit Table Modal */}
      <Modal isOpen={tableModal} onClose={() => setTableModal(false)} title={editTableTarget ? '✏️ Edit Meja' : '➕ Tambah Meja'}>
        <form onSubmit={handleSaveTable}>
          <div className="form-group">
            <label className="form-label">Nomor Meja</label>
            <input type="number" className="form-input" placeholder="cth. 1" required
              value={tableForm.tableNumber} onChange={e => setTableForm(f => ({ ...f, tableNumber: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Kode QR ID (Opsional)</label>
            <input className="form-input" placeholder="Biarkan kosong agar digenerate otomatis"
              value={tableForm.qrIdentify} onChange={e => setTableForm(f => ({ ...f, qrIdentify: e.target.value }))} />
            <small style={{color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block'}}>Akan di-generate otomatis menjadi QR-XXXX jika dikosongkan.</small>
          </div>
          <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px'}}>
            <input type="checkbox" id="isActive" checked={tableForm.isActive} 
              onChange={e => setTableForm(f => ({ ...f, isActive: e.target.checked }))} 
              style={{width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)'}} />
            <label htmlFor="isActive" style={{cursor: 'pointer'}}>Meja Aktif (Tersedia / Bisa dipesan)</label>
          </div>
          <div className="modal-footer" style={{marginTop: '24px'}}>
            <button type="button" className="btn btn-ghost" onClick={() => setTableModal(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : editTableTarget ? 'Simpan Perubahan' : 'Tambah Meja'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={qrModal} onClose={() => setQrModal(false)} title={`QR Code - Meja ${qrTable?.tableNumber}`}>
        {qrTable && (() => {
          const qrUrl = `${window.location.origin}/menu?table=${qrTable.qrIdentify}`;
          return (
            <div style={{textAlign: 'center', padding: '16px 0'}}>
              <div style={{display: 'inline-block', background: '#fff', padding: 20, borderRadius: 12}}>
                <QRCodeSVG value={qrUrl} size={220} />
              </div>
              <p style={{marginTop: 16, fontWeight: 600, fontSize: '1.1rem'}}>Meja {qrTable.tableNumber}</p>
              <p style={{color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4, wordBreak: 'break-all'}}>{qrUrl}</p>
              <p style={{color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8}}>Scan QR ini untuk langsung ke menu dengan meja terdeteksi otomatis</p>
            </div>
          );
        })()}
        <div className="modal-footer">
          <button className="btn btn-primary btn-full" onClick={() => setQrModal(false)}>Tutup</button>
        </div>
      </Modal>

      {/* Order Items Detail Modal */}
      <Modal isOpen={orderItemsModal} onClose={() => setOrderItemsModal(false)} title={`📋 Detail Pesanan: ${currentOrderNum}`}>
        {loadingItems ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : selectedOrderItems.length === 0 ? (
          <div className="empty-state"><p>Tidak ada item dalam pesanan ini.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga Satuan</th>
                  <th>Jumlah</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrderItems.map(item => (
                  <tr key={item.id_item_Order}>
                    <td style={{fontWeight: 500}}>{item.productId?.name}</td>
                    <td>{formatRupiah(item.productId?.price)}</td>
                    <td>{item.quantity}x</td>
                    <td style={{fontWeight: 600, color: 'var(--accent-primary)'}}>{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" style={{textAlign: 'right', fontWeight: 600, padding: '16px'}}>Total Pesanan:</td>
                  <td style={{fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.1rem', padding: '16px'}}>
                    {formatRupiah(selectedOrderItems.reduce((acc, curr) => acc + (curr.subtotal || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-primary btn-full" onClick={() => setOrderItemsModal(false)}>Tutup</button>
        </div>
      </Modal>
    </div>
  );
}
