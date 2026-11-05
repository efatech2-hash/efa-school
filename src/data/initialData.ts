import { Classe, Eleve, Depense, Enseignant, MessageWhatsApp, ParametresEcole, Paiement, NoteMatiere, PresenceRecord, Sexe, SessionType } from '../types';

export const initialParametres: ParametresEcole = {
  nom: "Complexe Scolaire EFA Excellence",
  slogan: "La technologie devient enfin facile",
  directeur: "M. Mensah KODJO",
  promoteur: "EFA TECHNOLOGIE",
  anneeScolaire: "2025 - 2026",
  deviseMonetaire: "F CFA",
  telephone: "+228 90 00 12 34",
  email: "efatech2@gmail.com",
  adresse: "Boulevard Circulaire, Quartier Administratif",
  ville: "Lomé",
  pays: "Togo",
  tauxRelanceAlerteJours: 15,
};

export const initialClasses: Classe[] = [
  {
    id: "cls-6e-a",
    nom: "6ème A",
    niveau: "6e",
    groupe: "A",
    session: "college",
    salle: "Bâtiment Collège · Salle 03",
    effectifMax: 30,
    scolariteAnnuelle: 160000,
    enseignantPrincipal: "Prof. Koffi ADANGBE",
    description: "Classe de Sixième - Section A (Collège)",
  },
  {
    id: "cls-5e-b",
    nom: "5ème B",
    niveau: "5e",
    groupe: "B",
    session: "college",
    salle: "Bâtiment Collège · Salle 07",
    effectifMax: 30,
    scolariteAnnuelle: 170000,
    enseignantPrincipal: "Prof. Koffi ADANGBE",
    description: "Classe de Cinquième - Section B (Collège)",
  },
  {
    id: "cls-cp1-a",
    nom: "CP1-A",
    niveau: "CP1",
    groupe: "A",
    session: "primaire",
    salle: "Bâtiment Primaire · Salle 01",
    effectifMax: 30,
    scolariteAnnuelle: 120000,
    enseignantPrincipal: "Mme Clarisse TCHIBOZO",
    description: "Classe de cours préparatoire première année - Section A",
  },
  {
    id: "cls-ce2-b",
    nom: "CE2-B",
    niveau: "CE2",
    groupe: "B",
    session: "primaire",
    salle: "Bâtiment Primaire · Salle 06",
    effectifMax: 32,
    scolariteAnnuelle: 150000,
    enseignantPrincipal: "M. Jean-Marc DOSSOU",
    description: "Classe de cours élémentaire deuxième année - Section B",
  },
  {
    id: "cls-tle-d",
    nom: "Tle D",
    niveau: "Tle",
    groupe: "A",
    session: "lycee",
    serie: "D",
    salle: "Bâtiment Lycée · Salle 12",
    effectifMax: 36,
    scolariteAnnuelle: 220000,
    enseignantPrincipal: "Prof. Anselme KPADONOU",
    description: "Terminale Scientifique Série D (Biologie et Mathématiques)",
  },
];

// Helper to generate realistic students
const boyNames = [
  "Ablam", "Emmanuel", "David", "Mohamed", "Kevin", "Marc", "Fabrice", "Rodrigue", 
  "Prince", "Samuel", "Moïse", "Landry", "Boris", "Alex", "Cedric", "Arnaud", 
  "Josué", "Ange", "Junior", "Fidèle", "Yannick", "Gilles", "Prosper", "Christian", "Ulrich"
];

const girlNames = [
  "Fatima", "Marie-Claire", "Grace", "Awa", "Aminata", "Priscille", "Estelle", "Ornella", 
  "Gloria", "Bintou", "Mariam", "Cynthia", "Sephora", "Vanessa", "Nafissatou", "Danielle", 
  "Rolande", "Inès", "Murielle", "Mirabelle", "Sonia", "Ruth", "Espérance", "Chantal", "Diane"
];

