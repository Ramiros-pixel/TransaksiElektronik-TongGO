# Payment Gateway Integration Guide - TongGo

## Implementasi Payment Gateway dengan Midtrans

Dokumentasi lengkap untuk mengintegrasikan payment gateway Midtrans ke project TongGo.

---

## 📦 File-File yang Dibuat

### 1. **Dependencies** (pom.xml)

- Midtrans Java Client v2.0.0
- Jackson (JSON processing)
- Spring WebFlux (HTTP client)
- Spring Mail (email notifications)

### 2. **Configuration**

```
config/MidtransConfig.java          → Initialize Midtrans SDK
util/MidtransSignatureUtil.java     → Verify callback signature
util/OrderNumberGenerator.java      → Generate unique order numbers
```

### 3. **Data Transfer Objects (DTOs)**

```
dto/PaymentRequestDTO.java          → Request untuk create payment
dto/PaymentResponseDTO.java         → Response dari create payment
dto/MidtransCallbackDTO.java        → Callback dari Midtrans
```

### 4. **Repository**

```
repository/PaymentRepository.java   → Database queries untuk payment
repository/OrderRepository.java     → Updated dengan query methods
```

### 5. **Services**

```
service/PaymentService.java         → Core payment logic
service/OrderService.java           → Order management logic
```

### 6. **Controllers**

```
controller/PaymentController.java   → REST API endpoints
```

### 7. **Models**

```
model/paymentModel.java             → Updated dengan payment fields
model/orderModel.java               → Updated dengan order_number & payment relation
```

---

## 🔧 Setup Awal

### Step 1: Update application.properties

Replace placeholder credentials dengan credentials dari Midtrans:

```properties
midtrans.server.key=YOUR_SERVER_KEY_HERE
midtrans.client.key=YOUR_CLIENT_KEY_HERE
midtrans.is.production=false  # true untuk production

# Email Configuration (optional)
spring.mail.host=smtp.gmail.com
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
```

### Step 2: Dapatkan Credentials Midtrans

1. Sign up di https://midtrans.com
2. Login ke https://dashboard.sandbox.midtrans.com
3. Copy **Server Key** dan **Client Key** dari Settings

### Step 3: Database Migration

Jalankan SQL untuk menambah kolom baru:

```sql
ALTER TABLE orders ADD COLUMN order_number VARCHAR(100) UNIQUE NOT NULL;
ALTER TABLE orders ADD COLUMN updated_at DATETIME NULL;

ALTER TABLE payments ADD COLUMN transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE payments ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN redirect_url TEXT;
ALTER TABLE payments ADD COLUMN signature_key VARCHAR(255);
ALTER TABLE payments ADD COLUMN updated_at DATETIME;
```

Atau biarkan Hibernate auto-update dengan `spring.jpa.hibernate.ddl-auto=update`

---

## 🚀 API Endpoints

### 1. Create Payment Transaction

```
POST /api/payment/process
Content-Type: application/json

{
  "orderId": 1,
  "amount": 150000.0,
  "paymentType": "snap",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "08123456789"
}

Response:
{
  "paymentId": 1,
  "orderId": 1,
  "midtransId": "abc123def456",
  "redirectUrl": "https://app.midtrans.com/snap/v2/vtweb/abc123...",
  "paymentStatus": "pending",
  "amount": 150000.0,
  "success": true,
  "message": "Transaction created successfully"
}
```

### 2. Get Payment Status

```
GET /api/payment/{orderId}

Response:
{
  "paymentId": 1,
  "orderId": 1,
  "midtransId": "abc123def456",
  "paymentStatus": "settlement",
  "amount": 150000.0,
  "success": true
}
```

### 3. Payment Callback (Webhook)

```
POST /api/payment/callback
(Automatically called by Midtrans after payment)

Midtrans akan send JSON payload dengan transaction details
Backend akan verify signature dan update payment status
```

### 4. Health Check

```
GET /api/payment/health

Response:
{
  "status": "ok",
  "message": "Payment service is running"
}
```

---

## 🔐 Signature Verification

Setiap callback dari Midtrans harus diverifikasi menggunakan **Server Key**:

```
SHA512(order_id + status_code + gross_amount + server_key)
```

Implementasi sudah ada di `MidtransSignatureUtil.verifySignature()`

---

## 💳 Payment Status Flow

```
PENDING → PROCESSING → SETTLEMENT ✅ (Successful)
                    → EXPIRED ⏰ (Timeout)
                    → FAILED ❌ (Rejected)
                    → CANCEL ❌ (Cancelled)
```

