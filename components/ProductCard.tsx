
import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Plus, Share2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Logic: Use Slug if available, otherwise ID
  const linkPath = `/product/${product.slug || product.id}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Construct the URL using HashRouter
    const url = `${window.location.origin}${window.location.pathname}#${linkPath}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this amazing ${product.name} on FlyingPopat!`,
          url: url,
        });
      } catch (err) {
        console.debug('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const discount = product.mrp && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  return (
    <Link to={linkPath} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
        
        <img 
          src={product.image} 
          alt={product.imageAlt || product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.tags && product.tags.map(tag => (
             <span key={tag} className="bg-gold-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider animate-glow shadow-sm">
               {tag === 'Hot Selling' ? 'Hot' : (tag === 'New Arrival' ? 'New' : tag)}
             </span>
          ))}
          {discount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-stone-600 p-2.5 rounded-full shadow-md transition-all duration-300 delay-75 hover:bg-royal-700 hover:text-white z-20 opacity-100 translate-y-0 lg:opacity-0 lg:-translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
          aria-label="Share product"
          title="Share"
        >
          <Share2 size={18} />
        </button>

        {!isAdmin && (
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 bg-white text-royal-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-royal-700 hover:text-white z-20 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
            aria-label="Add to cart"
          >
            <Plus size={20} />
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-bold text-royal-700 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-serif text-lg text-stone-900 mb-1 group-hover:text-royal-700 transition-colors">{product.name}</h3>
        
        <div className="flex items-center gap-2">
          <p className="text-stone-900 font-bold">₹{product.price.toLocaleString('en-IN')}</p>
          {product.mrp && product.mrp > product.price && (
             <p className="text-xs text-stone-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</p>
          )}
        </div>
      </div>
    </Link>
  );
};
