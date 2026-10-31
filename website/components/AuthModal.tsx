import React, { useState } from 'react';
import { AuthUser } from '../types';
import { signInUser, signUpUser } from '../lib/supabase';
import { validateIndianPhone } from '../lib/moderation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
  promptMessage?: string;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  promptMessage,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [identifier, setIdentifier] = useState(''); // email or mobile
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }

        const phoneValidation = validateIndianPhone(phone);
        if (!phoneValidation.isValid) {
          setErrorMessage(phoneValidation.reason || 'Invalid phone number.');
          setIsLoading(false);
          return;
        }

        const loginIdentifier = identifier.trim() || phone.trim();
        const { user, error } = await signUpUser({
          emailOrPhone: loginIdentifier,
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
        });

        if (error) {
          setErrorMessage(error);
          setIsLoading(false);
          return;
        }

        if (user) {
          onSuccess(user);
          onClose();
        }
      } else {
        // Log In
        if (!identifier.trim()) {
          setErrorMessage('Please enter your email or 10-digit mobile number.');
          setIsLoading(false);
          return;
        }

        const { user, error } = await signInUser({
          emailOrPhone: identifier.trim(),
          password,
        });

        if (error) {
          setErrorMessage(error);
          setIsLoading(false);
          return;
        }

        if (user) {
          onSuccess(user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 bg-slate-50 border-b border-slate-100 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <iconify-icon icon="lucide:x" class="text-xl"></iconify-icon>
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
              <iconify-icon icon="lucide:shield-check" class="text-lg"></iconify-icon>
            </span>
            <span className="text-xs font-black text-primary uppercase tracking-wider">Flatemate Verified Auth</span>
          </div>

          <h3 className="font-heading text-xl font-bold text-slate-900 mt-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Flatemate Account'}
          </h3>

          <p className="text-xs text-slate-600 mt-1">
            {promptMessage || (mode === 'login' 
              ? 'Log in to manage your spaces, inquiries, and verified connects.' 
              : 'Sign up in 30 seconds to list spaces and connect directly with hosts.')}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <iconify-icon icon="lucide:alert-circle" class="text-base shrink-0 mt-0.5"></iconify-icon>
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'signup' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  WhatsApp / Mobile Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Used to alert you on WhatsApp and sync your listings.</p>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                WhatsApp Mobile Number or Email *
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or your email"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">
                Password *
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Min 6 characters</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <iconify-icon icon={showPassword ? 'lucide:eye-off' : 'lucide:eye'} class="text-base"></iconify-icon>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 min-h-12 w-full rounded-xl bg-primary text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <iconify-icon icon="lucide:loader-2" class="text-base animate-spin"></iconify-icon>
                <span>Please wait...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Log In to Flatemate' : 'Create Account'}</span>
            )}
          </button>

          <p className="text-[11px] text-slate-500 text-center pt-2">
            By continuing, you agree to Flatemate's Zero Brokerage Policy and Safety Guidelines.
          </p>
        </form>
      </div>
    </div>
  );
};
