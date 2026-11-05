import React, { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useRole, ROLE_ALLOWED_TABS, getDefaultDashboardForRole } from './hooks/useRole';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Forbidden403 } from './components/Forbidden403';
import { AppTab, UserRole } from './types/auth';

// Core Views
import { DashboardView } from './components/DashboardView';
import { DashboardCaisseView } from './components/DashboardCaisseView';
import { DashboardCenseurView } from './components/DashboardCenseurView';
import { DashboardProfView } from './components/DashboardProfView';
import { ClassesView } from './components/ClassesView';
import { ElevesView } from './components/ElevesView';
import { FinancesView } from './components/FinancesView';
import { CommunicationView } from './components/CommunicationView';
import { DepensesView } from './components/DepensesView';
import { EnseignantsView } from './components/EnseignantsView';
import { ParametresView } from './components/ParametresView';
import { JournalCaisseView } from './components/JournalCaisseView';
import { SalairesView } from './components/SalairesView';
import { EmploiDuTempsView } from './components/EmploiDuTempsView';
import { RapportsView } from './components/RapportsView';
import { SaisieNotesPage } from './components/SaisieNotesPage';
import { PresencesProfPage } from './components/PresencesProfPage';
import { MesElevesProfPage } from './components/MesElevesProfPage';
import { BulletinsProfPage } from './components/BulletinsProfPage';
import { EmployesView } from './components/EmployesView';
import { OnboardingView } from './components/OnboardingView';
import { SessionDashboardView } from './components/SessionDashboardView';
import { CahierDeTexteView } from './components/CahierDeTexteView';
import { DisciplineView } from './components/DisciplineView';

// Modals
import { NewStudentModal } from './components/NewStudentModal';
import { NewPaymentModal } from './components/NewPaymentModal';
import { NewClassModal } from './components/NewClassModal';
import { NewDepenseModal } from './components/NewDepenseModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { BulletinModal } from './components/BulletinModal';
import { LoginPage } from './components/LoginPage';
import { SaisieAppelModal } from './components/SaisieAppelModal';
import { SaisieNotesModal } from './components/SaisieNotesModal';
import { SplashScreen } from './components/SplashScreen';
import { AbonnementsView } from './components/AbonnementsView';
import { UpgradeModal } from './components/UpgradeModal';
import { verifySubscriptionFirewall, SubscriptionTier } from './types/subscription';

import { Eleve, Paiement, CycleId } from './types';
import { AlertTriangle, X, ShieldAlert, Award, CalendarCheck, FileSpreadsheet, WifiOff, RefreshCw } from 'lucide-react';
import { subscribeToSchoolAlerts } from './lib/supabase';

