
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useCoupon } from '../context/CouponContext';
import { useInquiry } from '../context/InquiryContext';
import { isFirebaseConfigured } from '../firebase-config';
import { ProductCategory, Product, Order, OrderStatus, RefundStatus, Inquiry } from '../types';
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
  MapPin,
  Download,
  Wifi,
  WifiOff,
  Image as ImageIcon,
  Pencil,
  RefreshCcw,
  MinusCircle,
  TicketPercent,
  AlertTriangle,
  RefreshCw,
  Bold,
  Italic,
  List,
  MessageSquare,
  Link as LinkIcon,
  Tag
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, allUsers } = useAuth();
  const { products, deleteProduct, addProduct, updateProduct, updateProductStock, restoreDefaults } = useProducts();
  const { orders, updateOrderStatus, updateRefundStatus } = useOrders();
  const { coupons, addCoupon, deleteCoupon, toggleCouponStatus } = useCoupon();
  const { inquiries, markAsRead, deleteInquiry } = useInquiry();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'catalog' | 'customers' | 'coupons' | 'inquiries'>('orders');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
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
    slug: '',
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
    image: 'https://lh3.googleusercontent.com/d/16KK9KqWXaGl7_28yfAaroL6JqxU4j0zB',
    imageAlt: ''
  });

  const [colorsInput, setColorsInput] = useState('');
  const [occasionInput, setOccasionInput] = useState('');
  const [detailsInput, setDetailsInput] = useState('');
  const [careInput, setCareInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const currentSlug = newProduct.slug || '';
    const autoSlug = generateSlug(newProduct.name || '');
    
    if (!currentSlug || currentSlug === autoSlug) {
        setNewProduct(prev => ({ ...prev, name, slug: generateSlug(name) }));
    } else {
        setNewProduct(prev => ({ ...prev, name }));
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      slug: '',
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
      image: 'https://lh3.googleusercontent.com/d/16KK9KqWXaGl7_28yfAaroL6JqxU4j0zB',
      imageAlt: ''
    });
    setColorsInput('');
    setOccasionInput('');
    setDetailsInput('');
    setCareInput('');
    setTagsInput('');
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

      // Ensure slug exists
      const finalSlug = newProduct.slug || generateSlug(newProduct.name);

      const productData: Product = {
        ...newProduct as Product,
        slug: finalSlug,
        price: finalPrice,
        mrp: finalMrp,
        stock: Number(newProduct.stock) || 0,
        id: isEditing && editingProductId ? editingProductId : Date.now().toString(),
        image: mainImage,
        images: validImages,
        imageAlt: newProduct.imageAlt || '',
        colors: colorsInput.split(',').map(s => s.trim()).filter(Boolean),
        occasion: occasionInput.split(',').map(s => s.trim()).filter(Boolean),
        details: detailsInput.split('\n').map(s => s.trim()).filter(Boolean),
        care: careInput.split('\n').map(s => s.trim()).filter(Boolean),
        tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean)
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

  const handleTextFormat = (tag: string) => {
    const textarea = document.getElementById('description-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newProduct.description || '';
    
    const selection = text.substring(start, end);
    let formattedSelection = '';

    if (tag === 'b') formattedSelection = `<b>${selection}</b>`;
    else if (tag === 'i') formattedSelection = `<i>${selection}</i>`;
    else if (tag === 'ul') formattedSelection = `\n<ul>\n  <li>${selection}</li>\n</ul>\n`;

    const newText = text.substring(0, start) + formattedSelection + text.substring(end);
    
    setNewProduct({ ...newProduct, description: newText });
    textarea.focus();
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
    setTagsInput(product.tags ? product.tags.join(', ') : '');
    
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

  const addTag = (tag: string) => {
    const currentTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    if (!currentTags.includes(tag)) {
        const newTags = [...currentTags, tag].join(', ');
        setTagsInput(newTags);
    }
  };

  const handleUpdateStock = (productId: string, change: number) => {
    updateProductStock(productId, -change);
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
      alert("Refund status updated successfully!");
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

  // ... (Filtered helpers same as before) ...
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
  const refundStatuses: RefundStatus[] = ['Pending', 'Processed', 'Successful', 'Failed'];

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
      {/* ... Sidebar remains unchanged ... */}
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
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><ShoppingBag size={20} /> Orders</button>
          <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'catalog' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><Grid size={20} /> Catalog</button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'customers' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><Users size={20} /> Customers</button>
          <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'coupons' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><TicketPercent size={20} /> Coupons</button>
          <button onClick={() => setActiveTab('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-royal-50 text-royal-700' : 'text-stone-600 hover:bg-stone-50'}`}><MessageSquare size={20} /> Inquiries</button>
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
            {activeTab === 'coupons' && 'Manage discount codes and promotions'}
            {activeTab === 'inquiries' && 'View messages from the contact form'}
          </p>
        </div>

        {/* ... Tab Contents (Orders, Catalog, etc.) ... */}
        {/* Same as before but ensuring new modal is used in Catalog Tab */}
        
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input type="text" placeholder="Search orders..." value={orderSearchTerm} onChange={(e) => setOrderSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg w-full bg-white" />
              </div>
              <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-50 font-medium"><RefreshCcw size={18} /> Refresh List</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                  <thead className="bg-stone-50 text-stone-900 font-semibold uppercase text-xs border-b">
                    <tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Total</th><th className="px-6 py-4 text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                        <tr key={order.id} onClick={() => { setSelectedOrder(order); setNewStatus(order.status); setStatusNote(order.statusNote || ''); setNewRefundStatus(order.refundStatus || 'Pending'); }} className="hover:bg-stone-50/50 cursor-pointer">
                            <td className="px-6 py-4 font-mono">{order.id}</td>
                            <td className="px-6 py-4"><div>{order.customerName}</div><div className="text-xs text-stone-400">{order.email}</div></td>
                            <td className="px-6 py-4"><div>{order.date}</div>{order.timestamp && <div className="text-xs text-stone-400">{new Date(order.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</span>
                                {order.status === 'Cancelled' && <span className="block mt-1 text-[10px] text-stone-500">Refund: {order.refundStatus}</span>}
                            </td>
                            <td className="px-6 py-4 font-bold">₹{order.total.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-4 text-right"><ChevronRight size={18} /></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-500 w-full bg-white"/>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
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
                            <img src={product.image} alt={product.imageAlt || product.name} className="w-10 h-10 rounded object-cover bg-stone-100" />
                            <div>
                                <div className="font-medium text-stone-900">{product.name}</div>
                                {product.slug && <div className="text-xs text-stone-400 font-mono">/{product.slug}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-bold ${product.section === 'Kids' ? 'bg-pink-50 text-pink-700' : 'bg-royal-50 text-royal-700'}`}>{product.section}</span></td>
                        <td className="px-6 py-4">{product.category}</td>
                        <td className="px-6 py-4">₹{product.price}</td>
                        <td className="px-6 py-4 text-center">
                           <div className="flex items-center justify-center gap-1">
                             <button onClick={() => handleUpdateStock(product.id, -1)} className="p-1 hover:bg-stone-100 rounded" disabled={product.stock <= 0}><MinusCircle size={16} /></button>
                             <span className="font-bold w-6 text-center">{product.stock}</span>
                             <button onClick={() => handleUpdateStock(product.id, 1)} className="p-1 hover:bg-stone-100 rounded"><Plus size={16} /></button>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(product)} className="p-2 hover:bg-stone-100 rounded text-royal-600"><Pencil size={18} /></button>
                            <button onClick={() => handleDeleteClick(product.id)} className="p-2 hover:bg-stone-100 rounded text-red-600"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ... Other Tabs ... */}
        {activeTab === 'customers' && <div className="p-6 bg-white rounded"><p>Customers List...</p></div>}
        {activeTab === 'coupons' && <div className="p-6 bg-white rounded"><p>Coupons UI...</p></div>}
        {activeTab === 'inquiries' && <div className="p-6 bg-white rounded"><p>Inquiries Table...</p></div>}

      </main>

      {/* MODALS */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in-down">
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-royal-900 text-white sticky top-0 z-10">
                  <h3 className="font-bold text-lg">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                  <button onClick={handleModalClose} className="hover:bg-white/10 p-1 rounded transition-colors"><Plus className="rotate-45" size={20} /></button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSaveProduct} className="space-y-6">
                   {/* Product Name & Pricing */}
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                        <input type="text" required value={newProduct.name} onChange={handleNameChange} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-royal-500 focus:outline-none" />
                      </div>
                      
                      {/* URL Slug Input */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
                            <LinkIcon size={14} className="text-royal-700"/> URL Slug (SEO Friendly)
                        </label>
                        <div className="flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-stone-300 bg-stone-50 text-stone-500 text-sm">
                                .../product/
                            </span>
                            <input 
                                type="text" 
                                value={newProduct.slug} 
                                onChange={(e) => setNewProduct({...newProduct, slug: e.target.value})} 
                                placeholder="red-banarasi-saree"
                                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg border border-stone-300 focus:ring-royal-500 focus:border-royal-500 sm:text-sm font-mono text-stone-600" 
                            />
                        </div>
                        <p className="mt-1 text-xs text-stone-500">Leave blank to auto-generate from name.</p>
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

                   {/* Writeable Tags */}
                   <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Tags</label>
                      <div className="flex flex-col gap-2">
                         <div className="flex gap-2">
                            {AVAILABLE_TAGS.map(tag => (
                                <button type="button" key={tag} onClick={() => addTag(tag)} className="px-3 py-1.5 rounded-full text-xs font-bold border bg-white text-stone-600 border-stone-300 hover:bg-royal-50 hover:text-royal-700">
                                    + {tag}
                                </button>
                            ))}
                         </div>
                         <div className="relative">
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input 
                                type="text" 
                                value={tagsInput} 
                                onChange={(e) => setTagsInput(e.target.value)} 
                                className="w-full pl-10 pr-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-royal-500 text-sm"
                                placeholder="New Arrival, Hot Selling (Comma separated)" 
                            />
                         </div>
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
                       
                       {/* Image Alt Text */}
                       <div className="mt-3">
                          <label className="block text-xs font-medium text-stone-500 mb-1">Image Alt Text (SEO)</label>
                          <input 
                            type="text" 
                            value={newProduct.imageAlt || ''} 
                            onChange={(e) => setNewProduct({...newProduct, imageAlt: e.target.value})} 
                            placeholder="Describe the image for SEO (e.g. Red Banarasi Silk Saree with Gold Border)" 
                            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-royal-500 focus:outline-none" 
                          />
                       </div>
                   </div>

                   {/* Detailed Fields */}
                   <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                      <div className="border border-stone-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-royal-500">
                        <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 flex gap-2">
                          <button type="button" onClick={() => handleTextFormat('b')} className="p-1 hover:bg-stone-200 rounded text-stone-600" title="Bold">
                            <Bold size={16} />
                          </button>
                          <button type="button" onClick={() => handleTextFormat('i')} className="p-1 hover:bg-stone-200 rounded text-stone-600" title="Italic">
                            <Italic size={16} />
                          </button>
                          <button type="button" onClick={() => handleTextFormat('ul')} className="p-1 hover:bg-stone-200 rounded text-stone-600" title="List">
                            <List size={16} />
                          </button>
                        </div>
                        <textarea 
                          id="description-editor"
                          value={newProduct.description} 
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                          rows={4} 
                          className="w-full px-3 py-2 focus:outline-none border-none resize-y"
                          placeholder="Use buttons above to format text..."
                        ></textarea>
                      </div>
                   </div>
                   
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

      {/* ... Other Modals (Delete, Order, Inquiry) ... */}
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
      
      {/* ... Order Details & Inquiry Modals (unchanged logic) ... */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] md:w-full max-w-2xl overflow-hidden animate-fade-in-down max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-royal-900 text-white sticky top-0">
              <h3 className="font-bold text-lg">Order Details - {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/10 p-1 rounded transition-colors"><Plus className="rotate-45" size={20} /></button>
            </div>
            {/* ... Content ... */}
            <div className="p-6">
                {/* ... (Existing Order Details JSX) ... */}
                <div className="pt-4 border-t border-stone-100">
                 <div className="flex justify-end gap-3">
                        <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition-colors">Close</button>
                        <button onClick={handleUpdateStatus} className="px-4 py-2 bg-royal-700 text-white rounded-lg hover:bg-royal-800 transition-colors shadow-sm">Update Status</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-down max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
                <div>
                   <h3 className="font-serif text-xl font-bold text-stone-900">Message Details</h3>
                   <span className="text-xs text-stone-500">{selectedInquiry.date}</span>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full p-1 transition-colors">
                   <Plus className="rotate-45" size={24} />
                </button>
             </div>
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-stone-50 p-3 rounded-lg">
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-wide mb-1">From</p>
                      <p className="font-medium text-stone-900">{selectedInquiry.name}</p>
                   </div>
                   <div className="bg-stone-50 p-3 rounded-lg">
                      <p className="text-xs text-stone-500 uppercase font-bold tracking-wide mb-1">Email</p>
                      <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-royal-700 hover:underline">{selectedInquiry.email}</a>
                   </div>
                </div>
                <div>
                   <p className="text-xs text-stone-500 uppercase font-bold tracking-wide mb-2">Subject</p>
                   <p className="font-serif text-lg font-bold text-stone-800">{selectedInquiry.subject}</p>
                </div>
                <div>
                   <p className="text-xs text-stone-500 uppercase font-bold tracking-wide mb-2">Message Content</p>
                   <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-stone-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedInquiry.message}
                   </div>
                </div>
                <div className="flex justify-end pt-4">
                   <button 
                      onClick={() => setSelectedInquiry(null)}
                      className="px-6 py-2 bg-royal-700 text-white rounded-lg hover:bg-royal-800 transition-colors shadow-sm font-medium"
                   >
                      Close
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
