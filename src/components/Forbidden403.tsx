import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, School } from 'lucide-react';
import { UserRole } from '../types/auth';

interface Forbidden403Props {
  currentRole: UserRole;
  requiredRoles?: UserRole[];
  onReturnDashboard: () => void;
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  currentRole,
  requiredRoles,
  onReturnDashboard,
}) => {
  const roleLabels: Record<UserRole, string> = {
    fondateur: '👑 Fondateur',
    directeur: '👔 Directeur & Pédagogie',
    censeur: '⚖️ Censeur des Études',
    caisse: '💰 Caisse & Comptabilité',
    professeur: '📚 Professeur',
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900/90 border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
        
        {/* Glow behind */}
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-5 shadow-lg shadow-rose-950/40">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Status code */}
        <span className="inline-block px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold uppercase mb-2">
          Erreur 403 · Accès Interdit
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight mt-1">
          Accès Réservé & Non Autorisé
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          Votre session actuelle est identifiée sous le rôle <strong className="text-amber-400 font-semibold">{roleLabels[currentRole]}</strong>. Vous ne disposez pas des privilèges nécessaires pour accéder à ce module.
        </p>

        {requiredRoles && requiredRoles.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <span>Privilèges requis : </span>
            <span className="font-semibold text-rose-300">
              {requiredRoles.map(r => roleLabels[r]).join(' ou ')}
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReturnDashboard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Tableau de Bord</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-6 pt-4 border-t border-slate-800">
          EFA SCHOOL Security Shield · EFA TECHNOLOGIE
        </p>
      </div>
    </div>
  );
};
