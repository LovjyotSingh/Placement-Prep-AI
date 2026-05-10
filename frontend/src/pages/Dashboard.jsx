import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  FileText,
  Flame,
  Gauge,
  Medal,
  Play,
  TrendingUp,
} from 'lucide-react';
import { Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api, { getApiErrorMessage } from '../services/api';
import { getUser } from '../services/auth';

const ROLES = ['SDE', 'Data Analyst', 'Business Analyst', 'Product Manager'];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingInterview, setStartingInterview] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.targetRole || 'SDE');
  const [difficulty, setDifficulty] = useState('medium');

  useEffect(() => {
    api
      .get('/analytics/dashboard')
      .then((res) => setStats(res.data.data))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Could not load stats')))
      .finally(() => setLoading(false));
  }, []);

  const startInterview = async () => {
    setStartingInterview(true);
    try {
      const res = await api.post('/interviews/start', {
        targetRole: selectedRole,
        difficulty,
        questionCount: 10,
      });
      navigate(`/interview/${res.data.data.interviewId}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not start interview'));
      setStartingInterview(false);
    }
  };

  const radarData = stats
    ? [
        { subject: 'Technical', score: stats.scoreBreakdown.technical },
        { subject: 'Communication', score: stats.scoreBreakdown.communication },
        { subject: 'Confidence', score: stats.scoreBreakdown.confidence },
      ]
    : [];

  const statCards = [
    {
      label: 'Total interviews',
      value: stats?.overview?.totalInterviews || 0,
      icon: BookOpenCheck,
      accent: 'from-indigo-500 to-violet-500',
    },
    {
      label: 'Average score',
      value: `${stats?.overview?.averageScore || 0}%`,
      icon: Gauge,
      accent: 'from-teal-500 to-emerald-500',
    },
    {
      label: 'Best score',
      value: `${stats?.overview?.highestScore || 0}%`,
      icon: Medal,
      accent: 'from-amber-400 to-orange-500',
    },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="reveal-up grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="aurora-surface rounded-[2rem] p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/70">
                  <Flame size={16} className="text-amber-300" />
                  Your placement command center
                </div>
                <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                  Hi {user.name || 'there'}, ready for a sharper attempt?
                </h1>
                <p className="mt-4 max-w-2xl text-white/60">
                  Start a role-focused round, watch your score trend, and use each attempt to tighten the next one.
                </p>
              </div>
              <button
                onClick={() => navigate('/resume')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-0.5"
              >
                <FileText size={17} />
                Resume analyzer
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-white/70">Target role</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-bold text-white outline-none transition focus:ring-2 focus:ring-amber-300"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role} className="text-gray-900">
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-white/70">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 font-bold text-white outline-none transition focus:ring-2 focus:ring-amber-300"
                >
                  <option value="easy" className="text-gray-900">
                    Easy
                  </option>
                  <option value="medium" className="text-gray-900">
                    Medium
                  </option>
                  <option value="hard" className="text-gray-900">
                    Hard
                  </option>
                </select>
              </label>

              <button
                onClick={startInterview}
                disabled={startingInterview}
                className="shine-button rounded-2xl bg-amber-300 px-7 py-3.5 font-black text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {startingInterview ? 'Starting...' : 'Start interview'}
                  <Play size={17} fill="currentColor" />
                </span>
              </button>
            </div>
          </div>

          <div className="premium-card rounded-[2rem] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BrainCircuit size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-500">Today focus</div>
                <div className="text-xl font-black text-gray-950">Answer structure</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {['Lead with the result', 'Explain tradeoffs clearly', 'Close with measurable impact'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-sm font-bold text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="premium-card h-36 animate-pulse rounded-[1.5rem]" />
            ))}
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-5 md:grid-cols-3">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className="premium-card reveal-up rounded-[1.5rem] p-6"
                    style={{ animationDelay: `${index * 70}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}>
                        <Icon size={23} />
                      </div>
                      <TrendingUp size={18} className="text-emerald-500" />
                    </div>
                    <div className="mt-5 text-4xl font-black text-gray-950">{card.value}</div>
                    <div className="mt-1 text-sm font-bold uppercase tracking-[0.14em] text-gray-400">{card.label}</div>
                  </div>
                );
              })}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="premium-card rounded-[1.5rem] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-950">Score trend</h2>
                    <p className="text-sm font-medium text-gray-500">Your recent interview momentum</p>
                  </div>
                  <BarChart3 className="text-indigo-500" />
                </div>
                {stats?.trend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={245}>
                    <LineChart data={stats.trend}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e5e7eb' }} />
                      <Line type="monotone" dataKey="score" stroke="#5b5ce2" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Complete interviews to unlock your trend line." />
                )}
              </div>

              <div className="premium-card rounded-[1.5rem] p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-950">Skill radar</h2>
                    <p className="text-sm font-medium text-gray-500">Technical, communication, confidence</p>
                  </div>
                  <Gauge className="text-teal-500" />
                </div>
                {radarData.some((item) => item.score > 0) ? (
                  <ResponsiveContainer width="100%" height={245}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475467' }} />
                      <Radar dataKey="score" stroke="#0ea5a4" fill="#0ea5a4" fillOpacity={0.26} strokeWidth={3} />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Complete interviews to reveal your skill shape." />
                )}
              </div>
            </section>

            <section className="mt-8">
              <div className="premium-card rounded-[1.5rem] p-6">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-black text-gray-950">Recent interviews</h2>
                    <p className="text-sm font-medium text-gray-500">Latest attempts and outcomes</p>
                  </div>
                  <button
                    onClick={startInterview}
                    disabled={startingInterview}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    New attempt <ArrowRight size={16} />
                  </button>
                </div>

                {stats?.recentInterviews?.length > 0 ? (
                  <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
                    {stats.recentInterviews.map((interview, index) => (
                      <div key={`${interview.createdAt}-${index}`} className="grid gap-3 bg-white/60 p-4 transition hover:bg-white sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                          <div className="font-black text-gray-900">{interview.targetRole}</div>
                          <div className="mt-1 text-sm font-medium text-gray-500">
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          className={`text-2xl font-black ${
                            interview.overallScore >= 75
                              ? 'text-emerald-600'
                              : interview.overallScore >= 50
                                ? 'text-amber-600'
                                : 'text-red-500'
                          }`}
                        >
                          {interview.overallScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Your interview history will appear here after your first round." />
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center text-sm font-semibold text-gray-400">
      {text}
    </div>
  );
}
