import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const Series = lazy(() => import('./pages/Series'));
const CreateTheatre = lazy(() => import('./pages/CreateTheatre'));
const JoinTheatre = lazy(() => import('./pages/JoinTheatre'));
const TheatreDemo = lazy(() => import('./pages/TheatreDemo'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

function LoadingFallback() {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-vc-bg-base text-vc-gold space-y-3"
      role="status"
      aria-label="Loading VCinema"
    >
      <div className="w-12 h-12 rounded-full border border-vc-gold/40 bg-vc-bg-card flex items-center justify-center font-serif text-2xl font-bold animate-pulse shadow-[0_0_20px_rgba(198,167,106,0.2)]">
        V
      </div>
      <span className="text-[10px] font-mono tracking-[0.25em] text-vc-text-muted uppercase">
        Loading Auditorium...
      </span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public Catalogue & Discovery */}
              <Route index element={<Home />} />
              <Route path="movies" element={<Movies />} />
              <Route path="series" element={<Series />} />
              <Route path="create-theatre" element={<CreateTheatre />} />
              <Route path="join-theatre" element={<JoinTheatre />} />

              {/* Authentication Routes */}
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes (Require Authentication) */}
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Standalone Fullscreen Theatre Player */}
            <Route path="/theatre/demo" element={<TheatreDemo />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
