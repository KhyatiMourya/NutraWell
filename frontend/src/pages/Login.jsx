import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Leaf, AlertCircle, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Check remembered email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('nutrawell_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      
      // Save or remove remembered email
      if (rememberMe) {
        localStorage.setItem('nutrawell_remembered_email', email);
      } else {
        localStorage.removeItem('nutrawell_remembered_email');
      }

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    setErrorMsg('');
    
    // Simulate OAuth handshake
    setTimeout(async () => {
      try {
        // Log in with mock credentials
        await login('jane@example.com', 'password123');
        navigate('/dashboard');
      } catch (err) {
        setErrorMsg('Google single sign-on failed. Please try credentials.');
      } finally {
        setGoogleLoading(false);
      }
    }, 1500);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSuccess(true);
      setForgotEmail('');
    }, 1500);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl"
      >
        <Card className="shadow-premium overflow-hidden border border-gray-100/50 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            <div className="hidden md:flex md:col-span-5 relative bg-gray-100 overflow-hidden items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&auto=format&fit=crop"
                alt="Healthy food spread"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#2E7D32]/60 flex flex-col justify-between p-8 text-left text-white">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Leaf className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">NutraWell</span>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20 flex flex-col gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-green-200">Wellness Quote</span>
                  <p className="text-sm font-medium leading-relaxed">
                    "Your body hears everything your mind says. Keep it nourished with wholesome foods."
                  </p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Eat Well. Live Long.</span>
              </div>
            </div>

            {/* Right Column: Interactive Login Form */}
            <div className="md:col-span-7 p-8 sm:p-12 flex flex-col gap-6 text-left">
              
              {/* Header */}
              <div className="flex flex-col gap-1.5">
                <span className="section-label">Welcome Back</span>
                <h2 className="text-2xl font-bold text-gray-900">Sign In to <span className="text-[#2E7D32]">NutraWell</span></h2>
                <p className="text-sm text-gray-500">Continue your wellness journey</p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-[14px] text-xs font-semibold text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-secondary focus:ring-secondary/10"
                  required
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-secondary focus:ring-secondary/10"
                  required
                />

                {/* Extra Options Checkbox */}
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 select-none">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-primary h-4.5 w-4.5 rounded cursor-pointer border-gray-200"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => { setForgotModalOpen(true); setForgotSuccess(false); }}
                    className="text-secondary hover:text-secondary-hover hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button type="submit" loading={loading} className="w-full mt-2">
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">or sign in with</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Google Login button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-[14px] text-sm font-semibold text-gray-600 transition-all select-none focus:outline-none focus:ring-2 focus:ring-gray-100 disabled:opacity-50"
              >
                {googleLoading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path fill="#4285F4" d="M23.766 12.27c0-.796-.068-1.571-.202-2.318H12v4.51h6.6c-.276 1.472-1.096 2.715-2.316 3.54v2.9h3.722c2.18-2.008 3.76-4.966 3.76-8.632z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.955-1.077 7.938-2.915l-3.722-2.9c-1.033.693-2.36 1.115-4.216 1.115-3.24 0-5.99-2.189-6.974-5.14H1.144v2.997C3.125 20.198 7.21 24 12 24z" />
                    <path fill="#FBBC05" d="M5.026 14.16a7.195 7.195 0 010-4.32V6.843H1.144a11.956 11.956 0 000 10.315l3.882-2.998z" />
                    <path fill="#EA4335" d="M12 4.777c1.764 0 3.344.608 4.59 1.802l3.434-3.433C17.95 1.192 15.235 0 12 0 7.21 0 3.125 3.802 1.144 7.843l3.882 2.998c.983-2.951 3.734-5.14 6.974-5.14z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <p className="text-sm text-gray-500 text-center mt-2">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#8E7CC3] hover:text-[#7B68B0] font-semibold underline transition-colors">
                  Create one for free
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-premium shadow-2xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-6 text-left border border-gray-150 relative"
            >
              <button
                onClick={() => setForgotModalOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors focus:outline-none"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">Enter your registered email address and we will dispatch a reset authorization token link (Simulated).</p>
              </div>

              {forgotSuccess ? (
                <div className="flex flex-col items-center gap-4 text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Check className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-gray-900">Email Dispatched!</span>
                    <p className="text-xs text-gray-400 font-medium px-4">If the address exists, check your inbox for reset instructions.</p>
                  </div>
                  <Button size="sm" onClick={() => setForgotModalOpen(false)} className="w-1/2 mt-2">Close</Button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" loading={forgotLoading} className="w-full mt-2">
                    Send Reset Link
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Login;
