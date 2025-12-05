
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { Order, OrderStatus } from '../types';
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, ChevronDown, ChevronUp, Star, AlertCircle, X, ArrowLeftRight, Upload, RefreshCcw } from 'lucide-react';

export const MyOrders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { orders, cancelOrder, requestReturn } = useOrders();
  
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
  // Modal States
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [returningOrder, setReturningOrder] = useState<Order | null>(null);

  // Form States
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationComment, setCancellationComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // Return Form States
  const [returnType, setReturnType] = useState<'Return' | 'Exchange'>('Return');
  const [returnReason, setReturnReason] = useState('');
  const [returnComment, setReturnComment] = useState('');
  const [returnImage, setReturnImage] = useState('');

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
      cancelOrder(cancellingOrder.id, cancellationReason, cancellationComment);
      
      setCancellingOrder(null);
      setCancellationReason('');
      setCancellationComment('');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewingOrder) {
      // Removed feedback submission logic
      setReviewingOrder(null);
      setReviewRating(5);
      setReviewComment('');
      alert("Thank you for your feedback!");
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (returningOrder && returnReason && returnImage) {
        requestReturn(returningOrder.id, {
            type: returnType,
            reason: returnReason,
            comment: returnComment,
            image: returnImage,
            requestDate: new Date().toISOString().split('T')[0]
        });
        setReturningOrder(null);
        setReturnReason('');
        setReturnComment('');
        setReturnImage('');
        alert(`${returnType} Request Submitted Successfully.`);
    } else {
        alert("Please fill all fields and upload an image.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReturnImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isReturnEligible = (order: Order) => {
     if (order.status !== 'Delivered') return false;
     
     // Mocking Delivery Date if not present for logic check
     // In a real app, deliveryDate would be set when status changes to Delivered
     const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate) : new Date(order.date); 
     
     const diffTime = Math.abs(new Date().getTime() - deliveryDate.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
     
     // 3 days policy
     return diffDays <= 3;
  };

  const getTrackingSteps = (status: OrderStatus) => {
    const steps = [
      { status: 'Pending', label: 'Order Placed', icon: Clock },
      { status: 'Processing', label: 'Packed', icon: Package },
      { status: 'Shipped', label: 'Shipped', icon: Truck },
      { status: 'Delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentIdx = steps.findIndex(s => s.status === status);
    // If Cancelled or Return, show special state in list if needed, but for simple tracking:
    if (status === 'Cancelled' || status.includes('Return') || status.includes('Exchange')) return [];

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIdx,
      current: idx === currentIdx
    }));
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-stone-900">My Orders</h1>
        </div>

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
                              (order.status.includes('Return') || order.status.includes('Exchange')) ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-50 text-blue-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-stone-500">
                           Ordered on {order.date}
                           {order.timestamp && <span> at {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                        </p>
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
                    
                    {/* Refund/Return Status Display */}
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
                    {(order.status.includes('Return') || order.status.includes('Exchange')) && (
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <ArrowLeftRight className="text-orange-500 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-orange-700 text-sm">{order.status}</h4>
                                <p className="text-orange-600 text-sm mt-1">
                                    Your request is being processed. We will contact you shortly.
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
                      {(order.status !== 'Cancelled' && !order.status.includes('Return') && !order.status.includes('Exchange')) && (
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
                      
                      {/* Return / Exchange Button */}
                      {!order.status.includes('Return') && !order.status.includes('Exchange') && (
                        <button 
                          onClick={() => setReturningOrder(order)}
                          disabled={order.status !== 'Delivered' || !isReturnEligible(order)}
                          className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-stone-700 bg-white rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeftRight size={16} /> 
                          {order.status !== 'Delivered' ? 'Return available after delivery' : 
                           !isReturnEligible(order) ? 'Return window closed' : 'Return / Exchange'}
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

      {/* RETURN / EXCHANGE MODAL */}
      {returningOrder && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fade-in-down max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                    <ArrowLeftRight size={20} className="text-royal-700"/> Return or Exchange
                </h3>
                <button onClick={() => setReturningOrder(null)}><X size={20} className="text-stone-400" /></button>
              </div>
              
              <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-700">
                  Policy: Returns/Exchanges are accepted within 3 days of delivery. Product must be unused.
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-4">
                 <div className="flex bg-stone-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setReturnType('Return')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${returnType === 'Return' ? 'bg-white shadow-sm text-royal-700' : 'text-stone-500'}`}
                    >
                        Return
                    </button>
                    <button
                        type="button"
                        onClick={() => setReturnType('Exchange')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${returnType === 'Exchange' ? 'bg-white shadow-sm text-royal-700' : 'text-stone-500'}`}
                    >
                        Exchange
                    </button>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Reason</label>
                   <select 
                    required 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                   >
                     <option value="">Select a reason</option>
                     <option value="Defective / Damaged">Defective / Damaged</option>
                     <option value="Wrong Item Received">Wrong Item Received</option>
                     <option value="Size / Fit Issue">Size / Fit Issue</option>
                     <option value="Quality Not As Expected">Quality Not As Expected</option>
                   </select>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Upload Product Image (Required)</label>
                    <div className="border-2 border-dashed border-stone-300 rounded-lg p-4 text-center hover:bg-stone-50 transition-colors">
                        <input 
                            type="file" 
                            accept="image/*" 
                            required
                            onChange={handleImageUpload}
                            className="hidden" 
                            id="return-image-upload"
                        />
                        <label htmlFor="return-image-upload" className="cursor-pointer flex flex-col items-center">
                            {returnImage ? (
                                <img src={returnImage} alt="Preview" className="h-32 object-contain rounded-md" />
                            ) : (
                                <>
                                    <Upload size={24} className="text-stone-400 mb-2" />
                                    <span className="text-sm text-stone-600">Click to upload image</span>
                                    <span className="text-xs text-stone-400 mt-1">Proof of condition</span>
                                </>
                            )}
                        </label>
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Additional Comments</label>
                    <textarea 
                      rows={3}
                      value={returnComment}
                      onChange={(e) => setReturnComment(e.target.value)}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                      placeholder="Describe the issue..."
                    />
                 </div>

                 <button type="submit" className="w-full py-2.5 bg-royal-700 text-white rounded-lg hover:bg-royal-800 font-medium transition-colors">
                    Submit Request
                 </button>
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
