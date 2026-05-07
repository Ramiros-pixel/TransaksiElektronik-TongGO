# React UI untuk TongGo - Sistem Transaksi Elektronik

## Ringkasan

Membangun frontend React (Vite) yang terhubung ke backend Spring Boot **TongGo** — sebuah sistem pemesanan makanan/restoran dengan payment gateway Midtrans.

## Analisis Backend (API Endpoints)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | `/api/auth/login` | Login, return JWT token |
| POST | `/api/auth/register` | Daftar akun baru |
| GET | `/api/products/display` | Tampilkan semua produk |
| POST | `/api/products/tambah` | Tambah produk (Admin) |
| PUT | `/api/products/ubah/{id}` | Ubah produk (Admin) |
| DELETE | `/api/products/hapus/{id}` | Hapus produk (Admin) |
| GET | `/api/keranjang/display` | Lihat isi keranjang |
| POST | `/api/keranjang/tambah` | Tambah item ke keranjang |
| DELETE | `/api/keranjang/hapus/{id}` | Hapus dari keranjang |
| POST | `/api/orders/init` | Buat order baru |
| GET | `/api/orders/list` | Daftar semua order |
| GET | `/api/orders/{id}` | Detail order |
| GET | `/api/orders/user/{userId}` | Order milik user |
| DELETE | `/api/orders/{id}` | Hapus order |
| POST | `/api/payment/process` | Proses pembayaran (Midtrans) |
| GET | `/api/payment/{orderId}` | Status pembayaran |

## Model Data

- **User**: id, username, email, password, role (USER/ADMIN)
- **Product**: idProduct, name, price, description
- **OrderItem (Keranjang)**: item dalam pesanan
- **Order**: idOrder, orderNumber, userId, tableId, totalPrice, status (PAID/UNPAID), createdAt
- **Payment**: idPayment, orderId, midtransId, paymentType, paymentStatus, redirectUrl, grossAmount

## Halaman yang akan dibuat

1. **Landing Page** – Halaman sambutan dengan tombol Login
2. **Login Page** – Form login dengan JWT auth
3. **Register Page** – Form pendaftaran user baru
4. **Menu/Products Page** – Galeri produk dengan tombol "Tambah ke Keranjang"
5. **Keranjang (Cart) Page** – Daftar item keranjang, total harga, tombol checkout
6. **Orders Page** – Riwayat pesanan user
7. **Payment Page** – Halaman konfirmasi & redirect ke Midtrans
8. **Admin Dashboard** – Manajemen produk (CRUD) & semua order (hanya untuk role ADMIN)

## Proposed Changes

### Frontend Project (Vite + React)

Dibuat di folder: `d:\TransaksiElektronik-TongGO\frontend\`

#### [NEW] `frontend/` — React App (Vite)

```
frontend/
├── src/
│   ├── api/          ← Axios instance & API calls
│   ├── components/   ← Reusable components (Navbar, ProductCard, CartItem, Modal)
│   ├── pages/        ← Semua halaman
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── MenuPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── OrdersPage.jsx
│   │   ├── PaymentPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       └── ProductManagement.jsx
│   ├── context/      ← AuthContext, CartContext
│   ├── App.jsx       ← Routing
│   └── main.jsx
├── index.html
└── package.json
```

#### Tech Stack Frontend:
- **Vite + React** (framework)
- **React Router v6** (routing)
- **Axios** (HTTP client)
- **CSS Vanilla** (styling, dark mode, glassmorphism)
- **Google Fonts: Inter** (typography)

## Design Aesthetic

- **Tema**: Dark premium dengan aksen orange/gold (nuansa restoran mewah)
- **Glassmorphism** pada cards
- **Gradient** pada hero section dan buttons
- **Animasi**: hover effects, loading spinner, toast notifications
- **Responsive**: mobile-first design

## Verification Plan

### Automated
- `npm run build` untuk validasi kompilasi

### Manual
- Buka di browser: Login, tambah produk ke keranjang, checkout
- Verifikasi JWT disimpan di localStorage
- Verifikasi CORS antara frontend (port 5173) dan backend (port 8080)
