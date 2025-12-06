
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, ArrowRight, Banknote, Smartphone } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, cartSubtotal, discountAmount, finalTotal, appliedCoupon } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();
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

  // Protected Route Check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} replace />;
  }

  // Restrict Admin Access
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (cart.length === 0) {
    return <Navigate to="/catalog" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Navigate to Confirmation Page with selected payment method
    navigate('/payment-verification', { 
        state: { 
            shippingData: formData,
            totalAmount: finalTotal,
            paymentMethod: paymentMethod
        } 
    });
    
    setIsProcessing(false);
  };

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

              {/* Payment Method Preview */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                 <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="text-royal-700" size={24} /> Payment Method
                </h3>
                
                <div className="space-y-4">
                  {/* Razorpay Option */}
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-royal-700 bg-royal-50 ring-1 ring-royal-700' : 'border-stone-200 hover:bg-stone-50'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="online" 
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="w-5 h-5 text-royal-700 border-stone-300 focus:ring-royal-500"
                    />
                    <div className="ml-4 flex items-center gap-3 w-full">
                      <div className="p-2 bg-royal-100 text-royal-700 rounded-full">
                        <Smartphone size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm font-bold text-stone-900">Online Payment</span>
                        <span className="block text-xs text-stone-500">UPI, Cards, Netbanking (Razorpay)</span>
                      </div>
                      <div className="flex gap-1">
                         <div className="h-4 w-8 bg-blue-100 rounded"></div>
                         <div className="h-4 w-8 bg-orange-100 rounded"></div>
                      </div>
                    </div>
                  </label>

                  {/* COD Option */}
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-royal-700 bg-royal-50 ring-1 ring-royal-700' : 'border-stone-200 hover:bg-stone-50'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cod" 
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-5 h-5 text-royal-700 border-stone-300 focus:ring-royal-500"
                    />
                    <div className="ml-4 flex items-center gap-3">
                      <div className="p-2 bg-green-100 text-green-700 rounded-full">
                        <Banknote size={20} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-stone-900">Cash on Delivery</span>
                        <span className="block text-xs text-stone-500">Pay with cash when your order arrives</span>
                      </div>
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
                  {isProcessing ? 'Processing...' : (
                    <>
                      {paymentMethod === 'online' ? 'Proceed to Payment' : 'Review COD Order'} <ArrowRight size={18} />
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-stone-400">
                  <ShieldCheck size={14} /> Secure Order Processing
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};