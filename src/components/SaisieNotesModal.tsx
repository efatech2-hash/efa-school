import React, { useState } from 'react';
import { X, Award, Save, Check, Calculator, BookOpen } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Eleve, NoteMatiere } from '../types';

interface SaisieNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialClassId?: string;
  defaultMatiere?: string;
}

export const SaisieNotesModal: React.FC<SaisieNotesModalProps> = ({
  isOpen,
  onClose,
  initialClassId,
  defaultMatiere = 'Mathématiques',
}) => {
  const { classes, eleves, updateEleve } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId || classes[0]?.id || '');
  const [selectedMatiere, setSelectedMatiere] = useState<string>(defaultMatiere);
  const [notesState, setNotesState] = useState<Record<string, { d1: number; d2: number; exam: number }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const classStudents = eleves.filter(e => e.classeId === selectedClassId);

  // Initialize or fetch current grade
  const getStudentGrades = (student: Eleve) => {
    if (notesState[student.id]) {
      return notesState[student.id];
    }
    const existing = student.notes.find(n => n.matiere.toLowerCase().includes(selectedMatiere.toLowerCase()));
    if (existing) {
      return { d1: existing.devoir1, d2: existing.devoir2, exam: existing.examen };
    }
    return { d1: 12, d2: 13, exam: 14 };
  };

  const handleGradeChange = (studentId: string, field: 'd1' | 'd2' | 'exam', value: number) => {
    const clamped = Math.max(0, Math.min(20, value));
    setNotesState(prev => {
      const current = prev[studentId] || { d1: 12, d2: 13, exam: 14 };
      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: clamped,
        },
      };
    });
  };

  const handleSave = () => {
    classStudents.forEach(el => {
      const grades = notesState[el.id] || getStudentGrades(el);
      const existingNotes = [...(el.notes || [])];
      const noteIdx = existingNotes.findIndex(n => n.matiere.toLowerCase().includes(selectedMatiere.toLowerCase()));
      
      const newNoteObj: NoteMatiere = {
        matiere: selectedMatiere,
        devoir1: Number(grades.d1),
        devoir2: Number(grades.d2),
        examen: Number(grades.exam),
        coefficient: selectedMatiere.includes('Math') ? 3 : 2,
        appreciation: (grades.exam >= 14 ? 'Très bon travail' : grades.exam >= 10 ? 'Travail convenable' : 'Doit redoubler d\'effort'),
      };

      if (noteIdx >= 0) {
        existingNotes[noteIdx] = newNoteObj;
      } else {
        existingNotes.push(newNoteObj);
      }

      updateEleve({
        ...el,
        notes: existingNotes,
      });
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Saisie des Notes & Moyennes (/20)
              </h3>
              <p className="text-xs text-slate-400">
                Évaluation continue : Devoir 1, Devoir 2 et Examen trimestriel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              <span>Notes enregistrées avec succès et calculées pour les bulletins !</span>
            </div>
          )}

          {/* Selectors Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Classe</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-amber-300 focus:outline-hidden focus:border-amber-500"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.niveau})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Matière Enseignée</label>
              <select
                value={selectedMatiere}
                onChange={(e) => setSelectedMatiere(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-semibold focus:outline-hidden focus:border-amber-500"
              >
                <option value="Mathématiques">Mathématiques</option>
                <option value="Sciences & Calcul">Sciences & Calcul</option>
                <option value="Français">Français</option>
                <option value="Sciences Physiques & Chimie">Sciences Physiques & Chimie</option>
                <option value="Sciences de la Vie et de la Terre (SVT)">SVT</option>
              </select>
            </div>
          </div>

          {/* Grades Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-3">Élève & Matricule</th>
                  <th className="py-2.5 px-3 text-center">Devoir 1 (/20)</th>
                  <th className="py-2.5 px-3 text-center">Devoir 2 (/20)</th>
                  <th className="py-2.5 px-3 text-center">Examen (/20)</th>
                  <th className="py-2.5 px-3 text-center font-bold text-amber-400">Moyenne</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {classStudents.map(el => {
                  const grades = getStudentGrades(el);
                  const moy = ((grades.d1 + grades.d2 + grades.exam * 2) / 4).toFixed(2);

                  return (
                    <tr key={el.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-white block">{el.nom} {el.prenom}</span>
                        <span className="text-[10px] font-mono text-slate-400">{el.matricule}</span>
                      </td>

                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          value={grades.d1}
                          onChange={(e) => handleGradeChange(el.id, 'd1', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:border-amber-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          value={grades.d2}
                          onChange={(e) => handleGradeChange(el.id, 'd2', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-white focus:border-amber-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="20"
                          value={grades.exam}
                          onChange={(e) => handleGradeChange(el.id, 'exam', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-emerald-400 focus:border-emerald-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-black text-amber-400 text-sm bg-amber-500/10">
                        {moy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-end gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Enregistrer les Notes</span>
          </button>
        </div>

      </div>
    </div>
  );
};
