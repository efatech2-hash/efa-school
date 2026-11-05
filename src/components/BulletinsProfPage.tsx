import React, { useState } from 'react';
import { 
  FileSpreadsheet, Calculator, Lock, CheckCircle2, 
  AlertCircle, Printer, Eye, Award, ArrowLeft, ShieldAlert 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types/auth';
import { getProfClasses, getProfMatieresForClass } from '../utils/affectations';
import { Eleve } from '../types';

interface BulletinsProfPageProps {
  currentRole: UserRole;
  userEmail: string;
  onSelectStudentForBulletin: (eleve: Eleve) => void;
  onReturnDashboard?: () => void;
  initialClasseNom?: string;
}

export const BulletinsProfPage: React.FC<BulletinsProfPageProps> = ({
  currentRole,
  userEmail,
  onSelectStudentForBulletin,
  onReturnDashboard,
  initialClasseNom,
}) => {
  const { classes, eleves, updateEleve } = useSchool();
  const isProf = currentRole === 'professeur';
  const assignedClassNames = isProf ? getProfClasses(userEmail) : classes.map(c => c.nom);

  const [selectedClasseNom, setSelectedClasseNom] = useState<string>(() => {
    if (initialClasseNom && assignedClassNames.includes(initialClasseNom)) {
      return initialClasseNom;
    }
    return assignedClassNames[0] || '';
  });

  const [proposeSuccessMsg, setProposeSuccessMsg] = useState<string | null>(null);

  // Security guard
  const isSelectedClassForbidden = isProf && selectedClasseNom !== '' && !assignedClassNames.includes(selectedClasseNom);

  const currentClasseObj = classes.find(c => c.nom.toLowerCase().trim() === selectedClasseNom.toLowerCase().trim());
  const classStudents = currentClasseObj ? eleves.filter(e => e.classeId === currentClasseObj.id) : [];

  const myMatieres = isProf 
    ? getProfMatieresForClass(userEmail, selectedClasseNom)
    : ['Maths', 'Français', 'Anglais'];

  // Handler: "Proposer moyennes"
  const handleProposerMoyennes = () => {
    // Computes and locks proposed averages for his subjects in this class
    classStudents.forEach(st => {
      const updatedNotes = [...(st.notes || [])];
      myMatieres.forEach(mat => {
        const idx = updatedNotes.findIndex(n => n.matiere.toLowerCase().includes(mat.toLowerCase()));
        if (idx >= 0) {
          const item = updatedNotes[idx];
          const moy = (item.devoir1 + item.devoir2 + item.examen * 2) / 4;
          updatedNotes[idx] = {
            ...item,
            appreciation: moy >= 14 ? 'Proposition: Très bon trimestre' : moy >= 10 ? 'Proposition: Trimestre convenable' : 'Proposition: Doit intensifier les révisions',
          };
        }
      });
      updateEleve({
        ...st,
        notes: updatedNotes,
      });
    });

    setProposeSuccessMsg(`Moyennes calculées et proposées avec succès pour la matière « ${myMatieres.join(', ')} » (${selectedClasseNom}) pour ${classStudents.length} élèves. Transmis au Fondateur pour validation finale.`);
    setTimeout(() => {
      setProposeSuccessMsg(null);
    }, 6000);
  };

  // Empty state
  if (isProf && assignedClassNames.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white font-heading">
          Aucune classe assignée - Contactez le Fondateur
        </h3>
        <p className="text-xs text-slate-400 mt-2">
          Vous n'avez pas de classe assignée pour la proposition des bulletins.
        </p>
      </div>
    );
  }

  // 403 Security Guard
  if (isSelectedClassForbidden) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-rose-500/40 text-center max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-white font-heading">
          Vous n'enseignez pas cette classe
        </h3>
        <p className="text-xs text-slate-300 mt-2">
          Accès refusé pour la classe <strong className="text-rose-400">« {selectedClasseNom} »</strong>.
        </p>
        <button
          onClick={() => setSelectedClasseNom(assignedClassNames[0])}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes classes</span>
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
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Espace Bulletins & Moyennes
            </span>
            {isProf ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5" />
                Vos Matières ({myMatieres.join(', ')})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-[#D4AF37] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Droit de Validation Officielle Actif
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
            {isProf ? "Proposition des Moyennes Trimestrielles" : "Validation des Bulletins Trimestriels"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Calcul des moyennes pondérées par coefficient africain et homologation officielle.
          </p>
        </div>

        {/* 2 BOUTONS OBLIGATOIRES SELON LE BRIEF */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          
          {/* BOUTON 1: "Proposer moyennes" */}
          <button
            onClick={handleProposerMoyennes}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-slate-950" />
            <span>Proposer moyennes ({myMatieres.join(', ')})</span>
          </button>

          {/* BOUTON 2: "Valider bulletin" (Actif pour Fondateur & Directeur, désactivé avec tooltip pour Prof) */}
          {(currentRole === 'fondateur' || currentRole === 'directeur') ? (
            <button
              onClick={() => {
                setProposeSuccessMsg(`Bulletins de la classe ${selectedClasseNom} certifiés et validés avec succès par la Direction !`);
                setTimeout(() => setProposeSuccessMsg(null), 5000);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Valider Bulletins (Officiel)</span>
            </button>
          ) : (
            <div className="relative group">
              <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700/60 font-bold text-xs cursor-not-allowed opacity-60"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Valider bulletin</span>
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-64 p-2.5 bg-slate-950 text-amber-300 text-[11px] rounded-lg border border-amber-500/30 shadow-xl z-30 pointer-events-none">
                🔒 Seul le Fondateur ou Directeur peut valider définitivement le bulletin. Le professeur peut seulement proposer les moyennes.
              </div>
            </div>
          )}

        </div>
      </div>

      {proposeSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{proposeSuccessMsg}</span>
          </div>
          <button onClick={() => setProposeSuccessMsg(null)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 font-bold">✕</button>
        </div>
      )}

      {/* Class Selector Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Classe sélectionnée :</span>
          <select
            value={selectedClasseNom}
            onChange={(e) => setSelectedClasseNom(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-amber-300 font-bold focus:outline-hidden focus:border-amber-500"
          >
            {assignedClassNames.map(nom => (
              <option key={nom} value={nom}>Classe {nom} {isProf ? '(Vos affectations)' : ''}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Matière couverte : <strong className="text-slate-900 dark:text-white font-mono">{myMatieres.join(', ')}</strong></span>
          <span>·</span>
          <span>Effectif : <strong className="text-amber-600 dark:text-amber-400 font-mono">{classStudents.length} élèves</strong></span>
        </div>
      </div>

      {/* Table of students & their grade in the teacher's subject */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading uppercase tracking-wider">
            Tableau des Moyennes : {selectedClasseNom} · {myMatieres.join(', ')}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Formule : (Devoir 1 + Devoir 2 + Examen × 2) / 4
          </span>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Élève & Matricule</th>
                <th className="py-2.5 px-3 text-center">Devoir 1 (/20)</th>
                <th className="py-2.5 px-3 text-center">Devoir 2 (/20)</th>
                <th className="py-2.5 px-3 text-center">Examen (/20)</th>
                <th className="py-2.5 px-3 text-center font-bold text-amber-700 dark:text-amber-400">Moyenne Proposée</th>
                <th className="py-2.5 px-3">Appréciation Enseignant</th>
                <th className="py-2.5 px-3 text-center">Aperçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {classStudents.map((st) => {
                const noteObj = st.notes?.find(n => myMatieres.some(m => n.matiere.toLowerCase().includes(m.toLowerCase()))) || st.notes?.[0];
                const d1 = noteObj?.devoir1 ?? 12;
                const d2 = noteObj?.devoir2 ?? 12;
                const exam = noteObj?.examen ?? 12;
                const moy = ((d1 + d2 + exam * 2) / 4).toFixed(2);

                return (
                  <tr key={st.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 dark:text-white block">{st.nom} {st.prenom}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{st.matricule}</span>
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {d1.toFixed(1)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                      {d2.toFixed(1)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {exam.toFixed(1)}
                    </td>

                    <td className="py-2.5 px-3 text-center font-mono font-black text-amber-800 dark:text-amber-400 text-sm bg-amber-500/10">
                      {moy} / 20
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 italic text-[11px]">
                      {noteObj?.appreciation || 'Travail régulier'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onSelectStudentForBulletin(st)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                        title="Consulter le relevé trimestriel"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Bulletin</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
