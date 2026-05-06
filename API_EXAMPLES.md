# Payment Gateway API Examples

## 1. Create Payment Transaction

### Request

```bash
curl -X POST http://localhost:8080/api/payment/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 150000.0,
    "paymentType": "snap",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "08123456789"
  }'
```

### Response (Success)

```json
{
  "paymentId": 1,
  "orderId": 1,
  "midtransId": "abc123def456",
  "redirectUrl": "https://app.midtrans.com/snap/v2/vtweb/abc123def456-ghi789jkl",
  "paymentStatus": "pending",
  "amount": 150000.0,
  "success": true,
  "message": "Transaction created successfully"
}
```

### Response (Error)

```json
{
  "paymentId": null,
  "orderId": null,
  "midtransId": null,
  "redirectUrl": null,
  "paymentStatus": null,
  "amount": null,
  "success": false,
  "message": "Error: Order not found"
}
```

---

## 2. Get Payment Status

### Request

```bash
curl -X GET http://localhost:8080/api/payment/1 \
  -H "Content-Type: application/json"
```

### Response (Success)

```json
{
  "paymentId": 1,
  "orderId": 1,
  "midtransId": "abc123def456",
  "redirectUrl": "https://app.midtrans.com/snap/v2/vtweb/abc123def456-ghi789jkl",
  "paymentStatus": "settlement",
  "amount": 150000.0,
  "success": true
}
```

### Response (Not Found)

```json
{
  "paymentId": null,
  "orderId": 99,
  "midtransId": null,
  "redirectUrl": null,
  "paymentStatus": null,
  "amount": null,
  "success": false,
  "message": "Payment not found for order ID: 99"
}
```

---

## 3. Payment Callback from Midtrans

### Request (Automatically sent by Midtrans)

```bash
POST http://localhost:8080/api/payment/callback
Content-Type: application/json

{
  "transaction_time": "2024-05-10 14:30:00",
  "transaction_status": "settlement",
  "transaction_id": "abc123def456-ghi789jkl",
  "status_message": "Settlement berhasil",
  "status_code": "200",
  "merchant_id": "YOUR_MERCHANT_ID",
  "gross_amount": "150000.00",
  "currency": "IDR",
  "order_id": "ORD-1715000000123-ABC",
  "payment_type": "credit_card",
  "fraud_status": "accept",
  "signature_key": "abc123def456ghi789jkl1234567890abcdef"
}
```

### Response

```json
{
  "status": "ok",
  "message": "Notification received and processed"
}
```

### Possible Transaction Status Values

- `settlement` → Pembayaran sukses ✅
- `pending` → Menunggu pembayaran
- `expire` → Transaksi kadaluarsa
- `cancel` → Pembayaran dibatalkan
- `deny` → Pembayaran ditolak
- `failure` → Pembayaran gagal

---

## 4. Health Check

### Request

```bash
curl -X GET http://localhost:8080/api/payment/health
```

### Response

```json
{
  "status": "ok",
  "message": "Payment service is running"
}
```

---

## 5. Database Schema Verification

### Check if tables exist

```sql
SHOW TABLES LIKE 'payments';
SHOW TABLES LIKE 'orders';

DESCRIBE payments;
DESCRIBE orders;
```

### Sample Query

```sql
-- Get all pending payments
SELECT * FROM payments WHERE payment_status = 'pending';

-- Get payment details for specific order
SELECT p.*, o.order_number, o.total_price, o.status
FROM payments p
JOIN orders o ON p.order_id = o.id_order
WHERE o.id_order = 1;

-- Get payment statistics
SELECT
  payment_status,
  COUNT(*) as count,
  SUM(gross_amount) as total_amount
FROM payments
GROUP BY payment_status;
```

---

## 6. Common Error Responses

### Missing Required Field

```json
{
  "paymentId": null,
  "orderId": null,
  "midtransId": null,
  "redirectUrl": null,
  "paymentStatus": null,
  "amount": null,
  "success": false,
  "message": "Order ID and Amount are required"
}
```

### Invalid Signature (Callback)

```json
{
  "status": "error",
  "message": "Invalid signature"
}
```

### Order Not Found

```json
{
  "paymentId": null,
  "orderId": null,
  "midtransId": null,
  "redirectUrl": null,
  "paymentStatus": null,
  "amount": null,
  "success": false,
  "message": "Error: Order not found"
}
```

### Internal Server Error

```json
{
  "paymentId": null,
  "orderId": null,
  "midtransId": null,
  "redirectUrl": null,
  "paymentStatus": null,
  "amount": null,
  "success": false,
  "message": "Error: [error details]"
}
```

---

## 7. Complete Frontend Integration Example

```javascript
// 1. Create order and get orderId from server
// 2. Trigger payment
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
  .then((response) => response.json())
  .then((data) => {
    if (data.success) {
      // 3. Display Midtrans payment page
      snap.pay(data.midtransId, {
        onSuccess: function (result) {
          // 4. Payment successful
          console.log("Payment Success:", result);
          // Show success page or redirect
        },
        onError: function (result) {
          // 5. Payment failed
          console.error("Payment Error:", result);
          // Show error message
        },
      });
    }
  });

// 6. Optional: Check payment status periodically
setInterval(() => {
  fetch("/api/payment/1")
    .then((response) => response.json())
    .then((data) => {
      console.log("Payment Status:", data.paymentStatus);
    });
}, 5000);
```

---

## 8. Testing Checklist

- [ ] Create payment with valid order
- [ ] Verify redirect URL is valid
- [ ] Test with Midtrans Sandbox cards
- [ ] Receive and process callback
- [ ] Verify signature is correct
- [ ] Update payment status in database
- [ ] Update order status to PAID
- [ ] Test failed payment scenario
- [ ] Test expired payment scenario
- [ ] Check email notification (if implemented)

---

**Last Updated**: May 5, 2026
