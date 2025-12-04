
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const { cartCount } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  const isActive = (path: string) => location.pathname === path ? "text-royal-700 font-semibold" : "text-stone-600 hover:text-royal-700";

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-royal-700 rounded-tr-xl rounded-bl-xl flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">F</span>
            </div>
            <span className="font-serif text-2xl font-bold text-stone-900 tracking-wide">
              FLYING<span className="text-royal-700">POPAT</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className={`${isActive('/')} transition-colors duration-200`}>Home</Link>
            <Link to="/sarees" className={`${isActive('/sarees')} transition-colors duration-200`}>Sarees</Link>
            <Link to="/kids" className={`${isActive('/kids')} transition-colors duration-200`}>Kids Wear</Link>
            {isAdmin && (
              <Link to="/admin" className={`${isActive('/admin')} transition-colors duration-200 flex items-center gap-1`}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="relative p-2 text-stone-600 hover:text-royal-700 transition-colors" onClick={closeMenu}>
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-royal-700 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <div className="relative">
              {user ? (
                <div className="relative">
                   <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 focus:outline-none"
                   >
                     <img 
                       src={user.avatar} 
                       alt={user.name} 
                       className="w-8 h-8 rounded-full border border-stone-200"
                     />
                   </button>
                   
                   {/* Dropdown */}
                   {showProfileMenu && (
                     <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-100 py-1 animate-fade-in-down">
                        <div className="px-4 py-2 border-b border-stone-50">
                          <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{user.email}</p>
                        </div>
                        
                        {/* My Orders Link */}
                        <Link 
                          to="/my-orders" 
                          onClick={() => setShowProfileMenu(false)}
                          className={`w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2 ${isAdmin ? 'hidden' : ''}`}
                        >
                          <Package size={14} /> My Orders
                        </Link>

                        {isAdmin && (
                          <Link 
                            to="/admin" 
                            onClick={() => setShowProfileMenu(false)}
                            className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                     </div>
                   )}
                </div>
              ) : (
                <Link 
                  to="/login" 
                  state={{ from: location }} 
                  className="hidden md:flex items-center gap-1 text-stone-600 hover:text-royal-700 font-medium"
                >
                  <UserIcon size={20} /> <span className="text-sm">Login</span>
                </Link>
              )}
            </div>
            
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-stone-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-100 animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link to="/" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-royal-700">Home</Link>
            <Link to="/sarees" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-royal-700">Sarees</Link>
            <Link to="/kids" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-royal-700">Kids Wear</Link>
            
            {!isAdmin && (
              <Link to="/cart" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-royal-700">Cart ({cartCount})</Link>
            )}
            
            {user && !isAdmin && (
              <Link to="/my-orders" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-royal-700">My Orders</Link>
            )}

            {isAdmin && (
               <Link to="/admin" onClick={closeMenu} className="block px-3 py-2 rounded-md text-base font-medium text-royal-700 bg-royal-50">Admin Dashboard</Link>
            )}
            {!user ? (
              <Link 
                to="/login" 
                state={{ from: location }} 
                onClick={closeMenu} 
                className="block px-3 py-2 rounded-md text-base font-medium text-stone-700 hover:bg-stone-50 hover:text-royal-700"
              >
                Login
              </Link>
            ) : (
              <button onClick={() => { handleLogout(); closeMenu(); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside listener for profile menu */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-0" onClick={() => setShowProfileMenu(false)} />
      )}
    </nav>
  );
};
