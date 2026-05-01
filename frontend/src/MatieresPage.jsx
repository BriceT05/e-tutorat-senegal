import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowLeft, Calculator, FlaskConical, Languages, Globe2,
  Atom, Cpu, BookMarked, Landmark, Coins, Music, Palette, Users,
  ChevronRight, Search, GraduationCap, ArrowRight,
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
      { icon: Calculator, name: 'Mathématiques', tuteurs: 87, niveaux: ['Primaire', 'Collège', 'Lycée', 'Sup'], desc: 'Algèbre, géométrie, analyse, probabilités' },
      { icon: FlaskConical, name: 'Physique-Chimie', tuteurs: 54, niveaux: ['Collège', 'Lycée', 'Sup'], desc: 'Mécanique, thermodynamique, chimie organique' },
      { icon: Atom, name: 'Sciences de la Vie et de la Terre', tuteurs: 41, niveaux: ['Collège', 'Lycée'], desc: 'Biologie, géologie, écologie, génétique' },
      { icon: FlaskConical, name: 'Chimie', tuteurs: 28, niveaux: ['Lycée', 'Sup'], desc: 'Chimie générale, organique, inorganique' },
    ],
  },
  {
    id: 'lettres',
    label: 'Lettres & Langues',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    matieres: [
      { icon: BookMarked, name: 'Français', tuteurs: 72, niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Grammaire, dissertation, littérature, dictée' },
      { icon: Languages, name: 'Anglais', tuteurs: 65, niveaux: ['Primaire', 'Collège', 'Lycée', 'Sup'], desc: 'Conversation, grammaire, TOEFL, IELTS' },
      { icon: Globe2, name: 'Arabe', tuteurs: 38, niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Arabe classique, Coran, langue courante' },
      { icon: Languages, name: 'Espagnol', tuteurs: 22, niveaux: ['Collège', 'Lycée'], desc: 'Grammaire, conversation, DELE' },
      { icon: Languages, name: 'Wolof', tuteurs: 15, niveaux: ['Primaire', 'Adultes'], desc: 'Langue nationale, alphabet, expression orale' },
    ],
  },
  {
    id: 'sociales',
    label: 'Sciences sociales',
    color: '#10B981',
    bg: '#ECFDF5',
    matieres: [
      { icon: Landmark, name: 'Histoire-Géographie', tuteurs: 46, niveaux: ['Collège', 'Lycée'], desc: 'Histoire du Sénégal, géo mondiale, cartographie' },
      { icon: BookOpen, name: 'Philosophie', tuteurs: 29, niveaux: ['Lycée'], desc: 'Dissertation, commentaire de texte, argumentation' },
      { icon: Coins, name: 'Économie', tuteurs: 31, niveaux: ['Lycée', 'Sup'], desc: 'Micro, macro-économie, gestion, comptabilité' },
      { icon: Landmark, name: 'Éducation civique', tuteurs: 18, niveaux: ['Primaire', 'Collège'], desc: 'Droits et devoirs, institutions sénégalaises' },
    ],
  },
  {
    id: 'tech',
    label: 'Informatique & Technologie',
    color: '#F97316',
    bg: '#FFF7ED',
    matieres: [
      { icon: Cpu, name: 'Informatique', tuteurs: 44, niveaux: ['Collège', 'Lycée', 'Sup'], desc: 'Algorithmique, Python, Excel, bureautique' },
      { icon: Cpu, name: 'Programmation', tuteurs: 33, niveaux: ['Lycée', 'Sup'], desc: 'Python, JavaScript, Java, développement web' },
      { icon: Cpu, name: 'Technologie', tuteurs: 19, niveaux: ['Collège'], desc: 'Dessin technique, construction, électronique' },
    ],
  },
  {
    id: 'arts',
    label: 'Arts & Divers',
    color: '#EC4899',
    bg: '#FDF2F8',
    matieres: [
      { icon: Music, name: 'Musique', tuteurs: 12, niveaux: ['Primaire', 'Collège'], desc: 'Solfège, guitare, piano, chant' },
      { icon: Palette, name: 'Arts plastiques', tuteurs: 14, niveaux: ['Primaire', 'Collège', 'Lycée'], desc: 'Dessin, peinture, arts graphiques' },
      { icon: GraduationCap, name: 'Soutien scolaire général', tuteurs: 95, niveaux: ['Primaire', 'Collège'], desc: 'Aide aux devoirs, méthode de travail, organisation' },
    ],
  },
];

const NIVEAUX_COLORS = {
  'Primaire': { bg: '#DCFCE7', color: '#16A34A' },
  'Collège': { bg: '#DBEAFE', color: '#2563EB' },
  'Lycée': { bg: '#FEF3C7', color: '#D97706' },
  'Sup': { bg: '#F3E8FF', color: '#9333EA' },
  'Adultes': { bg: '#FCE7F3', color: '#DB2777' },
};

export default function MatieresPage({ onGoHome, onTuteurs }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
  const totalTuteurs = CATEGORIES.reduce((sum, c) => c.matieres.reduce((s, m) => s + m.tuteurs, sum), 0);

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
              Du CI à la Terminale et au-delà — nos {totalTuteurs}+ tuteurs couvrent toutes les matières du programme sénégalais.
            </p>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
              {[
                { icon: BookOpen, value: `${totalMatieres}+`, label: 'Matières' },
                { icon: Users, value: `${totalTuteurs}+`, label: 'Tuteurs qualifiés' },
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
                    {cat.matieres.map((m, mi) => {
                      const Icon = m.icon;
                      return (
                        <motion.div key={m.name} whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(62,42,31,0.1)' }}
                          style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '28px', border: `1.5px solid ${C.border}`, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                          onClick={onTuteurs}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '16px', backgroundColor: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={26} color={cat.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', color: C.text, fontWeight: 700, margin: '0 0 4px 0' }}>{m.name}</h3>
                              <p style={{ fontSize: '0.88rem', color: C.light, margin: 0, lineHeight: 1.4 }}>{m.desc}</p>
                            </div>
                          </div>

                          {/* Niveaux */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {m.niveaux.map(n => {
                              const s = NIVEAUX_COLORS[n] || { bg: C.accent, color: C.primary };
                              return (
                                <span key={n} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', backgroundColor: s.bg, color: s.color }}>
                                  {n}
                                </span>
                              );
                            })}
                          </div>

                          {/* Footer */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: `1px solid ${C.accent}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: C.muted, fontSize: '0.88rem', fontWeight: 600 }}>
                              <Users size={15} color={C.primary} />
                              {m.tuteurs} tuteurs disponibles
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.primary, fontWeight: 700, fontSize: '0.88rem' }}>
                              Voir <ChevronRight size={15} />
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