const lastNames = [
  "ADANGBE", "AGOSSOU", "BIO", "DOSSOU", "HOUNGBEDJI", "KOUASSI", "MENSAH", "TRAORE", 
  "DIALLO", "SOW", "TOURE", "KOFFI", "ADEBAYO", "KPODONOU", "ZINSOU", "BELLO", 
  "CHABI", "GBAGUIDI", "LAWSON", "N'GUESSAN", "OUEDRAOGO", "SANOGO", "TALL", "YAROU", 
  "DAOUDA", "SOSSOU", "FAYE", "CAMARA", "CISSE", "KONATE", "BAH", "NDIAYE", "KONE", 
  "DIOP", "SYLLA", "KABORE", "COMPAORE", "DIAKITE", "FOFANA", "BARRY"
];

const professions = [
  "Commerçant(e)", "Enseignant(e)", "Ingénieur(e)", "Comptable", "Fonctionnaire", 
  "Infirmier(ère)", "Entrepreneur", "Artisan", "Cadre Bancaire", "Médecin"
];

function generateStudentsForClass(
  classeId: string, 
  prefixMatricule: string, 
  count: number, 
  scolarite: number,
  birthYearRange: [number, number],
  matieresList: string[],
  session: SessionType
): Eleve[] {
  const students: Eleve[] = [];

  for (let i = 1; i <= count; i++) {
    const isGirl = i % 2 === 0;
    const prenom = isGirl ? girlNames[(i * 3) % girlNames.length] : boyNames[(i * 7) % boyNames.length];
    const nom = lastNames[(i * 5) % lastNames.length];
    const birthYear = birthYearRange[0] + (i % (birthYearRange[1] - birthYearRange[0] + 1));
    const birthMonth = String((i % 12) + 1).padStart(2, '0');
    const birthDay = String((i % 27) + 1).padStart(2, '0');
    
    // Vary payments:
    // ~40% Soldé (100%)
    // ~40% Partiel (30% to 75%)
    // ~20% Impayé (0% or minimal inscription)
    let montantPaye = 0;
    const paiements: Paiement[] = [];
    const paymentTier = i % 10;

    const matricule = `${prefixMatricule}-${String(i).padStart(3, '0')}`;
    const p1Phone = `+229 97 ${String(10 + (i * 3) % 89).padStart(2, '0')} ${String(20 + (i * 7) % 79).padStart(2, '0')} ${String(30 + (i * 2) % 69).padStart(2, '0')}`;

    if (paymentTier < 4) {
      // Soldé (100% paid in 2 or 3 installments)
      montantPaye = scolarite;
      const p1Amount = Math.floor(scolarite * 0.5);
      const p2Amount = scolarite - p1Amount;
      paiements.push({
        id: `pay-${classeId}-${i}-1`,
        eleveId: matricule,
        numeroRecu: `REC-2025-${String(100 + i * 3).padStart(4, '0')}`,
        date: "2025-09-12",
        montant: p1Amount,
        motif: "Inscription",
        mode: i % 2 === 0 ? "MTN MoMo" : "Espèces",
        reference: `MOMO-84920${i}`,
        recuPar: "Caisse EFA Excellence",
      });
      paiements.push({
        id: `pay-${classeId}-${i}-2`,
        eleveId: matricule,
        numeroRecu: `REC-2025-${String(200 + i * 3).padStart(4, '0')}`,
        date: "2025-11-20",
        montant: p2Amount,
        motif: "Solde",
        mode: i % 3 === 0 ? "Wave" : "Espèces",
        reference: `WV-39201${i}`,
        recuPar: "Caisse EFA Excellence",
      });
    } else if (paymentTier < 8) {
      // Partiel (paid between 40% and 75%)
      const ratio = (paymentTier === 4 ? 0.35 : paymentTier === 5 ? 0.5 : paymentTier === 6 ? 0.65 : 0.75);
      montantPaye = Math.round((scolarite * ratio) / 5000) * 5000;
      paiements.push({
        id: `pay-${classeId}-${i}-1`,
        eleveId: matricule,
        numeroRecu: `REC-2025-${String(300 + i * 3).padStart(4, '0')}`,
        date: "2025-09-15",
        montant: montantPaye,
        motif: "Tranche 1",
        mode: i % 2 === 0 ? "Moov Money" : "Espèces",
        reference: `MOOV-1029${i}`,
        recuPar: "Caisse EFA Excellence",
      });
    } else {
      // Impayé / Retard (paid 0 or tiny advance)
      if (paymentTier === 8) {
        montantPaye = 20000;
        paiements.push({
          id: `pay-${classeId}-${i}-1`,
          eleveId: matricule,
          numeroRecu: `REC-2025-${String(400 + i * 3).padStart(4, '0')}`,
          date: "2025-09-10",
          montant: 20000,
          motif: "Inscription",
          mode: "Espèces",
          recuPar: "Caisse EFA Excellence",
        });
      } else {
        montantPaye = 0;
      }
    }

    // Generate subject notes
    const notes: NoteMatiere[] = matieresList.map((matiere, mIdx) => {
      const baseGrade = 9 + ((i * 3 + mIdx * 5) % 9); // between 9 and 17.5
      const d1 = Math.min(20, Math.max(7, baseGrade - (i % 3) * 0.5));
      const d2 = Math.min(20, Math.max(8, baseGrade + ((i + mIdx) % 3) * 0.5));
      const exam = Math.min(20, Math.max(7.5, (d1 + d2) / 2 + ((i * mIdx) % 3) * 0.5));
      return {
        matiere,
        devoir1: Number(d1.toFixed(1)),
        devoir2: Number(d2.toFixed(1)),
        examen: Number(exam.toFixed(1)),
        coefficient: mIdx < 2 ? 3 : 2,
        appreciation: exam >= 14 ? "Très bon travail" : exam >= 12 ? "Bon travail" : exam >= 10 ? "Passable" : "Des efforts nécessaires",
      };
    });

    // Attendance records
    const presences: PresenceRecord[] = [
      { date: "2025-10-14", statut: "Présent", justifie: true },
      { date: "2025-10-21", statut: (i % 7 === 0) ? "Absent" : "Présent", motif: (i % 7 === 0) ? "Fièvre paludéenne" : undefined, justifie: (i % 7 === 0) },
      { date: "2025-10-28", statut: (i % 9 === 0) ? "Retard" : "Présent", motif: (i % 9 === 0) ? "Embouteillages carrefour" : undefined, justifie: true },
    ];

    students.push({
      id: `std-${classeId}-${i}`,
      matricule,
      nom,
      prenom,
      dateNaissance: `${birthYear}-${birthMonth}-${birthDay}`,
      sexe: (isGirl ? 'F' : 'M') as Sexe,
      classeId,
      session,
      photo: undefined,
      parent1: {
        nom: `${nom} ${isGirl ? 'Patrice' : 'Koffi'}`,
        telephone: p1Phone,
        profession: professions[(i * 3) % professions.length],
        lienParente: isGirl ? 'Père' : 'Mère',
      },
      parent2: (i % 3 === 0) ? {
        nom: `${nom} Victoire`,
        telephone: `+229 96 ${String(30 + (i * 2) % 65).padStart(2, '0')} 11 22`,
        profession: professions[(i + 4) % professions.length],
        lienParente: 'Mère',
      } : undefined,
      scolariteTotal: scolarite,
      montantPaye,
      paiements,
      notes,
      presences,
      dateInscription: "2025-09-08",
    });
  }

  return students;
}

