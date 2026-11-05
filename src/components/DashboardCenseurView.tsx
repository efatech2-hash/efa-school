import React, { useState, useEffect } from 'react';
import { 
  Scale, BookOpen, Calendar, Clock, AlertTriangle, 
  CheckCircle2, Users, FileText, ArrowRight, ShieldCheck, 
  UserCheck, AlertCircle, Eye, Sparkles, Radio, BellRing
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { AppTab, UserSession } from '../types/auth';
import { formatFCFA } from '../utils/formatters';
import { subscribeToSchoolAlerts, RealtimeSchoolAlert } from '../lib/supabase';

interface DashboardCenseurViewProps {
  user: UserSession;
  onNavigateTab: (tab: AppTab) => void;
}

export const DashboardCenseurView: React.FC<DashboardCenseurViewProps> = ({
  user,
  onNavigateTab,
}) => {
  const { 
    classes, 
    eleves, 
    cahiersTexte, 
    incidentsDiscipline, 
    absencesProfs,
    sessionMetrics,
    validerCahierTexte,
  } = useSchool();

  const [realtimeAlerts, setRealtimeAlerts] = useState<RealtimeSchoolAlert[]>([]);

  useEffect(() => {
    const unsub = subscribeToSchoolAlerts((alert) => {
      setRealtimeAlerts(prev => [alert, ...prev.slice(0, 9)]);
    });
    return () => unsub();
  }, []);

  // Filtrer selon cycle_id du censeur si applicable
  const targetCycle: 'primaire' | 'college' | 'lycee' = user.cycle_id === 'all' ? 'college' : user.cycle_id;
  const metrics = sessionMetrics[targetCycle];

  const cycleClasses = user.cycle_id === 'all' 
    ? classes 
    : classes.filter(c => c.session === user.cycle_id);

  const pendingVisas = cahiersTexte.filter(ct => !ct.valideParCenseur);
  const activeIncidents = incidentsDiscipline.filter(i => !i.valideParProviseur);
  const activeAbsences = absencesProfs.filter(a => a.statut !== 'Justifiée');

  return (
    <div className="space-y-6">
      
      {/* Top Banner Censeur */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Direction des Études & Censure Scolaire
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 font-bold uppercase">
              Cycle Assigné : {user.cycle_id.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Bureau du Censeur · {user.nom}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervision académique, contrôle quotidien des cahiers de texte, discipline, gestion des remplacements de professeurs et suivi des impayés (lecture seule).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('cahier-de-texte')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Viser Cahiers de Texte ({pendingVisas.length})</span>
          </button>

          <button
            onClick={() => onNavigateTab('discipline')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4 text-slate-950" />
            <span>Conseil de Discipline</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Censeur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Cahiers de texte en attente de visa */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Visas Cahier Texte</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400 tracking-tight">
              {pendingVisas.length}
            </span>
            <span className="text-xs font-medium text-slate-500">séances à viser</span>
          </div>
          <button
            onClick={() => onNavigateTab('cahier-de-texte')}
            className="mt-3 text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Contrôler les cahiers de texte →
          </button>
        </div>

        {/* Card 2: Emplois du Temps (Planification) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Emplois du Temps</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {cycleClasses.length}
            </span>
            <span className="text-xs font-medium text-slate-500">classes à gérer</span>
          </div>
          <button
            onClick={() => onNavigateTab('emploi-du-temps')}
            className="mt-3 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Modifier / Planifier créneaux →
          </button>
        </div>

        {/* Card 3: Discipline & Incidents */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Discipline & Sanctions</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
              {activeIncidents.length}
            </span>
            <span className="text-xs font-medium text-slate-500">incidents signalés</span>
          </div>
          <button
            onClick={() => onNavigateTab('discipline')}
            className="mt-3 text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Gérer sanctions & conseils →
          </button>
        </div>

        {/* Card 4: Remplacements Professeurs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Absences & Remplacements</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight">
              {activeAbsences.length}
            </span>
            <span className="text-xs font-medium text-slate-500">profs absents</span>
          </div>
          <button
            onClick={() => onNavigateTab('absences-profs')}
            className="mt-3 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Assigner un suppléant →
          </button>
        </div>

      </div>

      {/* RÈGLE D'OR 3 & MODULE FINANCES EN LECTURE SEULE : SUIVI DES IMPAYÉS */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Suivi Académique des Impayés de Scolarité
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                🔒 Lecture Seule (Règle d'or Censeur)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Le Censeur consulte les impayés pour la délivrance des billets d'entrée en salle d'examen, sans encaissement direct.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('paiements')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Consulter le Registre Impayés →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 block mb-1">Total Élèves du Cycle ({targetCycle.toUpperCase()}) :</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{metrics?.effectif || 0} élèves</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 block mb-1">Recouvrement Encaissé Caisse :</span>
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatFCFA(metrics?.recettes || 0)}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <span className="text-rose-600 dark:text-rose-400 block mb-1 font-semibold">Total Impayés à Régulariser :</span>
            <span className="text-xl font-bold font-mono text-rose-700 dark:text-rose-400">{formatFCFA(metrics?.impayes || 0)}</span>
          </div>
        </div>
      </div>

      {/* 5. FLUX REALTIME SUPABASE (Appels & Absences Enseignants en direct) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Flux Live Realtime Supabase
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Connecté
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Push instantané des fiches d'appel et signalements d'absence des enseignants
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Canal : efa-school-live
          </span>
        </div>

        {realtimeAlerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500">
            En attente de transmissions des professeurs en salle de classe (les nouveaux appels et absences s'afficheront instantanément ici).
          </div>
        ) : (
          <div className="space-y-2">
            {realtimeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${alert.type === 'absence' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{alert.title}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">{alert.message}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                  {alert.timestamp}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
