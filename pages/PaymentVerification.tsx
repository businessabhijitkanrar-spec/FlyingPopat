import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Upload, ArrowRight, Copy, Loader2, Image as ImageIcon } from 'lucide-react';
import { OrderStatus } from '../types';

export const PaymentVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartSubtotal, discountAmount, finalTotal, appliedCoupon, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { updateProductStock } = useProducts();
  const { isAuthenticated } = useAuth();

  const [screenshot, setScreenshot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Get data passed from checkout
  const { shippingData } = location.state || {};

  if (!isAuthenticated || !shippingData || cart.length === 0) {
    if (isSuccess) {
        // Allow staying if success (for the thank you message)
    } else {
        return <Navigate to="/cart" replace />;
    }
  }

  const upiId = "9875483952@ybl";

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    alert('UPI ID copied to clipboard');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large. Please upload image under 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmOrder = async () => {
    if (!screenshot) {
      setError("Please upload the payment screenshot to confirm your order.");
      return;
    }

    setIsSubmitting(true);
    setError('');

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
        status: 'Pending' as OrderStatus,
        total: finalTotal,
        subtotal: cartSubtotal,
        discount: discountAmount,
        // FIX: Firebase crashes if this is undefined. Must be string or null.
        couponCode: appliedCoupon?.code || null,
        itemsSummary: itemsSummary,
        paymentMethod: 'online' as const,
        paymentScreenshot: screenshot // Save the screenshot
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
    } finally {
      setIsSubmitting(false);
    }
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
            We will verify your payment screenshot and process your order shortly.
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-8 text-center">Complete Payment</h1>

        <div className="bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden">
          <div className="bg-royal-900 text-white p-6 text-center">
            <p className="text-sm opacity-80 mb-1">Total Payable Amount</p>
            <p className="text-4xl font-bold">₹{finalTotal.toLocaleString('en-IN')}</p>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Step 1: Payment Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-royal-100 text-royal-700 flex items-center justify-center font-bold">1</div>
                <h3 className="font-bold text-lg text-stone-900">Make Payment via UPI</h3>
              </div>
              
              <div className="ml-11 bg-stone-50 p-6 rounded-xl border border-stone-200">
                <p className="text-sm text-stone-600 mb-2">Send payment to the following UPI ID:</p>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-stone-300">
                  <span className="flex-1 font-mono font-bold text-stone-800 text-lg">{upiId}</span>
                  <button 
                    onClick={handleCopyUPI}
                    className="p-2 text-royal-700 hover:bg-royal-50 rounded-lg transition-colors"
                    title="Copy UPI ID"
                  >
                    <Copy size={20} />
                  </button>
                </div>
                <p className="text-xs text-stone-500 mt-2">
                  Compatible with GPay, PhonePe, Paytm, etc.
                </p>
              </div>
            </div>

            {/* Step 2: Upload Screenshot */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-royal-100 text-royal-700 flex items-center justify-center font-bold">2</div>
                <h3 className="font-bold text-lg text-stone-900">Upload Payment Screenshot</h3>
              </div>
              
              <div className="ml-11">
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {screenshot ? (
                    <div className="relative">
                      <img src={screenshot} alt="Payment Proof" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white font-medium flex items-center gap-2"><Upload size={16}/> Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="w-12 h-12 bg-royal-50 text-royal-700 rounded-full flex items-center justify-center mb-3">
                         <ImageIcon size={24} />
                      </div>
                      <p className="font-medium text-stone-700">Click to upload screenshot</p>
                      <p className="text-xs text-stone-400 mt-1">Supported: JPG, PNG, JPEG</p>
                    </div>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100">
              <button 
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="w-full bg-royal-700 text-white py-4 rounded-xl font-bold hover:bg-royal-800 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Verifying...
                  </>
                ) : (
                  <>
                    Confirm Payment & Place Order <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};