import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyOrders } from './pages/MyOrders';
import { GeminiStylist } from './components/GeminiStylist';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Footer = () => (
  <footer className="bg-stone-900 text-stone-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
      <div>
        <h2 className="font-serif text-2xl text-white font-bold mb-4">VASTRA<span className="text-royal-500">.AI</span></h2>
        <p className="text-sm leading-relaxed">Redefining tradition with technology. The world's first AI-curated saree boutique.</p>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-4">Collection</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-royal-500 transition-colors">Banarasi</a></li>
          <li><a href="#" className="hover:text-royal-500 transition-colors">Kanjeevaram</a></li>
          <li><a href="#" className="hover:text-royal-500 transition-colors">Chiffon</a></li>
          <li><a href="#" className="hover:text-royal-500 transition-colors">Wedding Edition</a></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-4">Support</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="#" className="hover:text-royal-500 transition-colors">Order Tracking</a></li>
          <li><a href="#" className="hover:text-royal-500 transition-colors">Returns & Exchanges</a></li>
          <li><a href="#" className="hover:text-royal-500 transition-colors">Saree Care Guide</a></li>
          <li><a href="#" className="hover:text-royal-500 transition-colors">Contact Us</a></li>
        </ul>
      </div>
       <div>
        <h3 className="text-white font-semibold mb-4">Contact</h3>
        <p className="text-sm mb-2">Bangalore, Karnataka, India</p>
        <p className="text-sm">hello@vastra.ai</p>
        <p className="text-sm mt-4 text-xs opacity-50">© 2024 Vastra AI. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <OrderProvider>
            <FeedbackProvider>
              <Router>
                <ScrollToTop />
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <div className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<Home />} />
                    </Routes>
                  </div>
                  <Footer />
                  <GeminiStylist />
                </div>
              </Router>
            </FeedbackProvider>
          </OrderProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;