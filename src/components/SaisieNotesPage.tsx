import React, { useState, useEffect } from 'react';
import { 
  Award, Save, CheckCircle2, AlertTriangle, ShieldAlert, 
  Lock, BookOpen, School, Filter, ArrowLeft, UserCheck, Calendar, Info
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types/auth';
import { getProfClasses, getProfMatieresForClass, saveNotesBatch, getStoredNotesTable } from '../utils/affectations';
import { getMatieresPourClasse, isClassePrimaire, MatiereCoefficient } from '../data/matieres_africaines';
import { Eleve } from '../types';

interface SaisieNotesPageProps {
  currentRole: UserRole;
  userEmail: string;
  onReturnDashboard?: () => void;
  initialClasseNom?: string;
}

export const SaisieNotesPage: React.FC<SaisieNotesPageProps> = ({
  currentRole,
  userEmail,
  onReturnDashboard,
  initialClasseNom,
}) => {
  const { classes, eleves, updateEleve } = useSchool();

  // Determine allowed classes
  const isProf = currentRole === 'professeur';
  const assignedClassNames = isProf ? getProfClasses(userEmail) : classes.map(c => c.nom);

  // Selected state
  const [selectedClasseNom, setSelectedClasseNom] = useState<string>(() => {
    if (initialClasseNom && assignedClassNames.includes(initialClasseNom)) {
      return initialClasseNom;
    }
    return assignedClassNames[0] || '';
  });

  // Verify security: is the currently selected class allowed?
  const isSelectedClassForbidden = isProf && selectedClasseNom !== '' && !assignedClassNames.includes(selectedClasseNom);

  // Official curriculum subjects for this class
  const officialClassMatieres: MatiereCoefficient[] = getMatieresPourClasse(selectedClasseNom);
  const isPrimaire = isClassePrimaire(selectedClasseNom);

  // Available subjects for the selected class (for teachers: restricted to assigned subjects, for direction: all official African subjects)
  const teacherMatieres = isProf ? getProfMatieresForClass(userEmail, selectedClasseNom) : [];
  const availableMatieres: string[] = isProf
    ? (teacherMatieres.length > 0 ? teacherMatieres : officialClassMatieres.map(m => m.nom))
    : officialClassMatieres.map(m => m.nom);

  const [selectedMatiere, setSelectedMatiere] = useState<string>(() => availableMatieres[0] || 'Mathématiques');
  const [selectedEval, setSelectedEval] = useState<'Devoir 1' | 'Devoir 2' | 'Composition'>('Devoir 1');

  // Input states: note /20 and appreciation keyed by eleveId
  const [gradesState, setGradesState] = useState<Record<string, { note: number; appreciation: string }>>({});
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Active subject's official coefficient
  const activeMatiereObj = officialClassMatieres.find(
    m => m.nom.toLowerCase().trim() === selectedMatiere.toLowerCase().trim() ||
         m.nom.toLowerCase().includes(selectedMatiere.toLowerCase()) ||
         selectedMatiere.toLowerCase().includes(m.nom.toLowerCase())
  );
  const defaultCoefficient = activeMatiereObj ? activeMatiereObj.coefficient : 2;
  const currentCoefficient = defaultCoefficient;

  // Update selected subject when class changes
  useEffect(() => {
    if (availableMatieres.length > 0 && !availableMatieres.includes(selectedMatiere)) {
      setSelectedMatiere(availableMatieres[0]);
    }
  }, [selectedClasseNom, availableMatieres, selectedMatiere]);

  // Find class object
  const currentClasseObj = classes.find(c => c.nom.toLowerCase().trim() === selectedClasseNom.toLowerCase().trim());
  const classStudents = currentClasseObj ? eleves.filter(e => e.classeId === currentClasseObj.id) : [];

  // Prepopulate grades when class, subject or eval changes
  useEffect(() => {
    const storedNotes = getStoredNotesTable();
    const newGradesState: Record<string, { note: number; appreciation: string }> = {};

    classStudents.forEach(st => {
      // Look in stored table
      const matchStored = storedNotes.find(
        n => n.eleve_id === st.id && 
             n.classe.toLowerCase().trim() === selectedClasseNom.toLowerCase().trim() && 
             n.matiere.toLowerCase().trim() === selectedMatiere.toLowerCase().trim() && 
             n.eval === selectedEval
      );

      if (matchStored) {
        newGradesState[st.id] = {
          note: matchStored.note,
          appreciation: matchStored.appreciation,
        };
      } else {
        // Fallback to student's existing notes if present
        const matchNoteObj = st.notes?.find(
          n => n.matiere.toLowerCase().includes(selectedMatiere.toLowerCase()) || 
               selectedMatiere.toLowerCase().includes(n.matiere.toLowerCase())
        );

        let defaultNote = 12;
        let defaultApp = 'Travail convenable';

        if (matchNoteObj) {
          if (selectedEval === 'Devoir 1') defaultNote = matchNoteObj.devoir1;
          else if (selectedEval === 'Devoir 2') defaultNote = matchNoteObj.devoir2;
          else defaultNote = matchNoteObj.examen;
          defaultApp = matchNoteObj.appreciation || (defaultNote >= 14 ? 'Très bon travail' : defaultNote >= 10 ? 'Travail convenable' : 'Doit redoubler d\'effort');
        }

        newGradesState[st.id] = {
          note: defaultNote,
          appreciation: defaultApp,
        };
      }
    });

    setGradesState(newGradesState);
  }, [selectedClasseNom, selectedMatiere, selectedEval, currentClasseObj?.id]);

  // Handle grade change
  const handleNoteChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(20, isNaN(val) ? 0 : val));
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        note: clamped,
        appreciation: prev[studentId]?.appreciation || (clamped >= 14 ? 'Très bon travail' : clamped >= 10 ? 'Travail convenable' : 'Doit redoubler d\'effort'),
      },
    }));
  };

  const handleAppreciationChange = (studentId: string, val: string) => {
    setGradesState(prev => ({
      ...prev,
      [studentId]: {
        note: prev[studentId]?.note ?? 10,
        appreciation: val,
      },
    }));
  };

  // Save notes handler
  const handleSaveAll = () => {
    const today = new Date().toISOString().split('T')[0];
    const notesToSave = classStudents.map(st => {
      const g = gradesState[st.id] || { note: 10, appreciation: 'En attente' };
      return {
        classe: selectedClasseNom,
        matiere: selectedMatiere,
        eval: selectedEval,
        eleve_id: st.id,
        eleve_nom: st.nom,
        eleve_prenom: st.prenom,
        eleve_matricule: st.matricule,
        note: Number(g.note),
        appreciation: g.appreciation,
        prof_id: userEmail,
        date: today,
      };
    });

    // 1. Save in dedicated notes table (localStorage 'efa_table_notes')
    saveNotesBatch(notesToSave);

    // 2. Also update student entity in SchoolContext so bulletins reflect it
    classStudents.forEach(st => {
      const g = gradesState[st.id] || { note: 10, appreciation: '' };
      const currentNotes = [...(st.notes || [])];
      const existingIdx = currentNotes.findIndex(
        n => n.matiere.toLowerCase().trim() === selectedMatiere.toLowerCase().trim()
      );

      let d1 = 12;
      let d2 = 12;
      let exam = 12;

      if (existingIdx >= 0) {
        d1 = currentNotes[existingIdx].devoir1;
        d2 = currentNotes[existingIdx].devoir2;
        exam = currentNotes[existingIdx].examen;
      }

      if (selectedEval === 'Devoir 1') d1 = g.note;
      else if (selectedEval === 'Devoir 2') d2 = g.note;
      else exam = g.note;

      const updatedNoteObj = {
        matiere: selectedMatiere,
        devoir1: d1,
        devoir2: d2,
        examen: exam,
        coefficient: currentCoefficient,
        appreciation: g.appreciation,
      };

      if (existingIdx >= 0) {
        currentNotes[existingIdx] = updatedNoteObj;
      } else {
        currentNotes.push(updatedNoteObj);
      }

      updateEleve({
        ...st,
        notes: currentNotes,
      });
    });

    setSavedSuccessMsg(`Évaluation « ${selectedEval} » en ${selectedMatiere} (Coef ${currentCoefficient}) enregistrée avec succès (${classStudents.length} élèves) !`);
    setTimeout(() => {
      setSavedSuccessMsg(null);
    }, 4500);
  };

  // 1. EMPTY STATE : Si aucune classe assignée
  if (isProf && assignedClassNames.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading">
          Aucune classe assignée - Contactez la Direction
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Votre compte enseignant (<strong className="text-slate-800 dark:text-white">{userEmail}</strong>) n'a pas encore de classes attribuées dans le tableau d'affectation officiel.
        </p>
        {onReturnDashboard && (
          <button
            onClick={onReturnDashboard}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à mon Dashboard</span>
          </button>
        )}
      </div>
    );
  }

  // 1.5. PRIMARY TEACHER NOTICE : STRICTEMENT AUCUNE NOTE / MATIÈRE AU PRIMAIRE
  const isPrimaryOnlyProf = isProf && assignedClassNames.length > 0 && assignedClassNames.every(cn => isClassePrimaire(cn));
  if (isPrimaryOnlyProf) {
    return (
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto my-12 shadow-xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto mb-2">
          <span className="text-3xl">🎒</span>
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-black text-xs uppercase">
          Enseignement Primaire
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          Module de Notes non applicable au Cours Primaire
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          Au Cours Primaire, un maître est affecté à sa classe unique toute l'année. Les coefficients et saisies par matière ne s'appliquent pas. Le suivi s'effectue via le registre d'appel quotidien.
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          {onReturnDashboard && (
            <button
              onClick={onReturnDashboard}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Retour au Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. FORBIDDEN 403 : Si le professeur tente de consulter une classe non assignée
  if (isSelectedClassForbidden) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-center max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-[11px] font-bold uppercase mb-2">
          Sécurité Pédagogique - Accès Refusé
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
          Vous n'enseignez pas cette classe
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          La classe <strong className="text-rose-600 dark:text-rose-400">« {selectedClasseNom} »</strong> ne fait pas partie de vos affectations pédagogiques officielles.
        </p>
        <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <span>Vos classes autorisées : </span>
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {assignedClassNames.join(', ')}
          </span>
        </div>
        <button
          onClick={() => setSelectedClasseNom(assignedClassNames[0])}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes classes assignées</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Saisie Pédagogique des Notes (/20)
            </span>
            {isProf ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5" />
                Accès Restreint à vos Affectations
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                <BookOpen className="w-2.5 h-2.5" />
                Programme Officiel Africain avec Coefficients
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            Registre des Notes & Évaluations Continues
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enregistrement officiel des Devoirs 1, 2 et Compositions avec coefficients nationaux et calcul des moyennes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveAll}
            disabled={classStudents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>Enregistrer les Notes ({selectedEval})</span>
          </button>
        </div>
      </div>

      {/* Primary Education Note if applicable */}
      {isPrimaire && (
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-3">
          <Info className="w-5 h-5 shrink-0 text-blue-500" />
          <div>
            <strong className="block font-bold">Carnet d'Évaluation Primaire ({selectedClasseNom}) :</strong>
            <span>Évaluation continue par compétences fondamentales (Lecture, Écriture, Calcul, Éveil). Pas de coefficient éliminatoire.</span>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {savedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
          <button onClick={() => setSavedSuccessMsg(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 cursor-pointer font-bold">✕</button>
        </div>
      )}

      {/* FILTRES : CLASSE + MATIÈRE + ÉVALUATION */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. SELECT CLASSE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Classe
              </label>
              {isProf && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  🔒 Assigné
                </span>
              )}
            </div>
            <select
              value={selectedClasseNom}
              onChange={(e) => setSelectedClasseNom(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-amber-300 font-bold focus:outline-hidden focus:border-amber-500 transition-colors"
            >
              {assignedClassNames.map(nom => (
                <option key={nom} value={nom}>
                  Classe {nom} {isProf ? '(Vos affectations)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. SELECT MATIÈRE AVEC COEFFICIENTS AFRICAINS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Matière
              </label>
              <span className="text-[10px] font-bold text-amber-700 dark:text-[#D4AF37] bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                Officiel: Coef {defaultCoefficient}
              </span>
            </div>
            <select
              value={selectedMatiere}
              onChange={(e) => setSelectedMatiere(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-amber-300 font-bold focus:outline-hidden focus:border-amber-500 transition-colors"
            >
              {availableMatieres.map(mat => {
                const coefObj = officialClassMatieres.find(m => m.nom.toLowerCase().trim() === mat.toLowerCase().trim());
                const coef = coefObj ? coefObj.coefficient : 2;
                return (
                  <option key={mat} value={mat}>
                    {mat} (Coef. {coef})
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. COEFFICIENT OFFICIEL (Programme Officiel Togo - Synchronisé) */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
              Coefficient Officiel
            </label>
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
              <span className="text-[11px] text-slate-500 font-medium">Programme Togo</span>
              <span className="inline-flex items-center gap-1 font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-xs">
                Coef. {currentCoefficient}
              </span>
            </div>
          </div>

          {/* 4. SELECT ÉVALUATION */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1.5">
              Type d'Évaluation
            </label>
            <select
              value={selectedEval}
              onChange={(e) => setSelectedEval(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-amber-300 font-bold focus:outline-hidden focus:border-amber-500 transition-colors"
            >
              <option value="Devoir 1">Devoir Continu N°1 (/20)</option>
              <option value="Devoir 2">Devoir Continu N°2 (/20)</option>
              <option value="Composition">Composition Trimestrielle (/20)</option>
            </select>
          </div>

        </div>

        {/* Quick summary stats */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>Effectif à noter : <strong className="text-slate-900 dark:text-white">{classStudents.length} élèves</strong></span>
            <span>·</span>
            <span>Matière : <strong className="text-amber-600 dark:text-amber-400">{selectedMatiere} (Coef {currentCoefficient})</strong></span>
          </div>

          <div className="text-[11px] font-mono">
            Barème officiel national : 0,00 à 20,00
          </div>
        </div>
      </div>

      {/* TABLE DES ÉLÈVES ET SAISIE DES NOTES */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Élèves de {selectedClasseNom} — Saisie {selectedEval}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {classStudents.length} élèves enregistrés
          </span>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aucun élève trouvé dans cette classe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 w-14 text-center">Photo</th>
                  <th className="py-2.5 px-3">Nom & Prénom</th>
                  <th className="py-2.5 px-3">Matricule</th>
                  <th className="py-2.5 px-3 text-center w-36">Note / 20</th>
                  <th className="py-2.5 px-3">Appréciation Pédagogique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {classStudents.map((st) => {
                  const g = gradesState[st.id] || { note: 10, appreciation: '' };
                  const isExcellent = g.note >= 16;
                  const isGood = g.note >= 14 && g.note < 16;
                  const isPassable = g.note >= 10 && g.note < 14;

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Photo / Avatar */}
                      <td className="py-2 px-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-[11px] text-amber-700 dark:text-amber-300 mx-auto">
                          {st.prenom.charAt(0)}{st.nom.charAt(0)}
                        </div>
                      </td>

                      {/* Nom & Prénom */}
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">{st.nom} {st.prenom}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{st.sexe === 'F' ? 'Fille' : 'Garçon'}</span>
                      </td>

                      {/* Matricule */}
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {st.matricule}
                      </td>

                      {/* Input Note /20 */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="0.25"
                            value={g.note}
                            onChange={(e) => handleNoteChange(st.id, parseFloat(e.target.value))}
                            className={`w-20 px-2.5 py-1.5 rounded-lg border text-center font-mono font-bold text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-500 transition-colors ${
                              isExcellent 
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/50 text-emerald-800 dark:text-emerald-300' 
                                : isGood 
                                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500/50 text-blue-800 dark:text-blue-300' 
                                : isPassable 
                                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500/50 text-amber-800 dark:text-amber-300' 
                                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500/50 text-rose-800 dark:text-rose-300'
                            }`}
                          />
                          <span className="text-slate-400 font-mono text-xs">/ 20</span>
                        </div>
                      </td>

                      {/* Input Appréciation */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={g.appreciation}
                          onChange={(e) => handleAppreciationChange(st.id, e.target.value)}
                          placeholder="Appréciation pour le bulletin..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
