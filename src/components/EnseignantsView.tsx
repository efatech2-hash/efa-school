import React, { useState } from 'react';
import { 
  Briefcase, Plus, Phone, Mail, 
  CheckCircle, DollarSign, ExternalLink, X, AlertCircle
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { Enseignant } from '../types';
import { formatCurrency, buildWhatsAppLink } from '../utils/formatters';

export const EnseignantsView: React.FC = () => {
  const { enseignants, classes, addEnseignant, deleteEnseignant } = useSchool();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [titre, setTitre] = useState('Professeur de Mathématiques');
  const [telephone, setTelephone] = useState('+229 97 ');
  const [email, setEmail] = useState('');
  const [matieresInput, setMatieresInput] = useState('Mathématiques');
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [salaireMensuel, setSalaireMensuel] = useState(180000);
  const [error, setError] = useState('');

  // Total payroll
  const masseSalariale = enseignants.reduce((acc, ens) => acc + (ens.salaireMensuel || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim()) {
      setError('Nom et prénom sont obligatoires.');
      return;
    }
    if (!telephone.trim() || telephone.length < 8) {
      setError('Numéro de téléphone WhatsApp requis.');
      return;
    }

    const matieres = matieresInput.split(',').map(m => m.trim()).filter(Boolean);

    addEnseignant({
      nom: nom.trim().toUpperCase(),
      prenom: prenom.trim(),
      titre: titre.trim(),
      telephone: telephone.trim(),
      email: email.trim() || `${prenom.toLowerCase()}.${nom.toLowerCase()}@efa-school.com`,
      matieres: matieres.length ? matieres : ['Enseignement Général'],
      classesIds: selectedClassId ? [selectedClassId] : [],
      salaireMensuel: Number(salaireMensuel),
      statut: 'Actif',
    });

    setIsModalOpen(false);
    setNom('');
    setPrenom('');
    setError('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white font-heading">
            Gestion du Corps Enseignant & Masse Salariale
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {enseignants.length} enseignants · Masse salariale mensuelle : <strong className="text-amber-400 font-mono">{formatCurrency(masseSalariale)}</strong>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-sm shadow-amber-500/20"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          <span>+ Ajouter un Enseignant</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {enseignants.map((ens) => {
          const assignedClasses = classes.filter(c => ens.classesIds?.includes(c.id));

          return (
            <div
              key={ens.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-base">
                      {ens.nom[0]}{ens.prenom[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        {ens.nom} {ens.prenom}
                      </h3>
                      <p className="text-[11px] text-amber-400/90 font-medium">
                        {ens.titre || 'Professeur'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                    {ens.statut}
                  </span>
                </div>

                {/* Subjects & Classes */}
                <div className="mt-4 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Matière(s)</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {ens.matieres.map((m, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-200 text-[10px]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Classe(s) assignée(s)</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {assignedClasses.length > 0 ? (
                        assignedClasses.map(c => (
                          <span key={c.id} className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-300 text-[10px] font-semibold">
                            {c.nom}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[10px]">Non assignée</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Salaire mensuel :</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      {formatCurrency(ens.salaireMensuel)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <a
                  href={buildWhatsAppLink(ens.telephone, `Bonjour ${ens.titre || 'Professeur'} ${ens.nom}, direction EFA SCHOOL...`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`mailto:${ens.email}`}
                  className="text-slate-400 hover:text-white text-[11px] inline-flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{ens.email}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: NOUVEL ENSEIGNANT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl text-slate-100 overflow-hidden my-8">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm font-heading">
                Ajouter un Enseignant
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {error && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: KOUASSI"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Sylvestre"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Titre / Spécialité</label>
                <input
                  type="text"
                  placeholder="ex: Professeur Certifié de Mathématiques"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Téléphone WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+229 97 ..."
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Salaire Mensuel (F CFA)</label>
                  <input
                    type="number"
                    step="5000"
                    min="50000"
                    required
                    value={salaireMensuel}
                    onChange={(e) => setSalaireMensuel(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Matières enseignées (séparées par virgules)</label>
                <input
                  type="text"
                  placeholder="ex: Mathématiques, Sciences Physiques"
                  value={matieresInput}
                  onChange={(e) => setMatieresInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Classe principale assignée</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">-- Aucune classe pour l'instant --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
