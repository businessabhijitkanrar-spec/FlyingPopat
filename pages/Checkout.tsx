
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useProducts } from '../context/ProductContext';
import { ArrowLeft, CreditCard, Truck, CheckCircle, ShieldCheck } from 'lucide-react';
import { OrderStatus } from '../types';

// Add type definition for Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const { cart, cartSubtotal, discountAmount, finalTotal, appliedCoupon, clearCart } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { addOrder } = useOrders();
  const { updateProductStock } = useProducts();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    zip: '',
    state: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Protected Route Check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />;
  }

  // Restrict Admin Access
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (cart.length === 0 && !isSuccess) {
    return <Navigate to="/catalog" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createOrder = async (paymentId?: string) => {
      // Create Items Summary String
      const itemsSummary = cart.map(item => `${item.name} (${item.quantity})`).join(', ');

      // Create New Order
      const newOrder = {
        id: `#ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending' as OrderStatus,
        total: finalTotal,
        subtotal: cartSubtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        itemsSummary: itemsSummary,
        paymentMethod: paymentMethod,
        paymentId: paymentId
      };

      addOrder(newOrder);

      // Deduct Stock
      for (const item of cart) {
        await updateProductStock(item.id, item.quantity);
      }

      clearCart();
      setIsProcessing(false);
      setIsSuccess(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (paymentMethod === 'cod') {
        // Simple delay for COD
        await new Promise(resolve => setTimeout(resolve, 1500));
        await createOrder();
    } else {
        // RAZORPAY INTEGRATION
        const options = {
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE', // Fallback if env not set
            amount: finalTotal * 100, // Amount in paise
            currency: "INR",
            name: "FlyingPopat",
            description: "Purchase of authentic weaves",
            image: "https://ui-avatars.com/api/?name=Flying+Popat&background=db2777&color=fff",
            handler: function (response: any) {
                // Payment Success
                console.log("Payment Successful:", response.razorpay_payment_id);
                createOrder(response.razorpay_payment_id);
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.phone
            },
            theme: {
                color: "#db2777"
            },
            modal: {
                ondismiss: function() {
                    setIsProcessing(false);
                    alert("Payment cancelled.");
                }
            }
        };

        try {
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any){
                alert("Payment Failed: " + response.error.description);
                setIsProcessing(false);
            });
            rzp1.open();
        } catch (error) {
            console.error("Razorpay Error:", error);
            alert("Failed to initiate payment. Please check your internet connection.");
            setIsProcessing(false);
        }
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
            Thank you for your purchase, {formData.name}.
          </p>
          {paymentMethod === 'online' && (
              <p className="text-sm text-green-600 font-bold mb-6">Payment Verified Successfully</p>
          )}
          {paymentMethod === 'cod' && (
              <p className="text-sm text-orange-600 font-bold mb-6">Please keep ₹{finalTotal} ready at delivery.</p>
          )}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate('/cart')} 
          className="flex items-center gap-2 text-stone-500 hover:text-royal-700 mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Cart
        </button>

        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            <form id="checkout-form" onSubmit={handleSubmit}>
              
              {/* Shipping Details */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 mb-8">
                <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
                  <Truck className="text-royal-700" size={24} /> Shipping Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input 
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                    <input 
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                    <input 
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street, House No, Apartment"
                      className="w-full border border-stone-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                    <input 
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">ZIP / Postal Code</label>
                    <input 
                      required
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                 <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-royal-700" size={24} /> Payment Method
                </h3>
                
                <div className="space-y-4">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-royal-700 bg-royal-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="online" 
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-5 h-5 text-royal-700 border-stone-300 focus:ring-royal-500"
                    />
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-stone-900">Online Payment (Razorpay)</span>
                      <span className="block text-xs text-stone-500">Credit/Debit Card, UPI, Net Banking</span>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-royal-700 bg-royal-50' : 'border-stone-200 hover:bg-stone-50'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cod" 
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-5 h-5 text-royal-700 border-stone-300 focus:ring-royal-500"
                    />
                    <div className="ml-4">
                      <span className="block text-sm font-bold text-stone-900">Cash on Delivery</span>
                      <span className="block text-xs text-stone-500">Pay when you receive your order</span>
                    </div>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-xl shadow-lg border border-stone-100 sticky top-24">
                <h3 className="font-serif text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 rounded-md overflow-hidden bg-stone-100 flex-shrink-0">
                         <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-stone-900 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-stone-500">{item.quantity} x ₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-sm font-medium text-stone-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2 text-sm text-stone-600 mb-6">
                   <div className="flex justify-between">
                     <span>Subtotal</span>
                     <span>₹{cartSubtotal.toLocaleString('en-IN')}</span>
                   </div>
                   {appliedCoupon && (
                     <div className="flex justify-between text-green-600 font-medium">
                       <span>Discount ({appliedCoupon.code})</span>
                       <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                     </div>
                   )}
                   <div className="flex justify-between">
                     <span>Shipping</span>
                     <span className="text-green-600">Free</span>
                   </div>
                   <div className="flex justify-between font-bold text-lg text-stone-900 pt-2 border-t border-stone-100 mt-2">
                     <span>Total</span>
                     <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                   </div>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isProcessing}
                  className="w-full bg-royal-700 text-white py-4 rounded-xl font-bold hover:bg-royal-800 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Place Order • ₹${finalTotal.toLocaleString('en-IN')}`}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-400">
                  <ShieldCheck size={14} /> Secure SSL Encrypted Transaction
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
