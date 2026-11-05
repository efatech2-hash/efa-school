import React, { useState } from 'react';
import { 
  Scale, AlertTriangle, ShieldAlert, CheckCircle2, 
  Clock, Plus, UserX, UserCheck, Check, ArrowRight, 
  FileText, Calendar 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole, UserSession } from '../types/auth';
import { IncidentDisciplineRecord, AbsenceProfRecord } from '../types';

interface DisciplineViewProps {
  currentRole: UserRole;
  user: UserSession;
  activeSubTab?: 'discipline' | 'absences-profs';
}

export const DisciplineView: React.FC<DisciplineViewProps> = ({
  currentRole,
  user,
  activeSubTab = 'discipline',
}) => {
  const { 
    classes, 
    eleves, 
    incidentsDiscipline, 
    addIncidentDiscipline, 
    validerSanctionProviseur,
    absencesProfs,
    signalerAbsenceProf,
    assignerRemplacementProf,
    enseignants,
  } = useSchool();

  const [mainTab, setMainTab] = useState<'discipline' | 'absences'>(
    activeSubTab === 'absences-profs' ? 'absences' : 'discipline'
  );

  // Modal Incident state
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState(eleves[0]?.id || '');
  const [gravite, setGravite] = useState<'Mineur' | 'Moyen' | 'Grave' | 'Conseil de discipline'>('Mineur');
  const [descriptionIncident, setDescriptionIncident] = useState('');
  const [sanctionProposee, setSanctionProposee] = useState('');

  // Modal Absence Prof state
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [motifAbsence, setMotifAbsence] = useState('');

  // Modal Remplacement state
  const [targetAbsenceId, setTargetAbsenceId] = useState<string | null>(null);
  const [selectedRemplacant, setSelectedRemplacant] = useState(enseignants[0]?.nom || '');

  // Modal Exclusion Proviseur state
  const [targetIncidentForExclusion, setTargetIncidentForExclusion] = useState<string | null>(null);
  const [decisionProviseur, setDecisionProviseur] = useState('Exclusion de 3 jours validée par le Proviseur.');

  // Roles permissions
  const canReportIncident = currentRole === 'professeur' || currentRole === 'censeur' || currentRole === 'directeur' || currentRole === 'fondateur';
  const canManageSanctions = currentRole === 'censeur' || currentRole === 'directeur' || currentRole === 'fondateur';
  const canValidateExclusion = currentRole === 'directeur' || currentRole === 'fondateur'; // PROVISEUR VALIDE EXCLUSIONS !
  const canManageReplacements = currentRole === 'censeur' || currentRole === 'directeur' || currentRole === 'fondateur';

  // Filter lists by user cycle
  const filteredIncidents = incidentsDiscipline.filter(inc => {
    if (user.cycle_id !== 'all' && inc.cycle_id !== user.cycle_id) return false;
    return true;
  });

  const filteredAbsences = absencesProfs.filter(abs => {
    if (user.cycle_id !== 'all' && abs.cycle_id !== user.cycle_id) return false;
    return true;
  });

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = eleves.find(el => el.id === targetStudentId);
    if (!st || !descriptionIncident) return;

    const parentCls = classes.find(c => c.id === st.classeId);
    const cycle = parentCls?.session || user.cycle_id;

    addIncidentDiscipline({
      date: new Date().toISOString().split('T')[0],
      eleveId: st.id,
      eleveNom: `${st.nom} ${st.prenom}`,
      classeNom: parentCls?.nom || 'Classe',
      cycle_id: cycle === 'all' ? 'college' : cycle,
      professeurNom: user.nom,
      gravite,
      description: descriptionIncident,
      sanction: sanctionProposee || undefined,
      valideParProviseur: gravite === 'Mineur',
    });

    setIsIncidentModalOpen(false);
    setDescriptionIncident('');
    setSanctionProposee('');
  };

  const handleAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateDebut || !motifAbsence) return;

    signalerAbsenceProf({
      dateDebut,
      dateFin: dateFin || dateDebut,
      professeurNom: user.nom,
      emailProf: user.email,
      motif: motifAbsence,
      cycle_id: user.cycle_id === 'all' ? 'college' : user.cycle_id,
    });

    setIsAbsenceModalOpen(false);
    setDateDebut('');
    setDateFin('');
    setMotifAbsence('');
  };

  const handleConfirmRemplacement = () => {
    if (!targetAbsenceId || !selectedRemplacant) return;
    assignerRemplacementProf(targetAbsenceId, selectedRemplacant);
    setTargetAbsenceId(null);
  };

  const handleConfirmExclusion = () => {
    if (!targetIncidentForExclusion || !decisionProviseur) return;
    validerSanctionProviseur(targetIncidentForExclusion, decisionProviseur);
    setTargetIncidentForExclusion(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Vie Scolaire & Discipline EFA
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Cycle : {user.cycle_id.toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Discipline, Conseils & Suppléances Enseignants
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Matrice officielle : Signalement par les professeurs, instruction des sanctions par le Censeur, et validation solennelle des exclusions par le Proviseur.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {canReportIncident && (
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Signaler Incident Élève</span>
            </button>
          )}

          {currentRole === 'professeur' && (
            <button
              onClick={() => setIsAbsenceModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <UserX className="w-4 h-4 text-slate-950" />
              <span>Signaler mon Absence</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setMainTab('discipline')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'discipline'
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          ⚖️ Incidents & Sanctions ({filteredIncidents.length})
        </button>

        <button
          onClick={() => setMainTab('absences')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            mainTab === 'absences'
              ? 'bg-amber-500/15 text-amber-800 dark:text-[#D4AF37] border border-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          👥 Absences Profs & Remplacements ({filteredAbsences.length})
        </button>
      </div>

      {/* 1. DISCIPLINE & SANCTIONS */}
      {mainTab === 'discipline' && (
        <div className="space-y-4">
          {filteredIncidents.map(inc => (
            <div
              key={inc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    inc.gravite === 'Grave' || inc.gravite === 'Conseil de discipline'
                      ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40'
                      : inc.gravite === 'Moyen'
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    Gravité : {inc.gravite}
                  </span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {inc.eleveNom} ({inc.classeNom})
                  </span>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  Signalé le {inc.date} par {inc.professeurNom}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {inc.description}
              </p>

              {inc.sanction && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-800 dark:text-white block mb-0.5">Sanction / Mesure :</span>
                  <p className="text-slate-600 dark:text-slate-400">{inc.sanction}</p>
                </div>
              )}

              {/* Status and Proviseur Validation Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  {inc.valideParProviseur ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{inc.decisionProviseur || "Exclusion / Décision formellement validée par le Proviseur"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                      <Clock className="w-4 h-4" />
                      <span>En attente de validation par le Proviseur (Direction)</span>
                    </span>
                  )}
                </div>

                {canValidateExclusion && !inc.valideParProviseur && (
                  <button
                    onClick={() => setTargetIncidentForExclusion(inc.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Valider Sanction / Exclusion (Proviseur)</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredIncidents.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              Aucun incident disciplinaire signalé dans ce cycle.
            </div>
          )}
        </div>
      )}

      {/* 2. ABSENCES PROFS & REMPLACEMENTS */}
      {mainTab === 'absences' && (
        <div className="space-y-4">
          {filteredAbsences.map(abs => (
            <div
              key={abs.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <UserX className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {abs.professeurNom}
                    </h4>
                    <span className="text-[10px] text-slate-500">{abs.emailProf}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500">
                    Du {abs.dateDebut} au {abs.dateFin}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    abs.statut === 'Remplacement assigné'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                  }`}>
                    {abs.statut}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">Motif de l'absence : </strong>
                <span>{abs.motif}</span>
              </div>

              {abs.remplacantNom && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Professeur suppléant désigné par le Censeur : <strong className="text-emerald-800 dark:text-emerald-300">{abs.remplacantNom}</strong>
                  </span>
                </div>
              )}

              {canManageReplacements && !abs.remplacantNom && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setTargetAbsenceId(abs.id);
                      setSelectedRemplacant(enseignants[0]?.nom || '');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assigner un Remplacement (Censeur)</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredAbsences.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              Aucune absence d'enseignant enregistrée.
            </div>
          )}
        </div>
      )}

      {/* Modal Signaler Incident */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Signaler un Incident Disciplinaire
            </h3>

            <form onSubmit={handleIncidentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Élève concerné</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                >
                  {eleves.map(el => {
                    const c = classes.find(cls => cls.id === el.classeId);
                    return (
                      <option key={el.id} value={el.id}>
                        {el.nom} {el.prenom} ({c?.nom || 'Classe'}) · {el.matricule}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Niveau de gravité</label>
                <select
                  value={gravite}
                  onChange={(e) => setGravite(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
                >
                  <option value="Mineur">Mineur (Bavardage, oubli manuel)</option>
                  <option value="Moyen">Moyen (Insolence, tricherie)</option>
                  <option value="Grave">Grave (Bagarre, dégradation, insulte)</option>
                  <option value="Conseil de discipline">Conseil de discipline (Exclusion temporaire/définitive)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Description précise des faits</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Circonstances, témoins, propos ou actes..."
                  value={descriptionIncident}
                  onChange={(e) => setDescriptionIncident(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Sanction ou mesure proposée</label>
                <input
                  type="text"
                  placeholder="Ex: Retenue, devoir supplémentaire, exclusion 2 jours..."
                  value={sanctionProposee}
                  onChange={(e) => setSanctionProposee(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Transmettre au Censeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Signaler Absence Prof */}
      {isAbsenceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Signaler une Absence Enseignant
            </h3>

            <form onSubmit={handleAbsenceSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Date Début</label>
                  <input
                    type="date"
                    required
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Date Fin (inclus)</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Motif de l'absence</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Raison médicale, convocation pédagogique, cas de force majeure..."
                  value={motifAbsence}
                  onChange={(e) => setMotifAbsence(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAbsenceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Transmettre au Censeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Censeur Assigner Remplacement */}
      {targetAbsenceId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Désigner un Professeur Suppléant (Censeur)
            </h3>
            <p className="text-xs text-slate-500">
              Sélectionnez l'enseignant titulaire ou vacataire chargé d'assurer la continuité des cours.
            </p>

            <div className="text-xs space-y-2">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold">Professeur Remplaçant</label>
              <select
                value={selectedRemplacant}
                onChange={(e) => setSelectedRemplacant(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold"
              >
                {enseignants.map(ens => (
                  <option key={ens.id} value={ens.nom}>
                    {ens.nom} {ens.prenom} ({ens.matieres.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTargetAbsenceId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRemplacement}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Confirmer l'affectation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Proviseur Validation Exclusion */}
      {targetIncidentForExclusion && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Validation Officielle par le Proviseur (Direction)
            </h3>
            <p className="text-xs text-slate-500">
              Selon le règlement officiel, seul le Proviseur / Directeur a compétence pour valider une mesure d'exclusion ou de convocation en conseil de discipline.
            </p>

            <div className="text-xs space-y-2">
              <label className="block text-slate-600 dark:text-slate-400 font-semibold">Décision exécutoire du Proviseur</label>
              <textarea
                rows={3}
                value={decisionProviseur}
                onChange={(e) => setDecisionProviseur(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setTargetIncidentForExclusion(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmExclusion}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Signer & Rendre Exécutoire
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
