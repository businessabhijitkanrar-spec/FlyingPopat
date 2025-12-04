
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useFeedback } from '../context/FeedbackContext';
import { useInquiry } from '../context/InquiryContext';
import { useCoupon } from '../context/CouponContext';
import { isFirebaseConfigured } from '../firebase-config';
import { ProductCategory, Product, Order, OrderStatus, RefundStatus, Coupon } from '../types';
import { 
  Package, 
  TrendingUp, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  ShoppingBag, 
  Grid, 
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Star,
  Download,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Pencil,
  RefreshCcw,
  MinusCircle,
  Tag,
  Inbox,
  TicketPercent,
  FileText
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, allUsers } = useAuth();
  const { products, deleteProduct, addProduct, updateProduct } = useProducts();
  const { orders, updateOrderStatus, updateRefundStatus } = useOrders();
  const { feedbacks } = useFeedback();
  const { inquiries, markAsRead, deleteInquiry } = useInquiry();
  const { coupons, addCoupon, deleteCoupon, toggleCouponStatus } = useCoupon();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'customers' | 'feedback' | 'inquiries' | 'coupons'>('orders');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending');
  const [statusNote, setStatusNote] = useState('');
  const [newRefundStatus, setNewRefundStatus] = useState<RefundStatus>('Pending');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  // Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);

  // Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    mrp: 0,
    section: 'Saree', // Default section
    category: ProductCategory.BANARASI,
    description: '',
    fabric: '',
    colors: [],
    occasion: [],
    details: [],
    care: [],
    tags: [],
    image: 'https://picsum.photos/600/800?random=' + Date.now()
  });

  // Local state for array inputs
  const [colorsInput, setColorsInput] = useState('');
  const [occasionInput, setOccasionInput] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [careInput, setCareInput] = useState('');
  
  // State for multiple images
  const [productImages, setProductImages] = useState<string[]>(['']);

  const AVAILABLE_TAGS = ['New Arrival', 'Hot Selling', 'Best Value'];

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const resetForm = () => {
    setNewProduct({
      name: '',
      price: 0,
      mrp: 0,
      section: 'Saree',
      category: ProductCategory.BANARASI,
      description: '',
      fabric: '',
      colors: [],
      occasion: [],
      details: [],
      care: [],
      tags: [],
      image: 'https://picsum.photos/600/800?random=' + Date.now()
    });
    setColorsInput('');
    setOccasionInput('');
    setDetailsInput('');
    setCareInput('');
    setProductImages(['']);
    setIsEditing(false);
    setEditingProductId(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.price) {
      // Filter out empty image strings
      const validImages = productImages.filter(img => img.trim() !== '');
      const mainImage = validImages.length > 0 ? validImages[0] : (newProduct.image || '');

      // Ensure MRP is at least equal to price if set
      const finalPrice = Number(newProduct.price);
      let finalMrp = newProduct.mrp ? Number(newProduct.mrp) : 0;
      if (finalMrp < finalPrice) finalMrp = finalPrice;

      const productData: Product = {
        ...newProduct as Product,
        price: finalPrice,
        mrp: finalMrp,
        id: isEditing && editingProductId ? editingProductId : Date.now().toString(),
        image: mainImage,
        images: validImages,
        colors: colorsInput.split(',').map(s => s.trim()).filter(Boolean),
        occasion: occasionInput.split(',').map(s => s.trim()).filter(Boolean),
        details: detailsInput.split('\n').map(s => s.trim()).filter(Boolean),
        care: careInput.split('\n').map(s => s.trim()).filter(Boolean),
        tags: newProduct.tags || []
      };

      if (isEditing) {
        updateProduct(productData);
      } else {
        addProduct(productData);
      }

      setShowAddModal(false);
      resetForm();
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCouponCode && newCouponDiscount > 0) {
      await addCoupon({
        id: Date.now().toString(),
        code: newCouponCode.toUpperCase(),
        discountPercentage: Number(newCouponDiscount),
        isActive: true
      });
      setNewCouponCode('');
      setNewCouponDiscount(10);
    }
  };

  const handleEditClick = (product: Product) => {
    setNewProduct(product);
    setEditingProductId(product.id);
    setColorsInput(product.colors.join(', '));
    setOccasionInput(product.occasion.join(', '));
    setDetailsInput(product.details ? product.details.join('\n') : '');
    setCareInput(product.care ? product.care.join('\n') : '');
    
    // Setup images
    if (product.images && product.images.length > 0) {
      setProductImages(product.images);
    } else {
      setProductImages([product.image]);
    }
    
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleModalClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...productImages];
        newImages[index] = reader.result as string;
        setProductImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (value: string, index: number) => {
    const newImages = [...productImages];
    newImages[index] = value;
    setProductImages(newImages);
  };

  const addImageSlot = () => {
    if (productImages.length < 3) {
      setProductImages([...productImages, '']);
    }
  };

  const removeImageSlot = (index: number) => {
    const newImages = productImages.filter((_, i) => i !== index);
    setProductImages(newImages.length ? newImages : ['']);
  };

  const toggleTag = (tag: string) => {
    setNewProduct(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleUpdateStatus = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, newStatus, statusNote);
      if (selectedOrder.status === 'Cancelled' && newStatus !== 'Cancelled') {
        // Reset refund status if un-cancelled (rare case)
        updateRefundStatus(selectedOrder.id, 'Pending');
      }
      setSelectedOrder(null);
      setStatusNote('');
    }
  };

  const handleUpdateRefundStatus = () => {
    if (selectedOrder) {
      updateRefundStatus(selectedOrder.id, newRefundStatus);
      setSelectedOrder(null);
    }
  };

  const handleExportCustomers = () => {
    const customers = allUsers.filter(u => u.role === 'user');
    const dataStr = JSON.stringify(customers, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vastra_customers_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) || 
    o.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase())
  );

  const filteredCustomers = allUsers.filter(u => 
    u.role === 'user' && (
      u.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Processing': return 'bg-yellow-100 text-yellow-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} className="mr-1" />;
      case 'Shipped': return <Truck size={14} className="mr-1" />;
      case 'Processing': return <Clock size={14} className="mr-1" />;
      case 'Pending': return <Clock size={14} className="mr-1" />;
      case 'Cancelled': return <XCircle size={14} className="mr-1" />;
      default: return null;
    }
  };

  const orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const refundStatuses: RefundStatus[] = ['Pending', 'Processed', 'Failed'];

  // Categories helper
  const SAREE_CATEGORIES = [ProductCategory.BANARASI, ProductCategory.KANJEEVARAM, ProductCategory.CHIFFON, ProductCategory.COTTON, ProductCategory.GEORGETTE, ProductCategory.LINEN];
  const KIDS_CATEGORIES = [ProductCategory.LEHENGA, ProductCategory.KURTA_SET, ProductCategory.FROCK, ProductCategory.SHERWANI, ProductCategory.GOWN];

  const currentCategoryOptions = newProduct.section === 'Kids' ? KIDS_CATEGORIES : SAREE_CATEGORIES;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex-shrink-0">
        <div className="p-6 border-b border-stone-100">
           <h2 className="font-serif text-xl font-bold text-stone-900">Admin Panel</h2>
           <p className="text-xs text-stone-500 mt-1">Manage Store & Orders</p>
           
           {/* System Status Indicator */}
           <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isFirebaseConfigured ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
              {isFirebaseConfigured ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isFirebaseConfigured ? 'System Online' : 'Local Mode'}
           </div>
        </div>
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <ShoppingBag size={20} />
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'catalog' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Grid size={20} />
            Catalog
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Users size={20} />
            Customers
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'feedback' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <MessageSquare size={20} />
            Feedbacks
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <Inbox size={20} />
            Inquiries
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coupons' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}
          >
            <TicketPercent size={20} />
            Coupons
          </button>
        </nav>
        
        {/* Mini Stats in Sidebar */}
        <div className="p-6 mt-auto">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-4">
             <div>
               <p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Total Sales</p>
               <p className="text-lg font-bold text-stone-900">₹{orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}</p>
             </div>
             <div>
               <p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Registered Users</p>
               <p className="text-lg font-bold text-royal-600">{allUsers.filter(u => u.role === 'user').length}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 font-serif capitalize">
            {activeTab} Management
          </h1>
          <p className="text-stone-500">
            {activeTab === 'orders' && 'View and manage customer orders'}
            {activeTab === 'catalog' && 'Update your collection and manage inventory'}
            {activeTab === 'customers' && 'View registered customer details'}
            {activeTab === 'feedback' && 'Customer reviews and cancellation reasons'}
            {activeTab === 'inquiries' && 'View messages from Contact Us form'}
            {activeTab === 'coupons' && 'Manage discount codes and promotions'}
          </p>
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Order Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search orders by ID or Name..." 
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-500 w-full bg-white"
                />
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setStatusNote(order.statusNote || ''); setNewRefundStatus(order.refundStatus || 'Pending'); }} 
                        className="hover:bg-stone-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4 font-mono font-medium text-stone-900">{order.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-stone-900">{order.customerName}</div>
                          <div className="text-xs text-stone-400">{order.email}</div>
                        </td>
                        <td className="px-6 py-4">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-stone-800">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={order.itemsSummary}>{order.itemsSummary}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            className="text-stone-400 hover:text-royal-700 transition-colors"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="p-8 text-center text-stone-500">
                  No orders found matching "{orderSearchTerm}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search customers..." 
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-500 w-full bg-white"
                />
              </div>
              <button 
                onClick={handleExportCustomers}
                className="flex items-center gap-2 bg-royal-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-royal-800 transition-colors shadow-sm"
              >
                <Download size={16} /> Export Data
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Phone Number</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Password (Stored)</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <img src={customer.avatar} alt="" className="w-8 h-8 rounded-full" />
                             <span className="font-medium text-stone-900">{customer.name}</span>
                           </div>
                        </td>
                         <td className="px-6 py-4 font-mono text-stone-700">
                            {customer.countryCode ? `${customer.countryCode} ` : ''}{customer.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4">{customer.email}</td>
                        <td className="px-6 py-4 font-mono bg-stone-50 text-stone-600 px-2 py-1 rounded w-fit">
                           {customer.password}
                        </td>
                        <td className="px-6 py-4">{customer.joinedDate || '2024-03-15'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-stone-500">
                  No customers found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
           <div className="space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Reason / Rating</th>
                      <th className="px-6 py-4">Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {feedbacks.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 text-xs">{item.date}</td>
                        <td className="px-6 py-4 font-medium text-stone-900">{item.userName}</td>
                        <td className="px-6 py-4 font-mono text-xs">{item.orderId}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase ${item.type === 'cancellation' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.type === 'review' ? (
                            <div className="flex items-center gap-1 text-yellow-500">
                              <span className="font-bold text-stone-900">{item.rating}</span> <Star size={14} className="fill-current"/>
                            </div>
                          ) : (
                            <span className="text-stone-700 font-medium">{item.reason}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 italic text-stone-500 max-w-xs truncate" title={item.comment}>
                          "{item.comment}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
               {feedbacks.length === 0 && (
                  <div className="p-8 text-center text-stone-500">No feedbacks received yet.</div>
               )}
             </div>
           </div>
        )}
        
        {/* INQUIRIES TAB */}
        {activeTab === 'inquiries' && (
           <div className="space-y-6">
             <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Message</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className={`hover:bg-stone-50/50 transition-colors ${inq.status === 'New' ? 'bg-royal-50/30' : ''}`}>
                        <td className="px-6 py-4 text-xs">{inq.date}</td>
                        <td className="px-6 py-4 font-medium text-stone-900">{inq.name}</td>
                        <td className="px-6 py-4">{inq.email}</td>
                        <td className="px-6 py-4 font-medium text-stone-800">{inq.subject}</td>
                        <td className="px-6 py-4 max-w-xs truncate text-stone-600" title={inq.message}>
                          {inq.message}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase ${inq.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                             {inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                             {inq.status === 'New' && (
                               <button 
                                 onClick={() => markAsRead(inq.id)}
                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                 title="Mark as Read"
                               >
                                 <CheckCircle size={16} />
                               </button>
                             )}
                             <button 
                               onClick={() => deleteInquiry(inq.id)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                               title="Delete Inquiry"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
               {inquiries.length === 0 && (
                  <div className="p-8 text-center text-stone-500">No new inquiries.</div>
               )}
             </div>
           </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
               <h3 className="text-lg font-bold mb-4">Create New Coupon</h3>
               <form onSubmit={handleAddCoupon} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Coupon Code</label>
                    <input 
                      type="text" 
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                      placeholder="e.g. SUMMER25"
                    />
                  </div>
                  <div className="w-full sm:w-32">
                    <label className="block text-sm font-medium text-stone-700 mb-1">Discount %</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-royal-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-royal-800 transition-colors">
                    Add Coupon
                  </button>
               </form>
            </div>

             <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-lg text-stone-800">{coupon.code}</td>
                        <td className="px-6 py-4 font-medium text-green-600">{coupon.discountPercentage}% OFF</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition-colors ${coupon.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          >
                             {coupon.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                             <button 
                               onClick={() => deleteCoupon(coupon.id)}
                               className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                               title="Delete Coupon"
                             >
                               <Trash2 size={16} />
                             </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
               </div>
               {coupons.length === 0 && (
                  <div className="p-8 text-center text-stone-500">No coupons available.</div>
               )}
             </div>
          </div>
        )}

        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">Total Products</p>
                  <h3 className="text-2xl font-bold text-stone-900">{products.length}</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">Top Category</p>
                  <h3 className="text-2xl font-bold text-stone-900">Banarasi</h3>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-stone-500 font-medium">Low Stock</p>
                  <h3 className="text-2xl font-bold text-stone-900">3 Items</h3>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-500 w-full bg-white"
                />
              </div>
              <button 
                onClick={() => { setShowAddModal(true); setIsEditing(false); resetForm(); }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-royal-700 text-white px-5 py-2.5 rounded-lg hover:bg-royal-800 transition-colors shadow-md font-medium"
              >
                <Plus size={18} /> Add New Item
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Section</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Pricing</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img src={product.image} alt="" className="w-10 h-10 rounded object-cover bg-stone-100" />
                            <span className="font-medium text-stone-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.section === 'Kids' ? 'bg-pink-50 text-pink-700' : 'bg-royal-50 text-royal-700'}`}>
                            {product.section}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           {product.category}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-stone-900">SP: ₹{product.price.toLocaleString('en-IN')}</span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-stone-400 line-through">MRP: ₹{product.mrp.toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(product)}
                              className="text-stone-400 hover:text-royal-600 transition-colors p-2 hover:bg-royal-50 rounded-full"
                              title="Edit Product"
                            >
                              <Pencil size={18} />
                            </button>
                            <button 
                              onClick={() => deleteProduct(product.id)}
                              className="text-stone-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                              title="Delete Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-stone-500">
                  No products found.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-lg overflow-hidden animate-fade-in-down max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-royal-900 text-white sticky top-0 z-10">
              <h3 className="font-bold text-lg">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={handleModalClose} className="hover:bg-white/10 p-1 rounded transition-colors">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              {/* Product Images Selection */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Product Images (Max 3)</label>
                <div className="space-y-3">
                  {productImages.map((img, index) => (
                    <div key={index} className="flex gap-2 items-start">
                       <div className="flex-1">
                          <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={img}
                                onChange={e => handleImageUrlChange(e.target.value, index)}
                                placeholder="Image URL"
                                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500 text-sm"
                              />
                              <label className="cursor-pointer bg-stone-100 border border-stone-300 rounded-lg px-3 py-2 hover:bg-stone-200 transition-colors flex items-center justify-center" title="Upload Image">
                                <ImageIcon size={18} className="text-stone-600" />
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, index)} />
                              </label>
                              {productImages.length > 1 && (
                                <button type="button" onClick={() => removeImageSlot(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                    <MinusCircle size={18} />
                                </button>
                              )}
                          </div>
                          {img && (
                            <div className="mt-2 h-20 w-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-50">
                              <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                  {productImages.length < 3 && (
                     <button type="button" onClick={addImageSlot} className="text-sm text-royal-700 font-medium hover:underline flex items-center gap-1">
                        <Plus size={16} /> Add another image
                     </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Selling Price (₹)</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value)})}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">MRP (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.mrp || ''}
                    onChange={e => setNewProduct({...newProduct, mrp: parseInt(e.target.value)})}
                    placeholder="Optional"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Leave blank or set equal to price for no discount</p>
                </div>
              </div>

              {/* Section and Category Selection */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Section</label>
                    <select 
                      value={newProduct.section}
                      onChange={e => {
                          const newSection = e.target.value as 'Saree' | 'Kids';
                          setNewProduct({
                              ...newProduct, 
                              section: newSection,
                              // Reset category when section changes to prevent mismatch
                              category: newSection === 'Kids' ? ProductCategory.LEHENGA : ProductCategory.BANARASI 
                          });
                      }}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    >
                      <option value="Saree">Saree</option>
                      <option value="Kids">Kids Wear</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    >
                      {currentCategoryOptions.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Tags / Badges</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1
                        ${(newProduct.tags || []).includes(tag) 
                          ? 'bg-royal-50 border-royal-200 text-royal-700' 
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}
                    >
                      <Tag size={12} /> {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Fabric</label>
                 <input 
                    type="text" 
                    value={newProduct.fabric}
                    onChange={e => setNewProduct({...newProduct, fabric: e.target.value})}
                    placeholder="e.g. Pure Silk"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Colors (Comma separated)</label>
                   <input 
                      type="text" 
                      value={colorsInput}
                      onChange={e => setColorsInput(e.target.value)}
                      placeholder="Red, Gold, Blue"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                </div>
                <div>
                   <label className="block text-sm font-medium text-stone-700 mb-1">Occasion (Comma separated)</label>
                   <input 
                      type="text" 
                      value={occasionInput}
                      onChange={e => setOccasionInput(e.target.value)}
                      placeholder="Wedding, Party"
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product Details (One per line)</label>
                <textarea 
                  rows={3}
                  value={detailsInput}
                  onChange={e => setDetailsInput(e.target.value)}
                  placeholder="Length: 6.3m&#10;Blouse piece included"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Care Instructions (One per line)</label>
                <textarea 
                  rows={3}
                  value={careInput}
                  onChange={e => setCareInput(e.target.value)}
                  placeholder="Dry clean only&#10;Iron on low heat"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-royal-500"
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full bg-royal-700 text-white py-3 rounded-lg font-medium hover:bg-royal-800 transition-colors shadow-md"
                >
                  {isEditing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-2xl overflow-hidden animate-fade-in-down max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-royal-900 text-white sticky top-0">
              <h3 className="font-bold text-lg">Order Details - {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/10 p-1 rounded transition-colors">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>
            
            <div className="p-6">
               <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Users size={16} className="text-royal-700" /> Customer Info
                    </h4>
                    <div className="space-y-2 text-sm text-stone-600 bg-stone-50 p-4 rounded-lg">
                      <p className="flex items-center gap-2"><span className="font-semibold w-16">Name:</span> {selectedOrder.customerName}</p>
                      <p className="flex items-center gap-2"><Mail size={14} className="text-stone-400" /> {selectedOrder.email}</p>
                      <p className="flex items-center gap-2"><Phone size={14} className="text-stone-400" /> {selectedOrder.phone || 'N/A'}</p>
                    </div>
                  </div>

                   <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-royal-700" /> Shipping Address
                    </h4>
                    <div className="space-y-1 text-sm text-stone-600 bg-stone-50 p-4 rounded-lg">
                      <p>{selectedOrder.address}</p>
                      <p>{selectedOrder.city}, {selectedOrder.zip}</p>
                    </div>
                  </div>
               </div>

               <div className="mb-6">
                 <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <ShoppingBag size={16} className="text-royal-700" /> Order Summary
                 </h4>
                 <div className="bg-stone-50 p-4 rounded-lg">
                   <p className="text-sm text-stone-600 mb-2">{selectedOrder.itemsSummary}</p>
                   
                   {/* Price Breakdown */}
                   <div className="space-y-1 text-sm text-stone-600 border-t border-stone-200 pt-2 mt-2">
                      {selectedOrder.subtotal && (
                        <div className="flex justify-between">
                           <span>Subtotal</span>
                           <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedOrder.discount ? (
                        <div className="flex justify-between text-green-600">
                           <span>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</span>
                           <span>- ₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between font-bold text-stone-900 pt-1 mt-1 border-t border-stone-200">
                         <span>Total Amount</span>
                         <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                      </div>
                   </div>
                 </div>
               </div>
               
               {/* Refund Management Section */}
               {selectedOrder.status === 'Cancelled' && (
                  <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <RefreshCcw size={16} /> Refund Management
                    </h4>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-red-600 mb-1 block">Current Refund Status</label>
                          <select
                            value={newRefundStatus}
                            onChange={(e) => setNewRefundStatus(e.target.value as RefundStatus)}
                            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                          >
                            {refundStatuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <button 
                          onClick={handleUpdateRefundStatus}
                          className="mt-5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
                        >
                          Update Refund
                        </button>
                    </div>
                  </div>
               )}

               <div className="pt-4 border-t border-stone-100">
                 <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Update Status</h4>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                        className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                        >
                        {orderStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                        </select>
                    </div>
                    <div>
                        <textarea
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500"
                            placeholder="Add a status note (Optional)..."
                            rows={2}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button 
                        onClick={() => setSelectedOrder(null)}
                        className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors"
                        >
                        Close
                        </button>
                        <button 
                        onClick={handleUpdateStatus}
                        className="px-4 py-2 bg-royal-700 text-white rounded-lg hover:bg-royal-800 transition-colors shadow-sm"
                        >
                        Update Status
                        </button>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
