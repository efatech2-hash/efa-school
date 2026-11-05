import React, { useState } from 'react';
import { 
  BookOpen, Users, Clock, CheckCircle2, 
  Calendar, Award, MessageSquare, Plus, Check, X, AlertTriangle, ArrowRight, Lock,
  Smartphone, Download, WifiOff, Sparkles 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Eleve, Classe } from '../types';
import { getProfClasses, getProfAffectation } from '../utils/affectations';
import { isClassePrimaire } from '../data/matieres_par_classe';

interface DashboardProfViewProps {
  userEmail?: string;
  onOpenAppelModal: (classeId?: string) => void;
  onOpenNotesModal: (classeId?: string) => void;
  onNavigateTab: (tab: any) => void;
  onSelectStudent: (eleve: Eleve) => void;
}

export const DashboardProfView: React.FC<DashboardProfViewProps> = ({
  userEmail = 'prof@efa.com',
  onOpenAppelModal,
  onOpenNotesModal,
  onNavigateTab,
  onSelectStudent,
}) => {
  const { classes, eleves } = useSchool();
  const aff = getProfAffectation(userEmail);
  const myClassNames = getProfClasses(userEmail);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // Filter classes to ONLY assigned classes
  const mesClasses = classes.filter(c => myClassNames.includes(c.nom));
  const mesClassesIds = mesClasses.map(c => c.id);
  const mesEleves = eleves.filter(e => mesClassesIds.includes(e.classeId));

  const isPrimaryTeacher = myClassNames.length > 0 && myClassNames.every(cn => isClassePrimaire(cn));

  // Today's schedule for this teacher
  const coursAujourdhui = mesClasses.map((cls, idx) => ({
    horaire: idx === 0 ? '08:00 — 10:00' : '10:15 — 12:15',
    classeNom: cls.nom,
    salle: cls.salle,
    matiere: isPrimaryTeacher ? 'Programme Primaire Global' : (aff?.matieres?.[0] || 'Maths'),
    statut: idx === 0 ? 'En cours' : 'À venir',
    effectif: eleves.filter(e => e.classeId === cls.id).length,
  }));

  const profNom = aff?.nom || (isPrimaryTeacher ? 'Maître Koffi' : 'Professeur');

  const handleInstallClick = () => {
    setPwaInstalled(true);
    setTimeout(() => setPwaInstalled(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER : Bonjour Enseignant */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {isPrimaryTeacher ? '🎒 Maître Titulaire (Primaire)' : '🎓 Espace Professeur Secondaire'}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 font-semibold">
              <Lock className="w-2.5 h-2.5" />
              {isPrimaryTeacher ? `Classe Unique : ${myClassNames.join(', ')}` : `Filtrage Actif (${mesClasses.length} classes assignées)`}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Bonjour {profNom}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isPrimaryTeacher 
              ? `Maître titulaire de ${myClassNames.join(' & ')} · Classe unique toute l'année · ${mesEleves.length} élèves sous tutelle.`
              : `Professeur de ${aff?.matieres?.join(', ') || 'Discipline'} · Classes ${myClassNames.join(' & ')} · ${mesEleves.length} élèves sous tutelle.`
            }
          </p>
        </div>

        {/* RACCOURCIS IMMÉDIATS SELON LE PROFIL */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('presences')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Faire l'Appel (Présences)</span>
          </button>

          {isPrimaryTeacher ? (
            <button
              onClick={() => onNavigateTab('eleves')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-950" />
              <span>Ma Classe ({mesEleves.length} élèves)</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigateTab('notes')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Saisir Notes (/20)</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 CARDS DEMANDÉES : Mes classes, Élèves, Cours aujourd'hui */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Mes classes avec effectifs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mes Classes Assignées</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {mesClasses.length}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">sections collège</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
            {mesClasses.map(c => {
              const eff = eleves.filter(e => e.classeId === c.id).length;
              return (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-700 dark:text-[#D4AF37]">{c.nom}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{eff} élèves · {c.salle.split('·')[1] || c.salle}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Élèves */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Élèves sous ma tutelle</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {mesEleves.length}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">élèves au total</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{myClassNames.join(' & ')} uniquement</span>
            <button
              onClick={() => onNavigateTab('eleves')}
              className="text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              Voir liste complète →
            </button>
          </div>
        </div>

        {/* Card 3: Cours aujourd'hui */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-400 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cours Programmés</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-700 dark:text-amber-400 tracking-tight">
              {coursAujourdhui.length}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">séances du jour</span>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>Matière : {aff?.matieres?.[0] || 'Maths'}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Pointage prêt</span>
          </div>
        </div>

      </div>

      {/* PWA INSTALL & OFFLINE COMFORT CARD FOR TEACHERS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-[#D4AF37] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Application Enseignant EFA SCHOOL (PWA Mobile)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                Mode Hors-Ligne Prêt
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Installez l'application sur votre smartphone ou tablette pour pointer les présences et saisir les notes même sans connexion internet.
            </p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{pwaInstalled ? "✓ Prêt sur l'écran d'accueil" : "Installer sur Mobile"}</span>
        </button>
      </div>

      {/* SECTION DU JOUR : EMPLOI DU TEMPS DE SES CLASSES & APERÇU ÉVALUATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Planning de la Journée (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Séances de Cours du Jour
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Planning officiel pour vos classes assignées</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-bold">
              Aujourd'hui
            </span>
          </div>

          <div className="space-y-3">
            {coursAujourdhui.map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-amber-700 dark:text-amber-400 shadow-xs">
                    {c.classeNom}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{c.matiere}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {c.horaire} · {c.salle} ({c.effectif} élèves)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    c.statut === 'En cours'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}>
                    {c.statut}
                  </span>

                  <button
                    onClick={() => onNavigateTab('presences')}
                    className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium cursor-pointer"
                    title="Faire l'appel pour cette séance"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aperçu Rapide : Appel Direct Primaire OU Saisie Notes Secondaire */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          {isPrimaryTeacher ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <span>Pointage Quotidien ({myClassNames[0] || 'CP1-A'})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Transmission instantanée à la Direction</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  En direct
                </span>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">Registre Quotidien de l'Établissement</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Chaque matin, validez la présence de vos {mesEleves.length} élèves. Les absents et motifs sont aussitôt consultables sur le tableau de bord de la session Primaire.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">Date du pointage :</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                    Dernières Évaluations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{aff?.matieres?.[0] || 'Discipline'} · {myClassNames.join(', ')}</p>
                </div>
                <button
                  onClick={() => onNavigateTab('notes')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                >
                  + Saisir
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {mesEleves.slice(0, 5).map(el => {
                  const noteMath = el.notes.find(n => n.matiere.includes('Math') || n.matiere.includes('Calcul') || n.matiere.includes('SVT')) || el.notes[0];
                  const studentClass = classes.find(c => c.id === el.classeId);

                  return (
                    <div
                      key={el.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{el.nom} {el.prenom}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {el.matricule} · <strong className="text-amber-700 dark:text-amber-400">{studentClass?.nom}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        {noteMath ? (
                          <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
                            {((noteMath.devoir1 + noteMath.devoir2 + noteMath.examen * 2) / 4).toFixed(1)} / 20
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">12.5 / 20</span>
                        )}
                        <button
                          onClick={() => onSelectStudent(el)}
                          className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white block mt-0.5 underline cursor-pointer"
                        >
                          Consulter
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isPrimaryTeacher ? (
              <button
                onClick={() => onNavigateTab('presences')}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Faire l'Appel de {myClassNames[0] || 'CP1-A'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('notes')}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accéder à la Grille Complète des Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