function MainApp() {
  const { classes, eleves, selectedSession, setSelectedSession, config, refreshSupabase } = useSchool();
  const { 
    role, 
    user, 
    loginAs, 
    setRole, 
    hasAccessToTab, 
    toastMessage, 
    triggerToast, 
    clearToast 
  } = useRole();

  const [showSplash, setShowSplash] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [currentTab, setCurrentTab] = useState<AppTab>(() => getDefaultDashboardForRole(role));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isViewingLoginPage, setIsViewingLoginPage] = useState(false);

  // Modals state
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [preselectedClassId, setPreselectedClassId] = useState<string | undefined>(undefined);

  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);

  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState(false);
  const [isNewDepenseModalOpen, setIsNewDepenseModalOpen] = useState(false);

  // Roll-call and Grade modals
  const [isAppelModalOpen, setIsAppelModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [modalTargetClassId, setModalTargetClassId] = useState<string | undefined>(undefined);

  // Drawer / Detailed inspection
  const [selectedStudent, setSelectedStudent] = useState<Eleve | null>(null);
  
  // Printable receipts & bulletins
  const [receiptData, setReceiptData] = useState<{ paiement: Paiement; eleve: Eleve } | null>(null);
  const [bulletinEleve, setBulletinEleve] = useState<Eleve | null>(null);

  // Subscription Upgrade / Firewall Modal State
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    reason?: string;
    requiredTier?: SubscriptionTier;
  }>({ isOpen: false });

  // Sync tab if active tab becomes forbidden on role switch
  useEffect(() => {
    if (!hasAccessToTab(currentTab)) {
      setCurrentTab(getDefaultDashboardForRole(role));
    }
  }, [role, currentTab, hasAccessToTab]);

  // Tab change handler with permission & firewall intercept
  const handleSelectTab = (tab: AppTab) => {
    if (!hasAccessToTab(tab)) {
      triggerToast('Accès interdit - Réservé Fondateur');
      return;
    }

    // PARE-FEU ABONNEMENT (Subscription Firewall)
    const activeTier = config.subscription_tier || 'pro';
    if (['paiements', 'journal-caisse', 'depenses', 'salaires', 'rapports'].includes(tab)) {
      const firewall = verifySubscriptionFirewall(activeTier, 'compta');
      if (!firewall.allowed) {
        setUpgradeModal({
          isOpen: true,
          reason: firewall.reason,
          requiredTier: firewall.requiredTier || 'pro',
        });
        return;
      }
    }

    if (role === 'professeur' && tab === 'eleves') {
      triggerToast('Vous voyez seulement vos classes');
    }
    setCurrentTab(tab);
  };

  // Handlers for quick actions
  const handleOpenNewStudent = (classId?: string) => {
    if (role === 'caisse' || role === 'professeur') {
      triggerToast('Accès interdit - Réservé Fondateur');
      return;
    }
    setPreselectedClassId(classId);
    setIsNewStudentModalOpen(true);
  };

  const handleOpenNewPayment = (studentId?: string) => {
    if (role === 'professeur') {
      triggerToast('Accès interdit - Réservé Fondateur et Caisse');
      return;
    }

    // Pare-feu comptabilité / caisse
    const activeTier = config.subscription_tier || 'pro';
    const firewall = verifySubscriptionFirewall(activeTier, 'compta');
    if (!firewall.allowed) {
      setUpgradeModal({
        isOpen: true,
        reason: firewall.reason,
        requiredTier: firewall.requiredTier || 'pro',
      });
      return;
    }

    setPreselectedStudentId(studentId);
    setIsNewPaymentModalOpen(true);
  };

  const handleOpenNewClass = () => {
    const activeTier = config.subscription_tier || 'pro';
    const firewall = verifySubscriptionFirewall(activeTier, 'classes_illimitees', classes.length);
    if (!firewall.allowed) {
      setUpgradeModal({
        isOpen: true,
        reason: firewall.reason,
        requiredTier: firewall.requiredTier || 'pro',
      });
      return;
    }
    setIsNewClassModalOpen(true);
  };

  const handleOpenAppelModal = (classId?: string) => {
    setModalTargetClassId(classId);
    setIsAppelModalOpen(true);
  };

  const handleOpenNotesModal = (classId?: string) => {
    setModalTargetClassId(classId);
    setIsNotesModalOpen(true);
  };

  const handlePaymentSuccess = (paiement: Paiement, eleve: Eleve) => {
    setReceiptData({ paiement, eleve });
  };

  const handleSelectStudent = (eleve: Eleve) => {
    setSelectedStudent(eleve);
  };

  const handleSelectClassForMessage = () => {
    if (hasAccessToTab('parents')) {
      setCurrentTab('parents');
    }
  };

  // Role switch handler
  const handleSwitchRole = (newRole: UserRole) => {
    setRole(newRole);
    const targetDashboard = getDefaultDashboardForRole(newRole);
    setCurrentTab(targetDashboard);
  };

  // Login handler
  const handleLoginSuccess = (selectedRole: UserRole, targetDashboard: string, customUser?: { nom: string; email: string; cycle_id?: CycleId; telephone?: string }) => {
    loginAs(selectedRole, customUser?.email, customUser?.cycle_id);
    if (customUser) {
      setRole(selectedRole, customUser);
    }
    setCurrentTab(targetDashboard as AppTab);
    setIsViewingLoginPage(false);
  };

  // Return to default dashboard
  const handleReturnDashboard = () => {
    setCurrentTab(getDefaultDashboardForRole(role));
  };

  // Online / Offline detection & automatic background sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshSupabase();
      triggerToast("🟢 Connexion Internet rétablie · Données synchronisées automatiquement");
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast("🟠 Mode Hors-Ligne activé · Données sauvegardées localement en toute sécurité");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshSupabase, triggerToast]);

  // Realtime push notifications (Prof -> Censeur + Directeur)
  useEffect(() => {
    if (role === 'censeur' || role === 'directeur' || role === 'fondateur') {
      const unsubscribe = subscribeToSchoolAlerts((alert) => {
        triggerToast(`⚡ REALTIME · ${alert.title} — ${alert.message}`);
      });
      return () => {
        unsubscribe();
      };
    }
  }, [role, triggerToast]);

  // Find class for modals
  const receiptClass = receiptData 
    ? classes.find(c => c.id === receiptData.eleve.classeId) || null
    : null;

  const bulletinClass = bulletinEleve
    ? classes.find(c => c.id === bulletinEleve.classeId) || null
    : null;

  // 1. SPLASH SCREEN BEFORE LOGIN / APP
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. If user opened full login page
  if (isViewingLoginPage) {
    return (
      <LoginPage
        initialRole={role}
        onLoginSuccess={handleLoginSuccess}
        onCancel={() => setIsViewingLoginPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex relative selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300">
      
      {/* TOAST ROUGE FLOTTANT "ACCÈS INTERDIT - RÉSERVÉ FONDATEUR" */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[100] max-w-md w-full bg-rose-600 text-white p-4 rounded-xl shadow-2xl shadow-rose-950/50 border border-rose-400 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-700/80 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xs uppercase tracking-wider block">Sécurité EFA SCHOOL</span>
              <p className="text-xs font-semibold leading-tight">{toastMessage}</p>
            </div>
          </div>
          <button
            onClick={clearToast}
            className="p-1.5 rounded-lg hover:bg-rose-700 text-white transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        currentRole={role}
        onSwitchRole={handleSwitchRole}
        onOpenLoginPage={() => setIsViewingLoginPage(true)}
        onUnauthorizedAttempt={triggerToast}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col lg:pl-72 w-full min-w-0 transition-all duration-200">
        
        {/* Offline Mode Banner */}
        {!isOnline && (
          <div className="bg-amber-600 text-white text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-sm z-40 relative">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Mode Hors-Ligne Actif · Données enregistrées localement (Multi-device) · Synchro automatique dès reconnexion</span>
          </div>
        )}

        {/* Top Header */}
        <Header
          currentTab={currentTab}
          currentRole={role}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNewStudent={() => handleOpenNewStudent()}
          onOpenNewPayment={() => handleOpenNewPayment()}
          onOpenAppelModal={() => handleOpenAppelModal()}
          onOpenNotesModal={() => handleOpenNotesModal()}
          onOpenLoginPage={() => setIsViewingLoginPage(true)}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* 1. DASHBOARD FONDATEUR / DIRECTION */}
          {currentTab === 'dashboard-fondateur' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DashboardView
                currentRole={role}
                onNavigateTab={(tab) => handleSelectTab(tab as AppTab)}
                onSelectSession={(sess) => {
                  setSelectedSession(sess);
                  handleSelectTab('session-view');
                }}
                onOpenOnboarding={() => handleSelectTab('onboarding')}
                onOpenNewStudent={() => handleOpenNewStudent()}
                onOpenNewPayment={() => handleOpenNewPayment()}
                onOpenNewDepense={() => setIsNewDepenseModalOpen(true)}
              />
            </ProtectedRoute>
          )}

          {/* 1b. ONBOARDING INITIAL DES CYCLES (Configuration Fondateur) */}
          {currentTab === 'onboarding' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <OnboardingView
                onComplete={() => handleSelectTab('dashboard-fondateur')}
                onCancel={() => handleSelectTab('dashboard-fondateur')}
              />
            </ProtectedRoute>
          )}

          {/* 1c. SESSION ISOLÉE (Primaire, Collège, Lycée) */}
          {currentTab === 'session-view' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'caisse']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <SessionDashboardView
                session={selectedSession || 'primaire'}
                onBack={() => handleSelectTab('dashboard-fondateur')}
                onOpenReceipt={(p, el) => setReceiptData({ paiement: p, eleve: el })}
                onOpenStudentDetail={(el) => handleSelectStudent(el)}
              />
            </ProtectedRoute>
          )}

          {/* 2. DASHBOARD CAISSE */}
          {currentTab === 'dashboard-caisse' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'caisse']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DashboardCaisseView
                onOpenNewPayment={handleOpenNewPayment}
                onOpenNewDepense={() => setIsNewDepenseModalOpen(true)}
                onOpenReceipt={(p, el) => setReceiptData({ paiement: p, eleve: el })}
                onNavigateTab={(tab) => handleSelectTab(tab as AppTab)}
              />
            </ProtectedRoute>
          )}

          {/* 2b. DASHBOARD CENSEUR */}
          {currentTab === 'dashboard-censeur' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'censeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DashboardCenseurView
                user={user}
                onNavigateTab={(tab) => handleSelectTab(tab as AppTab)}
              />
            </ProtectedRoute>
          )}

          {/* 3. DASHBOARD PROFESSEUR */}
          {currentTab === 'dashboard-professeur' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DashboardProfView
                userEmail={user.email}
                onOpenAppelModal={handleOpenAppelModal}
                onOpenNotesModal={handleOpenNotesModal}
                onNavigateTab={(tab) => handleSelectTab(tab as AppTab)}
                onSelectStudent={handleSelectStudent}
              />
            </ProtectedRoute>
          )}

          {/* 4. CLASSES */}
          {currentTab === 'classes' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <ClassesView
                currentRole={role}
                userEmail={user.email}
                onOpenNewClass={handleOpenNewClass}
                onOpenNewStudentForClass={(clsId) => handleOpenNewStudent(clsId)}
                onSelectStudent={handleSelectStudent}
                onSelectClassForMessage={handleSelectClassForMessage}
              />
            </ProtectedRoute>
          )}

          {/* 5. ÉLÈVES */}
          {currentTab === 'eleves' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'caisse', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              {role === 'professeur' ? (
                <MesElevesProfPage
                  currentRole={role}
                  userEmail={user.email}
                />
              ) : (
                <ElevesView
                  currentRole={role}
                  onOpenNewStudent={() => handleOpenNewStudent()}
                  onSelectStudent={handleSelectStudent}
                  onOpenPaymentForStudent={(stdId) => handleOpenNewPayment(stdId)}
                />
              )}
            </ProtectedRoute>
          )}

          {/* 6. INSCRIPTIONS (Fondateur et Directeur) */}
          {currentTab === 'inscriptions' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                      Guichet d'Inscription & Admissions 2025-2026
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Enregistrement officiel des dossiers élèves et délivrance de matricule national.
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenNewStudent()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    + Nouvelle Inscription
                  </button>
                </div>
                <ElevesView
                  currentRole={role}
                  onOpenNewStudent={() => handleOpenNewStudent()}
                  onSelectStudent={handleSelectStudent}
                  onOpenPaymentForStudent={(stdId) => handleOpenNewPayment(stdId)}
                />
              </div>
            </ProtectedRoute>
          )}

          {/* 7. EMPLOI DU TEMPS */}
          {currentTab === 'emploi-du-temps' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <EmploiDuTempsView currentRole={role} />
            </ProtectedRoute>
          )}

          {/* 7b. CAHIER DE TEXTE */}
          {currentTab === 'cahier-de-texte' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <CahierDeTexteView
                currentRole={role}
                user={user}
              />
            </ProtectedRoute>
          )}

          {/* 8. PRÉSENCES */}
          {currentTab === 'presences' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <PresencesProfPage
                currentRole={role}
                userEmail={user.email}
                onReturnDashboard={handleReturnDashboard}
              />
            </ProtectedRoute>
          )}

          {/* 8b. ABSENCES PROFS */}
          {currentTab === 'absences-profs' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DisciplineView
                currentRole={role}
                user={user}
                activeSubTab="absences-profs"
              />
            </ProtectedRoute>
          )}

          {/* 8c. DISCIPLINE & CONSEILS */}
          {currentTab === 'discipline' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DisciplineView
                currentRole={role}
                user={user}
                activeSubTab="discipline"
              />
            </ProtectedRoute>
          )}

          {/* 9. NOTES */}
          {currentTab === 'notes' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <SaisieNotesPage
                currentRole={role}
                userEmail={user.email}
                onReturnDashboard={handleReturnDashboard}
              />
            </ProtectedRoute>
          )}

          {/* 10. BULLETINS */}
          {currentTab === 'bulletins' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              {role === 'professeur' ? (
                <BulletinsProfPage
                  currentRole={role}
                  userEmail={user.email}
                  onSelectStudentForBulletin={(el) => setBulletinEleve(el)}
                  onReturnDashboard={handleReturnDashboard}
                />
              ) : (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                        Édition & Validation des Bulletins Trimestriels
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Cliquez sur une fiche élève pour générer, certifier et imprimer son bulletin officiel EFA SCHOOL.
                      </p>
                    </div>
                  </div>

                  <ElevesView
                    currentRole={role}
                    hidePaymentAction={true}
                    onOpenNewStudent={() => handleOpenNewStudent()}
                    onSelectStudent={handleSelectStudent}
                    onOpenPaymentForStudent={(stdId) => handleOpenNewPayment(stdId)}
                  />
                </div>
              )}
            </ProtectedRoute>
          )}

          {/* 11. PROFESSEURS */}
          {currentTab === 'professeurs' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <EnseignantsView />
            </ProtectedRoute>
          )}

          {/* 11b. GESTION DES EMPLOYÉS & CODES PIN */}
          {currentTab === 'employes' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <EmployesView
                currentRole={role}
                onUnauthorizedAttempt={triggerToast}
              />
            </ProtectedRoute>
          )}

          {/* 12. PAIEMENTS & FINANCES */}
          {currentTab === 'paiements' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'caisse']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <FinancesView
                currentRole={role}
                onOpenNewPayment={() => handleOpenNewPayment()}
                onOpenPaymentForStudent={(stdId) => handleOpenNewPayment(stdId)}
                onSelectStudent={handleSelectStudent}
              />
            </ProtectedRoute>
          )}

          {/* 13. JOURNAL DE CAISSE */}
          {currentTab === 'journal-caisse' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'caisse']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <JournalCaisseView
                onOpenNewPayment={() => handleOpenNewPayment()}
                onOpenReceipt={(p, el) => setReceiptData({ paiement: p, eleve: el })}
              />
            </ProtectedRoute>
          )}

          {/* 14. DÉPENSES */}
          {currentTab === 'depenses' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'caisse']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <DepensesView
                onOpenNewDepense={() => setIsNewDepenseModalOpen(true)}
              />
            </ProtectedRoute>
          )}

          {/* 15. SALAIRES (FONDATEUR crée et valide, PROF voit son salaire, CAISSE décharge) */}
          {currentTab === 'salaires' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'caisse', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <SalairesView
                currentRole={role}
                user={user}
                onUnauthorizedAttempt={triggerToast}
              />
            </ProtectedRoute>
          )}

          {/* 16. RAPPORTS */}
          {currentTab === 'rapports' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'caisse']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <RapportsView />
            </ProtectedRoute>
          )}

          {/* 17. PARENTS (COMMUNICATION) */}
          {currentTab === 'parents' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <CommunicationView />
            </ProtectedRoute>
          )}

          {/* 18. PARAMÈTRES (RÉSERVÉ FONDATEUR) */}
          {currentTab === 'parametres' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <ParametresView />
            </ProtectedRoute>
          )}

          {/* 18b. ABONNEMENTS & FORFAITS */}
          {currentTab === 'abonnements' && (
            <ProtectedRoute
              currentRole={role}
              allowedRoles={['fondateur', 'directeur', 'censeur', 'caisse', 'professeur']}
              onReturnDashboard={handleReturnDashboard}
              onUnauthorizedAttempt={triggerToast}
            >
              <AbonnementsView />
            </ProtectedRoute>
          )}

          {/* 19. 403 SCREEN */}
          {currentTab === '403' && (
            <Forbidden403
              currentRole={role}
              onReturnDashboard={handleReturnDashboard}
            />
          )}

          {/* Official Footer with Logo & Lomé Togo */}
          <footer className="mt-12 py-6 border-t border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo-efa.png"
                alt="Logo EFA SCHOOL"
                className="w-5 h-5 object-contain shrink-0"
              />
              <span className="font-semibold text-slate-300">
                © 2026 EFA TECHNOLOGIE - Lomé, Togo
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500">
              <span className="text-amber-400/90 font-medium">« La technologie devient enfin facile »</span>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsViewingLoginPage(true)}
                className="text-slate-400 hover:text-white underline cursor-pointer"
              >
                Changer de Rôle (Login)
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* ALL MODALS */}
      
      {/* Inscription Élève */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => {
          setIsNewStudentModalOpen(false);
          setPreselectedClassId(undefined);
        }}
        preselectedClassId={preselectedClassId}
      />

      {/* Encaisser Paiement */}
      <NewPaymentModal
        isOpen={isNewPaymentModalOpen}
        onClose={() => {
          setIsNewPaymentModalOpen(false);
          setPreselectedStudentId(undefined);
        }}
        preselectedStudentId={preselectedStudentId}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Créer Classe */}
      <NewClassModal
        isOpen={isNewClassModalOpen}
        onClose={() => setIsNewClassModalOpen(false)}
      />

      {/* Enregistrer Dépense */}
      <NewDepenseModal
        isOpen={isNewDepenseModalOpen}
        onClose={() => setIsNewDepenseModalOpen(false)}
      />

      {/* Faire l'Appel Modal */}
      <SaisieAppelModal
        isOpen={isAppelModalOpen}
        onClose={() => setIsAppelModalOpen(false)}
        initialClassId={modalTargetClassId}
      />

      {/* Saisie Notes Modal */}
      <SaisieNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        initialClassId={modalTargetClassId}
      />

      {/* Fiche Détail Élève */}
      {selectedStudent && (
        <StudentDetailModal
          eleve={selectedStudent}
          currentRole={role}
          onClose={() => setSelectedStudent(null)}
          onOpenPaymentModal={(eleveId) => {
            setSelectedStudent(null);
            handleOpenNewPayment(eleveId);
          }}
          onOpenReceipt={(paiement, eleve) => {
            setReceiptData({ paiement, eleve });
          }}
          onOpenBulletin={(eleve) => {
            setBulletinEleve(eleve);
          }}
        />
      )}

      {/* Reçu Officiel Imprimable */}
      {receiptData && (
        <ReceiptModal
          paiement={receiptData.paiement}
          eleve={receiptData.eleve}
          classe={receiptClass}
          onClose={() => setReceiptData(null)}
        />
      )}

      {/* Bulletin Trimestriel Imprimable */}
      {bulletinEleve && (
        <BulletinModal
          eleve={bulletinEleve}
          classe={bulletinClass}
          onClose={() => setBulletinEleve(null)}
        />
      )}

      {/* Pare-feu Abonnement / Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        reason={upgradeModal.reason}
        requiredTier={upgradeModal.requiredTier}
        onClose={() => setUpgradeModal({ isOpen: false })}
        onNavigateAbonnements={() => {
          setUpgradeModal({ isOpen: false });
          setCurrentTab('abonnements');
        }}
      />

    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <MainApp />
    </SchoolProvider>
  );
}
