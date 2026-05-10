import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  MessageSquareText,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { getToken } from '../services/auth';

const features = [
  {
    icon: MessageSquareText,
    title: 'Live AI mock rounds',
    desc: 'Practice role-focused interview questions with a flow that feels like the real session.',
  },
  {
    icon: BarChart3,
    title: 'Sharp feedback loops',
    desc: 'See scores for technical depth, communication, confidence, and your progress trend.',
  },
  {
    icon: FileSearch,
    title: 'Resume signal scan',
    desc: 'Upload your resume for ATS fit, missing keywords, and section-by-section improvement ideas.',
  },
];

const timeline = ['Choose a role', 'Answer like a real interview', 'Study the scorecard', 'Improve the next attempt'];

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  return (
    <div className="aurora-surface min-h-screen text-white">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-xl">
            <BrainCircuit size={23} />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight">PlacementPrep AI</div>
            <div className="text-xs font-medium text-white/60">Interview readiness studio</div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="shine-button rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-2xl transition hover:-translate-y-0.5"
            >
              <span className="relative z-10">Dashboard</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="hidden rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white/90 transition hover:bg-white/10 sm:block"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="shine-button rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-2xl transition hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start free <ArrowRight size={16} />
                </span>
              </button>
            </>
          )}
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-10 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:pb-20 lg:pt-16">
        <div className="reveal-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur-xl">
            <Sparkles size={16} className="text-amber-300" />
            AI-powered campus placement practice
          </div>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal sm:text-6xl lg:text-7xl">
            Turn interview anxiety into interview command.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">
            Practice realistic interviews, analyze your resume, and walk into placement season with a clear plan for what to improve next.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}
              className="shine-button rounded-full bg-amber-300 px-7 py-4 text-base font-black text-slate-950 shadow-2xl shadow-amber-500/20 transition hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start practicing <Play size={18} fill="currentColor" />
              </span>
            </button>
            <button
              onClick={() => navigate(isLoggedIn ? '/resume' : '/login')}
              className="rounded-full border border-white/20 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/20"
            >
              Analyze resume
            </button>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ['10', 'question rounds'],
              ['3', 'skill scores'],
              ['ATS', 'resume fit'],
            ].map(([value, label]) => (
              <div key={label} className="dark-glass rounded-2xl p-4">
                <div className="text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal-up relative lg:pl-4" style={{ animationDelay: '120ms' }}>
          <div className="float-slow dark-glass rounded-[2rem] p-5 sm:p-6">
            <div className="rounded-[1.5rem] bg-white p-5 text-slate-950 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="text-sm font-bold text-gray-500">Mock interview</div>
                  <div className="text-xl font-black">SDE readiness sprint</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Live</div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-slate-950 p-5 text-white">
                  <div className="flex items-center gap-3">
                    <Target className="text-amber-300" size={22} />
                    <div className="font-black">Explain a project tradeoff you made recently.</div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white/10">
                    <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-amber-300 to-teal-300" />
                  </div>
                </div>

                {[
                  ['Technical depth', '82%', 'bg-indigo-500'],
                  ['Communication clarity', '74%', 'bg-teal-500'],
                  ['Confidence', '88%', 'bg-amber-400'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div className={`h-2 rounded-full ${color}`} style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="dark-glass reveal-up rounded-[1.5rem] p-6"
                style={{ animationDelay: `${180 + index * 90}ms` }}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                  <Icon size={23} />
                </div>
                <h3 className="text-xl font-black">{feature.title}</h3>
                <p className="mt-3 leading-7 text-white/60">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-white/20 bg-white/10 p-5 backdrop-blur-2xl">
          <div className="grid gap-3 md:grid-cols-4">
            {timeline.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <CheckCircle2 size={20} className="text-teal-300" />
                <span className="text-sm font-bold text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
