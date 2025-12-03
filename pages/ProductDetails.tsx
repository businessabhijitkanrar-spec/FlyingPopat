import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Truck, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { generateProductStyleGuide } from '../services/gemini';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'desc' | 'details' | 'care'>('desc');
  
  // AI Style Guide State
  const [aiStyleGuide, setAiStyleGuide] = useState<string>('');
  const [isGeneratingStyle, setIsGeneratingStyle] = useState(false);

  const product = products.find((p) => p.id === id);

  // Auto-generate style guide when product loads
  useEffect(() => {
    let isMounted = true;
    if (product) {
      const fetchGuide = async () => {
        setIsGeneratingStyle(true);
        setAiStyleGuide(''); 
        const guide = await generateProductStyleGuide(product);
        if (isMounted) {
          setAiStyleGuide(guide);
          setIsGeneratingStyle(false);
        }
      };
      fetchGuide();
    }
    return () => { isMounted = false; };
  }, [product?.id]); // Re-run when product ID changes

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <h2 className="text-2xl font-serif mb-4">Product not found</h2>
        <button onClick={() => navigate('/catalog')} className="text-royal-700 hover:underline">
          Back to Catalog
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleGenerateStyleGuide = async () => {
    setIsGeneratingStyle(true);
    setAiStyleGuide(''); // Clear to show loading
    const guide = await generateProductStyleGuide(product);
    setAiStyleGuide(guide);
    setIsGeneratingStyle(false);
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-stone-500 hover:text-royal-700 mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Collection
        </button>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-lg">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            {/* Thumbnails (Simulated) */}
            <div className="grid grid-cols-4 gap-4">
               {[1,2,3].map((i) => (
                 <div key={i} className="aspect-square rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 ring-2 ring-transparent hover:ring-royal-700 transition-all">
                   <img src={product.image} alt="Thumbnail" className="w-full h-full object-cover" />
                 </div>
               ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col h-full">
            <div>
              <span className="text-sm font-bold tracking-widest text-royal-700 uppercase">{product.category}</span>
              <h1 className="font-serif text-4xl text-stone-900 font-bold mt-2 mb-4">{product.name}</h1>
              <p className="text-2xl font-medium text-stone-800 mb-6">₹{product.price.toLocaleString('en-IN')}</p>
              
              <div className="prose prose-stone mb-6">
                <p>{product.description}</p>
              </div>

              {/* AI Style Guide Section - Removed Header */}
              <div className="mb-8 min-h-[80px]">
                {isGeneratingStyle ? (
                  <div className="flex items-center gap-2 text-stone-400 text-sm animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Styling...</span>
                  </div>
                ) : (
                  <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 relative group">
                    <div className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {aiStyleGuide}
                    </div>
                    <button 
                        onClick={handleGenerateStyleGuide} 
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-royal-700 transition-opacity p-1"
                        title="Refresh Description"
                    >
                        <RefreshCw size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Color Selection (Simulated) */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold mb-3">Available Colors</h3>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <div key={color} className="group relative">
                        <div 
                        className={`w-8 h-8 rounded-full border border-stone-200 cursor-pointer shadow-sm`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                        />
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">{color}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {!isAdmin && (
                <div className="flex gap-4 mb-10">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-royal-700 text-white py-4 px-8 rounded-full font-bold hover:bg-royal-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} /> Add to Cart
                  </button>
                  <button className="p-4 border border-stone-300 rounded-full hover:bg-stone-50 transition-colors">
                    <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Info Tabs */}
            <div className="mt-auto">
              <div className="flex border-b border-stone-200 mb-4">
                {(['desc', 'details', 'care'] as const).map((tab) => (
                   <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-royal-700 border-b-2 border-royal-700' : 'text-stone-500 hover:text-stone-800'}`}
                  >
                    {tab === 'desc' ? 'Description' : tab}
                  </button>
                ))}
              </div>
              <div className="h-24 text-sm text-stone-600 leading-relaxed">
                 {activeTab === 'desc' && (
                    <p>{product.description} Woven with passion and precision.</p>
                 )}
                 {activeTab === 'details' && (
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Fabric: {product.fabric}</li>
                        <li>Occasion: {product.occasion.join(', ')}</li>
                        <li>Length: 6.3 meters (including blouse piece)</li>
                    </ul>
                 )}
                 {activeTab === 'care' && (
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Dry clean only</li>
                        <li>Store in a muslin cloth</li>
                        <li>Avoid direct sunlight when drying</li>
                    </ul>
                 )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-stone-200 pt-6 mt-6">
                <div className="flex flex-col items-center text-center gap-2">
                    <Truck size={20} className="text-royal-700"/>
                    <span className="text-xs font-medium">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <ShieldCheck size={20} className="text-royal-700"/>
                    <span className="text-xs font-medium">Authentic Silk</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <RefreshCw size={20} className="text-royal-700"/>
                    <span className="text-xs font-medium">7 Day Returns</span>
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
