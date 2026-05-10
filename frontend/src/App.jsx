import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BrainCircuit } from 'lucide-react';
import { clearLegacyAuth, getToken } from './services/auth';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));

clearLegacyAuth();

function PrivateRoute({ children }) {
  const token = getToken();
  return token ? children : <Navigate to="/login" replace />;
}

function AppLoader() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="premium-card rounded-[1.5rem] p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <BrainCircuit size={24} />
        </div>
        <div className="text-sm font-semibold text-gray-600">Loading PlacementPrep AI...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<AppLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/interview/:id" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />
          <Route path="/resume" element={<PrivateRoute><ResumePage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
