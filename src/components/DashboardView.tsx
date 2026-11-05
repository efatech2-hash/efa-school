import React, { useState } from 'react';
import { 
  Users, School, AlertCircle, TrendingUp, TrendingDown, 
  DollarSign, MessageSquare, CreditCard, Sparkles, 
  ChevronRight, ArrowRight, PieChart as PieIcon, Settings2, 
  Building2, Layers 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { formatFCFA, buildWhatsAppLink } from '../utils/formatters';
import { UserRole, AppTab } from '../types/auth';
import { SessionType, Eleve } from '../types';
import { ALL_SESSIONS } from '../types/config';

interface DashboardViewProps {
  currentRole?: UserRole;
  onNavigateTab: (tab: AppTab) => void;
  onSelectSession: (session: SessionType) => void;
  onOpenOnboarding: () => void;
  onOpenNewStudent: () => void;
  onOpenNewPayment: () => void;
  onOpenNewDepense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole = 'fondateur',
  onNavigateTab,
  onSelectSession,
  onOpenOnboarding,
  onOpenNewStudent,
  onOpenNewPayment,
  onOpenNewDepense,
}) => {
  const { 
    totalEleves, 
    totalClasses, 
    totalScolariteFacturee,
    totalRecettes, 
    totalImpayes, 
    totalDepenses, 
    beneficeNet, 
    tauxRecouvrement, 
    elevesEnRetard, 
    classesSurchargees,
    classes,
    eleves,
    parametres,
    config,
    currentEtablissement,
    setCurrentEtablissement,
    sessionMetrics,
    cyclesGroupedSummary,
    logWhatsAppMessage,
  } = useSchool();

  const [hoveredSlice, setHoveredSlice] = useState<SessionType | null>(null);

  // Quick WhatsApp reminder
  const handleQuickRelance = (eleve: Eleve) => {
    const reste = eleve.scolariteTotal - eleve.montantPaye;
    const classe = classes.find(c => c.id === eleve.classeId);
    const msg = `Bonjour ${eleve.parent1.nom}. La direction de ${parametres.nom} vous informe qu'un solde de ${formatFCFA(reste)} reste en attente pour la scolarité de ${eleve.nom} ${eleve.prenom} (${classe?.nom}). Merci de régulariser la situation auprès de la caisse.`;

    logWhatsAppMessage({
      type: 'Rappel Écolage',
      destinataireNom: `${eleve.parent1.nom} (${eleve.nom})`,
      eleveNom: `${eleve.nom} ${eleve.prenom}`,
      classeNom: classe?.nom,
      telephone: eleve.parent1.telephone,
      message: msg,
    });

    const link = buildWhatsAppLink(eleve.parent1.telephone, msg);
    window.open(link, '_blank');
  };

  // CA per active session
  const activeSessions = config.sessions || ['primaire', 'college', 'lycee'];
  const caPrimaire = sessionMetrics.primaire?.recettes || 0;
  const caCollege = sessionMetrics.college?.recettes || 0;
  const caLycee = sessionMetrics.lycee?.recettes || 0;
  const caTotal = caPrimaire + caCollege + caLycee;

  // Pie chart calculation
  const pieData = [
    { key: 'primaire' as SessionType, label: 'Primaire', value: caPrimaire, color: '#F59E0B', bgClass: 'bg-amber-500' },
    { key: 'college' as SessionType, label: 'Collège', value: caCollege, color: '#3B82F6', bgClass: 'bg-blue-500' },
    { key: 'lycee' as SessionType, label: 'Lycée', value: caLycee, color: '#A855F7', bgClass: 'bg-purple-500' },
  ].filter(p => activeSessions.includes(p.key));

  // Compute SVG Donut Chart Slices
  const totalPie = pieData.reduce((s, p) => s + p.value, 0) || 1;
  let cumulativeAngle = 0;
  const pieSlices = pieData.map(item => {
    const angle = (item.value / totalPie) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const pct = Math.round((item.value / totalPie) * 100);
    return {
      ...item,
      angle,
      startAngle,
      percentage: pct,
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero Welcome with Establishment Switcher */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1e293b] border border-amber-500/20 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-400 font-black text-xs uppercase tracking-wider">
                EFA TECHNOLOGIE · Année {parametres.anneeScolaire}
              </span>
              <span className="text-slate-500">·</span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Plateforme Active
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {parametres.nom}
            </h1>

            {/* Multi-campus selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300">Site actif :</span>
              {config.etablissements && config.etablissements.length > 1 ? (
                <select
                  value={currentEtablissement}
                  onChange={e => setCurrentEtablissement(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  {config.etablissements.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-bold text-amber-300">{currentEtablissement}</span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              title="Modifier les cycles et séries de l'école"
            >
              <Settings2 className="w-4 h-4 text-amber-400" />
              <span>Configurer Sessions</span>
            </button>
            <button
              onClick={onOpenNewPayment}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Encaisser Paiement</span>
            </button>
            <button
              onClick={() => onNavigateTab('parents')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-slate-950" />
              <span>Diffuser WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Decorative subtle gold glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3 DYNAMIC SESSION CARDS (PRIMAIRE, COLLÈGE, LYCÉE) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Univers & Sessions Scolaires
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Accédez directement à l'espace de gestion et la comptabilité isolée de chaque cycle
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400">
            {activeSessions.length} cycle(s) actif(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ALL_SESSIONS.filter(s => activeSessions.includes(s.key)).map(sess => {
            const m = sessionMetrics[sess.key] || { effectif: 0, classesCount: 0, recettes: 0 };
            const isPrimaire = sess.key === 'primaire';
            const isCollege = sess.key === 'college';

            const borderClass = isPrimaire 
              ? 'hover:border-amber-500/70 border-amber-500/30' 
              : isCollege 
              ? 'hover:border-blue-500/70 border-blue-500/30' 
              : 'hover:border-purple-500/70 border-purple-500/30';

            const bgBadge = isPrimaire
              ? 'bg-amber-500 text-slate-950'
              : isCollege
              ? 'bg-blue-600 text-white'
              : 'bg-purple-600 text-white';

            return (
              <div
                key={sess.key}
                className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${borderClass} shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{sess.icon}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bgBadge}`}>
                      {sess.key.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-amber-500 transition-colors">
                    {sess.label}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {sess.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Effectif</span>
                      <span className="font-black text-slate-800 dark:text-slate-100 font-mono text-sm">
                        {m.effectif} élèves
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Classes</span>
                      <span className="font-black text-slate-800 dark:text-slate-100 font-mono text-sm">
                        {m.classesCount} classes
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">CA Encaissé Session</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatFCFA(m.recettes)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSession(sess.key)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-amber-500 group-hover:text-slate-950"
                >
                  <span>Entrer dans la Session</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI GÉNÉRAL COMPTA PAR SESSION & RÉPARTITION CA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI Général 4 Boîtes */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Comptabilité Générale par Session</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  En temps réel
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encaissements d'écolage ventilés par cycle scolaire
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-500">
              Devise : {parametres.deviseMonetaire}
            </div>
          </div>

          {/* Grille dynamique des cycles achetés */}
          <div className={`grid gap-4 ${
            activeSessions.length === 1 ? 'grid-cols-1 sm:grid-cols-2' :
            activeSessions.length === 2 ? 'grid-cols-1 sm:grid-cols-3' :
            'grid-cols-2 sm:grid-cols-4'
          }`}>
            {activeSessions.includes('primaire') && (
              <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                  🎒 CA Primaire
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono block">
                  {formatFCFA(caPrimaire)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {sessionMetrics.primaire?.effectif || 0} élèves inscrits (dynamique)
                </span>
              </div>
            )}

            {activeSessions.includes('college') && (
              <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
                  📘 CA Collège
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono block">
                  {formatFCFA(caCollege)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {sessionMetrics.college?.effectif || 0} élèves inscrits
                </span>
              </div>
            )}

            {activeSessions.includes('lycee') && (
              <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block mb-1">
                  🎓 CA Lycée
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono block">
                  {formatFCFA(caLycee)}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {sessionMetrics.lycee?.effectif || 0} élèves inscrits
                </span>
              </div>
            )}

            {/* TOTAL GÉNÉRAL AGRÉGÉ */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                🏛️ TOTAL CAISSE
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                {formatFCFA(caTotal)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {totalEleves} élèves (Total consolidé)
              </span>
            </div>
          </div>

          {/* TABLEAU AGRÉGÉ OFFICIEL V2 : SELECT SUM(effectif), SUM(caisse) GROUP BY cycle_id + total */}
          <div className="mt-4 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Matrice Consolidée par Cycle (Fondateur V2)
              </span>
              <span className="text-[10px] font-mono text-amber-600 dark:text-[#D4AF37] font-semibold">
                GROUP BY cycle_id
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Cycle</th>
                    <th className="py-2 px-3 text-right">Effectif</th>
                    <th className="py-2 px-3 text-right">Classes</th>
                    <th className="py-2 px-3 text-right">Recettes Caisse</th>
                    <th className="py-2 px-3 text-right">Dépenses</th>
                    <th className="py-2 px-3 text-right">Impayés</th>
                    <th className="py-2 px-3 text-center">Recouvrement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {activeSessions.includes('primaire') && (
                    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <span>🎒</span>
                        <span>Primaire</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{cyclesGroupedSummary.primaire.effectif} él.</td>
                      <td className="py-2 px-3 text-right font-mono">{cyclesGroupedSummary.primaire.classesCount}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatFCFA(cyclesGroupedSummary.primaire.recettes)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatFCFA(cyclesGroupedSummary.primaire.depenses)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                        {formatFCFA(cyclesGroupedSummary.primaire.impayes)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                          {cyclesGroupedSummary.primaire.scolariteTotal > 0 ? Math.round((cyclesGroupedSummary.primaire.recettes / cyclesGroupedSummary.primaire.scolariteTotal) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  )}

                  {activeSessions.includes('college') && (
                    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                        <span>📘</span>
                        <span>Collège</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{cyclesGroupedSummary.college.effectif} él.</td>
                      <td className="py-2 px-3 text-right font-mono">{cyclesGroupedSummary.college.classesCount}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatFCFA(cyclesGroupedSummary.college.recettes)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatFCFA(cyclesGroupedSummary.college.depenses)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                        {formatFCFA(cyclesGroupedSummary.college.impayes)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold">
                          {cyclesGroupedSummary.college.scolariteTotal > 0 ? Math.round((cyclesGroupedSummary.college.recettes / cyclesGroupedSummary.college.scolariteTotal) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  )}

                  {activeSessions.includes('lycee') && (
                    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 flex items-center gap-1.5 font-bold text-purple-700 dark:text-purple-400">
                        <span>🎓</span>
                        <span>Lycée</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{cyclesGroupedSummary.lycee.effectif} él.</td>
                      <td className="py-2 px-3 text-right font-mono">{cyclesGroupedSummary.lycee.classesCount}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatFCFA(cyclesGroupedSummary.lycee.recettes)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatFCFA(cyclesGroupedSummary.lycee.depenses)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                        {formatFCFA(cyclesGroupedSummary.lycee.impayes)}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold">
                          {cyclesGroupedSummary.lycee.scolariteTotal > 0 ? Math.round((cyclesGroupedSummary.lycee.recettes / cyclesGroupedSummary.lycee.scolariteTotal) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* LIGNE TOTAL GLOBAL */}
                  <tr className="bg-amber-500/10 dark:bg-amber-500/15 font-black text-slate-900 dark:text-white border-t-2 border-amber-500/30">
                    <td className="py-2.5 px-3 flex items-center gap-1.5 text-amber-800 dark:text-[#D4AF37]">
                      <span>🏛️</span>
                      <span>TOTAL CONSOLIDÉ</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{cyclesGroupedSummary.global.totalEffectif} él.</td>
                    <td className="py-2.5 px-3 text-right font-mono">{cyclesGroupedSummary.global.totalClasses}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                      {formatFCFA(cyclesGroupedSummary.global.totalCaisse)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                      {formatFCFA(cyclesGroupedSummary.global.totalDepenses)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                      {formatFCFA(cyclesGroupedSummary.global.totalImpayes)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-600 text-white font-bold">
                        {cyclesGroupedSummary.global.tauxRecouvrement}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Facturé Prévisionnel</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100 text-sm mt-0.5 block">
                {formatFCFA(totalScolariteFacturee)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Impayés</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm mt-0.5 block">
                {formatFCFA(totalImpayes)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Bénéfice Net Actuel</span>
              <span className={`font-mono font-bold text-sm mt-0.5 block ${beneficeNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                {formatFCFA(beneficeNet)}
              </span>
            </div>
          </div>
        </div>

        {/* Camembert Répartition CA par Session */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Répartition du CA
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contribution de chaque session aux recettes
            </p>
          </div>

          {/* Donut Chart representation */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {pieSlices.map((slice, i) => {
                  const circumference = 2 * Math.PI * 38; // r = 38
                  const strokeLength = (slice.angle / 360) * circumference;
                  const strokeOffset = circumference - ((slice.startAngle / 360) * circumference);

                  return (
                    <circle
                      key={slice.key}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="16"
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={-((slice.startAngle / 360) * circumference)}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice.key)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Encaissé</span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                  {formatFCFA(caTotal)}
                </span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="w-full space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {pieSlices.map(item => (
                <div 
                  key={item.key} 
                  className={`flex items-center justify-between text-xs p-2 rounded-xl transition-colors cursor-pointer ${
                    hoveredSlice === item.key ? 'bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                  onClick={() => onSelectSession(item.key)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-md ${item.bgClass}`} />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{formatFCFA(item.value)}</span>
                    <span className="font-black text-slate-900 dark:text-white font-mono">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ALERTES ÉLÈVES EN RETARD DE PAIEMENT */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Alertes Recouvrement · Élèves en Retard ({elevesEnRetard.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Relancez directement les parents par message WhatsApp en 1 clic
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('parents')}
            className="text-xs font-bold text-amber-500 hover:text-amber-400 self-start sm:self-auto cursor-pointer flex items-center gap-1"
          >
            <span>Voir toute la liste</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {elevesEnRetard.slice(0, 6).map(el => {
            const reste = el.scolariteTotal - el.montantPaye;
            const targetCls = classes.find(c => c.id === el.classeId);
            return (
              <div 
                key={el.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {el.nom} {el.prenom}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {targetCls?.nom || el.classeId} · {el.matricule}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                      Reste {formatFCFA(reste)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 truncate">
                    Parent : {el.parent1.nom} ({el.parent1.telephone})
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickRelance(el)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Relance WhatsApp</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
