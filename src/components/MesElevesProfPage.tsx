import React, { useState } from 'react';
import { 
  Users, Search, Lock, School, Phone, BookOpen, 
  ArrowRight, ShieldCheck, Filter, CalendarCheck 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types/auth';
import { getProfClasses } from '../utils/affectations';
import { Eleve } from '../types';
import { isClassePrimaire } from '../data/matieres_par_classe';
import { SaisieAppelModal } from './SaisieAppelModal';

interface MesElevesProfPageProps {
  currentRole: UserRole;
  userEmail: string;
}

export const MesElevesProfPage: React.FC<MesElevesProfPageProps> = ({
  currentRole,
  userEmail,
}) => {
  const { classes, eleves } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAppelOpen, setIsAppelOpen] = useState(false);

  const isProf = currentRole === 'professeur';
  const myClassNames = isProf ? getProfClasses(userEmail) : classes.map(c => c.nom);

  // Detect if primary teacher (e.g. Koffi with CP1-A or any class starting with CP, CE, CM, CI, Maternelle)
  const isPrimaryProf = myClassNames.length > 0 && myClassNames.some(cn => isClassePrimaire(cn));

  // Primary teacher has 1 single class all year
  const primaryClassName = isPrimaryProf ? myClassNames[0] : null;

  // Selected class for college/lycee filter
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Map class name to id
  const myClassObjs = classes.filter(c => myClassNames.includes(c.nom));
  const myClassIds = myClassObjs.map(c => c.id);

  // Union of students in assigned classes
  const myStudents = isProf 
    ? eleves.filter(e => myClassIds.includes(e.classeId))
    : eleves;

  // Filter with search & class dropdown
  const filteredStudents = myStudents.filter(st => {
    const studentClassObj = classes.find(c => c.id === st.classeId);
    const studentClassName = studentClassObj?.nom || '';

    const matchesSearch = 
      st.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.matricule.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = isPrimaryProf 
      ? studentClassName === primaryClassName
      : (classFilter === 'ALL' || studentClassName === classFilter);

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#1e293b] border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {isPrimaryProf ? '🎒 Maître d’École Primaire' : '📚 Professeur Secondaire'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <Lock className="w-3 h-3" />
              {isPrimaryProf ? `Classe unique : ${primaryClassName}` : `${myStudents.length} élèves assignés`}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            {isPrimaryProf ? `Ma Classe de ${primaryClassName}` : 'Mes Élèves Assignés'}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {isPrimaryProf 
              ? 'Registre officiel d’appel et effectif sous votre responsabilité directe toute l’année scolaire.'
              : 'Consultation pédagogique des effectifs de vos classes assignées au Collège et Lycée.'}
          </p>
        </div>

        {/* Action: Faire l'Appel */}
        <button
          onClick={() => setIsAppelOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer transform active:scale-95 shrink-0"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Faire l'Appel de ma classe</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou matricule..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Collège/Lycée has class filter; Primary teacher does NOT have dropdown */}
        {!isPrimaryProf && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Classe :</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">Toutes mes classes ({myStudents.length})</option>
              {myClassNames.map(nom => (
                <option key={nom} value={nom}>Classe {nom}</option>
              ))}
            </select>
          </div>
        )}

        {isPrimaryProf && (
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
            Effectif classe : {filteredStudents.length} élèves
          </div>
        )}
      </div>

      {/* TABLE / GRID OF STUDENTS */}
      {/* 
        CRITICAL RULES RESPECTED:
        - Primary: NO student detail modal, NO WhatsApp message, NO finance, NO enroll, NO bulletin.
        - College/Lycée: NO finance, NO payment buttons, text-only parent phone (no WhatsApp write link).
      */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Élève</th>
                <th className="py-3.5 px-4 font-mono">Matricule</th>
                <th className="py-3.5 px-4">Classe</th>
                <th className="py-3.5 px-4">Sexe</th>
                <th className="py-3.5 px-4">Date Naissance</th>
                <th className="py-3.5 px-5">
                  {isPrimaryProf ? 'Statut Scolaire' : 'Contact Parent (Info Direction)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((st) => {
                const studentClassObj = classes.find(c => c.id === st.classeId);
                const studentClassName = studentClassObj?.nom || primaryClassName || 'Section A';

                return (
                  <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 font-black text-xs text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                          {st.prenom.charAt(0)}{st.nom.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block text-sm">
                            {st.nom} {st.prenom}
                          </span>
                          <span className="text-[10px] text-slate-400">Inscrit(e) le {st.dateInscription}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      {st.matricule}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs">
                        {studentClassName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium">
                      {st.sexe === 'F' ? 'Féminin' : 'Masculin'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {st.dateNaissance}
                    </td>

                    <td className="py-3.5 px-5">
                      {isPrimaryProf ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                          ✓ Inscrit Régulier
                        </span>
                      ) : (
                        <div className="text-slate-600 dark:text-slate-400 font-medium text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{st.parent1.nom}</span>
                          <span className="block font-mono text-[11px] text-slate-500">{st.parent1.telephone}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-xs">
            Aucun élève ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* Saisie Appel Modal */}
      <SaisieAppelModal
        isOpen={isAppelOpen}
        onClose={() => setIsAppelOpen(false)}
        initialClassId={myClassObjs[0]?.id}
        isPrimaryTeacher={isPrimaryProf}
      />
    </div>
  );
};
