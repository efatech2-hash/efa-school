import React, { useState, useEffect } from 'react';
import { 
  Lock, Mail, ArrowRight, ShieldCheck, 
  Crown, Wallet, BookOpen, Eye, EyeOff, KeyRound, 
  Briefcase, UserCheck, AlertOctagon, Smartphone, Scale, 
  Sun, Moon, User
} from 'lucide-react';
import { UserRole, CycleId, DEMO_ACCOUNTS, DEMO_DIRECTEURS_PAR_CYCLE, DEMO_CENSEURS_PAR_CYCLE, DEMO_PROF_AWA } from '../types/auth';
import { getStoredEmployes, Employe } from '../types/employes';
import { useSchool } from '../context/SchoolContext';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, targetDashboard: string, customUser?: { nom: string; email: string; cycle_id?: CycleId; telephone?: string }) => void;
  onCancel?: () => void;
  initialRole?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  onCancel,
  initialRole = 'fondateur',
}) => {
  const { theme, toggleTheme } = useSchool();

  // Tab: 'fondateur' (Email + Pass) vs 'equipe' (Username + Pass)
  const [authCategory, setAuthCategory] = useState<'fondateur' | 'equipe'>(
    initialRole === 'fondateur' ? 'fondateur' : 'equipe'
  );

  // Fondateur fields
  const [fondateurEmail, setFondateurEmail] = useState('fondateur@efa.com');
  const [fondateurPassword, setFondateurPassword] = useState('admin123');

  // Equipe fields (Directeur / Censeur / Caisse / Prof)
  const [selectedSubRole, setSelectedSubRole] = useState<'directeur' | 'censeur' | 'caisse' | 'professeur'>(
    initialRole === 'fondateur' ? 'directeur' : (initialRole as any)
  );
  const [equipeUsername, setEquipeUsername] = useState('directeur');
  const [equipePassword, setEquipePassword] = useState('admin123');
  const [selectedCycleId, setSelectedCycleId] = useState<CycleId>('lycee');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync default username when sub-role changes
  const handleSelectSubRole = (r: 'directeur' | 'censeur' | 'caisse' | 'professeur') => {
    setSelectedSubRole(r);
    setErrorMessage(null);
    if (r === 'directeur') {
      setEquipeUsername('directeur');
      setEquipePassword('admin123');
      setSelectedCycleId('lycee');
    } else if (r === 'censeur') {
      setEquipeUsername('censeur');
      setEquipePassword('admin123');
      setSelectedCycleId('college');
    } else if (r === 'caisse') {
      setEquipeUsername('caisse');
      setEquipePassword('admin123');
      setSelectedCycleId('all');
    } else if (r === 'professeur') {
      setEquipeUsername('koffi');
      setEquipePassword('admin123');
      setSelectedCycleId('primaire');
    }
  };

  // Submit Fondateur Login (Email + Pass)
  const handleSubmitFondateur = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!fondateurEmail.trim() || !fondateurPassword.trim()) {
      setErrorMessage("Veuillez renseigner votre email et mot de passe.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        localStorage.setItem('efa_role', 'fondateur');
      } catch {}

      onLoginSuccess('fondateur', 'dashboard-fondateur', {
        nom: DEMO_ACCOUNTS.fondateur.nom,
        email: fondateurEmail.trim(),
        cycle_id: 'all',
        telephone: '+228 90 00 00 01',
      });
    }, 400);
  };

  // Submit Equipe Login (Username + Pass)
  const handleSubmitEquipe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!equipeUsername.trim() || !equipePassword.trim()) {
      setErrorMessage("Veuillez renseigner votre nom d'utilisateur et mot de passe.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      try {
        localStorage.setItem('efa_role', selectedSubRole);
      } catch {}

      let targetDashboard = 'dashboard-fondateur';
      let userNom = 'Utilisateur';
      let userEmail = `${equipeUsername.trim().toLowerCase()}@efa.com`;
      let finalCycleId: CycleId = selectedCycleId;
      let userPhone = '+228 90 00 00 00';

      if (selectedSubRole === 'directeur') {
        targetDashboard = 'dashboard-fondateur';
        const dir = selectedCycleId === 'primaire' 
          ? DEMO_DIRECTEURS_PAR_CYCLE.primaire 
          : selectedCycleId === 'college'
          ? DEMO_DIRECTEURS_PAR_CYCLE.college
          : DEMO_DIRECTEURS_PAR_CYCLE.lycee;
        userNom = dir.nom;
        userEmail = dir.email;
        finalCycleId = dir.cycle_id;
        userPhone = '+228 90 00 00 02';
      } else if (selectedSubRole === 'censeur') {
        targetDashboard = 'dashboard-censeur';
        const cen = selectedCycleId === 'lycee' 
          ? DEMO_CENSEURS_PAR_CYCLE.lycee 
          : DEMO_CENSEURS_PAR_CYCLE.college;
        userNom = cen.nom;
        userEmail = cen.email;
        finalCycleId = cen.cycle_id;
        userPhone = '+228 90 00 00 03';
      } else if (selectedSubRole === 'caisse') {
        targetDashboard = 'dashboard-caisse';
        userNom = DEMO_ACCOUNTS.caisse.nom;
        userEmail = DEMO_ACCOUNTS.caisse.email;
        finalCycleId = 'all';
        userPhone = '+228 90 00 00 04';
      } else if (selectedSubRole === 'professeur') {
        targetDashboard = 'dashboard-professeur';
        if (selectedCycleId === 'lycee') {
          userNom = DEMO_PROF_AWA.nom;
          userEmail = DEMO_PROF_AWA.email;
          finalCycleId = 'lycee';
          userPhone = '+228 90 00 00 06';
        } else {
          userNom = DEMO_ACCOUNTS.professeur.nom;
          userEmail = DEMO_ACCOUNTS.professeur.email;
          finalCycleId = 'primaire';
          userPhone = '+228 90 00 00 05';
        }
      }

      onLoginSuccess(selectedSubRole, targetDashboard, {
        nom: userNom,
        email: userEmail,
        cycle_id: finalCycleId,
        telephone: userPhone,
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 flex flex-col justify-between relative selection:bg-amber-500 selection:text-slate-950 transition-colors duration-300 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 w-full px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <img
            src="/logo-efa.png"
            alt="Logo EFA SCHOOL"
            className="w-10 h-10 object-contain drop-shadow-md rounded-md"
          />
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight block">
              EFA SCHOOL
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              by EFA TECHNOLOGIE
            </span>
          </div>
        </div>

        {/* Action Controls: Theme Switcher & Back Button */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Basculer Mode Clair / Sombre"
            title={theme === 'dark' ? "Passer en Mode Clair" : "Passer en Mode Sombre"}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 transition-colors cursor-pointer shadow-xs"
            >
              ← Retour
            </button>
          )}
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-6 my-auto">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-300 dark:shadow-black/80 text-center">
          
          {/* Centered Large Official Logo with Pulse */}
          <div className="flex flex-col items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
              <img
                src="/logo-efa.png"
                alt="Logo Officiel EFA SCHOOL"
                className="w-[100px] sm:w-[115px] h-[100px] sm:h-[115px] object-contain drop-shadow-2xl relative z-10"
              />
            </div>
            <p className="mt-2 text-xs sm:text-sm font-bold text-[#D4AF37] italic tracking-wide">
              « La technologie devient enfin facile »
            </p>
          </div>

          {/* Mode Switcher Tabs : Fondateur (Email+Pass) vs Equipe (Username+Pass) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-5 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthCategory('fondateur');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authCategory === 'fondateur'
                  ? 'bg-white dark:bg-slate-800 text-amber-800 dark:text-[#D4AF37] shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>👑 Fondateur (Email)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthCategory('equipe');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authCategory === 'equipe'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>👥 Direction / Profs</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 text-left">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: FONDATEUR (Email + Mot de Passe)                 */}
          {/* ======================================================== */}
          {authCategory === 'fondateur' && (
            <form onSubmit={handleSubmitFondateur} className="space-y-4 text-left text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
                <span className="font-bold block">Accès Administrateur Général (cycle_id = 'all')</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Authentification par Email officiel + Mot de passe sécurisé.</span>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Email du Fondateur :
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={fondateurEmail}
                    onChange={(e) => setFondateurEmail(e.target.value)}
                    placeholder="fondateur@efa.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Mot de passe :
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={fondateurPassword}
                    onChange={(e) => setFondateurPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>CONNEXION FONDATEUR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center pt-1">
                Demo : <code className="text-amber-600 dark:text-amber-400 font-mono">fondateur@efa.com</code> / <code className="text-amber-600 dark:text-amber-400 font-mono">admin123</code>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: AUTRES RÔLES (Username + Mot de Passe)           */}
          {/* ======================================================== */}
          {authCategory === 'equipe' && (
            <form onSubmit={handleSubmitEquipe} className="space-y-4 text-left text-xs">
              
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                  Sélectionnez votre fonction :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  
                  {/* Directeur */}
                  <button
                    type="button"
                    onClick={() => handleSelectSubRole('directeur')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                      selectedSubRole === 'directeur'
                        ? 'bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mb-0.5 text-blue-500" />
                    <span className="text-[11px]">Directeur</span>
                  </button>

                  {/* Censeur */}
                  <button
                    type="button"
                    onClick={() => handleSelectSubRole('censeur')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                      selectedSubRole === 'censeur'
                        ? 'bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Scale className="w-4 h-4 mb-0.5 text-purple-500" />
                    <span className="text-[11px]">Censeur</span>
                  </button>

                  {/* Caisse */}
                  <button
                    type="button"
                    onClick={() => handleSelectSubRole('caisse')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                      selectedSubRole === 'caisse'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mb-0.5 text-emerald-500" />
                    <span className="text-[11px]">Caisse</span>
                  </button>

                  {/* Professeur */}
                  <button
                    type="button"
                    onClick={() => handleSelectSubRole('professeur')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                      selectedSubRole === 'professeur'
                        ? 'bg-indigo-500/15 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mb-0.5 text-indigo-500" />
                    <span className="text-[11px]">Professeur</span>
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Nom d'utilisateur (Username) :
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={equipeUsername}
                    onChange={(e) => setEquipeUsername(e.target.value)}
                    placeholder="ex: directeur, censeur, caisse, koffi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Mot de passe :
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={equipePassword}
                    onChange={(e) => setEquipePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Cycle selection if applicable */}
              {(selectedSubRole === 'directeur' || selectedSubRole === 'censeur' || selectedSubRole === 'professeur') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      Cycle scolaire d'affectation :
                    </label>
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                      {selectedCycleId}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {(selectedSubRole === 'directeur' || selectedSubRole === 'professeur') && (
                      <button
                        type="button"
                        onClick={() => setSelectedCycleId('primaire')}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          selectedCycleId === 'primaire'
                            ? 'bg-amber-500/20 text-amber-800 dark:text-[#D4AF37] border-amber-500'
                            : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        🎒 Primaire
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedCycleId('college')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        selectedCycleId === 'college'
                          ? 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500'
                          : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      📘 Collège
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedCycleId('lycee')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        selectedCycleId === 'lycee'
                          ? 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500'
                          : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      🎓 Lycée
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>SE CONNECTER ({selectedSubRole.toUpperCase()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-400 text-center pt-1">
                Identifiants : <code className="text-blue-500 font-mono">directeur</code> · <code className="text-purple-500 font-mono">censeur</code> · <code className="text-emerald-500 font-mono">caisse</code> · <code className="text-indigo-500 font-mono">koffi</code> (Pass: <code className="font-mono">admin123</code>)
              </div>
            </form>
          )}

          {/* Golden Rules Reminder */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center space-y-0.5">
            <span className="block font-medium">Matrice de Sécurité EFA V3 Active :</span>
            <span className="block text-[10px]">Caisse bloqué Notes · Prof bloqué Finances · Censeur sans encaissement direct · Fondateur total</span>
          </div>

        </div>
      </main>

      {/* Footer Official Mention */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800/60">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          © 2026 EFA TECHNOLOGIE - Lomé, Togo
        </span>
      </footer>

    </div>
  );
};
