
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useFeedback } from '../context/FeedbackContext';
import { Order, OrderStatus } from '../types';
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, ChevronDown, ChevronUp, Star, AlertCircle, X, RefreshCcw } from 'lucide-react';

export const MyOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const { addFeedback } = useFeedback();
  
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Modal States
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);

  // Form States
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationComment, setCancellationComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Filter orders for the logged-in user (matching email for this demo)
  const myOrders = orders.filter(o => o.email === user.email);

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cancellingOrder && cancellationReason) {
      cancelOrder(cancellingOrder.id);
      addFeedback({
        id: Date.now().toString(),
        orderId: cancellingOrder.id,
        userId: user.id,
        userName: user.name,
        type: 'cancellation',
        reason: cancellationReason,
        comment: cancellationComment,
        date: new Date().toISOString().split('T')[0]
      });
      setCancellingOrder(null);
      setCancellationReason('');
      setCancellationComment('');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewingOrder) {
      addFeedback({
        id: Date.now().toString(),
        orderId: reviewingOrder.id,
        userId: user.id,
        userName: user.name,
        type: 'review',
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toISOString().split('T')[0]
      });
      setReviewingOrder(null);
      setReviewRating(5);
      setReviewComment('');
      alert("Thank you for your feedback!");
    }
  };

  const getTrackingSteps = (status: OrderStatus) => {
    const steps = [
      { status: 'Pending', label: 'Order Placed', icon: Clock },
      { status: 'Processing', label: 'Packed', icon: Package },
      { status: 'Shipped', label: 'Shipped', icon: Truck },
      { status: 'Delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentIdx = steps.findIndex(s => s.status === status);
    // If Cancelled, show special state
    if (status === 'Cancelled') return [];

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIdx,
      current: idx === currentIdx
    }));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-8">My Orders</h1>

        {myOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm text-center">
             <Package size={48} className="mx-auto text-stone-300 mb-4" />
             <h3 className="text-xl font-medium text-stone-900">No orders found</h3>
             <p className="text-stone-500 mt-2">Looks like you haven't made any purchases yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-stone-900">{order.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                              'bg-blue-50 text-blue-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500">Ordered on {order.date}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-stone-900">₹{order.total.toLocaleString('en-IN')}</span>
                        {expandedOrder === order.id ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
                      </div>
                   </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-stone-100 bg-stone-50/50 p-6 animate-fade-in-down">
                    
                    {/* Refund Status Display */}
                    {order.status === 'Cancelled' && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <RefreshCcw className="text-red-500 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-red-700 text-sm">Order Cancelled</h4>
                                <p className="text-red-600 text-sm mt-1">
                                    Refund Status: <span className="font-bold uppercase tracking-wide bg-white px-2 py-0.5 rounded border border-red-200 ml-1">{order.refundStatus || 'Pending'}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Items</h4>
                        <p className="text-stone-800 text-sm font-medium">{order.itemsSummary}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Delivery Address</h4>
                        <p className="text-stone-600 text-sm">
                          {order.address}<br />
                          {order.city}, {order.zip}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-stone-200">
                      {order.status !== 'Cancelled' && (
                        <button 
                          onClick={() => setTrackingOrder(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-royal-700 text-white rounded-lg text-sm font-medium hover:bg-royal-800 transition-colors"
                        >
                          <MapPin size={16} /> Track Order
                        </button>
                      )}
                      
                      {(order.status === 'Pending' || order.status === 'Processing') && (
                        <button 
                          onClick={() => setCancellingOrder(order)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          <XCircle size={16} /> Cancel Order
                        </button>
                      )}

                      {order.status === 'Delivered' && (
                         <button 
                          onClick={() => setReviewingOrder(order)}
                          className="flex items-center gap-2 px-4 py-2 border border-yellow-200 text-yellow-700 bg-white rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
                        >
                          <Star size={16} /> Write Review
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TRACKING MODAL */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-down">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-xl font-bold">Track Shipment</h3>
                <button onClick={() => setTrackingOrder(null)}><X size={20} className="text-stone-400" /></button>
              </div>

              {trackingOrder.status === 'Cancelled' ? (
                <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg">
                  <XCircle size={48} className="mx-auto mb-2" />
                  <p className="font-bold">This order has been cancelled.</p>
                </div>
              ) : (
                <div className="space-y-8 relative">
                   {/* Vertical Line for Desktop / Horizontal for Mobile could be complex, doing simple list tracking */}
                   <div className="space-y-6">
                     {getTrackingSteps(trackingOrder.status).map((step, idx) => (
                       <div key={idx} className="flex gap-4">
                         <div className="flex flex-col items-center">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}>
                             <step.icon size={16} />
                           </div>
                           {idx < 3 && <div className={`w-0.5 h-full my-1 ${step.completed ? 'bg-green-200' : 'bg-stone-100'}`} />}
                         </div>
                         <div className="pb-6">
                            <p className={`font-bold text-sm ${step.completed ? 'text-stone-900' : 'text-stone-400'}`}>{step.label}</p>
                            {step.current && <p className="text-xs text-green-600 font-medium">Current Status</p>}
                            {step.completed && <p className="text-xs text-stone-500">{new Date().toLocaleDateString()}</p>}
                         </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {cancellingOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-down">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-red-600 flex items-center gap-2"><AlertCircle size={20}/> Cancel Order</h3>
                <button onClick={() => setCancellingOrder(null)}><X size={20} className="text-stone-400" /></button>
              </div>
              
              <p className="text-sm text-stone-600 mb-6">Are you sure you want to cancel order <b>{cancellingOrder.id}</b>? This action cannot be undone.</p>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Reason for Cancellation</label>
                   <select 
                    required 
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                   >
                     <option value="">Select a reason</option>
                     <option value="Changed my mind">Changed my mind</option>
                     <option value="Found better price">Found better price</option>
                     <option value="Ordered by mistake">Ordered by mistake</option>
                     <option value="Delivery time too long">Delivery time too long</option>
                     <option value="Other">Other</option>
                   </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Additional Comments</label>
                    <textarea 
                      rows={3}
                      value={cancellationComment}
                      onChange={(e) => setCancellationComment(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                      placeholder="Tell us more about why you're cancelling..."
                    />
                 </div>
                 <div className="flex gap-3 pt-2">
                   <button type="button" onClick={() => setCancellingOrder(null)} className="flex-1 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50">Keep Order</button>
                   <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirm Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-down">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-royal-700 flex items-center gap-2"><Star size={20} className="fill-current"/> Write a Review</h3>
                <button onClick={() => setReviewingOrder(null)}><X size={20} className="text-stone-400" /></button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-2">Rate your experience</label>
                   <div className="flex gap-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                       <button 
                        key={star} 
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                       >
                         <Star size={32} className={`${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-stone-200'}`} />
                       </button>
                     ))}
                   </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Your Feedback</label>
                    <textarea 
                      required
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                      placeholder="How was the saree quality? Delivery experience?"
                    />
                 </div>

                 <button type="submit" className="w-full py-2 bg-royal-700 text-white rounded-lg hover:bg-royal-800 font-medium">Submit Feedback</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
