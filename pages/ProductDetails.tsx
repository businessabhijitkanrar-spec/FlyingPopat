
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ArrowLeft, Truck, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'desc' | 'details' | 'care'>('desc');
  
  const product = products.find((p) => p.id === id);
  
  // Handle multiple images
  const images = product?.images && product.images.length > 0 ? product.images : (product ? [product.image] : []);
  const [selectedImage, setSelectedImage] = useState<string>(images[0] || '');
  
  // Update selected image if product loads late or changes
  React.useEffect(() => {
    if (images.length > 0) setSelectedImage(images[0]);
  }, [product]);

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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = images.indexOf(selectedImage);
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImage(images[newIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = images.indexOf(selectedImage);
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(images[newIndex]);
  };

  // Calculate discount
  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

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
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 shadow-lg relative group">
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
                    title="Previous Image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-stone-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
                    title="Next Image"
                  >
                    <ChevronRight size={24} />
                  </button>
                  
                  {/* Slide Indicator Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all shadow-sm ${selectedImage === images[idx] ? 'bg-white scale-125' : 'bg-white/50'}`} 
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Overlays for tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                 {product.tags?.map(tag => (
                   <span 
                    key={tag} 
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm bg-gold-500 text-white animate-glow"
                   >
                      {tag}
                   </span>
                 ))}
              </div>
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                 {images.map((img, index) => (
                   <div 
                    key={index} 
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer opacity-70 hover:opacity-100 transition-all ${selectedImage === img ? 'ring-2 ring-royal-700 opacity-100' : 'ring-2 ring-transparent'}`}
                   >
                     <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col h-full">
            <div>
              <span className="text-sm font-bold tracking-widest text-royal-700 uppercase">{product.category}</span>
              <h1 className="font-serif text-4xl text-stone-900 font-bold mt-2 mb-4">{product.name}</h1>
              
              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-3xl font-medium text-stone-900">₹{product.price.toLocaleString('en-IN')}</p>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <p className="text-xl text-stone-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</p>
                    <span className="text-lg font-bold text-green-600">
                      ({discount}% OFF)
                    </span>
                  </>
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
              {/* Increased height to accommodate full description */}
              <div className="min-h-[16rem] text-sm text-stone-600 leading-relaxed overflow-y-auto">
                 {activeTab === 'desc' && (
                    <div className="prose prose-sm prose-stone">
                      <p>{product.description}</p>
                      <p className="mt-4">Woven with passion and precision, this saree represents the pinnacle of traditional craftsmanship.</p>
                    </div>
                 )}
                 {activeTab === 'details' && (
                    <ul className="list-disc pl-4 space-y-2">
                        {product.details ? (
                          product.details.map((detail, index) => <li key={index}>{detail}</li>)
                        ) : (
                          <>
                            <li>Fabric: {product.fabric}</li>
                            <li>Occasion: {product.occasion.join(', ')}</li>
                            <li>Length: 6.3 meters (including blouse piece)</li>
                            <li>Blouse Piece: Included</li>
                          </>
                        )}
                    </ul>
                 )}
                 {activeTab === 'care' && (
                    <ul className="list-disc pl-4 space-y-2">
                        {product.care ? (
                          product.care.map((item, index) => <li key={index}>{item}</li>)
                        ) : (
                          <>
                            <li>Dry clean only to maintain the luster.</li>
                            <li>Store in a muslin cloth to allow the fabric to breathe.</li>
                            <li>Avoid direct sunlight when drying to prevent color fading.</li>
                            <li>Iron on low heat with a protective cloth.</li>
                          </>
                        )}
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
