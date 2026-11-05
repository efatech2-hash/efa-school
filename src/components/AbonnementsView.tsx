import React, { useState } from 'react';
import { 
  ShieldCheck, Crown, CheckCircle2, XCircle, Sparkles, 
  MessageCircle, ExternalLink, Zap, HelpCircle, Check, 
  ToggleLeft, ToggleRight, Building, Award, ArrowUpRight
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { 
  SubscriptionTier, 
  SUBSCRIPTION_PLANS, 
  getSubscriptionWhatsAppUrl 
} from '../types/subscription';

export const AbonnementsView: React.FC = () => {
  const { config, updateConfig, classes, parametres } = useSchool();
  const currentTier: SubscriptionTier = config.subscription_tier || 'pro';
  const [activeSpecial5YearsToggle, setActiveSpecial5YearsToggle] = useState(currentTier === 'special');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const tiersList: SubscriptionTier[] = ['starter', 'pro', 'premium', 'etat', 'special'];

  const handleSelectTier = (tier: SubscriptionTier) => {
    updateConfig({
      ...config,
      subscription_tier: tier,
    });
    setSuccessToast(`Plan ${SUBSCRIPTION_PLANS[tier].nom} activé avec succès sur votre établissement !`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleToggleSpecial5Years = () => {
    if (activeSpecial5YearsToggle) {
      setActiveSpecial5YearsToggle(false);
      handleSelectTier('pro');
    } else {
      setActiveSpecial5YearsToggle(true);
      handleSelectTier('special');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#0F172A] to-slate-900 border border-amber-500/30 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grille Tarifaire Officielle EFA SCHOOL</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white font-heading">
              Abonnements & Licences d'Établissement
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Une tarification claire et adaptée aux réalités africaines (Togo, Bénin, Côte d'Ivoire, Sénégal...). 
              Choisissez la formule calibrée pour votre établissement et activez-la directement via WhatsApp.
            </p>
          </div>

          {/* Current Active Plan Badge & Simulation Switcher */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-400">Forfait Actif :</span>
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                {SUBSCRIPTION_PLANS[currentTier]?.nom || 'PRO'}
              </span>
            </div>

            <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>Classes actives :</span>
                <span className="font-bold text-white">{classes.length} classes</span>
              </div>
              <div className="flex justify-between">
                <span>Établissement :</span>
                <span className="font-bold text-amber-300 truncate max-w-[140px]">{config.ecole}</span>
              </div>
            </div>

            {/* Manual Switcher for Fondateur */}
            <div className="pt-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Simuler un autre forfait (Mode Fondateur) :
              </label>
              <select
                value={currentTier}
                onChange={(e) => handleSelectTier(e.target.value as SubscriptionTier)}
                className="w-full text-xs font-bold bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {tiersList.map(t => (
                  <option key={t} value={t}>
                    {SUBSCRIPTION_PLANS[t].nom} — {SUBSCRIPTION_PLANS[t].prixMensuel} {SUBSCRIPTION_PLANS[t].periode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Special 5-Year Promo Toggle Highlight */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white uppercase">Offre Spéciale 5 Ans (1 500 000 FCFA)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Économie -60%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                5 ans de Premium + 150 000 F/an de maintenance technique. Après 5 ans, retour au tarif mensuel habituel.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleSpecial5Years}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              currentTier === 'special'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {currentTier === 'special' ? (
              <>
                <ToggleRight className="w-4 h-4 text-slate-950" />
                <span>Offre Spéciale Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-400" />
                <span>Activer l'Offre 5 Ans</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* The 5 Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {tiersList.map((tier) => {
          const plan = SUBSCRIPTION_PLANS[tier];
          const isCurrent = currentTier === tier;
          const isPro = tier === 'pro';
          const whatsAppUrl = getSubscriptionWhatsAppUrl(tier, config.ecole);

          return (
            <div
              key={tier}
              className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 ${
                isPro
                  ? 'bg-gradient-to-b from-[#FFF066] via-[#FFD700] to-[#E6C000] border-2 border-[#B8860B] shadow-2xl shadow-amber-500/30 ring-2 sm:ring-4 ring-[#FFD700]/60 text-slate-950 sm:-translate-y-1'
                  : isCurrent
                  ? 'bg-slate-900 dark:bg-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20 text-white'
                  : plan.isSpecial5Years
                  ? 'bg-slate-900/90 dark:bg-slate-900/90 border border-emerald-500/40 shadow-lg text-white'
                  : tier === 'etat'
                  ? 'bg-slate-900/90 dark:bg-slate-900/90 border border-blue-500/40 shadow-lg text-white'
                  : 'bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-white'
              }`}
            >
              {/* Badge Popular / Special */}
              <div className="mb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  {isPro ? (
                    <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-950 text-[#FFD700] border-2 border-[#B8860B] shadow-md inline-flex items-center gap-1">
                      ⭐ POPULAIRE
                    </span>
                  ) : (
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      plan.isSpecial5Years
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : tier === 'etat'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {plan.badge}
                    </span>
                  )}

                  {isCurrent && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                      isPro 
                        ? 'bg-slate-950 text-[#FFD700]' 
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      <Check className="w-3 h-3" /> Actif
                    </span>
                  )}
                </div>

                <h3 className={`text-lg font-black font-heading ${
                  isPro ? 'text-slate-950' : 'text-slate-900 dark:text-white'
                }`}>
                  {plan.nom}
                </h3>
                <p className={`text-[11px] mt-1 line-clamp-2 min-h-[32px] ${
                  isPro ? 'text-slate-900 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {plan.tagline}
                </p>
              </div>

              {/* Price */}
              <div className={`py-3 my-2 border-y ${
                isPro ? 'border-amber-800/30' : 'border-slate-100 dark:border-slate-800'
              }`}>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl sm:text-2xl font-black font-mono ${
                    isPro ? 'text-slate-950' : 'text-slate-900 dark:text-white'
                  }`}>
                    {plan.prixMensuel}
                  </span>
                </div>
                <span className={`text-[10px] font-extrabold block mt-0.5 ${
                  isPro ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}>
                  {plan.periode}
                </span>
              </div>

              {/* Feature List */}
              <div className="space-y-2.5 my-4 flex-1">
                <span className={`text-[10px] font-black uppercase tracking-wider block ${
                  isPro ? 'text-slate-950' : 'text-slate-400'
                }`}>
                  Inclus & Restrictions :
                </span>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    {feat.included ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isPro ? 'text-emerald-950' : 'text-emerald-500'
                      }`} />
                    ) : (
                      <XCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        isPro ? 'text-rose-950' : 'text-rose-500'
                      }`} />
                    )}
                    <div className="leading-tight">
                      <span className={
                        isPro
                          ? (feat.included ? 'text-slate-950 font-bold' : 'text-slate-800 line-through font-medium')
                          : (feat.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 line-through')
                      }>
                        {feat.label}
                      </span>
                      {feat.note && (
                        <span className={`block text-[10px] font-black ${
                          isPro
                            ? (feat.included ? 'text-amber-950 bg-amber-600/30 px-1 py-0.5 rounded' : 'text-rose-950 bg-rose-600/20 px-1 py-0.5 rounded')
                            : (feat.included ? 'text-amber-500' : 'text-rose-400')
                        }`}>
                          {feat.note}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp Action Button */}
              <div className={`space-y-2 pt-3 border-t ${
                isPro ? 'border-amber-800/30' : 'border-slate-100 dark:border-slate-800'
              }`}>
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    isPro
                      ? 'bg-slate-950 hover:bg-slate-900 text-[#FFD700] border-2 border-slate-950 shadow-lg hover:scale-[1.02]'
                      : plan.isSpecial5Years
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-emerald-600/90 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{isPro ? 'Commander PACK PRO WhatsApp' : 'Commander WhatsApp'}</span>
                </a>

                {!isCurrent && (
                  <button
                    type="button"
                    onClick={() => handleSelectTier(tier)}
                    className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center ${
                      isPro 
                        ? 'text-slate-950 hover:bg-black/10' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Activer manuellement
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Information & Manual Activation Notice */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-white font-heading">
            Modalités de Paiement & Activation de Licence
          </h4>
        </div>

        <p className="text-slate-400 leading-relaxed">
          Pour le moment, l'intégration des passerelles automatiques <span className="text-white font-semibold">Mixx (T-Money Togo)</span> et <span className="text-white font-semibold">Moov Money</span> est en cours de déploiement. 
          L'activation des packs s'effectue <span className="text-amber-400 font-semibold">manuellement par notre équipe technique</span> dès réception de votre message WhatsApp.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-slate-400 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Support direct WhatsApp : <strong className="text-white">+228 96 10 09 72</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Délai d'activation : Moins de 10 minutes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>EFA TECHNOLOGIE · Lomé, Togo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
