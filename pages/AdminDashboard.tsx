
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
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  // ... existing hooks
  const { user, isAdmin, allUsers } = useAuth();
  const { products, deleteProduct, addProduct, updateProduct, updateProductStock, restoreDefaults } = useProducts();
  const { orders, updateOrderStatus, updateRefundStatus } = useOrders();
  const { feedbacks } = useFeedback();
  const { inquiries, markAsRead, deleteInquiry } = useInquiry();
  const { coupons, addCoupon, deleteCoupon, toggleCouponStatus } = useCoupon();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'customers' | 'feedback' | 'inquiries' | 'coupons'>('orders');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

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
    stock: 0, 
    section: 'Saree', 
    category: ProductCategory.COTTON,
    description: '',
    fabric: '',
    colors: [],
    occasion: [],
    details: [],
    care: [],
    tags: [],
    image: 'https://lh3.googleusercontent.com/d/16KK9KqWXaGl7_28yfAaroL6JqxU4j0zB'
  });

  const [colorsInput, setColorsInput] = useState('');
  const [occasionInput, setOccasionInput] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [careInput, setCareInput] = useState('');
  
  const [productImages, setProductImages] = useState<string[]>(['']);

  const AVAILABLE_TAGS = ['New Arrival', 'Hot Selling', 'Best Value'];

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const convertDriveLink = (url: string): string => {
    if (url.includes('drive.google.com') && url.includes('/view')) {
      const idMatch = url.match(/\/d\/(.+?)\//);
      if (idMatch && idMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
      }
    }
    return url;
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      price: 0,
      mrp: 0,
      stock: 0,
      section: 'Saree',
      category: ProductCategory.COTTON,
      description: '',
      fabric: '',
      colors: [],
      occasion: [],
      details: [],
      care: [],
      tags: [],
      image: 'https://lh3.googleusercontent.com/d/16KK9KqWXaGl7_28yfAaroL6JqxU4j0zB'
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
      const validImages = productImages.filter(img => img.trim() !== '');
      const mainImage = validImages.length > 0 ? validImages[0] : (newProduct.image || '');

      const finalPrice = Number(newProduct.price);
      let finalMrp = newProduct.mrp ? Number(newProduct.mrp) : 0;
      if (finalMrp < finalPrice) finalMrp = finalPrice;

      const productData: Product = {
        ...newProduct as Product,
        price: finalPrice,
        mrp: finalMrp,
        stock: Number(newProduct.stock) || 0,
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

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
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
    const directLink = convertDriveLink(value);
    const newImages = [...productImages];
    newImages[index] = directLink;
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

  const SAREE_CATEGORIES = [
    ProductCategory.COTTON, ProductCategory.LINEN,
    ProductCategory.TISSUE, ProductCategory.TAANT, ProductCategory.JAMDANI
  ];
  
  const KIDS_CATEGORIES = [
    ProductCategory.DUNGAREES, ProductCategory.DRESSES, 
    ProductCategory.SWEAT_WEAR, ProductCategory.WAIST_COAT
  ];

  const currentCategoryOptions = newProduct.section === 'Kids' ? KIDS_CATEGORIES : SAREE_CATEGORIES;

  const lowStockCount = products.filter(p => p.stock < 5).length;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* ... Sidebar and Main Layout ... */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex-shrink-0">
        <div className="p-6 border-b border-stone-100">
           <h2 className="font-serif text-xl font-bold text-stone-900">Admin Panel</h2>
           <p className="text-xs text-stone-500 mt-1">Manage Store & Orders</p>
           
           <div className={`mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${isFirebaseConfigured ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
              {isFirebaseConfigured ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isFirebaseConfigured ? 'System Online' : 'Local Mode'}
           </div>
        </div>
        <nav className="p-4 space-y-2">
          {/* ... Navigation Buttons ... */}
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><ShoppingBag size={20} /> Orders</button>
          <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'catalog' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><Grid size={20} /> Catalog</button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><Users size={20} /> Customers</button>
          <button onClick={() => setActiveTab('feedback')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'feedback' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><MessageSquare size={20} /> Feedbacks</button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><Inbox size={20} /> Inquiries</button>
          <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coupons' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><TicketPercent size={20} /> Coupons</button>
        </nav>
        
        <div className="p-6 mt-auto">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-4">
             <div>
               <p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Total Sales</p>
               <p className="text-lg font-bold text-stone-900">₹{orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0).toLocaleString('en-IN')}</p>
             </div>
             <div>
               <p className="text-xs text-stone-500 uppercase tracking-wide font-bold">Low Stock Items</p>
               <p className={`text-lg font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockCount}</p>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 font-serif capitalize">{activeTab} Management</h1>
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
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 font-medium"
              >
                <RefreshCcw size={18} /> Refresh List
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Date & Time</th>
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
                        <td className="px-6 py-4">
                           <div>{order.date}</div>
                           {order.timestamp && <div className="text-xs text-stone-400">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-stone-800">₹{order.total.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 max-w-xs truncate" title={order.itemsSummary}>{order.itemsSummary}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-stone-400 hover:text-royal-700 transition-colors"><ChevronRight size={20} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && <div className="p-8 text-center text-stone-500">No orders found matching "{orderSearchTerm}"</div>}
            </div>
          </div>
        )}

        {/* CATALOG TAB */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Stats */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={24} /></div>
                <div><p className="text-sm text-stone-500 font-medium">Total Products</p><h3 className="text-2xl font-bold text-stone-900">{products.length}</h3></div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24} /></div>
                <div><p className="text-sm text-stone-500 font-medium">Top Category</p><h3 className="text-2xl font-bold text-stone-900">Banarasi</h3></div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users size={24} /></div>
                <div><p className="text-sm text-stone-500 font-medium">Low Stock Items</p><h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-600' : 'text-stone-900'}`}>{lowStockCount}</h3></div>
               </div>
             </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-500 w-full bg-white"/>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                 <button onClick={restoreDefaults} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-stone-200 text-stone-700 px-5 py-2.5 rounded-lg hover:bg-stone-300 transition-colors font-medium">
                     <RefreshCcw size={18} /> Restore Defaults
                 </button>
                 <button onClick={() => { setShowAddModal(true); setIsEditing(false); resetForm(); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-royal-700 text-white px-5 py-2.5 rounded-lg hover:bg-royal-800 transition-colors shadow-md font-medium">
                    <Plus size={18} /> Add New Item
                 </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase tracking-wider text-xs border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Section</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Pricing</th>
                      <th className="px-6 py-4 text-center">Stock</th>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.section === 'Kids' ? 'bg-pink-50 text-pink-700' : 'bg-royal-50 text-royal-700'}`}>{product.section}</span>
                        </td>
                        <td className="px-6 py-4">{product.category}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-stone-900">SP: ₹{product.price.toLocaleString('en-IN')}</span>
                            {product.mrp && product.mrp > product.price && <span className="text-xs text-stone-400 line-through">MRP: ₹{product.mrp.toLocaleString('en-IN')}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center gap-1">
                             <button onClick={() => updateProductStock(product.id, 1)} className="text-stone-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 disabled:opacity-30" disabled={product.stock <= 0} title="Decrease Stock"><MinusCircle size={16} /></button>
                             <span className={`min-w-[24px] text-center inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{product.stock}</span>
                             <button onClick={() => updateProductStock(product.id, -1)} className="text-stone-400 hover:text-green-600 p-1 rounded-full hover:bg-green-50" title="Increase Stock"><Plus size={16} /></button>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(product)} className="text-stone-400 hover:text-royal-600 transition-colors p-2 hover:bg-royal-50 rounded-full" title="Edit Product"><Pencil size={18} /></button>
                            <button onClick={() => handleDeleteClick(product.id)} className="text-stone-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full" title="Delete Product"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && <div className="p-8 text-center text-stone-500">No products found.</div>}
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs (Customers, etc.) */}
        {(activeTab === 'customers' || activeTab === 'feedback' || activeTab === 'inquiries' || activeTab === 'coupons') && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-8 text-center text-stone-500">
                Content for {activeTab} goes here.
            </div>
        )}

      </main>

      {/* ... MODALS (Add/Edit, Delete, Order Details) ... */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-down">
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-royal-900 text-white sticky top-0">
                  <h3 className="font-bold text-lg">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                  <button onClick={handleModalClose} className="hover:bg-white/10 p-1 rounded transition-colors"><Plus className="rotate-45" size={20} /></button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveProduct} className="space-y-6">
                   {/* Product Name & Pricing */}
                   <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                        <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Selling Price</label>
                            <input type="number" required min="0" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" />
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">MRP</label>
                            <input type="number" min="0" value={newProduct.mrp} onChange={(e) => setNewProduct({...newProduct, mrp: Number(e.target.value)})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" />
                         </div>
                      </div>
                   </div>
                   
                   {/* Section, Category & Stock */}
                   <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Section</label>
                        <select value={newProduct.section} onChange={(e) => setNewProduct({...newProduct, section: e.target.value as 'Saree' | 'Kids', category: e.target.value === 'Kids' ? KIDS_CATEGORIES[0] : SAREE_CATEGORIES[0]})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none">
                            <option value="Saree">Saree</option>
                            <option value="Kids">Kids</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                        <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none">
                            {currentCategoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                        <input type="number" required min="0" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" />
                      </div>
                   </div>

                   {/* Tags */}
                   <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Tags</label>
                      <div className="flex gap-2">
                         {AVAILABLE_TAGS.map(tag => (
                             <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${newProduct.tags?.includes(tag) ? 'bg-gold-500 text-white border-gold-500' : 'bg-white text-stone-600 border-stone-300'}`}>
                                 {tag}
                             </button>
                         ))}
                      </div>
                   </div>

                   {/* Images */}
                   <div>
                       <label className="block text-sm font-medium text-stone-700 mb-2">Product Images (Max 3)</label>
                       <div className="space-y-3">
                           {productImages.map((img, idx) => (
                               <div key={idx} className="flex gap-2">
                                  <input type="text" value={img} onChange={(e) => handleImageUrlChange(e.target.value, idx)} placeholder="Image URL (Google Drive supported)" className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-royal-500 focus:outline-none" />
                                  <div className="relative">
                                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, idx)} className="absolute inset-0 w-full opacity-0 cursor-pointer" />
                                    <button type="button" className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200"><ImageIcon size={18}/></button>
                                  </div>
                                  {productImages.length > 1 && <button type="button" onClick={() => removeImageSlot(idx)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>}
                               </div>
                           ))}
                           {productImages.length < 3 && <button type="button" onClick={addImageSlot} className="text-sm text-royal-700 font-medium hover:underline">+ Add Another Image</button>}
                       </div>
                       {/* Preview */}
                       <div className="flex gap-2 mt-2">
                           {productImages.filter(i => i).map((img, idx) => (
                               <img key={idx} src={img} alt="Preview" className="w-16 h-16 object-cover rounded border border-stone-200" />
                           ))}
                       </div>
                   </div>

                   {/* Detailed Fields */}
                   <div><label className="block text-sm font-medium text-stone-700 mb-1">Description</label><textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none"></textarea></div>
                   
                   <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-stone-700 mb-1">Fabric</label><input type="text" value={newProduct.fabric} onChange={(e) => setNewProduct({...newProduct, fabric: e.target.value})} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" /></div>
                      <div><label className="block text-sm font-medium text-stone-700 mb-1">Colors (comma separated)</label><input type="text" value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" placeholder="Red, Blue, Gold" /></div>
                   </div>
                   
                   <div><label className="block text-sm font-medium text-stone-700 mb-1">Occasion (comma separated)</label><input type="text" value={occasionInput} onChange={(e) => setOccasionInput(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" placeholder="Wedding, Party, Casual" /></div>
                   
                   <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-stone-700 mb-1">Product Details (newline separated)</label><textarea value={detailsInput} onChange={(e) => setDetailsInput(e.target.value)} rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" placeholder="Length: 6.3m&#10;Blouse: Included"></textarea></div>
                      <div><label className="block text-sm font-medium text-stone-700 mb-1">Care Instructions (newline separated)</label><textarea value={careInput} onChange={(e) => setCareInput(e.target.value)} rows={3} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" placeholder="Dry clean only&#10;Iron low heat"></textarea></div>
                   </div>

                   <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                      <button type="button" onClick={handleModalClose} className="px-6 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50">Cancel</button>
                      <button type="submit" className="px-6 py-2 bg-royal-700 text-white rounded-lg hover:bg-royal-800">{isEditing ? 'Update Product' : 'Add Product'}</button>
                   </div>
                </form>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in-down">
             <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-stone-900 mb-2">Delete Product?</h3>
             <p className="text-stone-600 mb-6">Are you sure you want to remove this item from the catalog? This action cannot be undone.</p>
             <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">Delete</button>
             </div>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-2xl overflow-hidden animate-fade-in-down max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-royal-900 text-white sticky top-0">
              <h3 className="font-bold text-lg">Order Details - {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/10 p-1 rounded transition-colors"><Plus className="rotate-45" size={20} /></button>
            </div>
            
            <div className="p-6">
               <div className="grid md:grid-cols-2 gap-8 mb-6">
                  {/* ... Customer and Address ... */}
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-2"><Users size={16} className="text-royal-700" /> Customer Info</h4>
                    <div className="space-y-2 text-sm text-stone-600 bg-stone-50 p-4 rounded-lg">
                      <p><span className="font-semibold">Name:</span> {selectedOrder.customerName}</p>
                      <p><span className="font-semibold">Email:</span> {selectedOrder.email}</p>
                      <p><span className="font-semibold">Phone:</span> {selectedOrder.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-2"><MapPin size={16} className="text-royal-700" /> Shipping Address</h4>
                    <div className="space-y-1 text-sm text-stone-600 bg-stone-50 p-4 rounded-lg">
                      <p>{selectedOrder.address}</p>
                      <p>{selectedOrder.city}, {selectedOrder.zip}</p>
                    </div>
                  </div>
               </div>

               {/* Payment Verification Section */}
               {selectedOrder.paymentScreenshot && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <ImageIcon size={16} className="text-royal-700" /> Payment Verification
                    </h4>
                    <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                        <p className="text-xs text-stone-500 mb-2">Manual Payment Screenshot:</p>
                        <a href={selectedOrder.paymentScreenshot} target="_blank" rel="noopener noreferrer">
                            <img 
                                src={selectedOrder.paymentScreenshot} 
                                alt="Payment Proof" 
                                className="w-full max-w-sm h-auto rounded border border-stone-300 shadow-sm hover:opacity-90 transition-opacity"
                            />
                        </a>
                    </div>
                  </div>
               )}

               {/* ... Summary and Status Update ... */}
               <div className="pt-4 border-t border-stone-100">
                 <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Update Status</h4>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)} className="flex-1 px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-royal-500">
                        {orderStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div>
                        <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-royal-500" placeholder="Add a status note (Optional)..." rows={2}/>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">Close</button>
                        <button onClick={handleUpdateStatus} className="px-4 py-2 bg-royal-700 text-white rounded-lg hover:bg-royal-800 transition-colors shadow-sm">Update Status</button>
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
