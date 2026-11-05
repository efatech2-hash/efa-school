import React, { useState } from 'react';
import { X, Calendar, Check, Send, Phone, Clock, Users, ShieldCheck } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Eleve, AppelRecordJour, SessionType } from '../types';
import { getSessionFromClasseNom } from '../data/matieres_par_classe';
import { useRole } from '../hooks/useRole';

interface SaisieAppelModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClassId?: string;
  isPrimaryTeacher?: boolean;
}

export const SaisieAppelModal: React.FC<SaisieAppelModalProps> = ({
  isOpen,
  onClose,
  initialClassId,
  isPrimaryTeacher = false,
}) => {
  const { classes, eleves, updateEleve, saveAppelJour, parametres } = useSchool();
  const { user, role } = useRole();

  // If primary teacher, auto select his assigned class
  const assignedClassName = user.classesAssignees?.[0];
  const assignedClassObj = classes.find(c => c.nom === assignedClassName);

  const defaultClassId = isPrimaryTeacher && assignedClassObj 
    ? assignedClassObj.id 
    : (initialClassId || classes[0]?.id || '');

  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statuses, setStatuses] = useState<Record<string, 'Présent' | 'Absent' | 'Retard'>>({});
  const [motifs, setMotifs] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentClass = classes.find(c => c.id === selectedClassId);
  const classStudents = eleves.filter(e => e.classeId === selectedClassId);
  const session: SessionType = currentClass?.session || getSessionFromClasseNom(currentClass?.nom || '');

  const getStatus = (eleveId: string) => {
    return statuses[eleveId] || 'Présent';
  };

  const handleToggleStatus = (eleveId: string, status: 'Présent' | 'Absent' | 'Retard') => {
    setStatuses(prev => ({
      ...prev,
      [eleveId]: status,
    }));
  };

  const handleMotifChange = (eleveId: string, motif: string) => {
    setMotifs(prev => ({
      ...prev,
      [eleveId]: motif,
    }));
  };

  const presentsCount = classStudents.filter(e => getStatus(e.id) === 'Présent').length;
  const absentsCount = classStudents.filter(e => getStatus(e.id) === 'Absent').length;
  const retardsCount = classStudents.filter(e => getStatus(e.id) === 'Retard').length;

  const handleEnvoyerDirection = () => {
    if (!currentClass) return;

    // 1. Update individual student presence history
    classStudents.forEach(el => {
      const st = statuses[el.id] || 'Présent';
      const motif = motifs[el.id];
      const newRecord = {
        date,
        statut: st,
        motif: st !== 'Présent' ? motif : undefined,
        justifie: st === 'Présent',
      };
      const updatedPresences = [newRecord, ...(el.presences || []).slice(0, 20)];
      updateEleve({
        ...el,
        presences: updatedPresences,
      });
    });

    // 2. Build official AppelRecordJour for Direction
    const now = new Date();
    const heure = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const absentsList = classStudents
      .filter(e => getStatus(e.id) === 'Absent' || getStatus(e.id) === 'Retard')
      .map(e => ({
        eleveId: e.id,
        nomComplet: `${e.nom} ${e.prenom}`,
        matricule: e.matricule,
        statut: getStatus(e.id) as 'Absent' | 'Retard',
        motif: motifs[e.id],
      }));

    const record: AppelRecordJour = {
      id: `appel-${currentClass.id}-${date}-${Date.now().toString(36)}`,
      date,
      heureEnvoi: heure,
      classeId: currentClass.id,
      classeNom: currentClass.nom,
      professeurNom: user.nom || 'Enseignant Titulaire',
      session,
      totalEleves: classStudents.length,
      totalPresents: presentsCount,
      totalAbsents: absentsCount,
      totalRetards: retardsCount,
      absents: absentsList,
    };

    saveAppelJour(record);

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Feuille d'Appel Pédagogique
                </h3>
                {isPrimaryTeacher && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase">
                    🎒 Primaire
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pointage de présence avec transmission directe et instantanée à la Direction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 font-bold animate-bounce">
              <Check className="w-5 h-5" />
              <span>Appel transmis avec succès à la Direction ! Les absents sont visibles en temps réel.</span>
            </div>
          )}

          {/* Selectors Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                Classe
              </label>
              {isPrimaryTeacher ? (
                <div className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-black text-amber-600 dark:text-amber-400 text-xs flex items-center justify-between">
                  <span>Classe de {currentClass?.nom || assignedClassName || 'Primaire'}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">🔒 Classe unique</span>
                </div>
              ) : (
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                Date de la séance
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Quick Counter */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Présents</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg">{presentsCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Absents</span>
              <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-lg">{absentsCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Retards</span>
              <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-lg">{retardsCount}</span>
            </div>
          </div>

          {/* Students Roll Call List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 text-[10px] uppercase font-bold">
                <tr>
                  <th className="py-2.5 px-3">Élève</th>
                  <th className="py-2.5 px-3 text-center">Statut d'Appel</th>
                  <th className="py-2.5 px-3">Motif (si absence / retard)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {classStudents.map(el => {
                  const currentSt = getStatus(el.id);

                  return (
                    <tr key={el.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{el.nom} {el.prenom}</span>
                        <span className="text-[10px] font-mono text-slate-400">{el.matricule}</span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(el.id, 'Présent')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              currentSt === 'Présent'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Présent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(el.id, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              currentSt === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(el.id, 'Retard')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                              currentSt === 'Retard'
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Retard
                          </button>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {currentSt !== 'Présent' ? (
                          <input
                            type="text"
                            placeholder="Ex: Paludisme, voyage..."
                            value={motifs[el.id] || ''}
                            onChange={e => handleMotifChange(el.id, e.target.value)}
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with "Envoyer à Direction" */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer font-semibold"
          >
            Fermer
          </button>
          
          <button
            type="button"
            onClick={handleEnvoyerDirection}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-2 transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>📤 Envoyer à Direction</span>
          </button>
        </div>

      </div>
    </div>
  );
};
