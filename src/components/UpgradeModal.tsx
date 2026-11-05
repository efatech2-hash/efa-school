import React from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, CheckCircle2, MessageCircle, Crown, Lock } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { SubscriptionTier, SUBSCRIPTION_PLANS, getSubscriptionWhatsAppUrl } from '../types/subscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  requiredTier?: SubscriptionTier;
  onNavigateAbonnements?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  reason,
  requiredTier = 'pro',
  onNavigateAbonnements,
}) => {
  const { config } = useSchool();

  if (!isOpen) return null;

  const currentTier = config.subscription_tier || 'pro';
  const targetPlan = SUBSCRIPTION_PLANS[requiredTier] || SUBSCRIPTION_PLANS.pro;
  const currentPlan = SUBSCRIPTION_PLANS[currentTier] || SUBSCRIPTION_PLANS.pro;
  const whatsAppUrl = getSubscriptionWhatsAppUrl(requiredTier, config.ecole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-[#0F172A] text-white rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with close */}
        <div className="relative z-10 px-6 pt-6 pb-2 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Passez au {targetPlan.nom}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Body */}
        <div className="relative z-10 p-6 sm:p-8 space-y-5">
          {/* Header Icon + Title */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white font-heading">
                Fonctionnalité Restreinte
              </h3>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">
                Forfait actuel : <span className="uppercase">{currentPlan.nom}</span>
              </p>
            </div>
          </div>

          {/* Reason card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {reason || (
              <span>
                Cette fonctionnalité nécessite une formule supérieure pour être débloquée sur votre compte établissement.
              </span>
            )}
          </div>

          {/* Recommended Upgrade Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-white uppercase tracking-wider block">
                  {targetPlan.nom}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {targetPlan.tagline}
                </span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-400 font-mono">
                  {targetPlan.prixMensuel}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {targetPlan.periode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-500/20">
              {targetPlan.pointsForts.slice(0, 4).map((pt, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Activer sur WhatsApp (+228 96 10 09 72)</span>
            </a>

            {onNavigateAbonnements && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateAbonnements();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                <span>Consulter les 5 Formules d'Abonnement</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[10px] text-center text-slate-500 italic">
            Activation manuelle instantanée par l'équipe EFA TECHNOLOGIE · Paiements Mobile Money (Mixx / Moov) bientôt disponibles.
          </p>
        </div>
      </div>
    </div>
  );
};
