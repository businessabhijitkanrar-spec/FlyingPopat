
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ArrowRight, User, ShieldCheck, Phone } from 'lucide-react';

export const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the previous path or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const countryCodes = [
    { code: '+91', country: 'IN' },
    { code: '+1', country: 'US' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'AU' },
    { code: '+971', country: 'UAE' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        // Validation for phone number
        if (!/^\d{10}$/.test(phone)) {
          setError('Phone number must be exactly 10 digits');
          return;
        }

        // Force role to user during registration
        await register(name, email, password, phone, countryCode, 'user');
      } else {
        await login(email, password, rememberMe);
      }
      
      // Redirect logic
      if (!isRegistering && role === 'admin') {
          navigate('/admin');
      } else {
          navigate(from);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      
      if (role === 'admin' && !isRegistering) {
        alert("Incorrect Admin Credentials");
      }
    }
  };

  const toggleMode = () => {
    const nextIsRegistering = !isRegistering;
    setIsRegistering(nextIsRegistering);
    setError('');
    setName('');
    setPassword('');
    setEmail('');
    setPhone('');
    
    // Always default to user role when switching modes
    if (nextIsRegistering) {
        setRole('user');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-stone-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-royal-700 rounded-tr-xl rounded-bl-xl flex items-center justify-center mb-4">
             <span className="text-white font-serif font-bold text-3xl">V</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {isRegistering ? 'Join Vastra AI today' : 'Sign in to access your account'}
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-stone-100">
          
          {/* Role Selection Tabs - Only show for Login */}
          {!isRegistering && (
            <div className="flex bg-stone-100 p-1 rounded-xl mb-6">
              <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${role === 'user' ? 'bg-white text-royal-700 shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <User size={16} /> Customer
              </button>
              <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${role === 'admin' ? 'bg-white text-royal-700 shadow-sm ring-1 ring-black/5' : 'text-stone-500 hover:text-stone-700'}`}
              >
                  <ShieldCheck size={16} /> Admin
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span className="block w-1.5 h-1.5 bg-red-600 rounded-full" /> {error}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-6 animate-fade-in-down">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-stone-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required={isRegistering}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-royal-500 focus:border-royal-500 sm:text-sm transition-shadow"
                      placeholder="Ananya Sharma"
                    />
                  </div>
                </div>

                <div>
                   <label htmlFor="phone" className="block text-sm font-medium text-stone-700">
                    Phone Number
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                     <div className="relative flex items-center min-w-[80px]">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-full py-3 pl-3 pr-2 border border-r-0 border-stone-300 bg-stone-50 text-stone-700 rounded-l-lg focus:ring-royal-500 focus:border-royal-500 sm:text-sm w-full outline-none"
                        >
                          {countryCodes.map((item) => (
                             <option key={item.code} value={item.code}>{item.code} {item.country}</option>
                          ))}
                        </select>
                     </div>
                    <div className="relative flex-grow">
                      <input
                        id="phone"
                        type="tel"
                        required={isRegistering}
                        value={phone}
                        onChange={(e) => {
                            // Allow only digits and limit to 10
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) setPhone(val);
                        }}
                        className="block w-full px-3 py-3 border border-stone-300 rounded-r-lg focus:outline-none focus:ring-royal-500 focus:border-royal-500 sm:text-sm transition-shadow"
                        placeholder="9876543210"
                      />
                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                         <Phone className="h-5 w-5 text-stone-400" />
                       </div>
                    </div>
                  </div>
                   <p className="mt-1 text-xs text-stone-500">10 digits required</p>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-royal-500 focus:border-royal-500 sm:text-sm transition-shadow"
                  placeholder={role === 'admin' && !isRegistering ? "flyingpopat@gmail.com" : "you@example.com"}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-royal-500 focus:border-royal-500 sm:text-sm transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-royal-700 focus:ring-royal-500 border-stone-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-stone-900 cursor-pointer">
                    Remember me
                  </label>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-royal-700 hover:bg-royal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    {isRegistering 
                      ? 'Sign Up'
                      : (role === 'admin' ? 'Login as Admin' : 'Login')
                    } 
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center">
              <div className="text-sm">
                <span className="text-stone-500">
                  {isRegistering ? "Already have an account? " : "Don't have an account? "}
                </span>
                <button 
                  type="button"
                  onClick={toggleMode}
                  className="font-medium text-royal-700 hover:text-royal-500 transition-colors"
                >
                  {isRegistering ? "Sign in" : "Create account"}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
