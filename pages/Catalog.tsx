import React, { useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { SareeCategory } from '../types';
import { Filter, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export const Catalog: React.FC = () => {
  const { products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(20000);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', ...Object.values(SareeCategory)];

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const priceMatch = product.price <= priceRange;
    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-stone-50 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-stone-900 mb-2">Our Collection</h1>
            <p className="text-stone-600">Explore our diverse range of traditional and modern drapes.</p>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 bg-white p-3 rounded-lg border border-stone-200 shadow-sm text-stone-700 font-medium hover:bg-stone-50 transition-colors"
          >
            {showFilters ? <X size={20} /> : <Filter size={20} />}
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <aside className={`w-full lg:w-64 flex-shrink-0 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-stone-900 font-bold border-b border-stone-100 pb-2">
                <Filter size={20} />
                <h2>Filters</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-semibold mb-3 text-stone-800">Category</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 text-royal-700 focus:ring-royal-500 border-stone-300"
                      />
                      <span className={`text-sm ${selectedCategory === cat ? 'text-royal-700 font-medium' : 'text-stone-600 group-hover:text-stone-900'}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-stone-800">Max Price</h3>
                  <span className="text-sm text-royal-700 font-medium">₹{priceRange.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="range" 
                  min="2000" 
                  max="20000" 
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-royal-700"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-2">
                  <span>₹2,000</span>
                  <span>₹20,000+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="text-xl text-stone-500">No sarees found matching your criteria.</p>
                  <button 
                    onClick={() => {setSelectedCategory('All'); setPriceRange(20000);}}
                    className="mt-4 text-royal-700 font-medium hover:underline"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};