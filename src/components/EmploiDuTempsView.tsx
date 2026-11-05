import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, Users, Download, Printer, Edit3, RotateCcw, Check, Sparkles } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types/auth';

interface EmploiDuTempsViewProps {
  currentRole?: UserRole;
}

const DEFAULT_SCHEDULE_GRID: Record<string, string[]> = {
  '08h00 - 10h00': [
    'Mathématiques (Prof Koffi)',
    'Français / Grammaire',
    'Mathématiques (Prof Koffi)',
    'Sciences & SVT',
    'Histoire & Géographie',
    'Éducation Physique (EPS)',
  ],
  '10h15 - 12h15': [
    'Lecture & Dictée',
    'Sciences Physiques',
    'Anglais LV1',
    'Mathématiques',
    'Expression Écrite',
    'Activités Pratiques',
  ],
  '15h00 - 17h00': [
    'Sciences de la Vie (SVT)',
    'Étude Dirigée',
    'Devoir Surveillé',
    'Philosophie / Éveil',
    'Travaux Pratiques',
    'Libre / Activités Club',
  ],
};

export const EmploiDuTempsView: React.FC<EmploiDuTempsViewProps> = ({ currentRole }) => {
  const { classes } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    '08h00 - 10h00',
    '10h15 - 12h15',
    '15h00 - 17h00',
  ];

  // Load custom schedule or fallback to default
  const [scheduleGrid, setScheduleGrid] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem(`efa_edt_${selectedClassId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_SCHEDULE_GRID;
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`efa_edt_${selectedClassId}`);
      if (stored) {
        setScheduleGrid(JSON.parse(stored));
      } else {
        setScheduleGrid(DEFAULT_SCHEDULE_GRID);
      }
    } catch {
      setScheduleGrid(DEFAULT_SCHEDULE_GRID);
    }
    setIsEditing(false);
  }, [selectedClassId]);

  const canManageSchedule = currentRole === 'censeur' || currentRole === 'fondateur' || currentRole === 'directeur';

  const handleCellChange = (slot: string, dayIndex: number, value: string) => {
    setScheduleGrid(prev => {
      const currentList = prev[slot] ? [...prev[slot]] : [];
      currentList[dayIndex] = value;
      return {
        ...prev,
        [slot]: currentList,
      };
    });
  };

  const handleSaveSchedule = () => {
    try {
      localStorage.setItem(`efa_edt_${selectedClassId}`, JSON.stringify(scheduleGrid));
      setToastMsg("Emploi du temps enregistré et synchronisé avec succès !");
      setIsEditing(false);
      setTimeout(() => setToastMsg(null), 3000);
    } catch {
      setToastMsg("Erreur de sauvegarde locale");
    }
  };

  const handleResetSchedule = () => {
    setScheduleGrid(DEFAULT_SCHEDULE_GRID);
    try {
      localStorage.removeItem(`efa_edt_${selectedClassId}`);
    } catch {}
    setToastMsg("Emploi du temps rétabli aux valeurs officielles par défaut !");
    setIsEditing(false);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between shadow-md">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-amber-500 hover:text-amber-400 font-bold">×</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
              Emploi du Temps Académique
            </h2>
            {canManageSchedule && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                Gestion Censeur
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Planning officiel des cours, répartition horaire des matières et salles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-300 font-bold focus:outline-hidden focus:border-amber-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom} ({c.salle})</option>
            ))}
          </select>

          {/* Action buttons for Censeur and Admins */}
          {canManageSchedule && (
            <>
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistrer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetSchedule}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
                title="Rétablir la grille par défaut"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rétablir</span>
              </button>
            </>
          )}

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-900 dark:text-white font-heading">{selectedClass?.nom}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">· {selectedClass?.salle}</span>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono font-medium">
            Titulaire : {selectedClass?.enseignantPrincipal || 'Non assigné'}
          </span>
        </div>

        <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3 w-32 font-semibold">Horaires</th>
              {days.map(d => (
                <th key={d} className="py-2.5 px-3 font-semibold text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950/60">
            {timeSlots.map((slot) => (
              <tr key={slot} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                <td className="py-3 px-3 font-mono text-[11px] text-amber-700 dark:text-amber-400 font-bold bg-slate-50 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  {slot}
                </td>
                {scheduleGrid[slot]?.map((subject, dIdx) => (
                  <td key={dIdx} className="py-3 px-2 text-center border-r border-slate-200 dark:border-slate-800/60 last:border-r-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => handleCellChange(slot, dIdx, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-blue-500/50 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-900 dark:text-white text-center focus:outline-hidden focus:border-blue-500"
                      />
                    ) : (
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px]">
                        <span className="font-semibold text-slate-900 dark:text-white block">{subject}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">{selectedClass?.salle}</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
