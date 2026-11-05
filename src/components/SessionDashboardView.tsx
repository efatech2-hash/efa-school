import React, { useState } from 'react';
import { 
  ArrowLeft, Users, GraduationCap, DollarSign, Wallet, 
  AlertTriangle, CheckCircle2, Clock, Calendar, Search, 
  Phone, Eye, Download, FileSpreadsheet, ShieldAlert 
} from 'lucide-react';
import { SessionType, Eleve, Classe, Paiement } from '../types';
import { useSchool } from '../context/SchoolContext';
import { formatFCFA } from '../utils/formatters';
import { ALL_SESSIONS } from '../types/config';

interface SessionDashboardViewProps {
  session: SessionType;
  onBack: () => void;
  onOpenReceipt?: (paiement: Paiement, eleve: Eleve) => void;
  onOpenStudentDetail?: (eleve: Eleve) => void;
}

export const SessionDashboardView: React.FC<SessionDashboardViewProps> = ({
  session,
  onBack,
  onOpenReceipt,
  onOpenStudentDetail,
}) => {
  const { 
    getElevesBySession, 
    getClassesBySession, 
    getDepensesBySession, 
    getAppelsBySession,
    sessionMetrics,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'eleves' | 'classes' | 'finances' | 'appels'>(
    session === 'primaire' ? 'appels' : 'eleves'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  const sessionInfo = ALL_SESSIONS.find(s => s.key === session) || {
    key: session,
    label: session.toUpperCase(),
    icon: '🏫',
    description: '',
  };

  const metrics = sessionMetrics[session];
  const eleves = getElevesBySession(session);
  const classes = getClassesBySession(session);
  const depenses = getDepensesBySession(session);
  const appels = getAppelsBySession(session);

  // Filtered students
  const filteredEleves = eleves.filter(el => {
    const matchesSearch = 
      el.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassFilter === 'all' || el.classeId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Navigation & Session Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Retour au Dashboard Fondateur"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{sessionInfo.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
                  Session Isolée
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  Comptabilité Autonome
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                {sessionInfo.label}
              </h1>
            </div>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          {session === 'primaire' && (
            <button
              onClick={() => setActiveTab('appels')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'appels'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              📋 Appels du Jour ({appels.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('eleves')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'eleves'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Élèves ({eleves.length})
          </button>
          <button
            onClick={() => setActiveTab('finances')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'finances'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Compta Session
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Classes ({classes.length})
          </button>
        </div>
      </div>

      {/* KPI Cards of this Session */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Effectif Session</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.effectif} élèves
          </div>
          <p className="text-xs text-slate-500 mt-1">{classes.length} classes actives</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Recettes Encaissées</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatFCFA(metrics.recettes)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Facturé : {formatFCFA(metrics.scolariteTotal)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reste à Recouvrer</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatFCFA(metrics.impayes)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Impayés sur scolarité</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Bénéfice Net Session</span>
            <Wallet className="w-5 h-5 text-indigo-500" />
          </div>
          <div className={`text-2xl font-black ${metrics.net >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
            {formatFCFA(metrics.net)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Dépenses : {formatFCFA(metrics.depenses)}</p>
        </div>
      </div>

      {/* TAB: APPELS DU JOUR (Spécifique Primaire / Relevés Direction) */}
      {activeTab === 'appels' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Feuille d'Appel en Direct - Aujourd'hui
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black animate-pulse">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Suivi instantané des absences transmises par les maîtres d'école à la Direction
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Date : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {appels.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-60" />
              <p className="font-bold">Aucun appel transmis pour le moment aujourd'hui</p>
              <p className="text-xs mt-1">Dès qu'un maître clique sur "📤 Envoyer à Direction", le relevé s'affiche ici.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appels.map(rec => (
                <div 
                  key={rec.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 font-black flex items-center justify-center text-sm">
                        {rec.classeNom}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-base">
                          Classe de {rec.classeNom}
                        </div>
                        <div className="text-xs text-slate-500">
                          Enseignant : <span className="font-bold text-slate-700 dark:text-slate-300">{rec.professeurNom}</span> · Reçu à {rec.heureEnvoi}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                        ✓ {rec.totalPresents} Présents
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 text-xs font-bold">
                        ✕ {rec.totalAbsents} Absents
                      </span>
                      {rec.totalRetards > 0 && (
                        <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          ⏱ {rec.totalRetards} Retards
                        </span>
                      )}
                    </div>
                  </div>

                  {rec.absents.length > 0 ? (
                    <div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                        Liste des Absents signalés par le maître :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {rec.absents.map((ab, i) => (
                          <div 
                            key={i}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5"
                          >
                            <span className="text-rose-500 text-xs font-black mt-0.5">✕</span>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {ab.nomComplet}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {ab.matricule}
                              </div>
                              {ab.motif && (
                                <div className="text-[11px] text-amber-600 dark:text-amber-400 italic mt-0.5 truncate">
                                  Motif : {ab.motif}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      100% de présence constatée ce matin dans cette classe !
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ÉLÈVES DE LA SESSION */}
      {activeTab === 'eleves' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Effectif Élèves · {sessionInfo.label} ({filteredEleves.length})
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher élève..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">Toutes les classes ({classes.length})</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Classe</th>
                  <th className="py-3 px-4">Parent WhatsApp</th>
                  <th className="py-3 px-4 text-right">Scolarité</th>
                  <th className="py-3 px-4 text-right">Payé</th>
                  <th className="py-3 px-4 text-right">Reste</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEleves.map(el => {
                  const targetCls = classes.find(c => c.id === el.classeId);
                  const reste = (el.scolariteTotal || 0) - (el.montantPaye || 0);
                  const isSolde = reste <= 0;
                  const isPartial = !isSolde && (el.montantPaye || 0) > 0;

                  return (
                    <tr 
                      key={el.id} 
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => onOpenStudentDetail && onOpenStudentDetail(el)}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {el.nom} {el.prenom}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {el.matricule}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">
                          {targetCls?.nom || el.classeId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{el.parent1.telephone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatFCFA(el.scolariteTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatFCFA(el.montantPaye)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        {formatFCFA(reste)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          isSolde 
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                            : isPartial 
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}>
                          {isSolde ? 'Soldé' : isPartial ? 'Partiel' : 'Impayé'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COMPTABILITÉ SESSION */}
      {activeTab === 'finances' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Journal Comptable & Dépenses Dédiées · {sessionInfo.label}
              </h2>
              <p className="text-xs text-slate-500">Recettes écolages et charges directes de ce cycle</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Dépenses Session</span>
              <span className="font-black text-rose-600 dark:text-rose-400 text-lg">
                {formatFCFA(metrics.depenses)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Dépenses affectées à cette session ({depenses.length})
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Bénéficiaire</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {depenses.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono">{d.date}</td>
                      <td className="py-3 px-4 font-semibold">{d.categorie}</td>
                      <td className="py-3 px-4">{d.description}</td>
                      <td className="py-3 px-4">{d.beneficiaire}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-600 dark:text-rose-400">
                        {formatFCFA(d.montant)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CLASSES */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => {
            const classEleves = eleves.filter(e => e.classeId === c.id);
            const totalClassFacture = classEleves.reduce((s, e) => s + (e.scolariteTotal || 0), 0);
            const totalClassPaye = classEleves.reduce((s, e) => s + (e.montantPaye || 0), 0);

            return (
              <div 
                key={c.id} 
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {c.nom}
                  </h3>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    {classEleves.length} / {c.effectifMax} élèves
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {c.salle} · Titulaire : <span className="font-semibold text-slate-700 dark:text-slate-300">{c.enseignantPrincipal || 'Non assigné'}</span>
                </p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-medium">
                  <span className="text-slate-500">Recouvrement :</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatFCFA(totalClassPaye)} / {formatFCFA(totalClassFacture)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
