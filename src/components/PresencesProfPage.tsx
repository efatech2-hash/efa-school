import React, { useState } from 'react';
import { 
  CalendarCheck, Calendar, Lock, CheckCircle2, 
  AlertCircle, Clock, ShieldAlert, Phone, ArrowLeft, Save, Filter 
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { UserRole } from '../types/auth';
import { getProfClasses } from '../utils/affectations';
import { buildWhatsAppLink } from '../utils/formatters';
import { Eleve } from '../types';

interface PresencesProfPageProps {
  currentRole: UserRole;
  userEmail: string;
  onReturnDashboard?: () => void;
  initialClasseNom?: string;
}

export const PresencesProfPage: React.FC<PresencesProfPageProps> = ({
  currentRole,
  userEmail,
  onReturnDashboard,
  initialClasseNom,
}) => {
  const { classes, eleves, updateEleve, logWhatsAppMessage, parametres } = useSchool();

  const isProf = currentRole === 'professeur';
  const assignedClassNames = isProf ? getProfClasses(userEmail) : classes.map(c => c.nom);

  const [selectedClasseNom, setSelectedClasseNom] = useState<string>(() => {
    if (initialClasseNom && assignedClassNames.includes(initialClasseNom)) {
      return initialClasseNom;
    }
    return assignedClassNames[0] || '';
  });

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [statuses, setStatuses] = useState<Record<string, { statut: 'Présent' | 'Absent' | 'Retard'; justifie: boolean }>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Security guard
  const isSelectedClassForbidden = isProf && selectedClasseNom !== '' && !assignedClassNames.includes(selectedClasseNom);

  const currentClasseObj = classes.find(c => c.nom.toLowerCase().trim() === selectedClasseNom.toLowerCase().trim());
  const classStudents = currentClasseObj ? eleves.filter(e => e.classeId === currentClasseObj.id) : [];

  const getRecord = (eleveId: string) => {
    return statuses[eleveId] || { statut: 'Présent', justifie: false };
  };

  const handleSetStatut = (eleveId: string, statut: 'Présent' | 'Absent' | 'Retard') => {
    setStatuses(prev => ({
      ...prev,
      [eleveId]: {
        statut,
        justifie: statut === 'Présent' ? false : prev[eleveId]?.justifie || false,
      },
    }));
  };

  const handleToggleJustifie = (eleveId: string) => {
    setStatuses(prev => {
      const current = prev[eleveId] || { statut: 'Absent', justifie: false };
      return {
        ...prev,
        [eleveId]: {
          ...current,
          justifie: !current.justifie,
        },
      };
    });
  };

  const handleSave = () => {
    classStudents.forEach(el => {
      const rec = getRecord(el.id);
      const newPresenceItem = {
        date,
        statut: rec.statut,
        justifie: rec.justifie,
      };
      const updatedList = [newPresenceItem, ...(el.presences || []).slice(0, 30)];
      updateEleve({
        ...el,
        presences: updatedList,
      });
    });

    setSaveSuccessMsg(`Appel validé pour la classe ${selectedClasseNom} (${date}) : ${classStudents.length} élèves pointés.`);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4500);
  };

  const handleSendWhatsApp = (el: Eleve) => {
    const rec = getRecord(el.id);
    const msg = `Bonjour ${el.parent1.nom}. L'administration de ${parametres.nom} vous informe que votre enfant ${el.nom} ${el.prenom} (${selectedClasseNom}) a été constaté ${rec.statut.toUpperCase()} ce ${date}${rec.justifie ? ' (Justifié)' : ' (Non justifié)'}. Contact établissement : ${parametres.telephone}.`;

    logWhatsAppMessage({
      type: 'Absence',
      destinataireNom: `${el.parent1.nom} (${el.nom})`,
      eleveNom: `${el.nom} ${el.prenom}`,
      classeNom: selectedClasseNom,
      telephone: el.parent1.telephone,
      message: msg,
    });

    const link = buildWhatsAppLink(el.parent1.telephone, msg);
    window.open(link, '_blank');
  };

  // 1. EMPTY STATE
  if (isProf && assignedClassNames.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-lg mx-auto my-12 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white font-heading">
          Aucune classe assignée - Contactez le Fondateur
        </h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Votre compte enseignant (<strong className="text-white">{userEmail}</strong>) n'a pas encore de classe assignée pour l'appel.
        </p>
        {onReturnDashboard && (
          <button
            onClick={onReturnDashboard}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Tableau de Bord</span>
          </button>
        )}
      </div>
    );
  }

  // 2. 403 SÉCURITÉ
  if (isSelectedClassForbidden) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-rose-500/40 text-center max-w-lg mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold uppercase mb-2">
          Erreur 403 · Non Autorisé
        </span>
        <h3 className="text-xl font-black text-white font-heading">
          Vous n'enseignez pas cette classe
        </h3>
        <p className="text-xs text-slate-300 mt-2">
          La classe <strong className="text-rose-400">« {selectedClasseNom} »</strong> ne fait pas partie de vos affectations.
        </p>
        <button
          onClick={() => setSelectedClasseNom(assignedClassNames[0])}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes classes</span>
        </button>
      </div>
    );
  }

  const presents = classStudents.filter(e => getRecord(e.id).statut === 'Présent').length;
  const absents = classStudents.filter(e => getRecord(e.id).statut === 'Absent').length;
  const retards = classStudents.filter(e => getRecord(e.id).statut === 'Retard').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5" />
              Appel & Pointage Journalier
            </span>
            {isProf && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <Lock className="w-2.5 h-2.5" />
                Vos Classes Uniquement
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
            Registre des Présences · {selectedClasseNom}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Faire l'appel en direct pour vos élèves assignés et alerter immédiatement les parents via WhatsApp.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={classStudents.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Valider l'Appel ({date})</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Select Classe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 text-xs font-semibold">
                Sélectionner la Classe
              </label>
              {isProf && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  🔒 Assigné
                </span>
              )}
            </div>
            <select
              value={selectedClasseNom}
              onChange={(e) => setSelectedClasseNom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:outline-hidden focus:border-amber-500 transition-colors"
            >
              {assignedClassNames.map(nom => (
                <option key={nom} value={nom}>
                  Classe {nom} {isProf ? '(Vos affectations)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5">
              Date de la Séance (par défaut aujourd'hui)
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500 transition-colors"
            />
          </div>

        </div>

        {/* 3 Indicators Bar */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Présents</span>
            <span className="text-xl font-black font-mono text-emerald-300">{presents}</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30">
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Absents</span>
            <span className="text-xl font-black font-mono text-rose-300">{absents}</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Retards</span>
            <span className="text-xl font-black font-mono text-amber-300">{retards}</span>
          </div>
        </div>
      </div>

      {/* Table Élèves de cette classe uniquement */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
              Feuille d'Appel : {selectedClasseNom} ({classStudents.length} élèves)
            </h3>
            <p className="text-xs text-slate-400">
              Cochez le statut de chaque élève pour le cours du {date}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Ne montre PAS les élèves d'autres classes
          </span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Élève & Matricule</th>
                <th className="py-2.5 px-3 text-center">Pointage Présence</th>
                <th className="py-2.5 px-3 text-center">Motif Justifié ?</th>
                <th className="py-2.5 px-3 text-right">Alerte Parent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {classStudents.map((st) => {
                const rec = getRecord(st.id);

                return (
                  <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white block">{st.nom} {st.prenom}</span>
                      <span className="text-[10px] font-mono text-slate-400">{st.matricule} · <strong className="text-amber-400">{selectedClasseNom}</strong></span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleSetStatut(st.id, 'Présent')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            rec.statut === 'Présent'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Présent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatut(st.id, 'Absent')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            rec.statut === 'Absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetStatut(st.id, 'Retard')}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            rec.statut === 'Retard'
                              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Retard
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {rec.statut !== 'Présent' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleJustifie(st.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                            rec.justifie
                              ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {rec.justifie ? '✓ Justifié' : 'Non justifié'}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[11px]">--</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {rec.statut === 'Absent' ? (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(st)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition-all cursor-pointer"
                        >
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>Alerter WhatsApp</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-600 font-mono">--</span>
                      )}
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
