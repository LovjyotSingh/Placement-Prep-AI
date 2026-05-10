import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Send,
  SkipForward,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getApiErrorMessage } from '../services/api';

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('loading');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 10 });
  const [timer, setTimer] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [finalData, setFinalData] = useState(null);

  useEffect(() => {
    if (phase !== 'question') return undefined;
    const ticker = setInterval(() => setTimer((seconds) => seconds + 1), 1000);
    return () => clearInterval(ticker);
  }, [phase]);

  const fmt = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const loadQuestion = useCallback(async () => {
    setPhase('loading');
    setAnswer('');
    setTimer(0);
    try {
      const res = await api.get(`/interviews/${id}/next-question`);
      const { completed, question: nextQuestion, currentIndex, totalQuestions } = res.data.data;
      if (completed) {
        const doneRes = await api.post(`/interviews/${id}/complete`);
        setFinalData(doneRes.data.data);
        setPhase('done');
      } else {
        setQuestion(nextQuestion);
        setProgress({ current: currentIndex, total: totalQuestions });
        setPhase('question');
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load question'));
      setPhase('question');
    }
  }, [id]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  const submitAnswer = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${id}/submit-response`, {
        question: question.question,
        questionCategory: question.category,
        answer,
        timeSpent: timer,
      });
      setFeedback(res.data.data.evaluation);
      setPhase('feedback');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Submission failed. Check your AI API key.'));
    } finally {
      setSubmitting(false);
    }
  };

  const skipQuestion = async () => {
    if (!question?.question) return;
    setSkipping(true);
    try {
      await api.post(`/interviews/${id}/skip-question`, {
        question: question.question,
        questionCategory: question.category,
        timeSpent: timer,
      });
      toast.success('Question skipped');
      await loadQuestion();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not skip question'));
    } finally {
      setSkipping(false);
    }
  };

  const completion = useMemo(() => {
    if (!progress.total) return 0;
    return Math.round(((progress.current + 1) / progress.total) * 100);
  }, [progress.current, progress.total]);

  if (phase === 'loading') return <InterviewLoader />;
  if (phase === 'done') return <CompletionView finalData={finalData} navigate={navigate} />;
  if (phase === 'feedback') return <FeedbackView feedback={feedback} loadQuestion={loadQuestion} />;

  return (
    <div className="app-shell min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-sm transition hover:-translate-x-0.5"
              title="Back to dashboard"
            >
              <ArrowLeft size={19} />
            </button>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Question {progress.current + 1} of {progress.total}
              </div>
              <div className="truncate text-base font-semibold text-gray-950">Interview session</div>
            </div>
          </div>

          <div className="hidden min-w-48 flex-1 items-center gap-3 md:flex">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-400 transition-all duration-700" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-sm font-semibold text-gray-500">{completion}%</span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 font-mono text-sm font-semibold text-white shadow-lg shadow-slate-900/20">
            <Clock3 size={16} className="text-amber-300" />
            {fmt(timer)}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:py-8">
        <section className="space-y-6">
          <div className="aurora-surface reveal-up rounded-[1.5rem] p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-6">
            <div className="hero-sheen" />
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-xl">
                  <Target size={14} className="text-amber-300" />
                  {question?.category || 'technical'}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-xl">
                  <Sparkles size={14} className="text-teal-300" />
                  Structured answer expected
                </span>
              </div>
              <h1 className="max-w-5xl text-xl font-semibold leading-8 text-white sm:text-2xl sm:leading-9 lg:text-[1.7rem] lg:leading-10">
                {question?.question}
              </h1>
              {question?.context && (
                <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm font-medium leading-6 text-white/72 backdrop-blur-xl">
                  {question.context}
                </div>
              )}
            </div>
          </div>

          <div className="premium-card reveal-up rounded-[1.5rem] p-5 sm:p-6" style={{ animationDelay: '90ms' }}>
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <label htmlFor="interview-answer" className="text-lg font-semibold text-gray-950">
                  Your answer
                </label>
                <p className="mt-1 text-sm font-medium text-gray-500">Use context, action, result, and measurable impact where possible.</p>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">{answer.length} characters</div>
            </div>

            <textarea
              id="interview-answer"
              rows={10}
              placeholder="Start with the main idea, add context, explain tradeoffs, and close with the outcome..."
              className="scanline w-full resize-none rounded-2xl border border-gray-200 bg-white/80 px-5 py-4 text-[0.95rem] leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:-translate-y-0.5 hover:bg-gray-50"
              >
                <ArrowLeft size={17} />
                Quit
              </button>
              <button
                onClick={skipQuestion}
                disabled={submitting || skipping}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 font-semibold text-amber-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {skipping ? <Loader2 size={17} className="animate-spin" /> : <SkipForward size={17} />}
                {skipping ? 'Skipping' : 'Skip'}
              </button>
              <button
                onClick={submitAnswer}
                disabled={submitting || skipping || !answer.trim()}
                className="shine-button flex-1 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Evaluating
                    </>
                  ) : (
                    <>
                      Submit answer
                      <Send size={18} />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="premium-card rounded-[1.5rem] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <MessageSquareText size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">Answer formula</div>
                <div className="text-base font-semibold text-gray-950">STAR plus impact</div>
              </div>
            </div>
            <div className="space-y-3">
              {['Situation in one line', 'Task and constraints', 'Actions you owned', 'Result with numbers'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 text-sm font-medium text-gray-700">
                  <CheckCircle2 size={17} className="text-teal-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card rounded-[1.5rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Progress</div>
            <div className="mt-3 text-3xl font-semibold text-gray-950">{completion}%</div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-teal-500 to-amber-400" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function InterviewLoader() {
  return (
    <div className="aurora-surface flex min-h-screen items-center justify-center px-5 text-white">
      <div className="hero-sheen" />
      <div className="relative z-10 max-w-md text-center">
        <div className="mx-auto mb-7 neural-loader">
          <div className="neural-core">
            <BrainCircuit size={32} />
          </div>
        </div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 backdrop-blur-xl">
          <Sparkles size={14} className="text-amber-300" />
          Preparing question
        </div>
        <h1 className="text-2xl font-semibold leading-8 sm:text-3xl">Generating the next interview prompt</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
          Calibrating role, difficulty, and question depth for this round.
        </p>
        <div className="mx-auto mt-7 grid max-w-sm grid-cols-3 gap-2">
          {['Role', 'Signal', 'Depth'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/20 bg-white/10 p-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/60 backdrop-blur-xl">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeedbackView({ feedback, loadQuestion }) {
  const score = feedback?.score ?? 0;

  return (
    <div className="app-shell min-h-screen px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[19rem_1fr]">
        <div className="aurora-surface reveal-up rounded-[1.5rem] p-6 text-white shadow-2xl shadow-slate-900/20">
          <div className="hero-sheen" />
          <div className="relative z-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              <Trophy size={14} className="text-amber-300" />
              Response score
            </div>
            <div className="text-6xl font-semibold leading-none">{score}</div>
            <div className="mt-2 text-sm text-white/50">out of 100</div>
            <button
              onClick={loadQuestion}
              className="shine-button mt-7 w-full rounded-2xl bg-amber-300 px-5 py-3.5 font-semibold text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Next question <ArrowRight size={18} />
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="premium-card reveal-up rounded-[1.5rem] p-6">
            <h1 className="text-2xl font-semibold text-gray-950">Response feedback</h1>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-500">Here is the signal from this answer. Keep what worked and tighten what needs improvement.</p>
            <div className="mt-6 space-y-4">
              <ScoreBar label="Technical correctness" value={feedback?.technicalScore ?? 0} color="from-indigo-500 to-blue-500" />
              <ScoreBar label="Communication clarity" value={feedback?.clarityScore ?? 0} color="from-teal-500 to-emerald-500" />
              <ScoreBar label="Confidence and depth" value={feedback?.confidenceScore ?? 0} color="from-amber-400 to-orange-500" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FeedbackList title="Strengths" icon={CheckCircle2} tone="emerald" items={feedback?.strengths} />
            <FeedbackList title="Improve next" icon={Lightbulb} tone="amber" items={feedback?.improvements} />
          </div>

          {feedback?.feedback && (
            <div className="premium-card rounded-[1.5rem] p-6">
              <div className="mb-3 flex items-center gap-3">
                <BrainCircuit className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-950">Coach notes</h2>
              </div>
              <p className="text-sm font-medium leading-7 text-gray-600">{feedback.feedback}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompletionView({ finalData, navigate }) {
  return (
    <div className="aurora-surface flex min-h-screen items-center justify-center px-4 py-8 text-white">
      <div className="hero-sheen" />
      <div className="relative z-10 grid w-full max-w-5xl gap-5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="dark-glass rounded-[1.5rem] p-7 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 shadow-2xl shadow-amber-500/20">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl font-semibold">Interview complete</h1>
          <p className="mt-3 text-sm text-white/60">Your final readiness score is ready.</p>
          <div className="mt-7 text-6xl font-semibold">{finalData?.overallScore ?? '--'}</div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">overall score</div>
        </div>

        <div className="rounded-[1.5rem] bg-white p-6 text-slate-950 shadow-2xl">
          <h2 className="text-xl font-semibold">Performance breakdown</h2>
          <div className="mt-6 space-y-5">
            <ScoreBar label="Technical" value={finalData?.scores?.technical ?? 0} color="from-indigo-500 to-blue-500" />
            <ScoreBar label="Communication" value={finalData?.scores?.communication ?? 0} color="from-teal-500 to-emerald-500" />
            <ScoreBar label="Confidence" value={finalData?.scores?.confidence ?? 0} color="from-amber-400 to-orange-500" />
          </div>

          {finalData?.feedback?.summary && (
            <div className="mt-6 rounded-2xl bg-indigo-50 p-5 text-sm font-medium leading-7 text-indigo-900">{finalData.feedback.summary}</div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-2xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-2xl border border-gray-200 px-5 py-3.5 font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:bg-gray-50"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <RotateCcw size={17} />
                New interview
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-semibold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-950">{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function FeedbackList({ title, icon: Icon, tone, items }) {
  if (!items?.length) return null;
  const toneClass = tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';

  return (
    <div className="premium-card rounded-[1.5rem] p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon size={22} />
        </div>
        <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="flex gap-3 rounded-2xl bg-white/70 p-4 text-sm font-medium leading-6 text-gray-600">
            {tone === 'emerald' ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500" /> : <XCircle size={17} className="mt-0.5 shrink-0 text-amber-500" />}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
