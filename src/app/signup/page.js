"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Mail, User, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._]+_ug_\d{2}@(cse|ece|eie|ee|me|ce)\.nits\.ac\.in$/;
    if (!emailRegex.test(form.email)) {
      alert("Please use your institute email ID");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.step === "otp") {
        setStep(2);
      } else {
        alert(data.error || data.message || "Signup failed");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });

      const data = await res.json();

      if (res.ok) {
        router.replace("/profile");
      } else {
        alert(data.error || "Verification failed");
      }
    } catch (error) {
      alert("Verification error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className='absolute inset-0 w-full h-full pointer-events-none'>
        <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[128px] animate-pulse' />
        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-[128px] animate-pulse delay-700' />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10 p-6"
      >
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 h-1 bg-white/10 w-full">
            <motion.div
              initial={{ width: "50%" }}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              className="h-full bg-indigo-500"
            />
          </div>

          <div className="text-center mb-8 pt-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 text-white shadow-lg shadow-indigo-500/30">
              {step === 1 ? <UserPlus className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-zinc-400">
              {step === 1 ? "Join the community today" : "Enter the OTP sent to your email"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold ml-1">Institute Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                      type="email"
                      className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                      placeholder="name_ug_23@cse.nits.ac.in"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                      <PasswordInput
                        className="w-full pl-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                        placeholder="******"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold ml-1">Confirm</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                      <PasswordInput
                        className="w-full pl-12 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                        placeholder="******"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                >
                  {loading ? "Creating..." : "Create Account"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <div className="text-center mt-4">
                  <p className="text-zinc-500 text-sm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                      Login
                    </Link>
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-400 font-bold ml-1 text-center block">
                    One-Time Password
                  </label>
                  <input
                    type="text"
                    placeholder="000000"
                    className="w-full p-4 bg-black/30 border border-indigo-500/30 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-mono text-center text-3xl tracking-[1em]"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                    required
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-center text-zinc-500 text-xs">Enter the 6-digit code sent to your email</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3.5 rounded-xl border border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/20"
                  >
                    {loading ? "Verifying..." : "Verify & Sign Up"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
