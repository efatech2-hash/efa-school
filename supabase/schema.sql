-- ==============================================================================
-- EFA SCHOOL - Architecture Supabase PostgreSQL V2
-- EFA TECHNOLOGIE · Lomé, Togo
-- Matrice Multi-Cycles : cycle_id ENUM('primaire', 'college', 'lycee', 'all')
-- ==============================================================================

-- 1. Types ENUM
CREATE TYPE cycle_type AS ENUM ('primaire', 'college', 'lycee', 'all');
CREATE TYPE user_role_type AS ENUM ('fondateur', 'directeur', 'censeur', 'caisse', 'professeur');
CREATE TYPE subscription_tier_type AS ENUM ('starter', 'pro', 'premium', 'etat', 'special');
CREATE TYPE finance_type AS ENUM ('frais_scolarite', 'salaire', 'depense');
CREATE TYPE note_statut_type AS ENUM ('brouillon', 'valide_prof', 'verifie_censeur', 'valide_proviseur');
CREATE TYPE finance_statut_type AS ENUM ('en_attente', 'valide', 'rejete', 'decharge_signee');

-- 2. Table: users
-- Stocke les comptes employés et directeurs avec leur cycle_id associé et abonnement
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  role user_role_type NOT NULL DEFAULT 'professeur',
  cycle_id cycle_type NOT NULL DEFAULT 'all',
  pin VARCHAR(4) NOT NULL,
  telephone TEXT,
  subscription_tier subscription_tier_type NOT NULL DEFAULT 'pro',
  logo_ecole TEXT,
  statut TEXT NOT NULL DEFAULT 'actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Table: eleves
-- Fiches des élèves rattachées au cycle scolaire avec contact WhatsApp des parents
CREATE TABLE IF NOT EXISTS eleves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  classe TEXT NOT NULL,
  cycle_id cycle_type NOT NULL,
  parent_nom TEXT NOT NULL,
  parent_contact TEXT NOT NULL, -- WhatsApp obligatoire (ex: +228 90 00 00 00)
  scolarite_total NUMERIC NOT NULL DEFAULT 150000,
  montant_paye NUMERIC NOT NULL DEFAULT 0,
  date_naissance DATE,
  sexe VARCHAR(1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table: notes
-- Notes sur 20 saisies par les enseignants et contrôlées par le Censeur/Proviseur
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eleve_id UUID NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
  matiere TEXT NOT NULL,
  valeur NUMERIC(4, 2) NOT NULL CHECK (valeur >= 0 AND valeur <= 20),
  trimestre INT NOT NULL DEFAULT 1 CHECK (trimestre IN (1, 2, 3)),
  type_evaluation TEXT NOT NULL DEFAULT 'Devoir 1', -- Devoir 1, Devoir 2, Composition
  prof_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cycle_id cycle_type NOT NULL,
  statut note_statut_type NOT NULL DEFAULT 'brouillon',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Table: finance
-- Journal unifié : Recouvrement écolage, Salaires et Dépenses d'établissement
CREATE TABLE IF NOT EXISTS finance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type finance_type NOT NULL,
  montant NUMERIC NOT NULL CHECK (montant > 0),
  cycle_id cycle_type NOT NULL,
  description TEXT NOT NULL,
  eleve_id UUID REFERENCES eleves(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  statut finance_statut_type NOT NULL DEFAULT 'valide',
  recu_numero TEXT,
  mode_reglement TEXT NOT NULL DEFAULT 'Espèces', -- Espèces, T-Money, Flooz, Virement
  date_transaction DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEX & OPTIMISATIONS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_cycle_id ON users(cycle_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_eleves_cycle_id ON eleves(cycle_id);
CREATE INDEX IF NOT EXISTS idx_eleves_classe ON eleves(classe);
CREATE INDEX IF NOT EXISTS idx_notes_eleve_id ON notes(eleve_id);
CREATE INDEX IF NOT EXISTS idx_notes_cycle_id ON notes(cycle_id);
CREATE INDEX IF NOT EXISTS idx_finance_cycle_id ON finance(cycle_id);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance(type);

-- ==============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS) & RÈGLES D'OR
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE eleves ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance ENABLE ROW LEVEL SECURITY;

-- 1. Le Fondateur (cycle_id = 'all') a accès à tout
CREATE POLICY "Fondateur accès total users" ON users FOR ALL USING (true);
CREATE POLICY "Fondateur accès total eleves" ON eleves FOR ALL USING (true);
CREATE POLICY "Fondateur accès total notes" ON notes FOR ALL USING (true);
CREATE POLICY "Fondateur accès total finance" ON finance FOR ALL USING (true);

-- 2. Règle d'or: La Caisse n'a AUCUN accès aux tables notes
-- (Pas de politique SELECT/INSERT/UPDATE sur la table notes pour le rôle caisse)

-- 3. Règle d'or: Les Professeurs n'ont AUCUN accès à la table finance
-- (Pas de politique SELECT/INSERT/UPDATE sur la table finance pour le rôle professeur, sauf leur propre salaire)

-- ==============================================================================
-- DONNÉES INITIALES (DEMO EFA SCHOOL TOGO)
-- ==============================================================================

-- Utilisateurs clés par cycle
INSERT INTO users (email, nom, role, cycle_id, pin, telephone) VALUES
  ('fondateur@efa.com', 'Fondateur EFA', 'fondateur', 'all', '9999', '+228 90 00 00 01'),
  ('directeur@efa.com', 'Paul DOSSOU (Proviseur)', 'directeur', 'lycee', '8888', '+228 90 00 00 02'),
  ('principal@efa.com', 'Mireille MENSAH (Principal)', 'directeur', 'college', '7777', '+228 90 00 00 03'),
  ('dir.primaire@efa.com', 'Kokou AMEGAN (Dir. Primaire)', 'directeur', 'primaire', '6666', '+228 90 00 00 04'),
  ('censeur.lycee@efa.com', 'Dr. Ayité JOHNSON (Censeur Lycée)', 'censeur', 'lycee', '5555', '+228 90 00 00 05'),
  ('censeur.college@efa.com', 'Akossiwa KOUASSI (Censeur Collège)', 'censeur', 'college', '4444', '+228 90 00 00 06'),
  ('caisse@efa.com', 'Awa OUEDRAOGO (Caisse Centrale)', 'caisse', 'all', '1111', '+228 90 00 00 07'),
  ('prof.koffi@efa.com', 'Prof. Koffi AGBEKO (Mathématiques)', 'professeur', 'lycee', '1234', '+228 90 00 00 08'),
  ('prof.awa@efa.com', 'Prof. Awa TOURE (Lettres & Français)', 'professeur', 'college', '2222', '+228 90 00 00 09')
ON CONFLICT (email) DO NOTHING;
