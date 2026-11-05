import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initialisation du système scolaire...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1400; // 1.4s duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct > 30 && pct < 70) {
        setStatusText('Chargement des cycles et règlements officiels Togo...');
      } else if (pct >= 70 && pct < 95) {
        setStatusText('Vérification de la sécurité et synchronisation...');
      } else if (pct >= 95) {
        setStatusText('Prêt !');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0F172A] text-white transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle background glow */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />

      {/* Centered Logo & Branding */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-2xl animate-pulse" />
          <img
            src="/logo-efa.png"
            alt="Logo EFA SCHOOL"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-2xl relative z-10 animate-pulse duration-1000"
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-heading">
          EFA <span className="text-[#D4AF37]">SCHOOL</span>
        </h1>
        <p className="text-xs sm:text-sm font-bold text-[#D4AF37] italic mt-1.5 tracking-wide">
          « La technologie devient enfin facile »
        </p>
        <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
          by EFA TECHNOLOGIE · Lomé, Togo
        </span>

        {/* Progress Loading Bar */}
        <div className="w-full mt-8 space-y-2">
          <div className="w-full h-2 rounded-full bg-slate-800 border border-slate-700/60 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-300 rounded-full transition-all duration-75 ease-out shadow-sm shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate pr-2">{statusText}</span>
            <span className="font-bold text-amber-400 shrink-0">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
