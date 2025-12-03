import React from 'react';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 bg-white text-royal-700 p-3 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-royal-700 hover:text-white"
          aria-label="Add to cart"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs font-bold text-royal-700 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-serif text-lg text-stone-900 mb-1 group-hover:text-royal-700 transition-colors">{product.name}</h3>
        <p className="text-stone-600 font-medium">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </Link>
  );
};
