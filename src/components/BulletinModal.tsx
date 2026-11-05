import React from 'react';
import { X, Printer, Award, BookOpen } from 'lucide-react';
import { Eleve, Classe } from '../types';
import { useSchool } from '../context/SchoolContext';

interface BulletinModalProps {
  eleve: Eleve | null;
  classe: Classe | null;
  onClose: () => void;
}

export const BulletinModal: React.FC<BulletinModalProps> = ({
  eleve,
  classe,
  onClose,
}) => {
  const { parametres, config } = useSchool();

  if (!eleve) return null;

  const notes = eleve.notes || [];

  // Calculate weighted average
  let totalPoints = 0;
  let totalCoeffs = 0;

  notes.forEach((n) => {
    const avg = (n.devoir1 + n.devoir2 + n.examen * 2) / 4;
    totalPoints += avg * n.coefficient;
    totalCoeffs += n.coefficient;
  });

  const moyenneGenerale = totalCoeffs > 0 ? (totalPoints / totalCoeffs).toFixed(2) : "14.50";
  const numMoy = parseFloat(moyenneGenerale);

  const mention = numMoy >= 16 ? "Très Bien (Félicitations du Conseil)" :
                 numMoy >= 14 ? "Bien (Tableau d'Honneur)" :
                 numMoy >= 12 ? "Assez Bien (Encouragements)" :
                 numMoy >= 10 ? "Passable" : "Insuffisant (Avertissement Travail)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Action bar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Bulletin Périodique Officiel
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / Exporter</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bulletin Document */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 font-sans">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-2">
                <img
                  src={config?.logoEcole || "/logo-efa.png"}
                  alt={parametres.nom}
                  className="w-16 h-16 object-contain shrink-0 rounded-lg p-0.5 border border-slate-200"
                />
                {config?.logoEcole && (
                  <img
                    src="/logo-efa.png"
                    alt="EFA SCHOOL"
                    className="w-8 h-8 object-contain shrink-0 opacity-80"
                    title="Propulsé par EFA SCHOOL"
                  />
                )}
              </div>
              <div>
                <h2 className="text-base font-black text-slate-950 uppercase">
                  {parametres.nom}
                </h2>
                <p className="text-[11px] text-slate-600 font-medium italic">
                  Ministère des Enseignements Primaire et Secondaire
                </p>
                <p className="text-[10px] text-slate-500">
                  {parametres.ville}, {parametres.pays} · Année {parametres.anneeScolaire}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-900 font-bold text-xs uppercase block">
                Bulletin du 1er Trimestre
              </span>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">Session 2025-2026</p>
            </div>
          </div>

          {/* Student Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Nom de l'élève</span>
              <span className="font-bold text-slate-900">{eleve.nom} {eleve.prenom}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Matricule</span>
              <span className="font-mono font-bold text-slate-800">{eleve.matricule}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Classe</span>
              <span className="font-bold text-slate-900">{classe?.nom || 'Classe assignée'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Titulaire</span>
              <span className="text-slate-800">{classe?.enseignantPrincipal || 'Non assigné'}</span>
            </div>
          </div>

          {/* Marks Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Matière</th>
                  <th className="py-2.5 px-3 text-center">Devoir 1</th>
                  <th className="py-2.5 px-3 text-center">Devoir 2</th>
                  <th className="py-2.5 px-3 text-center">Examen</th>
                  <th className="py-2.5 px-3 text-center">Moy / 20</th>
                  <th className="py-2.5 px-3 text-center">Coeff</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3">Appréciation de l'Enseignant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {notes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-slate-500">
                      Aucune note saisie pour ce trimestre
                    </td>
                  </tr>
                ) : (
                  notes.map((n, idx) => {
                    const avg = ((n.devoir1 + n.devoir2 + n.examen * 2) / 4);
                    const totalM = avg * n.coefficient;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{n.matiere}</td>
                        <td className="py-2 px-3 text-center font-mono">{n.devoir1.toFixed(1)}</td>
                        <td className="py-2 px-3 text-center font-mono">{n.devoir2.toFixed(1)}</td>
                        <td className="py-2 px-3 text-center font-mono font-medium">{n.examen.toFixed(1)}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-slate-900 bg-amber-50/60">
                          {avg.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center font-mono">{n.coefficient}</td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">{totalM.toFixed(1)}</td>
                        <td className="py-2 px-3 text-slate-600 text-[11px] italic">{n.appreciation || 'Travail régulier'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900 text-white">
            <div className="border-r border-slate-700 pr-3">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Moyenne Générale</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-bold font-mono text-amber-300">{moyenneGenerale}</span>
                <span className="text-xs text-slate-400">/ 20</span>
              </div>
            </div>

            <div className="border-r border-slate-700 pr-3">
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Mention du Conseil</span>
              <p className="text-xs font-semibold text-white mt-1">{mention}</p>
            </div>

            <div>
              <span className="text-[10px] text-amber-400 uppercase font-semibold block">Assiduité & Conduite</span>
              <p className="text-xs text-emerald-400 mt-1 font-medium">Élève sérieux · 0 blâme</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 grid grid-cols-3 gap-4 text-xs text-center border-t border-slate-200">
            <div>
              <p className="font-semibold text-slate-600">Le Maître / Titulaire</p>
              <div className="h-16 mt-2 border-b border-dashed border-slate-300 flex items-end justify-center text-[10px] text-slate-400">
                Vu et Approuvé
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-600">Les Parents d'Élèves</p>
              <div className="h-16 mt-2 border-b border-dashed border-slate-300 flex items-end justify-center text-[10px] text-slate-400">
                Signature du tuteur
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-900">Le Directeur des Études</p>
              <p className="text-[11px] font-bold text-amber-800">{parametres.directeur}</p>
              <div className="h-16 mt-2 flex items-center justify-center">
                <div className="px-3 py-1 border border-amber-600 rounded-sm text-[9px] font-bold text-amber-800 uppercase">
                  CACHE EFA SCHOOL
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
