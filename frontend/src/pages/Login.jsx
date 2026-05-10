import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Lock, Mail, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from '../services/api';
import { saveAuth } from '../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      saveAuth(res.data.data.token, res.data.data.user);
      toast.success(`Welcome back, ${res.data.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed. Please check your email and password.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/20 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="aurora-surface hidden p-10 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                <BrainCircuit size={25} />
              </div>
              <div>
                <div className="text-xl font-black">PlacementPrep AI</div>
                <div className="text-sm font-medium text-white/50">Welcome back to the studio</div>
              </div>
            </button>
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/70">
                <Sparkles size={16} className="text-amber-300" />
                Resume sharper. Interview calmer.
              </div>
              <h1 className="text-5xl font-black leading-tight">Pick up exactly where your progress left off.</h1>
            </div>
          </div>
        </section>

        <section className="glass-panel bg-white/80 p-7 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white lg:hidden">
                <BrainCircuit size={24} />
              </div>
              <h1 className="text-4xl font-black text-gray-950">Welcome back</h1>
              <p className="mt-2 font-medium text-gray-500">Login to continue your preparation.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pl-12 font-semibold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Password</span>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pl-12 font-semibold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="shine-button w-full rounded-2xl bg-slate-950 py-4 font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Logging in...' : 'Login'}
                  <ArrowRight size={18} />
                </span>
              </button>
            </form>

            <p className="mt-7 text-center font-medium text-gray-600">
              Do not have an account?{' '}
              <Link to="/register" className="font-black text-indigo-600 hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
