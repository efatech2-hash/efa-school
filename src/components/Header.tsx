import React from 'react';
import { 
  Menu, Plus, UserPlus, CreditCard, Sparkles, 
  Calendar, Award, Crown, Wallet, BookOpen, LogOut,
  Briefcase, Moon, Sun, Users, Scale
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { AppTab, UserRole } from '../types/auth';

interface HeaderProps {
  currentTab: AppTab;
  currentRole: UserRole;
  onOpenMobileSidebar: () => void;
  onOpenNewStudent: () => void;
  onOpenNewPayment: () => void;
  onOpenAppelModal?: () => void;
  onOpenNotesModal?: () => void;
  onOpenLoginPage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentRole,
  onOpenMobileSidebar,
  onOpenNewStudent,
  onOpenNewPayment,
  onOpenAppelModal,
  onOpenNotesModal,
  onOpenLoginPage,
}) => {
  const { parametres, theme, toggleTheme, config } = useSchool();

  const titles: Record<AppTab, { title: string; subtitle: string }> = {
    'dashboard-fondateur': {
      title: "Tableau de Bord Direction",
      subtitle: "Aperçu des effectifs, scolarités, impayés et pilotage d'établissement"
    },
    'dashboard-caisse': {
      title: "Dashboard Caisse & Recouvrement",
      subtitle: "Recettes journalières, encaissements d'écolage et dépenses courantes"
    },
    'dashboard-censeur': {
      title: "Direction des Études & Censure",
      subtitle: "Supervision des emplois du temps, visas cahier de texte et discipline"
    },
    'dashboard-professeur': {
      title: "Espace Pédagogique & Enseignant",
      subtitle: "Emploi du temps, saisie des notes /20 et pointage des présences"
    },
    'cahier-de-texte': {
      title: "Cahier de Texte Numérique",
      subtitle: "Enregistrement des cours dispensés, devoirs donnés et visas officiels"
    },
    discipline: {
      title: "Discipline & Conseils d'Établissement",
      subtitle: "Registre des manquements, avertissements et exclusions validées"
    },
    'absences-profs': {
      title: "Absences Enseignants & Remplacements",
      subtitle: "Signalement des absences profs et réassignation des heures de cours"
    },
    classes: {
      title: "Gestion des Classes",
      subtitle: "Niveaux, effectifs, duplication de groupes et répartition des salles"
    },
    eleves: {
      title: "Gestion des Élèves",
      subtitle: "Fiches élèves, matricules officiels, dossiers parents et scolarité"
    },
    inscriptions: {
      title: "Inscriptions & Admissions",
      subtitle: "Enregistrement des nouveaux élèves et attribution des matricules"
    },
    'emploi-du-temps': {
      title: "Emploi du Temps Hebdomadaire",
      subtitle: "Planning des cours par classe, salle et matière assignée"
    },
    presences: {
      title: "Pointage des Présences",
      subtitle: "Appel journalier, registre des absences et alertes WhatsApp aux parents"
    },
    notes: {
      title: "Saisie des Notes & Évaluations",
      subtitle: "Devoirs continus, coefficients officiels africains et calcul des moyennes"
    },
    bulletins: {
      title: "Bulletins Trimestriels",
      subtitle: "Édition et validation officielle des relevés de notes EFA SCHOOL"
    },
    professeurs: {
      title: "Gestion du Corps Enseignant",
      subtitle: "Professeurs, matières enseignées, classes et masse salariale"
    },
    employes: {
      title: "Gestion des Employés & Codes PIN",
      subtitle: "Contrôle des accès, affectations, blocage et sécurisation PIN"
    },
    paiements: {
      title: "Finances & Recouvrement Scolaire",
      subtitle: "Suivi des écolages par classe, encaissements et reçus officiels"
    },
    'journal-caisse': {
      title: "Journal Général de Caisse",
      subtitle: "Livre des entrées et sorties d'espèces certifié par la direction"
    },
    depenses: {
      title: "Dépenses & Charges de l'Établissement",
      subtitle: "Salaires, loyers, fournitures et calcul du bénéfice net"
    },
    salaires: {
      title: "Salaires & Rémunérations",
      subtitle: "Grille de paie des professeurs, fiches de salaire et décharges"
    },
    rapports: {
      title: "Rapports & Bilans Périodiques",
      subtitle: "Comptabilité officielle, taux de recouvrement et exportations PDF"
    },
    parents: {
      title: "Communication Parents (WhatsApp)",
      subtitle: "Diffusion instantanée, relances de paiement et alertes de présence"
    },
    parametres: {
      title: "Paramètres de l'Établissement",
      subtitle: "Configuration générale, devise, année scolaire et sauvegarde"
    },
    abonnements: {
      title: "Plans & Abonnements EFA SCHOOL",
      subtitle: "Starter, Pro, Premium, État & Offre Spéciale 5 ans"
    },
    'session-view': {
      title: "Cycle & Session Scolaire",
      subtitle: "Comptabilité, effectifs et registres isolés par cycle d'enseignement"
    },
    onboarding: {
      title: "Configuration des Cycles & Multi-sites",
      subtitle: "Choix des ordres d'enseignement, classes nationales et séries homologuées"
    },
    '403': {
      title: "Accès Interdit (403)",
      subtitle: "Droits d'accès insuffisants pour ce module"
    },
  };

  const current = titles[currentTab] || { title: "EFA SCHOOL", subtitle: "" };

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-2.5 sm:px-6 py-2 sm:py-3 transition-colors duration-300">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Left: Official Logo & Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenMobileSidebar}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Logo: School logo if uploaded, or official EFA logo */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {config?.logoEcole ? (
                <div className="relative shrink-0">
                  <img
                    src={config.logoEcole}
                    alt={config.ecole || "Logo École"}
                    className="w-7 h-7 sm:w-[40px] sm:h-[40px] object-cover rounded-lg sm:rounded-xl border border-amber-500/40 shadow-xs bg-white dark:bg-slate-800"
                  />
                  <img
                    src="/logo-efa.png"
                    alt="EFA"
                    className="w-3 h-3 sm:w-4 sm:h-4 object-contain absolute -bottom-1 -right-1 rounded-full bg-white dark:bg-slate-900 shadow-xs p-0.5 border border-amber-400"
                    title="Propulsé par EFA SCHOOL"
                  />
                </div>
              ) : (
                <img
                  src="/logo-efa.png"
                  alt="EFA SCHOOL"
                  className="w-7 h-7 sm:w-[40px] sm:h-[40px] object-contain shrink-0 drop-shadow-sm"
                />
              )}
              <div className="flex flex-col max-w-[95px] xs:max-w-[130px] sm:max-w-[220px]">
                <span className="text-xs sm:text-base font-black tracking-tight text-slate-900 dark:text-white font-heading leading-tight truncate">
                  {config?.ecole || "EFA SCHOOL"}
                </span>
                <span className="text-[8px] sm:text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight hidden xs:flex items-center gap-1 truncate">
                  <span>by EFA</span>
                  {config?.subscription_tier && (
                    <span className="px-1 py-0.2 rounded text-[7px] sm:text-[8px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-[#D4AF37] border border-amber-500/20">
                      {config.subscription_tier}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="hidden xl:block h-7 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Current Page Title */}
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-200 tracking-tight">
                  {current.title}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-amber-500/10 text-amber-700 dark:text-[#D4AF37] border border-amber-500/30">
                  <Sparkles className="w-2.5 h-2.5" />
                  {parametres.anneeScolaire}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Action Controls (Responsive flex, never overflows on 360px) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Active Role Badge with 5 Roles */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold shadow-xs">
              {currentRole === 'fondateur' && <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-[#D4AF37]" />}
              {currentRole === 'directeur' && <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              {currentRole === 'censeur' && <Scale className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              {currentRole === 'caisse' && <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              {currentRole === 'professeur' && <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
              <span className={
                currentRole === 'fondateur' ? 'text-amber-700 dark:text-[#D4AF37]' :
                currentRole === 'directeur' ? 'text-blue-700 dark:text-blue-400' :
                currentRole === 'censeur' ? 'text-purple-700 dark:text-purple-400' :
                currentRole === 'caisse' ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-700 dark:text-indigo-400'
              }>
                {currentRole === 'fondateur' ? '👑 Fondateur' : 
                 currentRole === 'directeur' ? '👔 Proviseur / Dir.' : 
                 currentRole === 'censeur' ? '⚖️ Censeur' :
                 currentRole === 'caisse' ? '💰 Caisse' : '📚 Professeur'}
              </span>
            </div>

            {/* Teacher quick buttons */}
            {currentRole === 'professeur' && (
              <>
                {onOpenAppelModal && (
                  <button
                    onClick={onOpenAppelModal}
                    className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                    title="Faire l'appel"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Appel</span>
                  </button>
                )}
                {onOpenNotesModal && (
                  <button
                    onClick={onOpenNotesModal}
                    className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors cursor-pointer"
                    title="Saisir les notes"
                  >
                    <Award className="w-3.5 h-3.5 text-slate-950" />
                    <span className="hidden sm:inline">Notes</span>
                  </button>
                )}
              </>
            )}

            {/* Cashier quick buttons */}
            {currentRole === 'caisse' && (
              <button
                onClick={onOpenNewPayment}
                className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                title="Encaisser un paiement"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Encaisser</span>
              </button>
            )}

            {/* Founder and Director quick buttons */}
            {(currentRole === 'fondateur' || currentRole === 'directeur') && (
              <>
                <button
                  onClick={onOpenNewPayment}
                  className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                  title="Encaisser"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Encaisser</span>
                </button>

                <button
                  onClick={onOpenNewStudent}
                  className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors cursor-pointer"
                  title="Inscrire un élève"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">+ Élève</span>
                </button>
              </>
            )}

            {/* Login / Switch modal trigger */}
            {onOpenLoginPage && (
              <button
                onClick={onOpenLoginPage}
                className="inline-flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs shrink-0"
                title="Changer de rôle / Se connecter"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-500 dark:text-[#D4AF37]" />
                <span className="hidden md:inline">Connexion</span>
              </button>
            )}

            {/* Dark/Light mode toggle button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Basculer Mode Clair / Sombre"
              title={theme === 'dark' ? "Passer en Mode Clair (☀️)" : "Passer en Mode Sombre (🌙)"}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
