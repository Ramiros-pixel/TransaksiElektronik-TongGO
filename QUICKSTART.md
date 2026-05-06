# ⚡ Payment Gateway - Quick Start

Get payment gateway running in **5 minutes**!

---

## 🎯 Prerequisites

- Java 21+
- MySQL 8.0+
- Maven 3.8+
- Midtrans Account (signup: https://midtrans.com)

---

## ⚙️ Step 1: Get Midtrans Credentials (2 min)

1. Sign up at https://midtrans.com (free)
2. Login to Dashboard: https://dashboard.sandbox.midtrans.com
3. Go to **Settings → Access Keys**
4. Copy **Server Key** and **Client Key**

**Example:**

```
Server Key: SB-Mid-server-abc1234567890...
Client Key: SB-Mid-client-def1234567890...
```

---

## 🔧 Step 2: Update Configuration (1 min)

Edit: `src/main/resources/application.properties`

```properties
# Replace these values with your actual credentials from Midtrans
midtrans.server.key=SB-Mid-server-YOUR_KEY_HERE
midtrans.client.key=SB-Mid-client-YOUR_KEY_HERE
midtrans.is.production=false
```

---

## 🗄️ Step 3: Update Database (1 min)

Run this SQL in MySQL:

```sql
-- Add new columns to orders table
ALTER TABLE orders
ADD COLUMN order_number VARCHAR(100) UNIQUE NOT NULL DEFAULT CONCAT('ORD-', UNIX_TIMESTAMP(NOW()), '-', RAND()),
ADD COLUMN updated_at DATETIME NULL;

-- Add new columns to payments table
ALTER TABLE payments
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN payment_method VARCHAR(50),
ADD COLUMN redirect_url TEXT,
ADD COLUMN signature_key VARCHAR(255),
ADD COLUMN transaction_id VARCHAR(100),
ADD COLUMN updated_at DATETIME;
```

Or just let Hibernate handle it automatically (already configured).

---

## 🚀 Step 4: Build & Run (1 min)

```bash
# Build project
mvn clean install

# Run application
mvn spring-boot:run
```

Application starts at: **http://localhost:8080**

---

## ✅ Step 5: Test API (1 min)

### Create Payment

```bash
curl -X POST http://localhost:8080/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 150000,
    "paymentType": "snap",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "08123456789"
  }'
```

**Response:**

```json
{
  "paymentId": 1,
  "orderId": 1,
  "midtransId": "abc123...",
  "redirectUrl": "https://app.midtrans.com/snap/v2/...",
  "paymentStatus": "pending",
  "success": true
}
```

### Test Payment

1. Copy `redirectUrl`
2. Open in browser
3. Use **Test Card**: `4811 1111 1111 1114`
4. Any expiry date & CVC
5. Click **Charge** → Payment success! ✅

### Check Status

```bash
curl -X GET http://localhost:8080/api/payment/1
```

---

## 💻 Frontend Integration

Add to your HTML page:

```html
<!-- 1. Load Midtrans Library -->
<script
  src="https://app.midtrans.com/snap/snap.js"
  data-client-key="SB-Mid-client-YOUR_KEY"
></script>

<!-- 2. Add Payment Button -->
<button onclick="payWithMidtrans()">Pay Now 💳</button>

<!-- 3. JavaScript -->
<script>
  function payWithMidtrans() {
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
      .then((r) => r.json())
      .then((data) => {
        snap.pay(data.midtransId, {
          onSuccess: () => alert("Payment Success!"),
          onError: () => alert("Payment Failed!"),
          onClose: () => alert("Payment Cancelled!"),
        });
      });
  }
</script>
```

Or use the provided template: `src/main/resources/templates/checkout.html`

---

## 🧪 Test Payment Cards

| Card Type    | Number              | Status      |
| ------------ | ------------------- | ----------- |
| Visa Success | 4811 1111 1111 1114 | ✅ Accepted |
| Visa Failed  | 4111 1111 1111 1114 | ❌ Rejected |
| Mastercard   | 5105 1051 0510 5100 | ✅ Accepted |

Use any expiry & CVC, all in Sandbox mode.

---

## 📱 API Endpoints

| Endpoint                 | Method | Purpose        |
| ------------------------ | ------ | -------------- |
| `/api/payment/process`   | POST   | Create payment |
| `/api/payment/{orderId}` | GET    | Check status   |
| `/api/payment/callback`  | POST   | Webhook (auto) |
| `/api/payment/health`    | GET    | Health check   |

---

## 🐛 Troubleshooting

### "Invalid credentials"

→ Check Server Key & Client Key in `application.properties`

### "Order not found"

→ Create order first, use correct `orderId`

### "Connection refused"

→ Verify MySQL is running

### "Maven not found"

→ Add Maven to PATH or use `./mvnw` (included)

---

## 📖 Full Documentation

- **Setup Guide**: See `PAYMENT_GATEWAY_GUIDE.md`
- **API Examples**: See `API_EXAMPLES.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🎉 You're Done!

Payment gateway is now live! 🚀

**Next Steps:**

1. ✅ Test all payment scenarios
2. ✅ Customize checkout page
3. ✅ Add email notifications
4. ✅ Deploy to production

---

## 💡 Pro Tips

- **Test webhook locally**: Use ngrok → `ngrok http 8080`
- **Monitor transactions**: Midtrans Dashboard shows real-time data
- **Check logs**: `mvn spring-boot:run` shows all request/response
- **Database queries**: `SELECT * FROM payments` to verify

---

## ❓ Need Help?

- Midtrans Docs: https://docs.midtrans.com
- Community: https://stackoverflow.com/questions/tagged/midtrans
- Support: contact@midtrans.com

---

**Happy Coding! 💻**

_Last Updated: May 5, 2026_
