import React, { useState } from 'react';
import { X, UserPlus, Phone, User, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Sexe } from '../types';

interface NewStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClassId?: string;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  isOpen,
  onClose,
  preselectedClassId,
}) => {
  const { classes, addEleve } = useSchool();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('2018-05-12');
  const [sexe, setSexe] = useState<Sexe>('M');
  const [classeId, setClasseId] = useState(preselectedClassId || classes[0]?.id || '');
  const [parent1Nom, setParent1Nom] = useState('');
  const [parent1Tel, setParent1Tel] = useState('+229 ');
  const [parent1Profession, setParent1Profession] = useState('');
  const [parent1Lien, setParent1Lien] = useState<'Père' | 'Mère' | 'Tuteur'>('Père');

  const [parent2Nom, setParent2Nom] = useState('');
  const [parent2Tel, setParent2Tel] = useState('');
  const [parent2Profession, setParent2Profession] = useState('');

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedClass = classes.find(c => c.id === (classeId || preselectedClassId));
  const scolarite = selectedClass?.scolariteAnnuelle || 120000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      setError('Veuillez renseigner le nom et le prénom de l\'élève.');
      return;
    }
    if (!parent1Nom.trim() || !parent1Tel.trim() || parent1Tel.length < 8) {
      setError('Le contact WhatsApp du Parent 1 est obligatoire pour les notifications.');
      return;
    }

    addEleve({
      nom: nom.trim().toUpperCase(),
      prenom: prenom.trim(),
      dateNaissance,
      sexe,
      classeId: classeId || (classes[0]?.id || ''),
      photo: undefined,
      parent1: {
        nom: parent1Nom.trim(),
        telephone: parent1Tel.trim(),
        profession: parent1Profession.trim() || undefined,
        lienParente: parent1Lien,
      },
      parent2: parent2Nom.trim() ? {
        nom: parent2Nom.trim(),
        telephone: parent2Tel.trim() || undefined,
        profession: parent2Profession.trim() || undefined,
        lienParente: 'Mère',
      } : undefined,
      scolariteTotal: scolarite,
      montantPaye: 0,
      dateInscription: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                Inscription d'un Nouvel Élève
              </h3>
              <p className="text-[11px] text-slate-400">
                Génération automatique du matricule et fiche parent WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section: Informations Élève */}
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>Identité de l'Élève</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: KOUASSI"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Prénom(s) *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Marc Aurel"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Sexe</label>
                <select
                  value={sexe}
                  onChange={(e) => setSexe(e.target.value as Sexe)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="M">Masculin (Garçon)</option>
                  <option value="F">Féminin (Fille)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Classe d'affectation *</label>
                <select
                  value={classeId}
                  onChange={(e) => setClasseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-semibold text-amber-300"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} ({c.scolariteAnnuelle.toLocaleString()} F)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Parent 1 (Obligatoire avec WhatsApp) */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>Parent / Tuteur Principal (WhatsApp Requis)</span>
              </div>
              <span className="text-[10px] text-emerald-400/80 font-normal">Obligatoire pour relances</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nom complet du Parent 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: KOUASSI Patrice"
                  value={parent1Nom}
                  onChange={(e) => setParent1Nom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Téléphone WhatsApp (avec indicatif) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+229 97 00 00 00"
                  value={parent1Tel}
                  onChange={(e) => setParent1Tel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-emerald-500 font-mono text-emerald-300 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Lien de parenté</label>
                <select
                  value={parent1Lien}
                  onChange={(e) => setParent1Lien(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur">Tuteur Légal</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Profession (Optionnel)</label>
                <input
                  type="text"
                  placeholder="ex: Enseignant, Commerçant..."
                  value={parent1Profession}
                  onChange={(e) => setParent1Profession(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Parent 2 (Optionnel) */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              Second Parent / Contact d'Urgence (Optionnel)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Nom Parent 2</label>
                <input
                  type="text"
                  placeholder="ex: KOUASSI Diane"
                  value={parent2Nom}
                  onChange={(e) => setParent2Nom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Téléphone Parent 2</label>
                <input
                  type="text"
                  placeholder="+229 ..."
                  value={parent2Tel}
                  onChange={(e) => setParent2Tel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
            >
              Valider l'Inscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