const sixiemeSubjects = ["Maths", "Français", "Anglais", "Histoire-Géo", "SVT"];
const cinquiemeSubjects = ["Maths", "Français", "Anglais", "Physique-Chimie", "SVT"];
const cp1Subjects = ["Lecture & Écriture", "Mathématiques & Calcul", "Éveil & Dessin", "Expression Orale"];
const ce2Subjects = ["Français (Grammaire & Dictée)", "Mathématiques", "Histoire & Géographie", "Sciences & Hygiène", "Anglais Initiation"];
const tleDSubjects = ["Mathématiques", "Sciences de la Vie et de la Terre (SVT)", "Sciences Physiques & Chimie", "Français & Philosophie", "Anglais"];

export const initialEleves: Eleve[] = [
  ...generateStudentsForClass("cls-6e-a", "EFA-6A", 27, 160000, [2013, 2014], sixiemeSubjects, 'college'),
  ...generateStudentsForClass("cls-5e-b", "EFA-5B", 27, 170000, [2012, 2013], cinquiemeSubjects, 'college'),
  ...generateStudentsForClass("cls-cp1-a", "EFA-CP1", 25, 120000, [2018, 2019], cp1Subjects, 'primaire'),
  ...generateStudentsForClass("cls-ce2-b", "EFA-CE2", 30, 150000, [2015, 2016], ce2Subjects, 'primaire'),
  ...generateStudentsForClass("cls-tle-d", "EFA-TLE", 35, 220000, [2007, 2008], tleDSubjects, 'lycee'),
];

