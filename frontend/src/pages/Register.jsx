import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { Salad, AlertCircle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "female",
    weight: "",
    height: "",
    activity_level: "sedentary",
    goal: "maintain",
  });

  const checks = {
    length: formData.password.length >= 6,
    number: /\d/.test(formData.password),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password)
      return setErrorMsg("Please fill in required fields.");
    if (!checks.length || !checks.number || !checks.symbol)
      return setErrorMsg("Please fulfill all password requirements.");
    setErrorMsg("");
    setStep(2);
  };

  // UPDATED: Correct fetch call to your backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Keep your existing Google logic, but ensure it navigates correctly
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="flex-grow flex items-center justify-center py-6 sm:py-12">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="shadow-premium overflow-hidden border border-gray-100/50 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="hidden md:flex md:col-span-5 relative bg-gray-100 overflow-hidden items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
                className="absolute inset-0 w-full h-full object-cover"
                alt="Health"
              />
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] p-8 text-white flex flex-col justify-between">
                <span className="font-bold">NutraWell</span>
                <p className="text-sm font-semibold">
                  "Eat smart today for a stronger tomorrow."
                </p>
              </div>
            </div>

            <div className="md:col-span-7 p-8 sm:p-12 flex flex-col gap-6 text-left">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Create Your Account
              </h2>
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.form
                    key="step-1"
                    onSubmit={handleNextStep}
                    className="flex flex-col gap-4"
                  >
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Button type="submit" className="w-full">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="step-2"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                      <Select
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        options={[
                          { label: "Female", value: "female" },
                          { label: "Male", value: "male" },
                        ]}
                      />
                    </div>
                    <Button type="submit" loading={loading} className="w-full">
                      Create Account <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
export default Register;
