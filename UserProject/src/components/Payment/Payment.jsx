import React, { useState, useEffect } from 'react';
import './Payment.css';

const Payment = ({ booking, onPaymentComplete }) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: booking?.estimatedFare || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  useEffect(() => {
    if (booking?.estimatedFare) {
      setPaymentData(prev => ({ ...prev, amount: booking.estimatedFare }));
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cvv') {
      // Limit CVV to 3-4 digits
      if (value.length <= 4 && /^\d*$/.test(value)) {
        setPaymentData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!paymentData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    if (!paymentData.cardHolderName.trim()) {
      setError('Please enter card holder name');
      return false;
    }
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      setError('Please select expiry date');
      return false;
    }
    if (!paymentData.cvv.match(/^\d{3,4}$/)) {
      setError('Please enter a valid CVV');
      return false;
    }
    if (paymentData.amount <= 0) {
      setError('Invalid payment amount');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const paymentRequest = {
        userId: booking.userId,
        bookingId: booking.id,
        amount: paymentData.amount,
        paymentMethod: paymentMethod,
        cardNumber: paymentData.cardNumber.replace(/\s/g, ''),
        cardHolderName: paymentData.cardHolderName,
        expiryDate: `${paymentData.expiryMonth}/${paymentData.expiryYear}`,
        cvv: paymentData.cvv
      };

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest)
      });

      if (response.ok) {
        const payment = await response.json();
        setSuccess(`Payment successful! Transaction ID: ${payment.id}`);
        
        // Update booking status to confirmed
        try {
          await fetch(`/api/bookings/${booking.id}/status?status=CONFIRMED`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } catch (err) {
          console.error('Failed to update booking status:', err);
        }

        if (onPaymentComplete) {
          onPaymentComplete(payment);
        }

        // Reset form
        setTimeout(() => {
          setPaymentData({
            cardNumber: '',
            cardHolderName: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: '',
            amount: 0
          });
          setSuccess('');
        }, 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment processing error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>No Booking Selected</h2>
          <p>Please select a booking to proceed with payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Complete Payment</h2>
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>From:</span>
                <span>{booking.pickupLocation}</span>
              </div>
              <div className="summary-row">
                <span>To:</span>
                <span>{booking.dropLocation}</span>
              </div>
              <div className="summary-row">
                <span>Cab Type:</span>
                <span>{booking.cabType}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{booking.estimatedFare}</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="payment-method">
            <h3>Payment Method</h3>
            <div className="method-options">
              <label className="method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Credit/Debit Card</span>
              </label>
              <label className="method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>UPI</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'CARD' && (
            <div className="card-details">
              <h3>Card Details</h3>
              
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardHolderName">Card Holder Name</label>
                  <input
                    type="text"
                    id="cardHolderName"
                    name="cardHolderName"
                    value={paymentData.cardHolderName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryMonth">Expiry Month</label>
                  <select
                    id="expiryMonth"
                    name="expiryMonth"
                    value={paymentData.expiryMonth}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="expiryYear">Expiry Year</label>
                  <select
                    id="expiryYear"
                    name="expiryYear"
                    value={paymentData.expiryYear}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="upi-details">
              <h3>UPI Details</h3>
              <div className="form-group">
                <label htmlFor="upiId">UPI ID</label>
                <input
                  type="text"
                  id="upiId"
                  name="upiId"
                  placeholder="username@upi"
                  required
                />
              </div>
            </div>
          )}

          <div className="payment-actions">
            <button type="submit" className="btn-pay" disabled={loading}>
              {loading ? 'Processing Payment...' : `Pay ₹${paymentData.amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Payment; 