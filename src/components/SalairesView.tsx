import React, { useState } from 'react';
import { 
  Briefcase, DollarSign, CheckCircle, Download, 
  Printer, ArrowRight, ShieldCheck, Lock, Plus, 
  Check, FileCheck, AlertTriangle 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { formatFCFA } from '../utils/formatters';
import { UserRole, UserSession } from '../types/auth';

interface SalairesViewProps {
  currentRole?: UserRole;
  user?: UserSession;
  onUnauthorizedAttempt?: (msg: string) => void;
}

export const SalairesView: React.FC<SalairesViewProps> = ({
  currentRole = 'fondateur',
  user,
  onUnauthorizedAttempt,
}) => {
  const { enseignants, classes } = useSchool();
  const [mois, setMois] = useState('Octobre 2025');
  const [signedSalaries, setSignedSalaries] = useState<Record<string, boolean>>({
    'ens-1': true,
  });
  const [isNewSalaryModalOpen, setIsNewSalaryModalOpen] = useState(false);

  // New salary form
  const [selectedProfId, setSelectedProfId] = useState(enseignants[0]?.id || '');
  const [nouveauMontant, setNouveauMontant] = useState('280000');
  const [prime, setPrime] = useState('25000');

  // FILTERING FOR PROFESSOR: Prof=Voir MON salaire uniquement !
  const isProf = currentRole === 'professeur';
  const displayedEnseignants = isProf
    ? enseignants.filter(ens => 
        (user?.email && ens.email?.toLowerCase() === user.email.toLowerCase()) ||
        (user?.nom && ens.nom?.toLowerCase().includes(user.nom.toLowerCase()))
      )
    : enseignants;

  const totalMasseSalariale = displayedEnseignants.reduce((acc, ens) => acc + (ens.salaireMensuel || 0), 0);

  const handleOpenCreateSalary = () => {
    // RÈGLE D'OR EN DUR : if action=='create-salary' && role!='Fondateur' => FORBIDDEN
    if (currentRole !== 'fondateur') {
      if (onUnauthorizedAttempt) {
        onUnauthorizedAttempt("Action Interdite : Seul le Fondateur a le pouvoir de créer ou approuver un salaire.");
      }
      return;
    }
    setIsNewSalaryModalOpen(true);
  };

  const handleSigneDecharge = (ensId: string) => {
    setSignedSalaries(prev => ({
      ...prev,
      [ensId]: true,
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {isProf ? "Mon Émolument & Fiche de Paie Personnelle" : "Gestion des Salaires & États de Paie"}
            </span>
            {currentRole === 'fondateur' ? (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                👑 Fondateur : Création, Dépôt & Approbation
              </span>
            ) : currentRole === 'caisse' ? (
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                💰 Caisse : Remise d'Enveloppe & Signature
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-300 dark:border-slate-700">
                🔒 Lecture Seule (Règle d'or V2)
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
            {isProf ? `Bulletin de Paie · ${user?.nom || 'Enseignant'}` : "Livre de Paie & Rémunérations EFA SCHOOL"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isProf
              ? "Consultation de votre salaire de base, primes pédagogiques et décharge d'émargement."
              : `Masse salariale active : ${formatFCFA(totalMasseSalariale)} · ${displayedEnseignants.length} enseignants au registre.`
            }
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-amber-300 font-bold focus:outline-hidden focus:border-amber-500"
          >
            <option value="Septembre 2025">Septembre 2025</option>
            <option value="Octobre 2025">Octobre 2025</option>
            <option value="Novembre 2025">Novembre 2025</option>
          </select>

          {currentRole === 'fondateur' && (
            <button
              onClick={handleOpenCreateSalary}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Créer / Déposer Salaire</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Bulletins</span>
          </button>
        </div>
      </div>

      {/* Teachers Salary Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading uppercase tracking-wider">
            État Mensuel des Émoluments ({mois})
          </h3>
          <span className="text-xs font-mono font-bold text-amber-700 dark:text-[#D4AF37]">
            Total : {formatFCFA(totalMasseSalariale)}
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-slate-50 dark:bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-bold">Enseignant</th>
                <th className="py-2.5 px-3 font-bold">Titre & Matière</th>
                <th className="py-2.5 px-3 font-bold">Classes</th>
                <th className="py-2.5 px-3 text-right font-bold">Salaire Net</th>
                <th className="py-2.5 px-3 text-center font-bold">Décharge & Signature</th>
                <th className="py-2.5 px-3 text-center font-bold">Bulletin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {displayedEnseignants.map(ens => {
                const assigned = classes.filter(c => ens.classesIds?.includes(c.id));
                const isSigned = signedSalaries[ens.id];

                return (
                  <tr key={ens.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      <span>{ens.nom} {ens.prenom}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{ens.telephone}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <span>{ens.titre || "Enseignant titulaire"}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 block">{ens.matieres?.join(', ') || 'Programme général'}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {assigned.map(c => (
                          <span key={c.id} className="px-1.5 py-0.5 rounded-sm bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-semibold">
                            {c.nom}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatFCFA(ens.salaireMensuel)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isSigned ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          <span>Émargé / Remis</span>
                        </span>
                      ) : (
                        currentRole === 'caisse' || currentRole === 'fondateur' ? (
                          <button
                            onClick={() => handleSigneDecharge(ens.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors cursor-pointer shadow-xs"
                          >
                            Remettre Enveloppe
                          </button>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            En attente de signature
                          </span>
                        )
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer font-semibold"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Fiche</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {displayedEnseignants.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Aucun salaire enregistré pour ce profil.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création Salaire - Réservé Fondateur */}
      {isNewSalaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Créer & Approuver un Salaire (Fondateur Uniquement)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Conformément à la règle d'or V2, seul le Fondateur est habilité à ordonnancer et créer un bulletin de paie.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Enseignant / Employé</label>
                <select
                  value={selectedProfId}
                  onChange={(e) => setSelectedProfId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                >
                  {enseignants.map(ens => (
                    <option key={ens.id} value={ens.id}>{ens.nom} {ens.prenom} ({ens.titre})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Salaire de Base (F CFA)</label>
                <input
                  type="number"
                  value={nouveauMontant}
                  onChange={(e) => setNouveauMontant(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Primes & Indemnités (F CFA)</label>
                <input
                  type="number"
                  value={prime}
                  onChange={(e) => setPrime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewSalaryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => setIsNewSalaryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Approuver & Ordonnancer Paie
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
