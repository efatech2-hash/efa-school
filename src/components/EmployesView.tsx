import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, Eye, EyeOff, Lock, Unlock, 
  Trash2, Edit3, Phone, CheckCircle, AlertTriangle, 
  Search, ShieldAlert, Sparkles, BookOpen, Wallet, Crown, Briefcase
} from 'lucide-react';
import { Employe, EmployeRole, EmployeStatut, getStoredEmployes, saveStoredEmployes } from '../types/employes';
import { UserRole, CycleId } from '../types/auth';
import { useSchool } from '../context/SchoolContext';

interface EmployesViewProps {
  currentRole: UserRole;
  onUnauthorizedAttempt?: (msg: string) => void;
}

export const EmployesView: React.FC<EmployesViewProps> = ({ currentRole, onUnauthorizedAttempt }) => {
  const { classes } = useSchool();
  const [employes, setEmployes] = useState<Employe[]>(() => getStoredEmployes());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'tous' | EmployeRole>('tous');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  
  // Notification / Toast
  const [notification, setNotification] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null);

  // Form Fields
  const [formNom, setFormNom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<EmployeRole>('professeur');
  const [formCycle, setFormCycle] = useState<CycleId>('lycee');
  const [formTelephone, setFormTelephone] = useState('');
  const [formPin, setFormPin] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [formClasses, setFormClasses] = useState<string[]>([]);
  const [formMatieres, setFormMatieres] = useState<string>('');
  const [formSalaire, setFormSalaire] = useState<number>(250000);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const togglePinReveal = (id: string) => {
    setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleStatut = (emp: Employe) => {
    if (emp.role === 'fondateur') {
      showNotice('Impossible de bloquer le compte Fondateur');
      return;
    }

    if (currentRole === 'directeur') {
      // Directeur can propose
      showNotice(`Demande de blocage/déblocage pour "${emp.nom}" transmise au Fondateur`);
      return;
    }

    const nextStatut: EmployeStatut = emp.statut === 'actif' ? 'bloque' : 'actif';
    const updated = employes.map(e => e.id === emp.id ? { ...e, statut: nextStatut } : e);
    setEmployes(updated);
    saveStoredEmployes(updated);
    showNotice(nextStatut === 'bloque' 
      ? `Compte de ${emp.nom} BLOQUÉ avec succès` 
      : `Compte de ${emp.nom} RÉACTIVÉ avec succès`
    );
  };

  const handleDelete = (emp: Employe) => {
    if (emp.role === 'fondateur') {
      showNotice('Le compte Fondateur ne peut pas être supprimé');
      return;
    }

    if (currentRole === 'directeur') {
      showNotice(`Demande de suppression pour "${emp.nom}" soumise au Fondateur pour validation`);
      return;
    }

    if (confirm(`Confirmez-vous la suppression définitive du compte de ${emp.nom} ?`)) {
      const updated = employes.filter(e => e.id !== emp.id);
      setEmployes(updated);
      saveStoredEmployes(updated);
      showNotice(`Employé ${emp.nom} supprimé du registre`);
    }
  };

  const openAddModal = () => {
    setEditingEmploye(null);
    setFormNom('');
    setFormEmail('');
    setFormRole('professeur');
    setFormCycle('lycee');
    setFormTelephone('+228 ');
    setFormPin(String(Math.floor(1000 + Math.random() * 9000)));
    setFormClasses([]);
    setFormMatieres('Maths');
    setFormSalaire(250000);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employe) => {
    setEditingEmploye(emp);
    setFormNom(emp.nom);
    setFormEmail(emp.email);
    setFormRole(emp.role);
    setFormCycle(emp.cycle_id || 'lycee');
    setFormTelephone(emp.telephone);
    setFormPin(emp.pin);
    setFormClasses(emp.classesAssignees || []);
    setFormMatieres((emp.matieres || []).join(', '));
    setFormSalaire(emp.salaireBase || 250000);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim()) return;

    const parsedMatieres = formMatieres
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    const targetCycle: CycleId = formRole === 'fondateur' ? 'all' : formCycle;

    if (editingEmploye) {
      const updated = employes.map(e => {
        if (e.id === editingEmploye.id) {
          return {
            ...e,
            nom: formNom,
            email: formEmail || `${formNom.toLowerCase().replace(/\s+/g, '')}@efa.com`,
            role: formRole,
            cycle_id: targetCycle,
            telephone: formTelephone,
            pin: formPin,
            classesAssignees: formClasses,
            matieres: parsedMatieres,
            salaireBase: formSalaire,
          };
        }
        return e;
      });
      setEmployes(updated);
      saveStoredEmployes(updated);
      showNotice(`Informations de ${formNom} mises à jour`);
    } else {
      const newEmp: Employe = {
        id: `emp-${Date.now().toString(36)}`,
        nom: formNom,
        email: formEmail || `${formNom.toLowerCase().replace(/\s+/g, '')}@efa.com`,
        role: formRole,
        cycle_id: targetCycle,
        pin: formPin,
        telephone: formTelephone,
        statut: 'actif',
        classesAssignees: formClasses,
        matieres: parsedMatieres,
        dateEmbauche: new Date().toISOString().split('T')[0],
        salaireBase: formSalaire,
      };
      const updated = [...employes, newEmp];
      setEmployes(updated);
      saveStoredEmployes(updated);
      showNotice(`Nouvel employé "${formNom}" enregistré avec le PIN ${formPin}`);
    }

    setIsModalOpen(false);
  };

  const filteredEmployes = employes.filter(emp => {
    const matchesSearch = 
      emp.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.telephone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (emp.email && emp.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'tous' || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] border border-[#D4AF37] text-white px-5 py-3 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-[#D4AF37] border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Gestion des Employés & Codes PIN EFA SCHOOL
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Attribution des rôles, affectations pédagogiques, PINs de connexion rapide et contrôle des accès.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] dark:bg-amber-500 text-amber-400 dark:text-slate-950 font-bold text-xs shadow-md hover:bg-slate-800 dark:hover:bg-amber-400 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Ajouter un Employé</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['tous', 'fondateur', 'directeur', 'caisse', 'professeur'] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                filterRole === r
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r === 'tous' ? 'Tous les rôles' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployes.map((emp) => {
          const isRevealed = revealedPins[emp.id];
          const isBloque = emp.statut === 'bloque';

          return (
            <div
              key={emp.id}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isBloque
                  ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 opacity-90'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#D4AF37]/50'
              }`}
            >
              <div>
                {/* Top Badge: Role + Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    emp.role === 'fondateur'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-[#D4AF37] border-amber-500/30'
                      : emp.role === 'directeur'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                      : emp.role === 'caisse'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                  }`}>
                    {emp.role === 'fondateur' && <Crown className="w-3.5 h-3.5" />}
                    {emp.role === 'directeur' && <Briefcase className="w-3.5 h-3.5" />}
                    {emp.role === 'caisse' && <Wallet className="w-3.5 h-3.5" />}
                    {emp.role === 'professeur' && <BookOpen className="w-3.5 h-3.5" />}
                    <span className="uppercase">{emp.role}</span>
                  </span>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    isBloque
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {isBloque ? '⛔ Bloqué' : '✓ Actif'}
                  </span>
                </div>

                {/* Name & Phone */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {emp.nom}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span>{emp.telephone}</span>
                  {emp.email && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[150px]">{emp.email}</span>
                    </>
                  )}
                </div>

                {/* PIN Code Box (Password style with toggle) */}
                <div className="mt-4 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Code PIN Connexion :
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-widest">
                      {isRevealed ? emp.pin : '••••'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePinReveal(emp.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    title={isRevealed ? "Masquer le PIN" : "Afficher le PIN"}
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Classes & Subjects */}
                {emp.role === 'professeur' && (
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Classes:</span>
                      {emp.classesAssignees && emp.classesAssignees.length > 0 ? (
                        emp.classesAssignees.map(c => (
                          <span key={c} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-[#D4AF37] font-bold text-[10px]">
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Aucune</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Matières:</span>
                      {emp.matieres && emp.matieres.length > 0 ? (
                        emp.matieres.map(m => (
                          <span key={m} className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
                            {m}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Toutes</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Bloquer/Débloquer, Modifier, Supprimer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatut(emp)}
                  disabled={emp.role === 'fondateur'}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                    isBloque
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
                  }`}
                  title={currentRole === 'directeur' ? "Proposer blocage au Fondateur" : undefined}
                >
                  {isBloque ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Débloquer</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Bloquer</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(emp)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Modifier employé"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(emp)}
                    disabled={emp.role === 'fondateur'}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title={currentRole === 'directeur' ? "Demander suppression au Fondateur" : "Supprimer employé"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal: Ajouter / Modifier un employé */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                {editingEmploye ? `Modifier : ${editingEmploye.nom}` : "Ajouter un Nouvel Employé"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nom Complet & Titre *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Koffi ADANGBE"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle de l'Employé *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as EmployeRole)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#D4AF37]"
                  >
                    <option value="directeur">👔 Directeur</option>
                    <option value="caisse">💰 Caisse & Finances</option>
                    <option value="professeur">📚 Professeur</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Code PIN (4 chiffres) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={formPin}
                      onChange={(e) => setFormPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold tracking-widest text-center focus:outline-hidden focus:border-[#D4AF37]"
                    />
                    <button
                      type="button"
                      onClick={() => setFormPin(String(Math.floor(1000 + Math.random() * 9000)))}
                      className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-[#D4AF37] border border-amber-500/30 text-[10px] font-bold whitespace-nowrap cursor-pointer hover:bg-amber-500/20"
                    >
                      Générer
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+228 90 00 00 00"
                    value={formTelephone}
                    onChange={(e) => setFormTelephone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Institutionnel
                  </label>
                  <input
                    type="email"
                    placeholder="nom@efa.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {formRole === 'professeur' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Classes Assignées (Multi-sélection)
                    </label>
                    <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-28 overflow-y-auto">
                      {classes.map(c => {
                        const isSelected = formClasses.includes(c.nom);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFormClasses(formClasses.filter(x => x !== c.nom));
                              } else {
                                setFormClasses([...formClasses, c.nom]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-600'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                            }`}
                          >
                            {isSelected ? `✓ ${c.nom}` : `+ ${c.nom}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Matières Enseignées (séparées par une virgule)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Mathématiques, PCT, Français"
                      value={formMatieres}
                      onChange={(e) => setFormMatieres(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>
                </>
              )}

              {currentRole === 'fondateur' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Salaire Mensuel de Base (FCFA) - 🔒 Confidentiel Fondateur
                  </label>
                  <input
                    type="number"
                    value={formSalaire}
                    onChange={(e) => setFormSalaire(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-400 text-slate-950 font-black cursor-pointer shadow-md"
                >
                  {editingEmploye ? "Mettre à Jour" : "Enregistrer l'Employé"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
