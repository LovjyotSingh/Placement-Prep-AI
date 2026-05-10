import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, Mail, Sparkles, User, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from '../services/api';
import { saveAuth } from '../services/auth';

const ROLES = ['SDE', 'Data Analyst', 'Business Analyst', 'Product Manager'];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', targetRole: 'SDE' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      saveAuth(res.data.data.token, res.data.data.user);
      toast.success('Account created. Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] shadow-2xl shadow-slate-900/20 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="glass-panel bg-white/80 p-7 sm:p-10">
          <div className="mx-auto max-w-md">
            <button onClick={() => navigate('/')} className="mb-8 flex items-center gap-3 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BrainCircuit size={24} />
              </div>
              <div>
                <div className="text-lg font-black text-gray-950">PlacementPrep AI</div>
                <div className="text-xs font-bold text-gray-500">Start your readiness sprint</div>
              </div>
            </button>

            <h1 className="text-4xl font-black text-gray-950">Create your account</h1>
            <p className="mt-2 font-medium text-gray-500">Build a practice plan around your target role.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <IconInput
                label="Full name"
                icon={User}
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              <IconInput
                label="Email"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
              />
              <IconInput
                label="Password"
                icon={Wand2}
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(value) => setForm({ ...form, password: value })}
              />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Target role</span>
                <select
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 font-semibold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  value={form.targetRole}
                  onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="shine-button w-full rounded-2xl bg-slate-950 py-4 font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Creating account...' : 'Create free account'}
                  <ArrowRight size={18} />
                </span>
              </button>
            </form>

            <p className="mt-7 text-center font-medium text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-indigo-600 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </section>

        <section className="aurora-surface hidden p-10 text-white lg:block">
          <div className="flex h-full flex-col justify-between">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/70">
              <Sparkles size={16} className="text-amber-300" />
              Free AI practice suite
            </div>
            <div>
              <h2 className="text-5xl font-black leading-tight">Train for the room before you enter it.</h2>
              <div className="mt-8 grid gap-3">
                {['Role-aware interview rounds', 'Instant scorecards', 'Resume ATS feedback'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/20 bg-white/10 p-4 font-bold text-white/80 backdrop-blur-xl">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function IconInput({ label, icon: Icon, type, placeholder, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-700">{label}</span>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type={type}
          required
          placeholder={placeholder}
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 pl-12 font-semibold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
