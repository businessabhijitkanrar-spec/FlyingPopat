
import React from 'react';
import { ArrowRight, Star, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { Schema } from '../components/Schema';

export const Home: React.FC = () => {
  const { products } = useProducts();
  const featuredProducts = products.slice(0, 4);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FlyingPopat",
    "url": window.location.origin,
    "logo": "https://ui-avatars.com/api/?name=Flying+Popat&background=be185d&color=fff",
    "description": "A luxury e-commerce platform for sarees featuring an AI-powered personal stylist.",
    "foundingDate": "1957",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hirapur",
      "addressLocality": "Howrah",
      "addressRegion": "West Bengal",
      "postalCode": "711310",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91 9674283413",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": "en"
    },
    "sameAs": []
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Schema data={orgSchema} />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://lh3.googleusercontent.com/d/16KK9KqWXaGl7_28yfAaroL6JqxU4j0zB" 
            alt="Silk Saree Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-xs font-semibold tracking-wider text-white uppercase mb-4 backdrop-blur-sm">
            Est. 1957
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold mb-6 leading-tight">
            Weaving Tradition <br /> Into <span className="text-gold-400 italic">Elegance</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-100 mb-10 font-light max-w-2xl mx-auto">
            Discover India's finest handloom sarees, curated by AI intelligence to match your perfect moment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalog" className="px-8 py-4 bg-royal-700 hover:bg-royal-800 text-white rounded-full font-medium transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
              Shop Collection <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-4 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-bold mb-4">Curated Masterpieces</h2>
            <div className="w-24 h-1 bg-royal-700 mx-auto rounded-full" />
            <p className="mt-4 text-stone-600 max-w-2xl mx-auto">
              Handpicked selections featuring authentic Banarasi silk and contemporary linens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/catalog" className="inline-flex items-center text-royal-700 font-semibold hover:text-royal-900 transition-colors border-b-2 border-royal-700 pb-1">
              Show All Collection <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-12 text-center">
          <div className="p-6">
            <div className="w-16 h-16 bg-royal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-royal-700" size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3">Authentic Weaves</h3>
            <p className="text-stone-600">Sourced directly from weavers in Phulia, Santipur, and Many Places.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-royal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="text-royal-700" size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3">AI Personal Styling</h3>
            <p className="text-stone-600">Our Gemini-powered 'Veda' stylist helps you find the perfect match for your skin tone.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 bg-royal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-royal-700" size={32} />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3">Secure Shopping</h3>
            <p className="text-stone-600">Seamless checkout experience with guaranteed delivery and easy returns.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
