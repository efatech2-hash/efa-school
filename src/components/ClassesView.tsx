import React, { useState } from 'react';
import { 
  School, Plus, Copy, Users, Eye, 
  MessageSquare, BookOpen, AlertCircle, CheckCircle, 
  ChevronRight, Search
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Classe, Eleve } from '../types';
import { formatCurrency } from '../utils/formatters';

import { UserRole } from '../types/auth';
import { getProfClasses } from '../utils/affectations';

interface ClassesViewProps {
  currentRole?: UserRole;
  userEmail?: string;
  onOpenNewClass: () => void;
  onOpenNewStudentForClass: (classeId: string) => void;
  onSelectStudent: (eleve: Eleve) => void;
  onSelectClassForMessage: (classeId: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({
  currentRole = 'fondateur',
  userEmail = 'prof@efa.com',
  onOpenNewClass,
  onOpenNewStudentForClass,
  onSelectStudent,
  onSelectClassForMessage,
}) => {
  const { classes, eleves, duplicateClasseGroup, deleteClasse } = useSchool();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [justDuplicatedMsg, setJustDuplicatedMsg] = useState<string | null>(null);

  const isProf = currentRole === 'professeur';
  const myClassNames = isProf ? getProfClasses(userEmail) : classes.map(c => c.nom);

  const handleDuplicate = (classeId: string, nom: string) => {
    const duplicated = duplicateClasseGroup(classeId);
    if (duplicated) {
      setJustDuplicatedMsg(`Groupe dédoublé avec succès : Nouvelle classe ${duplicated.nom} créée !`);
      setTimeout(() => setJustDuplicatedMsg(null), 4000);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const studentsInSelectedClass = selectedClass 
    ? eleves.filter(e => e.classeId === selectedClass.id)
    : [];

  const baseClasses = isProf 
    ? classes.filter(c => myClassNames.includes(c.nom))
    : classes;

  const filteredClasses = baseClasses.filter(c => 
    c.nom.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.niveau.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.salle.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            {isProf ? "Mes Classes Assignées (Lecture Pédagogique)" : "Gestion des Classes & Répartition Pédagogique"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isProf 
              ? `${filteredClasses.length} classe(s) assignée(s) à votre compte enseignant` 
              : `${classes.length} classes actives · Dédoublez vos sections (A/B/C) en 1 clic`}
          </p>
        </div>

        {!isProf && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenNewClass}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Créer une Classe</span>
            </button>
          </div>
        )}
      </div>

      {justDuplicatedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{justDuplicatedMsg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par niveau, nom ou salle..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const classStudents = eleves.filter(e => e.classeId === cls.id);
          const studentCount = classStudents.length;
          const fillRatio = Math.round((studentCount / cls.effectifMax) * 100);
          const isOverloaded = studentCount > cls.effectifMax;

          const totalScolariteClass = classStudents.reduce((acc, el) => acc + el.scolariteTotal, 0);
          const totalPayeClass = classStudents.reduce((acc, el) => acc + el.montantPaye, 0);
          const tauxPaiement = totalScolariteClass > 0 
            ? Math.round((totalPayeClass / totalScolariteClass) * 100) 
            : 0;

          return (
            <div
              key={cls.id}
              className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header: Class Name & Group */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white font-heading">
                        {cls.nom}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {cls.niveau}
                      </span>
                      {cls.serie && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          Série {cls.serie}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {cls.salle}
                    </p>
                  </div>

                  {/* Duplicate Group Action */}
                  <button
                    onClick={() => handleDuplicate(cls.id, cls.nom)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors border border-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    title="Dédoubler cette classe (+ Ajouter Groupe B/C)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">+ Groupe</span>
                  </button>
                </div>

                {/* Capacity Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Effectif de la classe</span>
                    <span className={`font-mono font-bold ${isOverloaded ? 'text-rose-400' : 'text-slate-200'}`}>
                      {studentCount} / {cls.effectifMax} élèves
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${Math.min(100, fillRatio)}%` }}
                      className={`h-full transition-all ${
                        isOverloaded
                          ? 'bg-rose-500'
                          : fillRatio >= 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  {isOverloaded && (
                    <span className="text-[10px] text-rose-400 font-medium block">
                      Classe surchargée (Dépassement de {studentCount - cls.effectifMax} élèves)
                    </span>
                  )}
                </div>

                {/* Teacher & Tuition */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Titulaire :</span>
                    <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {cls.enseignantPrincipal || 'Non assigné'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Écolage annuel :</span>
                    <span className="font-mono font-bold text-amber-400">
                      {formatCurrency(cls.scolariteAnnuelle)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Recouvrement :</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {tauxPaiement}% ({formatCurrency(totalPayeClass)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedClassId(cls.id)}
                  className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Voir Élèves ({studentCount})</span>
                </button>

                <button
                  onClick={() => onSelectClassForMessage(cls.id)}
                  className="py-2 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: LIST OF STUDENTS IN SELECTED CLASS */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-8">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                  {selectedClass.nom}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Liste des Élèves · {selectedClass.nom}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {studentsInSelectedClass.length} élèves inscrits · Salle {selectedClass.salle} · Titulaire : {selectedClass.enseignantPrincipal || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenNewStudentForClass(selectedClass.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  + Inscrire dans cette classe
                </button>
                <button
                  onClick={() => setSelectedClassId(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">N°</th>
                    <th className="py-2.5 px-3">Matricule</th>
                    <th className="py-2.5 px-3">Nom & Prénom</th>
                    <th className="py-2.5 px-3">Sexe</th>
                    <th className="py-2.5 px-3">Parent 1 & WhatsApp</th>
                    <th className="py-2.5 px-3 text-right">Payé / Scolarité</th>
                    <th className="py-2.5 px-3 text-center">Fiche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {studentsInSelectedClass.map((el, index) => {
                    const reste = el.scolariteTotal - el.montantPaye;
                    const isSolde = reste <= 0;

                    return (
                      <tr key={el.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{index + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 font-medium">{el.matricule}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{el.nom} {el.prenom}</td>
                        <td className="py-2.5 px-3 text-slate-300">{el.sexe}</td>
                        <td className="py-2.5 px-3 text-slate-300">
                          <span>{el.parent1.nom}</span>
                          <span className="text-[10px] text-emerald-400 block font-mono">{el.parent1.telephone}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="font-mono font-bold text-emerald-400 block">{formatCurrency(el.montantPaye)}</span>
                          {reste > 0 ? (
                            <span className="text-[10px] font-mono text-rose-400">Reste: {formatCurrency(reste)}</span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-semibold">Soldé</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedClassId(null);
                              onSelectStudent(el);
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-[10px] font-medium cursor-pointer"
                          >
                            Ouvrir
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
      )}

    </div>
  );
};
