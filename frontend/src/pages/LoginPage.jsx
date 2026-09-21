import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldAlert, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import IrisLogo from '../components/shared/IrisLogo';
import DisclaimerBar from '../components/shared/DisclaimerBar';

export default function LoginPage() {
  const { login, sessionExpired, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isClientIdPlaceholder = !clientId || clientId === 'your_google_oauth_client_id_here';

  const handleSuccess = async (credentialResponse) => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      await login(credentialResponse);
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleError = () => {
    console.error('Google sign-in popup or prompt failed');
    setErrorMessage('Google sign-in was cancelled or failed.');
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-between bg-[#0B1416] text-[#EAF6F7] font-sans relative overflow-hidden">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#9FE2EE]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Chrome */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <IrisLogo size={28} />
          <span className="font-display font-bold text-lg text-[#EAF6F7] tracking-tight">Iris</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#9FE2EE]/15 text-[#9FE2EE] border border-[#9FE2EE]/30">
            Health
          </span>
        </div>

        {/* Global Emergency Help Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-800/50 text-red-300 text-xs font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0 stroke-[2]" />
          <span>Emergency? Call <strong>911 / 112</strong> immediately</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md bg-[#162326]/90 backdrop-blur-xl border border-[#2A3B3F] rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
          
          {/* Iris Mark */}
          <div className="relative p-3 rounded-2xl bg-[#101B1E] border border-[#2A3B3F] shadow-soft">
            <IrisLogo size={48} />
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#EAF6F7]">
              Sign in to Iris
            </h2>
            <p className="text-sm text-[#8CA3A8] font-sans">
              Your personal clinical health & AI assistant
            </p>
          </div>

          {/* Session Expiration Toast */}
          {sessionExpired && (
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Session expired — please sign in again.</span>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Developer setup hint if Client ID is not yet provided */}
          {isClientIdPlaceholder && (
            <div className="w-full p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 text-xs flex items-start gap-2 text-left">
              <Info className="w-4 h-4 text-[#9FE2EE] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#9FE2EE]">Google Client ID Required</p>
                <p className="text-[11px] text-slate-300">
                  Add your <code>VITE_GOOGLE_CLIENT_ID</code> to <code>frontend/.env</code> to connect your Google Cloud project.
                </p>
              </div>
            </div>
          )}

          {/* Google Sign-in Button */}
          <div className="w-full flex justify-center py-2 min-h-[44px]">
            {isLoggingIn ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-[#9FE2EE] py-2">
                <span className="w-4 h-4 rounded-full border-2 border-[#9FE2EE] border-t-transparent animate-spin" />
                <span>Verifying credentials...</span>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_black"
                shape="pill"
                text="signin_with"
                size="large"
                width="280"
              />
            )}
          </div>

          {/* Privacy Note */}
          <p className="text-[11px] text-[#8CA3A8] leading-relaxed">
            By signing in, your conversations and clinical assessments are securely synced to your private session.
          </p>

        </div>
      </main>

      {/* Global Bottom Disclaimer */}
      <footer className="w-full pb-3 z-10">
        <DisclaimerBar />
      </footer>

    </div>
  );
}