| Status     | Meaning                    |
| ---------- | -------------------------- |
| pending    | Menunggu customer membayar |
| settlement | Pembayaran berhasil ✅     |
| expire     | Transaksi kadaluarsa       |
| cancel     | Pembayaran dibatalkan      |
| failed     | Pembayaran gagal           |

---

## 🧪 Testing dengan Sandbox

### 1. Test Card Numbers

```
Visa Success:    4811 1111 1111 1114
Visa Failed:     4111 1111 1111 1114
Mastercard:      5105 1051 0510 5100
```

### 2. Test dengan Postman

1. POST ke `/api/payment/process` dengan test order
2. Copy `redirectUrl` dari response
3. Buka di browser dan gunakan test card
4. Check payment status dengan GET `/api/payment/{orderId}`

### 3. Verify Callback (Optional)

Bisa setup ngrok untuk receive Midtrans callbacks di local:

```bash
ngrok http 8080
```

Lalu set Webhook URL di Midtrans Dashboard ke:

```
http://YOUR_NGROK_URL/api/payment/callback
```

---

## 📨 Email Notifications (Optional)

Untuk mengirim email confirmation payment, uncomment dan implement method:

```java
private void sendPaymentConfirmationEmail(orderModel order, paymentModel payment) {
    // Implement email sending logic
}
```

---

## ⚠️ Important Notes

1. **Server Key Privacy**: Jangan pernah expose Server Key di frontend
2. **Client Key**: Boleh digunakan di frontend untuk Snap
3. **Signature Verification**: WAJIB verify setiap callback
4. **Timeout**: Return 200 OK dalam 30 detik dari Midtrans
5. **Idempotent**: Callback bisa dikirim lebih dari 1x, handle dengan baik

---

## 🔗 Frontend Integration

### Menggunakan Midtrans Snap di HTML:

```html
<head>
  <script
    src="https://app.midtrans.com/snap/snap.js"
    data-client-key="YOUR_CLIENT_KEY"
  ></script>
</head>

<body>
  <button onclick="startPayment()">Pay Now</button>

  <script>
    function startPayment() {
      fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: 1,
          amount: 150000,
          paymentType: "snap",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          customerPhone: "08123456789",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          snap.pay(data.midtransId, {
            onSuccess: function (result) {
              alert("Pembayaran Berhasil!");
              // Redirect atau update UI
            },
            onPending: function (result) {
              alert("Pembayaran Tertunda");
            },
            onError: function (result) {
              alert("Pembayaran Gagal");
            },
          });
        });
    }
  </script>
</body>
```

---

## 📝 Database Schema

```sql
-- Orders table
CREATE TABLE orders (
  id_order BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  table_id BIGINT NOT NULL,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  total_price DOUBLE,
  status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (table_id) REFERENCES tables(id_table)
);

-- Payments table
CREATE TABLE payments (
  id_payment BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT UNIQUE NOT NULL,
  midtrans_id VARCHAR(255) NOT NULL,
  transaction_id VARCHAR(100),
  payment_type VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  gross_amount DOUBLE NOT NULL,
  redirect_url TEXT,
  signature_key VARCHAR(255),
  payment_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id_order)
);
```

---

## 🆘 Troubleshooting

| Problem                 | Solution                                    |
| ----------------------- | ------------------------------------------- |
| "Invalid signature"     | Pastikan Server Key di app.properties benar |
| "Transaction not found" | Check apakah order ID valid dan ada di DB   |
| Callback tidak diterima | Setup webhook URL di Midtrans Dashboard     |
| Payment stuck pending   | Cek status di Midtrans Dashboard            |

---

## 📚 Referensi Lengkap

- Midtrans Documentation: https://docs.midtrans.com
- Midtrans Java SDK: https://github.com/midtrans/midtrans-java-client
- Midtrans Dashboard: https://dashboard.sandbox.midtrans.com
- Test Cards: https://docs.midtrans.com/en/technical-reference/test-transactions

---

## ✅ Checklist

- [ ] Update pom.xml dengan Midtrans dependencies
- [ ] Set credentials di application.properties
- [ ] Migrate database schema
- [ ] Test create payment endpoint
- [ ] Test payment callback
- [ ] Setup frontend Snap integration
- [ ] Test dengan Midtrans Sandbox
- [ ] Deploy ke production

---

**Created**: May 5, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation
