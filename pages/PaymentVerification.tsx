
import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ArrowRight, Loader2, PackageCheck, CreditCard, Lock } from 'lucide-react';
import { OrderStatus } from '../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartSubtotal, discountAmount, finalTotal, appliedCoupon, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { updateProductStock } = useProducts();
  const { isAuthenticated, user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Get data passed from checkout
  const { shippingData, paymentMethod } = location.state || {};

  if (!isAuthenticated || !shippingData || cart.length === 0) {
    if (isSuccess) {
        // Allow staying if success (for the thank you message)
    } else {
        return <Navigate to="/cart" replace />;
    }
  }

  const createOrder = async (paymentId?: string) => {
    try {
      // Create Items Summary String
      const itemsSummary = cart.map(item => `${item.name} (${item.quantity})`).join(', ');

      // Create New Order
      const newOrder = {
        id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: shippingData.name,
        email: shippingData.email,
        phone: shippingData.phone,
        address: shippingData.address,
        city: shippingData.city,
        zip: shippingData.zip,
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        status: 'Pending' as OrderStatus,
        total: finalTotal,
        subtotal: cartSubtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        itemsSummary: itemsSummary,
        paymentMethod: paymentMethod,
        paymentId: paymentId || null
      };

      await addOrder(newOrder);

      // Deduct Stock
      for (const item of cart) {
        await updateProductStock(item.id, item.quantity);
      }

      clearCart();
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Order placement failed:", err);
      setError(err.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleRazorpayPayment = () => {
    setIsSubmitting(true);
    setError('');

    // Load Razorpay Script if not present
    if (!window.Razorpay) {
        setError("Payment gateway failed to load. Please check internet or try COD.");
        setIsSubmitting(false);
        return;
    }

    const options = {
      key: process.env.RAZORPAY_KEY_ID || '', // Use env key or empty string
      amount: finalTotal * 100, // Amount in paise
      currency: "INR",
      name: "FlyingPopat",
      description: "Saree Purchase",
      image: "https://ui-avatars.com/api/?name=Flying+Popat&background=be185d&color=fff",
      handler: function (response: any) {
        // Success Handler
        createOrder(response.razorpay_payment_id);
      },
      prefill: {
        name: shippingData.name,
        email: shippingData.email,
        contact: shippingData.phone
      },
      theme: {
        color: "#be185d"
      },
      modal: {
        ondismiss: function() {
            setIsSubmitting(false);
        }
      }
    };

    try {
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
            setError(`Payment Failed: ${response.error.description}`);
            setIsSubmitting(false);
        });
        rzp1.open();
    } catch (e) {
        // If key is missing or invalid, offer simulated success for demo purposes
        console.warn("Razorpay Init Failed (likely missing key). Simulating success.");
        if (confirm("Razorpay Key missing in demo. Simulate successful payment?")) {
            setTimeout(() => createOrder(`pay_simulated_${Date.now()}`), 1000);
        } else {
            setIsSubmitting(false);
            setError("Payment cancelled or configured incorrectly.");
        }
    }
  };

  const handleCODConfirm = () => {
    setIsSubmitting(true);
    setError('');
    createOrder();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-fade-in-down">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 mb-4">Order Placed!</h2>
          <p className="text-stone-600 mb-2">
            Thank you for your purchase, {shippingData.name}.
          </p>
          <p className="text-sm text-stone-500 mb-6">
            {paymentMethod === 'online' 
                ? "Payment successfully received. Your order is being processed."
                : "Your order will be shipped soon. Please pay cash on delivery."
            }
          </p>
          <button 
            onClick={() => navigate('/catalog')}
            className="w-full bg-royal-700 text-white py-3 rounded-lg font-bold hover:bg-royal-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden">
          <div className="bg-royal-900 text-white p-6 text-center">
            <h1 className="font-serif text-2xl font-bold">Confirm & Pay</h1>
            <p className="text-royal-200 text-sm mt-1">
                {paymentMethod === 'online' ? 'Secure Online Payment' : 'Cash on Delivery'}
            </p>
          </div>

          <div className="p-8 space-y-8">
            
            <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-2 ${paymentMethod === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                    {paymentMethod === 'online' ? <CreditCard size={32} /> : <PackageCheck size={32} />}
                </div>
                <h3 className="text-xl font-bold text-stone-900">
                    {paymentMethod === 'online' ? 'Complete Your Payment' : 'You\'re almost done!'}
                </h3>
                <p className="text-stone-600">
                    Total Payable Amount: <span className="font-bold text-stone-900">₹{finalTotal.toLocaleString('en-IN')}</span>
                </p>
                {paymentMethod === 'cod' && (
                    <div className="bg-stone-50 p-4 rounded-lg text-sm text-stone-500 border border-stone-100">
                        <p>Please ensure you have the exact amount ready upon delivery.</p>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

            <div className="pt-2">
              {paymentMethod === 'online' ? (
                  <button 
                    onClick={handleRazorpayPayment}
                    disabled={isSubmitting}
                    className="w-full bg-royal-700 text-white py-4 rounded-xl font-bold hover:bg-royal-800 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Processing...
                      </>
                    ) : (
                      <>
                        Pay ₹{finalTotal.toLocaleString('en-IN')} Now <Lock size={18} />
                      </>
                    )}
                  </button>
              ) : (
                  <button 
                    onClick={handleCODConfirm}
                    disabled={isSubmitting}
                    className="w-full bg-royal-700 text-white py-4 rounded-xl font-bold hover:bg-royal-800 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Placing Order...
                      </>
                    ) : (
                      <>
                        Confirm Order <ArrowRight size={20} />
                      </>
                    )}
                  </button>
              )}
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 py-2 text-stone-500 hover:text-stone-800 text-sm font-medium"
              >
                Cancel and Return to Checkout
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};