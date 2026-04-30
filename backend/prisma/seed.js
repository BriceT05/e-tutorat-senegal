const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TUTEURS = [
  {
    prenom: 'Ibrahima', nom: 'Diallo', email: 'ibrahima.diallo@etutorat.sn',
    bio: 'Professeur de mathématiques avec 8 ans d\'expérience dans les lycées dakarois. Spécialisé en préparation au Baccalauréat.',
    diplome: 'Master Mathématiques — UCAD', region: 'Dakar',
    matieres: ['Mathématiques', 'Physique-Chimie'], niveaux: ['Lycée (2nde–Tle)', 'Supérieur'],
    tarif: 3500, modeCours: 'Les deux', noteAvg: 4.9, nbAvis: 87,
  },
  {
    prenom: 'Fatou', nom: 'Sow', email: 'fatou.sow@etutorat.sn',
    bio: 'Enseignante certifiée en français et littérature. Aidez vos enfants à maîtriser la langue de Molière avec bienveillance.',
    diplome: 'Licence Lettres Modernes — UGB Saint-Louis', region: 'Saint-Louis',
    matieres: ['Français', 'Histoire-Géo'], niveaux: ['Primaire (CI–CM2)', 'Collège (6ème–3ème)'],
    tarif: 2500, modeCours: 'À domicile', noteAvg: 4.8, nbAvis: 63,
  },
  {
    prenom: 'Moussa', nom: 'Ndoye', email: 'moussa.ndoye@etutorat.sn',
    bio: 'Ingénieur logiciel et formateur en informatique. Cours de Python, JavaScript et algorithmes adaptés à tous niveaux.',
    diplome: 'Ingénieur Informatique — ESP Dakar', region: 'Dakar',
    matieres: ['Informatique', 'Mathématiques'], niveaux: ['Lycée (2nde–Tle)', 'Supérieur'],
    tarif: 5000, modeCours: 'En ligne', noteAvg: 4.7, nbAvis: 41,
  },
  {
    prenom: 'Aïssatou', nom: 'Diop', email: 'aissatou.diop@etutorat.sn',
    bio: 'Native anglophone et professeure certifiée TEFL. Cours d\'anglais conversationnel, TOEFL et préparation aux examens.',
    diplome: 'Bachelor English Studies — University of Ghana', region: 'Thiès',
    matieres: ['Anglais', 'Espagnol'], niveaux: ['Collège (6ème–3ème)', 'Lycée (2nde–Tle)', 'Supérieur'],
    tarif: 4000, modeCours: 'En ligne', noteAvg: 5.0, nbAvis: 112,
  },
  {
    prenom: 'Cheikh', nom: 'Fall', email: 'cheikh.fall@etutorat.sn',
    bio: 'Médecin et tuteur en SVT et Biologie. Pédagogie claire pour les élèves qui visent la filière scientifique.',
    diplome: 'Docteur en Médecine — FMPOS Dakar', region: 'Dakar',
    matieres: ['SVT', 'Physique-Chimie'], niveaux: ['Lycée (2nde–Tle)', 'Supérieur'],
    tarif: 6000, modeCours: 'Les deux', noteAvg: 4.6, nbAvis: 29,
  },
  {
    prenom: 'Mariama', nom: 'Ba', email: 'mariama.ba@etutorat.sn',
    bio: 'Professeure d\'arabe coranique et langue arabe moderne. Cours pour enfants et adultes débutants à avancés.',
    diplome: 'Licence Langue Arabe — Université Islamique de Médine', region: 'Kaolack',
    matieres: ['Arabe'], niveaux: ['Primaire (CI–CM2)', 'Collège (6ème–3ème)', 'Lycée (2nde–Tle)'],
    tarif: 2000, modeCours: 'À domicile', noteAvg: 4.8, nbAvis: 55,
  },
  {
    prenom: 'Ousmane', nom: 'Thiam', email: 'ousmane.thiam@etutorat.sn',
    bio: 'Expert en Économie et Gestion. Prépare les élèves de Terminale G et les étudiants en Licence d\'économie.',
    diplome: 'Master Économie — FASEG Dakar', region: 'Dakar',
    matieres: ['Économie', 'Mathématiques'], niveaux: ['Lycée (2nde–Tle)', 'Supérieur'],
    tarif: 3000, modeCours: 'En ligne', noteAvg: 4.5, nbAvis: 38,
  },
  {
    prenom: 'Rokhaya', nom: 'Ndiaye', email: 'rokhaya.ndiaye@etutorat.sn',
    bio: 'Tutrice expérimentée du primaire. Méthodes ludiques et bienveillantes pour que l\'enfant prenne goût aux études.',
    diplome: 'CFEE — École Normale Supérieure', region: 'Mbour',
    matieres: ['Mathématiques', 'Français', 'Histoire-Géo'], niveaux: ['Primaire (CI–CM2)'],
    tarif: 1500, modeCours: 'À domicile', noteAvg: 4.9, nbAvis: 74,
  },
  {
    prenom: 'Serigne', nom: 'Mbaye', email: 'serigne.mbaye@etutorat.sn',
    bio: 'Philosophe et enseignant. Cours de philo pour Terminale, aide à la dissertation et à l\'argumentation.',
    diplome: 'Master Philosophie — UCAD', region: 'Touba',
    matieres: ['Philosophie', 'Français'], niveaux: ['Lycée (2nde–Tle)'],
    tarif: 2500, modeCours: 'Les deux', noteAvg: 4.4, nbAvis: 21,
  },
];

async function main() {
  console.log('🌱 Seeding tuteurs...');

  const hash = await bcrypt.hash('Tutorat2026!', 10);

  for (const t of TUTEURS) {
    const exists = await prisma.user.findUnique({ where: { email: t.email } });
    if (exists) {
      console.log(`  ⏭  ${t.prenom} ${t.nom} déjà en base`);
      continue;
    }

    await prisma.user.create({
      data: {
        ...t,
        password: hash,
        role: 'TUTEUR',
      },
    });

    console.log(`  ✅ ${t.prenom} ${t.nom}`);
  }

  console.log('✨ Seed terminé !');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
