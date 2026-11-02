import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertCircle, BookOpen, Users, Award, ArrowLeft } from 'lucide-react';
import { authApi } from '../utils/api.js';
import { useAuthStore } from '../store/authStore.js';

const PERKS = [
  { icon: BookOpen, text: 'Access to 3,500+ expert-led courses' },
  { icon: Users, text: 'Live 1:1 mentoring sessions' },
  { icon: Award, text: 'Verified industry certifications' },
];

const AVATAR_INITIALS = ['A', 'B', 'C', 'D'];

export default function LoginPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = mode === 'login' ? authApi.login : authApi.register;
      const { data } = await fn(form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (decorative) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative bg-gray-950 flex-col justify-between p-14 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-16 w-[380px] h-[380px] bg-brand-600/25 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-0 -left-12 w-[300px] h-[300px] bg-violet-700/20 rounded-full blur-[100px] animate-blob animate-delay-2000" />
        </div>
        <div className="absolute inset-0 hero-grid pointer-events-none" />

        {/* Logo */}
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5 font-extrabold text-xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-[0_2px_10px_rgba(37,69,245,0.4)]">
              <Zap className="h-4 w-4 text-white fill-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-violet-400">
              Skillfyme
            </span>
          </Link>
        </div>

        {/* Middle content */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Accelerate your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-accent-500">
                career growth
              </span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Join thousands of professionals leveling up with personalized learning paths and live mentoring.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="glass flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-brand-400" />
                </div>
                <span className="text-gray-300 text-sm font-semibold">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {AVATAR_INITIALS.map((l, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 border-2 border-gray-950 flex items-center justify-center text-white text-[10px] font-bold"
                >
                  {l}
                </div>
              ))}
            </div>
            <span>250,000+ learners worldwide</span>
          </div>
        </div>

        <p className="relative text-gray-700 text-xs">
          &copy; {new Date().getFullYear()} Skillfyme, Inc.
        </p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14 bg-gray-50">
        <div className="w-full max-w-[420px]">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-xl">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-700 to-brand-500">
                Skillfyme
              </span>
            </Link>
            <Link to="/" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-gray-500">
              {mode === 'login'
                ? 'Sign in to continue your learning journey'
                : 'Start your learning journey — free forever'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm mb-6">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="jane@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <a href="#" className="text-sm text-brand-600 hover:text-brand-700 font-bold transition-colors">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2 rounded-xl"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-brand-600 font-extrabold hover:text-brand-700 transition-colors"
              >
                {mode === 'login' ? 'Sign up for free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