export const initialDepenses: Depense[] = [
  {
    id: "dep-001",
    date: "2025-10-02",
    categorie: "Salaire Enseignants",
    montant: 950000,
    session: "generale",
    description: "Paiement de la masse salariale des enseignants du Primaire et Secondaire (Septembre)",
    beneficiaire: "Corps Enseignant EFA Excellence",
    modePaiement: "Virement",
    reference: "VIR-SAL-0925",
  },
  {
    id: "dep-002",
    date: "2025-10-05",
    categorie: "Loyer",
    montant: 500000,
    session: "generale",
    description: "Loyer mensuel des locaux du complexe scolaire (Bâtiment A & B)",
    beneficiaire: "SCI Les Cocotiers",
    modePaiement: "Chèque",
    reference: "CHQ-83921",
  },
  {
    id: "dep-003",
    date: "2025-10-08",
    categorie: "Électricité",
    montant: 115000,
    session: "college",
    description: "Facture énergie SBEE - Climatisation des salles informatiques Collège et éclairage",
    beneficiaire: "Société Béninoise d'Énergie Électrique (SBEE)",
    modePaiement: "Mobile Money",
    reference: "SBEE-FAC-2025-10",
  },
  {
    id: "dep-004",
    date: "2025-10-12",
    categorie: "Fournitures",
    montant: 185000,
    session: "primaire",
    description: "Achat fournitures d'éveil, craies de couleur et cahiers de dessin Primaire",
    beneficiaire: "Papeterie Centrale de Cotonou",
    modePaiement: "Caisse",
    reference: "FAC-PAP-4821",
  },
  {
    id: "dep-005",
    date: "2025-10-15",
    categorie: "Taxes",
    montant: 120000,
    session: "generale",
    description: "Taxes communales et redevance d'assainissement scolaire",
    beneficiaire: "Mairie de Cotonou - Recette Fiscale",
    modePaiement: "Virement",
    reference: "TAX-2025-Q3",
  },
  {
    id: "dep-006",
    date: "2025-10-20",
    categorie: "Entretien & Travaux",
    montant: 75000,
    session: "lycee",
    description: "Révision de la verrerie et paillasses de laboratoire SVT / PCT Lycée",
    beneficiaire: "Artisan Plomberie & Bâtiment Sarl",
    modePaiement: "Mobile Money",
    reference: "MOMO-PLOMB-28",
  },
  {
    id: "dep-007",
    date: "2025-10-25",
    categorie: "Eau",
    montant: 42000,
    session: "generale",
    description: "Facture eau courante SONEB - Points d'eau et robinets cour",
    beneficiaire: "Société Nationale des Eaux du Bénin (SONEB)",
    modePaiement: "Mobile Money",
    reference: "SONEB-99214",
  },
];

