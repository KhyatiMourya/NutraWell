import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Salad, AlertCircle, ArrowLeft, ArrowRight, Check, Circle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Register() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'female',
    weight: '',
    height: '',
    activity_level: 'sedentary',
    goal: 'maintain',
  });

  // Password validation checks
  const passwordVal = formData.password;
  const checks = {
    length: passwordVal.length >= 6,
    number: /\d/.test(passwordVal),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(passwordVal),
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMsg('Please fill in name, email, and password.');
      return;
    }

    // Verify password validation rules
    if (!checks.length || !checks.number || !checks.symbol) {
      setErrorMsg('Please fulfill all password requirements.');
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Registration failed. Email might already be taken.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setErrorMsg('');

    setTimeout(async () => {
      try {
        // Register standard mock user via auth pipeline
        const mockEmail = `google_user_${Date.now()}@gmail.com`;
        await register({
          name: 'Jane Google Doe',
          email: mockEmail,
          password: 'Password123!',
          age: '28',
          gender: 'female',
          weight: '65',
          height: '168',
          activity_level: 'sedentary',
          goal: 'maintain'
        });
        navigate('/dashboard');
      } catch (err) {
        setErrorMsg('Google registration failed. Please try form signup.');
      } finally {
        setGoogleLoading(false);
      }
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
            
            {/* Left Column: Wellness Quote (hidden on mobile) */}
            <div className="hidden md:flex md:col-span-5 relative bg-gray-100 overflow-hidden items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
                alt="Aesthetic Healthy Salad Platter"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex flex-col justify-between p-8 text-left text-white">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <Salad className="h-5 w-5" />
                  </div>
                  <span className="font-bold tracking-tight text-sm">NutraWell</span>
                </div>

                <div className="glass-card p-6 border border-white/20 bg-white/10 backdrop-blur-md rounded-premium text-white flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Habit Building</span>
                  <p className="text-sm font-semibold leading-relaxed">
                    "An investment in health always pays the best interest. Eat smart today for a stronger tomorrow."
                  </p>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Eat Smart. Live Well.
                </span>
              </div>
            </div>

            {/* Right Column: Sign Up Wizard */}
            <div className="md:col-span-7 p-8 sm:p-12 flex flex-col gap-6 text-left">
              
              {/* Header */}
              <div className="flex flex-col gap-1 items-start">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Your Account</h2>
                <p className="text-xs text-gray-500 font-semibold">Step {step} of 2: {step === 1 ? 'Credentials' : 'Biometrics Profile'}</p>
                
                {/* Custom Progress Line */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-gray-150'}`} />
                  <span className={`h-1.5 w-10 rounded-full transition-all duration-300 ${step === 2 ? 'bg-primary' : 'bg-gray-150'}`} />
                </div>
              </div>

              {/* Error Notice */}
              {errorMsg && (
                <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-[14px] text-xs font-semibold text-red-600">
                  <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Wizard Content */}
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onSubmit={handleNextStep}
                    className="flex flex-col gap-4"
                  >
                    <Input
                      label="Full Name"
                      name="name"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="focus:border-secondary focus:ring-secondary/10"
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="focus:border-secondary focus:ring-secondary/10"
                      required
                    />
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="Enter a secure password"
                      value={formData.password}
                      onChange={handleChange}
                      className="focus:border-secondary focus:ring-secondary/10"
                      required
                    />

                    {/* Password Strength/Validation Checklist */}
                    <div className="p-3.5 bg-slate-50/50 rounded-premium border border-gray-100 flex flex-col gap-2 text-xs font-semibold text-gray-500 select-none">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Password Requirements</span>
                      
                      <div className="flex items-center gap-2">
                        {checks.length ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-1.5 mr-1" />
                        )}
                        <span className={checks.length ? 'text-emerald-700 font-bold' : ''}>Min 6 characters</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {checks.number ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-1.5 mr-1" />
                        )}
                        <span className={checks.number ? 'text-emerald-700 font-bold' : ''}>Contains at least 1 number</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {checks.symbol ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-300 ml-1.5 mr-1" />
                        )}
                        <span className={checks.symbol ? 'text-emerald-700 font-bold' : ''}>Contains a special character (!, @, #, etc.)</span>
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2">
                      Continue to Health Profile
                      <ArrowRight className="h-4.5 w-4.5" />
                    </Button>

                    {/* Google OAuth Section */}
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-100"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">or sign up with</span>
                      <div className="flex-grow border-t border-gray-100"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignup}
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
                      <span>Sign up with Google</span>
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Age (Years)"
                        name="age"
                        type="number"
                        placeholder="e.g. 28"
                        value={formData.age}
                        onChange={handleChange}
                        className="focus:border-secondary focus:ring-secondary/10"
                        required
                      />
                      <Select
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="focus:border-secondary focus:ring-secondary/10"
                        options={[
                          { label: 'Female', value: 'female' },
                          { label: 'Male', value: 'male' },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Weight (kg)"
                        name="weight"
                        type="number"
                        step="0.1"
                        placeholder="e.g. 65"
                        value={formData.weight}
                        onChange={handleChange}
                        className="focus:border-secondary focus:ring-secondary/10"
                        required
                      />
                      <Input
                        label="Height (cm)"
                        name="height"
                        type="number"
                        placeholder="e.g. 168"
                        value={formData.height}
                        onChange={handleChange}
                        className="focus:border-secondary focus:ring-secondary/10"
                        required
                      />
                    </div>

                    <Select
                      label="Activity Level"
                      name="activity_level"
                      value={formData.activity_level}
                      onChange={handleChange}
                      className="focus:border-secondary focus:ring-secondary/10"
                      options={[
                        { label: 'Sedentary (Little to no exercise)', value: 'sedentary' },
                        { label: 'Lightly Active (Exercise 1-3 days/week)', value: 'lightly_active' },
                        { label: 'Moderately Active (Exercise 3-5 days/week)', value: 'moderately_active' },
                        { label: 'Very Active (Hard exercise 6-7 days/week)', value: 'very_active' },
                      ]}
                    />

                    <Select
                      label="Primary Wellness Goal"
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="focus:border-secondary focus:ring-secondary/10"
                      options={[
                        { label: 'Lose Weight (Deficit of 500 kcal)', value: 'lose_weight' },
                        { label: 'Maintain Weight (Balance intake)', value: 'maintain' },
                        { label: 'Gain Muscle/Weight (Surplus of 400 kcal)', value: 'gain_muscle' },
                      ]}
                    />

                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="w-1/3"
                      >
                        <ArrowLeft className="h-4.5 w-4.5" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        loading={loading}
                        className="w-2/3"
                      >
                        Create Account
                        <Check className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Redirect banner */}
              <p className="text-sm text-gray-500 font-semibold text-center mt-2 select-none">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary hover:text-secondary-hover underline font-bold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
export default Register;
