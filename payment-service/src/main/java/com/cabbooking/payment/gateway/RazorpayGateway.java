package com.cabbooking.payment.gateway;

import com.cabbooking.payment.config.RazorpayConfig;
import com.cabbooking.payment.dto.CreateOrderRequest;
import com.cabbooking.payment.dto.PaymentResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

@Component
public class RazorpayGateway {

    private final RazorpayConfig razorpayConfig;

    public RazorpayGateway(RazorpayConfig razorpayConfig) {
        this.razorpayConfig = razorpayConfig;
    }

    public PaymentResponse createOrder(CreateOrderRequest request) throws RazorpayException {
        if (razorpayConfig.getKeyId() == null || razorpayConfig.getKeyId().isBlank()
                || razorpayConfig.getKeySecret() == null || razorpayConfig.getKeySecret().isBlank()) {
            throw new IllegalStateException("Razorpay keys are not configured");
        }

        long amountInPaise = Math.round(request.getRideFare() * 100);

        RazorpayClient razorpayClient = new RazorpayClient(razorpayConfig.getKeyId(), razorpayConfig.getKeySecret());

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", razorpayConfig.getCurrency());
        orderRequest.put("receipt", request.getBookingId());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = razorpayOrder.get("id");

        return new PaymentResponse(
                request.getBookingId(),
                razorpayOrderId,
                razorpayConfig.getKeyId(),
                amountInPaise,
                razorpayConfig.getCurrency(),
                "CREATED"
        );
    }
}