export const initialEnseignants: Enseignant[] = [
  {
    id: "ens-01",
    nom: "TCHIBOZO",
    prenom: "Clarisse",
    session: "primaire",
    matieres: ["Français", "Éveil", "Mathématiques"],
    classesIds: ["cls-cp1-a"],
    salaireMensuel: 140000,
    telephone: "+229 97 11 22 33",
    email: "clarisse.tchibozo@efa-school.com",
    statut: "Actif",
    titre: "Professeur Titulaire CP1 (Primaire)",
  },
  {
    id: "ens-02",
    nom: "DOSSOU",
    prenom: "Jean-Marc",
    session: "primaire",
    matieres: ["Français", "Calcul", "Sciences & Hygiène"],
    classesIds: ["cls-ce2-b"],
    salaireMensuel: 160000,
    telephone: "+229 96 44 55 66",
    email: "jeanmarc.dossou@efa-school.com",
    statut: "Actif",
    titre: "Professeur Titulaire CE2 (Primaire)",
  },
  {
    id: "ens-03",
    nom: "KPADONOU",
    prenom: "Anselme",
    session: "lycee",
    matieres: ["Mathématiques"],
    classesIds: ["cls-tle-d"],
    salaireMensuel: 240000,
    telephone: "+229 95 77 88 99",
    email: "anselme.kpadonou@efa-school.com",
    statut: "Actif",
    titre: "Professeur Certifié de Mathématiques (Lycée)",
  },
  {
    id: "ens-04",
    nom: "BIO",
    prenom: "Gildas",
    session: "lycee",
    matieres: ["Sciences de la Vie et de la Terre (SVT)"],
    classesIds: ["cls-tle-d"],
    salaireMensuel: 220000,
    telephone: "+229 97 33 22 11",
    email: "gildas.bio@efa-school.com",
    statut: "Actif",
    titre: "Professeur de SVT (Lycée)",
  },
  {
    id: "ens-05",
    nom: "MENSAH",
    prenom: "Sylvestre",
    session: "lycee",
    matieres: ["Sciences Physiques & Chimie"],
    classesIds: ["cls-tle-d"],
    salaireMensuel: 230000,
    telephone: "+229 94 66 77 88",
    email: "sylvestre.mensah@efa-school.com",
    statut: "Actif",
    titre: "Professeur de Physique-Chimie (Lycée)",
  },
];

export const initialMessages: MessageWhatsApp[] = [
  {
    id: "msg-001",
    date: "2025-10-24 16:45",
    type: "Rappel Écolage",
    destinataireNom: "ADANGBE Koffi (Parent de ADANGBE Junior)",
    eleveNom: "ADANGBE Junior",
    classeNom: "Tle D",
    telephone: "+229 97 12 34 56",
    message: "Bonjour cher parent d'élève ADANGBE Junior (Tle D). La direction EFA SCHOOL vous rappelle cordialement qu'un solde de 120.000 F CFA reste dû sur la scolarité. Merci de vous rapprocher de la comptabilité.",
    statut: "Délivré",
  },
  {
    id: "msg-002",
    date: "2025-10-22 09:15",
    type: "Réunion Parents",
    destinataireNom: "Tous les Parents (Diffusion CP1-A)",
    classeNom: "CP1-A",
    telephone: "+229 97 88 00 11",
    message: "Chers parents d'élèves de la classe de CP1-A, vous êtes invités à la première rencontre trimestrielle de concertation pédagogique ce samedi à 09h00 précises au Complexe EFA Excellence.",
    statut: "Ouvert",
  },
  {
    id: "msg-003",
    date: "2025-10-20 08:30",
    type: "Absence",
    destinataireNom: "Mme DOSSOU Victoire",
    eleveNom: "DOSSOU Kevin",
    classeNom: "CE2-B",
    telephone: "+229 96 11 22 33",
    message: "Urgent EFA SCHOOL : Votre enfant DOSSOU Kevin a été constaté absent au cours ce matin. Veuillez informer la vie scolaire de la raison au plus vite.",
    statut: "Délivré",
  },
];
