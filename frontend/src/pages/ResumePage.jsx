import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, FileText, Lightbulb, ListChecks, Search, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api, { getApiErrorMessage } from '../services/api';

const ROLES = ['SDE', 'Data Analyst', 'Business Analyst', 'Product Manager'];

export default function ResumePage() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('SDE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    const allowed = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(selected.type) && !selected.name.endsWith('.txt')) {
      return toast.error('Please upload a PDF, DOC, DOCX, or TXT file');
    }
    if (selected.size > 5 * 1024 * 1024) return toast.error('File must be smaller than 5MB');
    setFile(selected);
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return toast.error('Please select a file first');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', role);
      const res = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data.data.analysis);
      toast.success('Analysis complete');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Analysis failed. Try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-black text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>

        <section className="reveal-up grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="aurora-surface rounded-[2rem] p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white/70">
              <Sparkles size={16} className="text-amber-300" />
              Resume intelligence
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">Make your resume speak the role's language.</h1>
            <p className="mt-4 max-w-xl text-white/60">
              Upload your resume and get ATS fit, missing keywords, strengths, improvements, and section-level feedback in one pass.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['ATS score', 'Keyword gaps', 'Action fixes'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm font-black text-white/80 backdrop-blur-xl">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card rounded-[2rem] p-6 sm:p-8">
            <div
              onClick={() => fileRef.current.click()}
              className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-lg transition group-hover:-translate-y-1">
                {file ? <FileText size={31} /> : <UploadCloud size={31} />}
              </div>
              <div className="max-w-sm text-xl font-black text-gray-950">{file ? file.name : 'Drop in your resume'}</div>
              <div className="mt-2 text-sm font-semibold text-gray-500">PDF, DOC, DOCX, or TXT up to 5MB</div>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFile} className="hidden" />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-700">Analyzing for role</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 font-semibold outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                >
                  {ROLES.map((roleName) => (
                    <option key={roleName} value={roleName}>
                      {roleName}
                    </option>
                  ))}
                </select>
              </label>

              <button
                onClick={analyze}
                disabled={loading || !file}
                className="shine-button rounded-2xl bg-slate-950 px-7 py-4 font-black text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? 'Analyzing...' : 'Analyze resume'}
                  <Search size={18} />
                </span>
              </button>
            </div>
          </div>
        </section>

        {result && (
          <section className="reveal-up mt-8 grid gap-6 lg:grid-cols-[22rem_1fr]">
            <div className="premium-card rounded-[2rem] p-7 text-center">
              <h2 className="text-xl font-black text-gray-950">ATS compatibility</h2>
              <ScoreRing score={result.atsScore} />
              <p className="mt-5 text-sm font-bold text-gray-500">{scoreMessage(result.atsScore)}</p>
            </div>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <InsightCard title="Strengths" icon={CheckCircle2} color="emerald" items={result.strengths} />
                <InsightCard title="Improvements" icon={Lightbulb} color="amber" items={result.improvements} />
              </div>

              {result.sectionFeedback && Object.keys(result.sectionFeedback).length > 0 && (
                <div className="premium-card rounded-[1.5rem] p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <ListChecks className="text-indigo-600" />
                    <h3 className="text-xl font-black text-gray-950">Section feedback</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                      <div key={section} className="rounded-2xl border border-gray-100 bg-white/70 p-4">
                        <div className="font-black capitalize text-gray-900">{section}</div>
                        <div className="mt-1 text-sm font-medium leading-6 text-gray-600">{feedback}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.missingKeywords?.length > 0 && (
                <div className="premium-card rounded-[1.5rem] p-6">
                  <h3 className="mb-4 text-xl font-black text-gray-950">Missing keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((keyword, index) => (
                      <span key={`${keyword}-${index}`} className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-black text-indigo-700">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <InsightCard title="Recommendations" icon={Sparkles} color="indigo" items={result.recommendations} numbered />
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

function ScoreRing({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const color = safeScore >= 75 ? '#10b981' : safeScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative mx-auto mt-8 h-44 w-44">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={`${safeScore} 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black" style={{ color }}>
          {safeScore}
        </span>
        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">score</span>
      </div>
    </div>
  );
}

function InsightCard({ title, icon: Icon, color, items, numbered = false }) {
  if (!items?.length) return null;

  const colorClass = {
    emerald: 'text-emerald-700 bg-emerald-50',
    amber: 'text-amber-700 bg-amber-50',
    indigo: 'text-indigo-700 bg-indigo-50',
  }[color];

  return (
    <div className="premium-card rounded-[1.5rem] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colorClass}`}>
          <Icon size={22} />
        </div>
        <h3 className="text-xl font-black text-gray-950">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold leading-6 text-gray-600">
            <span className="mt-0.5 font-black text-gray-950">{numbered ? `${index + 1}.` : <XCircle size={17} className="text-gray-300" />}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function scoreMessage(score) {
  if (score >= 75) return 'Strong ATS compatibility. Keep the signal crisp.';
  if (score >= 50) return 'Good foundation. The fixes below can lift your match.';
  return 'Needs focused improvements. Start with keywords and section clarity.';
}
