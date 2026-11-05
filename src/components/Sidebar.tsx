import React from 'react';
import { 
  LayoutDashboard, School, Users, Wallet, CreditCard,
  MessageCircle, TrendingDown, Briefcase, Settings, 
  Sun, Moon, ShieldCheck, ChevronRight, Calendar,
  Award, FileText, UserPlus, Receipt, Coins, CheckSquare, 
  LogOut, Crown, BookOpen, FileSpreadsheet, CalendarCheck, UserCheck,
  Scale, UserX
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole, AppTab, DEMO_ACCOUNTS } from '../types/auth';
import { getProfClasses } from '../utils/affectations';
import { isClassePrimaire } from '../data/matieres_par_classe';
import { ALL_SESSIONS } from '../types/config';

export type NavTab = AppTab;

interface NavMenuItem {
  id: AppTab;
  label: string;
  icon: any;
  badge: string | null;
  badgeAlert?: boolean;
  badgeSpecial?: boolean;
}

interface SidebarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentRole: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onOpenLoginPage?: () => void;
  onUnauthorizedAttempt?: (message: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  currentRole,
  onSwitchRole,
  onOpenLoginPage,
  onUnauthorizedAttempt,
}) => {
  const { 
    classes,
    eleves,
    totalEleves, 
    totalClasses, 
    elevesEnRetard, 
    parametres, 
    theme, 
    toggleTheme,
    config,
    selectedSession,
    setSelectedSession,
    getElevesBySession,
  } = useSchool();

  // Role details
  const activeUser = DEMO_ACCOUNTS[currentRole] || DEMO_ACCOUNTS.fondateur;

  // 1. MENU FONDATEUR (Tout + Salaires + Paramètres + Gestion Employés)
  const menuFondateur: NavMenuItem[] = [
    { id: 'dashboard-fondateur' as AppTab, label: 'Tableau de Bord', icon: LayoutDashboard, badge: null },
    { id: 'eleves' as AppTab, label: 'Gestion des Élèves', icon: Users, badge: `${totalEleves}` },
    { id: 'inscriptions' as AppTab, label: 'Inscriptions', icon: UserPlus, badge: 'Nouveau' },
    { id: 'classes' as AppTab, label: 'Gestion des Classes', icon: School, badge: `${totalClasses}` },
    { id: 'emploi-du-temps' as AppTab, label: 'Emploi du Temps', icon: Calendar, badge: null },
    { id: 'cahier-de-texte' as AppTab, label: 'Cahier de Texte & Visas', icon: BookOpen, badge: 'Digital' },
    { id: 'presences' as AppTab, label: 'Présences & Appel', icon: CalendarCheck, badge: null },
    { id: 'absences-profs' as AppTab, label: 'Absences & Remplacements', icon: UserX, badge: 'Profs' },
    { id: 'discipline' as AppTab, label: 'Discipline & Conseils', icon: Scale, badge: null },
    { id: 'notes' as AppTab, label: 'Saisie des Notes', icon: Award, badge: '/20' },
    { id: 'bulletins' as AppTab, label: 'Bulletins Trimestriels', icon: FileSpreadsheet, badge: 'Validation' },
    { id: 'professeurs' as AppTab, label: 'Corps Enseignant', icon: Briefcase, badge: null },
    { id: 'employes' as AppTab, label: 'Employés & Codes PIN', icon: UserCheck, badge: 'PIN' },
    { id: 'paiements' as AppTab, label: 'Paiements & Écolages', icon: CreditCard, badge: elevesEnRetard.length > 0 ? `${elevesEnRetard.length} impayés` : null, badgeAlert: true },
    { id: 'journal-caisse' as AppTab, label: 'Journal de Caisse', icon: Receipt, badge: 'Direct' },
    { id: 'depenses' as AppTab, label: 'Dépenses École', icon: TrendingDown, badge: null },
    { id: 'salaires' as AppTab, label: 'Salaires & Paie', icon: Coins, badge: 'Secret' },
    { id: 'rapports' as AppTab, label: 'Rapports Financiers', icon: FileText, badge: 'PDF' },
    { id: 'parents' as AppTab, label: 'Communication Parents', icon: MessageCircle, badge: 'WhatsApp', badgeSpecial: true },
    { id: 'parametres' as AppTab, label: 'Paramètres Établissement', icon: Settings, badge: null },
    { id: 'abonnements' as AppTab, label: 'Abonnements & Licences', icon: ShieldCheck, badge: config.subscription_tier ? config.subscription_tier.toUpperCase() : 'PRO', badgeSpecial: true },
  ];

  // 2. MENU DIRECTEUR / PROVISEUR (Pédagogie + Bulletins + Employés, PAS de salaires secrets)
  const menuDirecteur: NavMenuItem[] = [
    { id: 'dashboard-fondateur' as AppTab, label: 'Dashboard Directeur', icon: LayoutDashboard, badge: null },
    { id: 'eleves' as AppTab, label: 'Gestion des Élèves', icon: Users, badge: `${totalEleves}` },
    { id: 'inscriptions' as AppTab, label: 'Inscriptions', icon: UserPlus, badge: 'Nouveau' },
    { id: 'classes' as AppTab, label: 'Gestion des Classes', icon: School, badge: `${totalClasses}` },
    { id: 'emploi-du-temps' as AppTab, label: 'Emploi du Temps', icon: Calendar, badge: null },
    { id: 'cahier-de-texte' as AppTab, label: 'Cahier de Texte', icon: BookOpen, badge: null },
    { id: 'presences' as AppTab, label: 'Présences & Appel', icon: CalendarCheck, badge: null },
    { id: 'absences-profs' as AppTab, label: 'Absences Profs', icon: UserX, badge: null },
    { id: 'discipline' as AppTab, label: 'Discipline & Exclusions', icon: Scale, badge: 'Conseil' },
    { id: 'notes' as AppTab, label: 'Contrôle des Notes', icon: Award, badge: '/20' },
    { id: 'bulletins' as AppTab, label: 'Bulletins Trimestriels', icon: FileSpreadsheet, badge: 'Valider' },
    { id: 'professeurs' as AppTab, label: 'Corps Enseignant', icon: Briefcase, badge: null },
    { id: 'employes' as AppTab, label: 'Employés & Codes PIN', icon: UserCheck, badge: 'PIN' },
    { id: 'paiements' as AppTab, label: 'Paiements & Écolages', icon: CreditCard, badge: elevesEnRetard.length > 0 ? `${elevesEnRetard.length}` : null, badgeAlert: true },
    { id: 'journal-caisse' as AppTab, label: 'Journal de Caisse', icon: Receipt, badge: 'Lecture' },
    { id: 'depenses' as AppTab, label: 'Dépenses (Proposer)', icon: TrendingDown, badge: null },
    { id: 'rapports' as AppTab, label: 'Rapports Périodiques', icon: FileText, badge: 'PDF' },
    { id: 'parents' as AppTab, label: 'Communication Parents', icon: MessageCircle, badge: 'WhatsApp', badgeSpecial: true },
    { id: 'abonnements' as AppTab, label: 'Forfaits & Licences', icon: ShieldCheck, badge: config.subscription_tier ? config.subscription_tier.toUpperCase() : 'PRO' },
  ];

  // 3. MENU CENSEUR (Études, Emploi du temps, Cahier de texte visas, Absences profs, Discipline, Impayés lecture seule)
  const menuCenseur: NavMenuItem[] = [
    { id: 'dashboard-censeur' as AppTab, label: 'Dashboard Censeur', icon: LayoutDashboard, badge: 'Études' },
    { id: 'eleves' as AppTab, label: 'Gestion des Élèves', icon: Users, badge: `${totalEleves}` },
    { id: 'classes' as AppTab, label: 'Gestion des Classes', icon: School, badge: `${totalClasses}` },
    { id: 'emploi-du-temps' as AppTab, label: 'Emploi du Temps', icon: Calendar, badge: 'Horaires' },
    { id: 'cahier-de-texte' as AppTab, label: 'Cahier de Texte & Visas', icon: BookOpen, badge: 'Visas' },
    { id: 'presences' as AppTab, label: 'Présences & Appel', icon: CalendarCheck, badge: null },
    { id: 'absences-profs' as AppTab, label: 'Absences & Remplacements', icon: UserX, badge: 'Profs' },
    { id: 'discipline' as AppTab, label: 'Discipline & Sanctions', icon: Scale, badge: 'Conseils' },
    { id: 'notes' as AppTab, label: 'Contrôle des Notes', icon: Award, badge: '/20' },
    { id: 'bulletins' as AppTab, label: 'Bulletins Trimestriels', icon: FileSpreadsheet, badge: 'Vérif' },
    { id: 'paiements' as AppTab, label: 'Impayés (Lecture Seule)', icon: CreditCard, badge: elevesEnRetard.length > 0 ? `${elevesEnRetard.length}` : null, badgeAlert: true },
  ];

  // 4. MENU CAISSE (Argent uniquement)
  const menuCaisse: NavMenuItem[] = [
    { id: 'dashboard-caisse' as AppTab, label: 'Dashboard Caisse', icon: LayoutDashboard, badge: 'Solde' },
    { id: 'eleves' as AppTab, label: 'Élèves (Lecture)', icon: Users, badge: `${totalEleves}` },
    { id: 'paiements' as AppTab, label: 'Paiements & Encaissements', icon: CreditCard, badge: elevesEnRetard.length > 0 ? `${elevesEnRetard.length}` : null, badgeAlert: true },
    { id: 'journal-caisse' as AppTab, label: 'Journal de Caisse', icon: Receipt, badge: 'Jour' },
    { id: 'depenses' as AppTab, label: 'Dépenses (< 10k F)', icon: TrendingDown, badge: null },
    { id: 'rapports' as AppTab, label: 'Rapports Financiers (PDF)', icon: FileText, badge: 'Reçus' },
  ];

  // Teacher dynamic counts
  const myClassNames = currentRole === 'professeur' ? getProfClasses(activeUser.email) : [];
  const teacherStudentsCount = eleves.filter(e => {
    const c = classes.find(cls => cls.id === e.classeId);
    return c && myClassNames.includes(c.nom);
  }).length;

  // 5. MENU PROFESSEUR (Différenciation Primaire vs Collège/Lycée)
  const isPrimaryProf = currentRole === 'professeur' && (
    myClassNames.length > 0 && myClassNames.every(cn => isClassePrimaire(cn))
  );

  const menuProfPrimaire: NavMenuItem[] = [
    { id: 'dashboard-professeur' as AppTab, label: 'Tableau de Bord Maître', icon: LayoutDashboard, badge: 'Primaire' },
    { id: 'eleves' as AppTab, label: 'Ma Classe & Élèves', icon: Users, badge: `${teacherStudentsCount || 28}` },
    { id: 'cahier-de-texte' as AppTab, label: 'Cahier de Texte', icon: BookOpen, badge: 'Cahier' },
    { id: 'presences' as AppTab, label: 'Faire l\'Appel (Présences)', icon: CalendarCheck, badge: 'Direct' },
    { id: 'absences-profs' as AppTab, label: 'Signaler Mon Absence', icon: UserX, badge: null },
    { id: 'discipline' as AppTab, label: 'Incidents & Discipline', icon: Scale, badge: null },
    { id: 'emploi-du-temps' as AppTab, label: 'Emploi du Temps', icon: Calendar, badge: null },
    { id: 'salaires' as AppTab, label: 'Mon Salaire', icon: Coins, badge: 'Paie' },
  ];

  const menuProfCollegeLycee: NavMenuItem[] = [
    { id: 'dashboard-professeur' as AppTab, label: 'Dashboard Professeur', icon: LayoutDashboard, badge: 'Secondaire' },
    { id: 'classes' as AppTab, label: 'Mes Classes', icon: School, badge: `${myClassNames.length || 1}` },
    { id: 'eleves' as AppTab, label: 'Mes Élèves', icon: Users, badge: `${teacherStudentsCount || 35}` },
    { id: 'cahier-de-texte' as AppTab, label: 'Cahier de Texte', icon: BookOpen, badge: 'Séances' },
    { id: 'notes' as AppTab, label: 'Saisie Notes (/20)', icon: Award, badge: 'Coefficients' },
    { id: 'presences' as AppTab, label: 'Saisie Présences (Appel)', icon: CalendarCheck, badge: 'Appel' },
    { id: 'absences-profs' as AppTab, label: 'Signaler Mon Absence', icon: UserX, badge: null },
    { id: 'discipline' as AppTab, label: 'Rapports Discipline', icon: Scale, badge: null },
    { id: 'bulletins' as AppTab, label: 'Bulletins Trimestriels', icon: FileSpreadsheet, badge: 'Notes' },
    { id: 'emploi-du-temps' as AppTab, label: 'Emploi du Temps', icon: Calendar, badge: null },
    { id: 'salaires' as AppTab, label: 'Mon Salaire', icon: Coins, badge: 'Paie' },
  ];

  // Select current items according to role
  const navItems = 
    currentRole === 'caisse' 
      ? menuCaisse 
      : currentRole === 'censeur'
      ? menuCenseur
      : currentRole === 'professeur' 
      ? (isPrimaryProf ? menuProfPrimaire : menuProfCollegeLycee) 
      : currentRole === 'directeur'
      ? menuDirecteur
      : menuFondateur;

  const roleBadges: Record<UserRole, { label: string; color: string; icon: any }> = {
    fondateur: {
      label: '👑 Fondateur',
      color: 'bg-amber-500/15 text-amber-800 dark:text-[#D4AF37] border-amber-500/40',
      icon: Crown,
    },
    directeur: {
      label: '👔 Directeur',
      color: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/40',
      icon: Briefcase,
    },
    censeur: {
      label: '⚖️ Censeur',
      color: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/40',
      icon: Scale,
    },
    caisse: {
      label: '💰 Caisse',
      color: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
      icon: Wallet,
    },
    professeur: {
      label: '📚 Professeur',
      color: 'bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/40',
      icon: BookOpen,
    },
  };

  const currentBadge = roleBadges[currentRole];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with 48x48 Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo-efa.png"
              alt="Logo EFA SCHOOL"
              className="w-[48px] h-[48px] object-contain shrink-0 drop-shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">EFA SCHOOL</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight">by EFA TECHNOLOGIE</p>
            </div>
          </div>
        </div>

        {/* ROLE BADGE EN HAUT SIDEBAR (👑 Fondateur / 👔 Directeur / 💰 Caisse / 📚 Professeur) */}
        <div className="mx-4 mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className={`px-2 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 shadow-xs ${currentBadge.color}`}>
              <span>{currentBadge.label}</span>
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-900 dark:text-white text-xs block truncate leading-tight">
                {activeUser.nom}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate leading-tight">
                {activeUser.email}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {/* CYCLES & SESSIONS (V2 Isolation: Primaire / Collège / Lycée) */}
          {(currentRole === 'fondateur' || currentRole === 'directeur' || currentRole === 'caisse') && (
            <div className="mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Cycles Scolaires
                </span>
                {currentRole === 'fondateur' && (
                  <button
                    onClick={() => {
                      onSelectTab('onboarding');
                      onCloseMobile();
                    }}
                    className="text-[10px] font-semibold text-amber-600 dark:text-[#D4AF37] hover:underline cursor-pointer"
                    title="Configurer les cycles et campus"
                  >
                    ⚙️ Configurer
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {ALL_SESSIONS.filter(s => (config?.sessions || []).includes(s.key)).map((s) => {
                  const isSelected = currentTab === 'session-view' && selectedSession === s.key;
                  const count = getElevesBySession ? getElevesBySession(s.key).length : 0;
                  return (
                    <button
                      key={s.key}
                      onClick={() => {
                        setSelectedSession(s.key);
                        onSelectTab('session-view');
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 text-amber-800 dark:text-[#D4AF37] border border-amber-500/50 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {count} él.
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-800 dark:text-[#D4AF37] font-bold border border-amber-500/40 dark:border-[#D4AF37]/40 shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon 
                    className={`w-4 h-4 transition-colors shrink-0 ${
                      isActive ? 'text-amber-600 dark:text-[#D4AF37]' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`} 
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                      item.badgeSpecial
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : item.badgeAlert
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                        : isActive
                        ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Quick Switcher & Logout Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/70 space-y-2">
          
          {/* Quick switch between 5 roles */}
          {onSwitchRole && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider block px-1">
                Basculer de rôle (5 Rôles V2) :
              </span>
              <div className="grid grid-cols-5 gap-1">
                <button
                  type="button"
                  onClick={() => onSwitchRole('fondateur')}
                  className={`py-1 px-1 rounded-md text-[9px] font-bold transition-all text-center truncate cursor-pointer ${
                    currentRole === 'fondateur'
                      ? 'bg-amber-500/20 text-amber-800 dark:text-[#D4AF37] border border-amber-500/50'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                  title="👑 Fondateur"
                >
                  👑 Fond.
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('directeur')}
                  className={`py-1 px-1 rounded-md text-[9px] font-bold transition-all text-center truncate cursor-pointer ${
                    currentRole === 'directeur'
                      ? 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/50'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                  title="👔 Directeur"
                >
                  👔 Dir.
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('censeur')}
                  className={`py-1 px-1 rounded-md text-[9px] font-bold transition-all text-center truncate cursor-pointer ${
                    currentRole === 'censeur'
                      ? 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/50'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                  title="⚖️ Censeur"
                >
                  ⚖️ Cens.
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('caisse')}
                  className={`py-1 px-1 rounded-md text-[9px] font-bold transition-all text-center truncate cursor-pointer ${
                    currentRole === 'caisse'
                      ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/50'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                  title="💰 Caisse"
                >
                  💰 Caisse
                </button>
                <button
                  type="button"
                  onClick={() => onSwitchRole('professeur')}
                  className={`py-1 px-1 rounded-md text-[9px] font-bold transition-all text-center truncate cursor-pointer ${
                    currentRole === 'professeur'
                      ? 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/50'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                  title="📚 Professeur"
                >
                  📚 Prof.
                </button>
              </div>
            </div>
          )}

          {/* Mobile & Sidebar Quick Actions: Connexion + Mode Jour/Nuit */}
          <div className="flex items-center gap-2">
            {onOpenLoginPage && (
              <button
                onClick={onOpenLoginPage}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-500 dark:text-[#D4AF37]" />
                <span className="truncate">Connexion / PIN</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Basculer thème"
              title={theme === 'dark' ? "Passer en Mode Clair (☀️)" : "Passer en Mode Sombre (🌙)"}
              className="p-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span className="text-[10px] font-semibold text-amber-400">Jour</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-[10px] font-semibold text-slate-700">Nuit</span>
                </>
              )}
            </button>
          </div>

          {/* Official Footer */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
            <img
              src="/logo-efa.png"
              alt="Logo EFA"
              className="w-4 h-4 object-contain shrink-0"
            />
            <div className="truncate leading-tight">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">
                © 2026 EFA TECHNOLOGIE
              </span>
              <span className="text-[9px] text-slate-400 truncate block">
                Direction EFA · Lomé, Togo
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
