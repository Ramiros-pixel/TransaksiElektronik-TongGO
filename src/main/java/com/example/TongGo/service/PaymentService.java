package com.example.TongGo.service;

import com.example.TongGo.dto.MidtransCallbackDTO;
import com.example.TongGo.dto.PaymentRequestDTO;
import com.example.TongGo.dto.PaymentResponseDTO;
import com.example.TongGo.model.orderModel;
import com.example.TongGo.model.paymentModel;
import com.example.TongGo.model.Paid;
import com.example.TongGo.repository.OrderRepository;
import com.example.TongGo.repository.PaymentRepository;
import com.example.TongGo.util.MidtransSignatureUtil;
import com.example.TongGo.util.OrderNumberGenerator;
import com.midtrans.service.MidtransSnapApi;
import com.midtrans.httpclient.error.MidtransError;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MidtransSignatureUtil signatureUtil;

    @Autowired
    private OrderNumberGenerator orderNumberGenerator;

    @Autowired
    private MidtransSnapApi midtransSnapApi;

    /**
     * Create payment transaction with Midtrans
     */
    @Transactional
    public PaymentResponseDTO createTransaction(PaymentRequestDTO request) throws MidtransError {
        try {
            // Get order
            Optional<orderModel> orderOptional = orderRepository.findById(request.getOrderId());
            if (!orderOptional.isPresent()) {
                throw new IllegalArgumentException("Order not found");
            }

            orderModel order = orderOptional.get();

            // Generate order number if not exists
            if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
                order.setOrderNumber(orderNumberGenerator.generateOrderNumber());
                orderRepository.save(order);
            }

            // Check if payment already exists for this order
            Optional<paymentModel> existingPayment = paymentRepository.findByOrderIdIdOrder(order.getIdOrder());
            
            if (existingPayment.isPresent()) {
                paymentModel p = existingPayment.get();
                // If payment is already pending or successful, reuse the existing midtrans token
                if (p.getMidtransId() != null && !p.getMidtransId().isEmpty() && !p.getPaymentStatus().equals("failed") && !p.getPaymentStatus().equals("expire")) {
                    PaymentResponseDTO response = new PaymentResponseDTO();
                    response.setPaymentId(p.getIdPayment());
                    response.setOrderId(order.getIdOrder());
                    response.setMidtransId(p.getMidtransId());
                    response.setRedirectUrl(p.getRedirectUrl());
                    response.setPaymentStatus(p.getPaymentStatus());
                    response.setAmount(p.getGrossAmount());
                    response.setSuccess(true);
                    response.setMessage("Reusing existing transaction");
                    return response;
                }
            }

            // Prepare Midtrans payload
            Map<String, Object> transactionDetails = new HashMap<>();
            // Use order number, but append timestamp if it's a retry to avoid "order_id taken"
            String midtransOrderId = order.getOrderNumber();
            if (existingPayment.isPresent()) {
                midtransOrderId += "-" + System.currentTimeMillis();
            }
            transactionDetails.put("order_id", midtransOrderId);
            transactionDetails.put("gross_amount", request.getAmount().intValue());

            Map<String, Object> customerDetails = new HashMap<>();
            customerDetails.put("first_name", request.getCustomerName());
            customerDetails.put("email", request.getCustomerEmail());
            customerDetails.put("phone", request.getCustomerPhone());

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("transaction_details", transactionDetails);
            requestBody.put("customer_details", customerDetails);

            // Call Midtrans Snap API
            JSONObject snapResponse = midtransSnapApi.createTransaction(requestBody);

            // Extract response
            String token = snapResponse.getString("token");
            String redirectUrl = snapResponse.getString("redirect_url");

            // Save or Update payment record
            paymentModel payment = existingPayment.orElse(new paymentModel());
            if (!existingPayment.isPresent()) {
                payment.setOrderId(order);
                payment.setCreatedAt(LocalDateTime.now());
            }
            
            payment.setMidtransId(token); 
            payment.setPaymentType(request.getPaymentType());
            payment.setGrossAmount(request.getAmount());
            payment.setPaymentStatus("pending");
            payment.setRedirectUrl(redirectUrl);
            payment.setUpdatedAt(LocalDateTime.now());

            paymentRepository.save(payment);

            // Return response
            PaymentResponseDTO response = new PaymentResponseDTO();
            response.setPaymentId(payment.getIdPayment());
            response.setOrderId(order.getIdOrder());
            response.setMidtransId(token);
            response.setRedirectUrl(redirectUrl);
            response.setPaymentStatus("pending");
            response.setAmount(request.getAmount());
            response.setSuccess(true);
            response.setMessage("Transaction created successfully");

            return response;

        } catch (MidtransError e) {
            throw new RuntimeException("Failed to create Midtrans transaction: " + e.getMessage(), e);
        }
    }

    /**
     * Handle Midtrans callback notification
     */
    @Transactional
    public void handlePaymentNotification(MidtransCallbackDTO callback) throws Exception {
        // Find payment by Order Number (which Midtrans returns as order_id)
        Optional<paymentModel> paymentOptional = paymentRepository.findByOrderIdOrderNumber(callback.getOrderId());
        if (!paymentOptional.isPresent()) {
            throw new IllegalArgumentException("Payment not found for Order ID: " + callback.getOrderId());
        }

        paymentModel payment = paymentOptional.get();
        orderModel order = payment.getOrderId();

        // Update payment record
        payment.setTransactionId(callback.getTransactionId());
        payment.setPaymentMethod(callback.getPaymentType());
        payment.setPaymentStatus(callback.getTransactionStatus());
        payment.setUpdatedAt(LocalDateTime.now());

        // Handle transaction status
        switch (callback.getTransactionStatus()) {
            case "settlement":
                // Payment successful
                payment.setPaymentStatus("settlement");
                order.setStatus(Paid.paid);
                sendPaymentConfirmationEmail(order, payment);
                break;

            case "pending":
                // Payment pending
                payment.setPaymentStatus("pending");
                break;

            case "expire":
                // Payment expired
                payment.setPaymentStatus("expire");
                order.setStatus(Paid.cancelled);
                break;

            case "cancel":
                // Payment cancelled
                payment.setPaymentStatus("cancel");
                order.setStatus(Paid.cancelled);
                break;

            case "deny":
            case "failure":
                // Payment failed
                payment.setPaymentStatus("failed");
                order.setStatus(Paid.cancelled);
                break;

            default:
                payment.setPaymentStatus(callback.getTransactionStatus());
        }

        order.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        orderRepository.save(order);
    }

    /**
     * Get payment status by order ID
     */
    public PaymentResponseDTO getPaymentStatus(Long orderId) {
        Optional<paymentModel> paymentOptional = paymentRepository.findByOrderIdIdOrder(orderId);
        if (!paymentOptional.isPresent()) {
            throw new IllegalArgumentException("Payment not found for order ID: " + orderId);
        }

        paymentModel payment = paymentOptional.get();
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setPaymentId(payment.getIdPayment());
        response.setOrderId(orderId);
        response.setMidtransId(payment.getMidtransId());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setAmount(payment.getGrossAmount());
        response.setSuccess(payment.getPaymentStatus().equals("settlement"));

        return response;
    }

    /**
     * Send payment confirmation email (placeholder)
     */
    private void sendPaymentConfirmationEmail(orderModel order, paymentModel payment) {
        // TODO: Implement email sending logic
        System.out.println("Payment confirmed for order: " + order.getOrderNumber());
        System.out.println("Amount: " + payment.getGrossAmount());
    }
}
