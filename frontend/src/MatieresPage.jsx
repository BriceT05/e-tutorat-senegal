// Page matières — catalogue statique des disciplines groupées par catégorie.
// Charge le nombre de tuteurs par matière depuis l'API pour afficher un compteur en temps réel.
// Le clic sur une matière navigue vers TuteursPage avec le filtre pré-sélectionné.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from './api.js';
import {
  BookOpen, ArrowLeft, Users, ChevronRight, Search, GraduationCap, ArrowRight,
} from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

const FadeIn = ({ children, delay = 0, style = {} }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }} style={style}>
    {children}
  </motion.div>
);

const CATEGORIES = [
  {
    id: 'sciences',
    label: 'Sciences exactes',
    color: '#3B82F6',
    bg: '#EFF6FF',
    matieres: [
      { name: 'Mathématiques',                     image: '/Mathématique.jpg',    niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Algèbre, géométrie, analyse, probabilités' },
      { name: 'Physique-Chimie',                   image: '/Physique chimie.jpg', niveaux: ['Collège', 'Lycée'],             desc: 'Mécanique, thermodynamique, chimie organique' },
      { name: 'Sciences de la Vie et de la Terre', image: '/SVT.jpg', dbKey: 'SVT', niveaux: ['Collège', 'Lycée'],          desc: 'Biologie, géologie, écologie, génétique' },
    ],
  },
  {
    id: 'lettres',
    label: 'Lettres & Langues',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    matieres: [
      { name: 'Français',  image: '/Français.jpg',  niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Grammaire, dissertation, littérature, dictée' },
      { name: 'Anglais',   image: '/Anglais.jpg',   niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Conversation, grammaire, TOEFL, IELTS' },
      { name: 'Arabe',     image: '/Arabe.jpg',     niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Arabe classique, Coran, langue courante' },
      { name: 'Espagnol',  image: '/Espagnol.jpg',  niveaux: ['Collège', 'Lycée'],             desc: 'Grammaire, conversation, DELE' },
    ],
  },
  {
    id: 'sociales',
    label: 'Sciences sociales',
    color: '#10B981',
    bg: '#ECFDF5',
    matieres: [
      { name: 'Histoire-Géographie', image: '/Histoire Géograhie.jpg', dbKey: 'Histoire-Géo', niveaux: ['Collège', 'Lycée'], desc: 'Histoire du Sénégal, géo mondiale, cartographie' },
      { name: 'Philosophie',         image: '/Philosophie.jpg',        niveaux: ['Lycée'],              desc: 'Dissertation, commentaire de texte, argumentation' },
      { name: 'Économie',            image: '/Economie.jpg',           niveaux: ['Lycée'],              desc: 'Micro, macro-économie, gestion, comptabilité' },
      { name: 'Éducation civique',   image: '/Education civique.jpg',  niveaux: ['Primaire', 'Collège'], desc: 'Droits et devoirs, institutions sénégalaises' },
    ],
  },
  {
    id: 'tech',
    label: 'Informatique & Technologie',
    color: '#F97316',
    bg: '#FFF7ED',
    matieres: [
      { name: 'Informatique', image: '/Informatique.jpg', niveaux: ['Collège', 'Lycée'], desc: 'Word, Excel, bureautique' },
    ],
  },
  {
    id: 'arts',
    label: 'Arts & Divers',
    color: '#EC4899',
    bg: '#FDF2F8',
    matieres: [
      { name: 'Musique',                  image: '/Musique.jpg',          niveaux: ['Primaire', 'Collège'],           desc: 'Solfège, guitare, piano, chant' },
      { name: 'Arts plastiques',          image: '/Arts plastique.jpg',   niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Dessin, peinture, arts graphiques' },
      { name: 'Soutien scolaire général', image: '/Soutien scolaire.jpg', niveaux: ['Primaire', 'Collège'],           desc: 'Aide aux devoirs, méthode de travail, organisation' },
    ],
  },
];


export default function MatieresPage({ onGoHome, onTuteurs }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [tuteursByMatiere, setTuteursByMatiere] = useState({});
  const [totalTuteursAPI, setTotalTuteursAPI] = useState(null);

  useEffect(() => {
    api.get('/tuteurs').then(data => {
      const list = Array.isArray(data) ? data : [];
      setTotalTuteursAPI(list.length);
      const counts = {};
      list.forEach(t => {
        (t.matieres || []).forEach(m => { counts[m] = (counts[m] || 0) + 1; });
      });
      setTuteursByMatiere(counts);
    }).catch(() => {});
  }, []);

  // Certaines matières ont un dbKey différent du label affiché (ex: 'SVT', 'Histoire-Géo')
  // car la BDD stocke l'abréviation mais l'UI affiche le nom complet.
  const getTuteurCount = (m) => {
    const key = m.dbKey || m.name;
    return tuteursByMatiere[key] ?? null;
  };

  const filtered = CATEGORIES
    .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
    .map(cat => ({
      ...cat,
      matieres: cat.matieres.filter(m =>
        search === '' || m.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.matieres.length > 0);

  const totalMatieres = CATEGORIES.reduce((sum, c) => sum + c.matieres.length, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS }}>
      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,253,245,0.95)',
        backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', height: '72px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={onGoHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: SANS }}>
            <ArrowLeft size={20} /> Accueil
          </button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: '1.3rem', color: C.text }}>Toutes les matières</span>
          </div>
          <button onClick={onTuteurs} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.primary, border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: SANS, padding: '8px 18px', borderRadius: '999px' }}>
            Nos tuteurs <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.accent} 0%, rgba(251,191,36,0.1) 100%)`, padding: '64px 5% 52px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(249,115,22,0.1)', padding: '7px 16px', borderRadius: '100px', color: C.primary, fontWeight: 700, fontSize: '0.85rem', marginBottom: '20px' }}>
              <BookOpen size={15} /> {totalMatieres} matières disponibles
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', color: C.text, fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px 0' }}>
              Toutes les <span style={{ color: C.primary, fontStyle: 'italic' }}>matières</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: C.muted, maxWidth: '560px', lineHeight: 1.6, margin: '0 0 32px 0' }}>
              Du CI à la Terminale et au-delà — nos tuteurs qualifiés couvrent toutes les matières du programme sénégalais.
            </p>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { icon: BookOpen, value: `${totalMatieres}+`, label: 'Matières' },
                { icon: Users, value: totalTuteursAPI !== null ? `${totalTuteursAPI}` : '—', label: 'Tuteurs inscrits' },
                { icon: GraduationCap, value: '5', label: 'Niveaux scolaires' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid rgba(249,115,22,0.2)` }}>
                    <Icon size={22} color={C.primary} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem', color: C.text, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '0.82rem', color: C.light, fontWeight: 600 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '20px 5%', position: 'sticky', top: '72px', zIndex: 40 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une matière..."
              style={{ width: '100%', padding: '11px 16px 11px 42px', borderRadius: '999px', border: `1.5px solid ${C.border}`, backgroundColor: C.background, fontFamily: SANS, fontSize: '0.95rem', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[{ id: 'all', label: 'Toutes' }, ...CATEGORIES.map(c => ({ id: c.id, label: c.label }))].map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ padding: '8px 16px', borderRadius: '999px', border: `1.5px solid ${activeCategory === cat.id ? C.primary : C.border}`, backgroundColor: activeCategory === cat.id ? C.primary : 'transparent', color: activeCategory === cat.id ? '#fff' : C.muted, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 5% 80px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.light }}>
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p style={{ fontSize: '1.1rem' }}>Aucune matière trouvée pour "{search}"</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>
            {filtered.map((cat, ci) => (
              <FadeIn key={cat.id} delay={ci * 0.1}>
                <div>
                  {/* Category header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '5px', height: '32px', borderRadius: '3px', backgroundColor: cat.color }} />
                    <h2 style={{ fontFamily: SERIF, fontSize: '1.8rem', color: C.text, fontWeight: 800, margin: 0 }}>{cat.label}</h2>
                    <span style={{ fontSize: '0.85rem', color: C.light, fontWeight: 600, backgroundColor: C.accent, padding: '4px 12px', borderRadius: '100px' }}>
                      {cat.matieres.length} matière{cat.matieres.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Matieres grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '20px' }}>
                    {cat.matieres.map((m) => {
                      const count = getTuteurCount(m);
                      return (
                        <motion.div key={m.name}
                          whileHover={{ y: -5, boxShadow: '0 24px 56px rgba(20,10,0,0.22)' }}
                          style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', minHeight: '230px', cursor: 'pointer', border: `1.5px solid ${C.border}` }}
                          onClick={onTuteurs}>

                          {/* Photo de fond */}
                          <img src={m.image} alt={m.name}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                          {/* Overlay dégradé */}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,8,0,0.30) 0%, rgba(15,8,0,0.78) 100%)' }} />

                          {/* Contenu */}
                          <div style={{ position: 'relative', zIndex: 1, padding: '24px', minHeight: '230px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                            {/* Haut : titre + desc */}
                            <div>
                              <h3 style={{ fontFamily: SERIF, fontSize: '1.3rem', color: '#fff', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{m.name}</h3>
                              <p style={{ fontFamily: SANS, fontSize: '0.9rem', color: 'rgba(255,255,255,0.92)', margin: 0, lineHeight: 1.5, fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{m.desc}</p>
                            </div>

                            {/* Bas : niveaux + tuteurs */}
                            <div>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                {m.niveaux.map(n => (
                                  <span key={n} style={{ fontFamily: SANS, fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.35)', letterSpacing: '0.3px' }}>
                                    {n}
                                  </span>
                                ))}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.25)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.85rem', fontWeight: 700, fontFamily: SANS, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                                  <Users size={14} color="#FBBF24" />
                                  {count !== null ? `${count} tuteur${count !== 1 ? 's' : ''}` : 'Tuteurs disponibles'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FBBF24', fontWeight: 800, fontSize: '0.88rem', fontFamily: SANS, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                                  Voir <ChevronRight size={15} />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {/* CTA bottom */}
        <FadeIn delay={0.3}>
          <div style={{ marginTop: '72px', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, borderRadius: '28px', padding: '48px', textAlign: 'center', color: '#fff' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '2.2rem', fontWeight: 900, margin: '0 0 12px 0' }}>
              Vous ne trouvez pas votre matière ?
            </h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: '0 0 28px 0' }}>
              Contactez-nous — nous recrutons constamment de nouveaux tuteurs.
            </p>
            <button onClick={onTuteurs} style={{ backgroundColor: '#fff', color: C.primary, border: 'none', padding: '14px 32px', borderRadius: '999px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', fontFamily: SANS, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Explorer les tuteurs <ArrowRight size={18} />
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
