
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { InquiryProvider } from './context/InquiryContext';
import { CouponProvider } from './context/CouponContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { PaymentVerification } from './pages/PaymentVerification';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { MyOrders } from './pages/MyOrders';
import { ContactUs } from './pages/ContactUs';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { ShippingPolicy } from './pages/ShippingPolicy';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
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
        <h2 className="font-serif text-2xl text-white font-bold mb-4">FLYING<span className="text-royal-500">POPAT</span></h2>
        <p className="text-sm leading-relaxed">Redefining tradition with technology. The world's first AI-curated saree boutique.</p>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-4">Collection</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/sarees" className="hover:text-royal-500 transition-colors">Sarees</Link></li>
          <li><Link to="/kids" className="hover:text-royal-500 transition-colors">Kids Wear</Link></li>
          <li><Link to="/sarees" className="hover:text-royal-500 transition-colors">Wedding Edition</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-semibold mb-4">Policies</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/return-policy" className="hover:text-royal-500 transition-colors">Cancellation & Refunds</Link></li>
          <li><Link to="/shipping-policy" className="hover:text-royal-500 transition-colors">Shipping Policy</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-royal-500 transition-colors">Privacy Policy</Link></li>
          <li><Link to="/terms-conditions" className="hover:text-royal-500 transition-colors">Terms & Conditions</Link></li>
        </ul>
      </div>
       <div>
        <h3 className="text-white font-semibold mb-4">Contact</h3>
        <p className="text-sm mb-2">Howrah, West Bengal, India</p>
        <p className="text-sm"><a href="mailto:help.flyingpopat@gmail.com" className="hover:text-royal-500">help.flyingpopat@gmail.com</a></p>
        <p className="text-sm mt-4 text-xs opacity-50">© 2024 FlyingPopat. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProductProvider>
        <CouponProvider>
          <CartProvider>
            <OrderProvider>
              <FeedbackProvider>
                <InquiryProvider>
                  <Router>
                    <ScrollToTop />
                    <div className="flex flex-col min-h-screen">
                      <Navbar />
                      <div className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          {/* Routes for separate sections */}
                          <Route path="/sarees" element={<Catalog section="Saree" />} />
                          <Route path="/kids" element={<Catalog section="Kids" />} />
                          
                          {/* Generic Catalog Fallback */}
                          <Route path="/catalog" element={<Catalog section="All" />} />
                          
                          <Route path="/product/:id" element={<ProductDetails />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/payment-verification" element={<PaymentVerification />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/my-orders" element={<MyOrders />} />
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/contact" element={<ContactUs />} />
                          
                          {/* Policy Pages */}
                          <Route path="/return-policy" element={<ReturnPolicy />} />
                          <Route path="/shipping-policy" element={<ShippingPolicy />} />
                          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/terms-conditions" element={<Terms />} />
                          
                          <Route path="*" element={<Home />} />
                        </Routes>
                      </div>
                      <Footer />
                      <GeminiStylist />
                    </div>
                  </Router>
                </InquiryProvider>
              </FeedbackProvider>
            </OrderProvider>
          </CartProvider>
        </CouponProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default App;
