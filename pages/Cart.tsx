
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCoupon } from '../context/CouponContext';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, Ticket } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, cartSubtotal, discountAmount, finalTotal, appliedCoupon, applyCoupon } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { validateCoupon } = useCoupon();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' as 'success' | 'error' | '' });

  // Restrict Admin Access
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    const coupon = validateCoupon(couponCode);
    if (coupon) {
      applyCoupon(coupon);
      setCouponMessage({ text: `Coupon applied! You saved ${coupon.discountPercentage}%`, type: 'success' });
    } else {
      setCouponMessage({ text: 'Invalid or expired coupon code.', type: 'error' });
      applyCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponCode('');
    setCouponMessage({ text: '', type: '' });
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login, but set 'from' to /checkout so they go there after login
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-stone-50 px-4 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4 text-stone-800">Your Cart is Empty</h2>
        <p className="text-stone-600 mb-8 max-w-md">Looks like you haven't found your perfect drape yet. Veda, our AI stylist, is waiting to help you.</p>
        <Link 
          to="/catalog" 
          className="bg-royal-700 text-white px-8 py-3 rounded-full hover:bg-royal-800 transition-all font-medium"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold mb-8 text-stone-900">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items */}
          <div className="flex-1 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm flex gap-6 items-center">
                <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-lg bg-stone-100" />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-royal-700 font-bold uppercase">{item.category}</p>
                      <h3 className="font-serif text-lg font-bold text-stone-900">{item.name}</h3>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p className="text-stone-600 text-sm mb-4">Fabric: {item.fabric}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-white rounded shadow-sm disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-white rounded shadow-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-lg text-stone-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              onClick={clearCart} 
              className="text-sm text-red-500 hover:underline font-medium"
            >
              Clear Cart
            </button>
          </div>

          {/* Checkout Summary */}
          <div className="lg:w-96">
            <div className="bg-white p-8 rounded-xl shadow-lg sticky top-24">
              <h3 className="font-serif text-xl font-bold mb-6">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-stone-700 mb-2">Discount Coupon</label>
                <div className="flex gap-2">
                   <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Ticket size={16} className="text-stone-400" />
                      </div>
                      <input 
                        type="text" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon}
                        placeholder="Enter Code"
                        className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-royal-500 disabled:bg-stone-50"
                      />
                   </div>
                   {appliedCoupon ? (
                      <button 
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Remove
                      </button>
                   ) : (
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={!couponCode}
                        className="px-3 py-2 bg-royal-700 text-white rounded-lg text-sm font-medium hover:bg-royal-800 transition-colors disabled:opacity-50"
                      >
                        Apply
                      </button>
                   )}
                </div>
                {couponMessage.text && (
                  <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              <div className="space-y-4 text-sm text-stone-600 mb-6 border-t border-stone-100 pt-4">
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
                {/* Tax removed */}
              </div>

              <div className="border-t border-stone-100 pt-4 mb-8">
                <div className="flex justify-between font-bold text-lg text-stone-900">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-royal-700 text-white py-4 rounded-xl font-bold hover:bg-royal-800 transition-colors shadow-lg flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              
              <p className="text-xs text-center text-stone-400 mt-4">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
