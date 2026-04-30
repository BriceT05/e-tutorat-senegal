import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Search,
  BookOpen, GraduationCap, TrendingUp, Lightbulb, Globe, Star,
  PenLine, Users,
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

const CATEGORIES_BLOG = [
  { id: 'all', label: 'Tous les articles', icon: BookOpen },
  { id: 'conseils', label: 'Conseils scolaires', icon: Lightbulb },
  { id: 'bac', label: 'BAC & Examens', icon: GraduationCap },
  { id: 'orientation', label: 'Orientation', icon: TrendingUp },
  { id: 'numerique', label: 'Numérique & Éducation', icon: Globe },
  { id: 'succes', label: 'Témoignages', icon: Star },
];

const PROFILS = [
  { emoji: '🎓', label: 'Étudiants', desc: 'Partagez vos méthodes de révision et vos retours d\'expérience.' },
  { emoji: '🔬', label: 'Chercheurs', desc: 'Publiez vos réflexions sur l\'éducation et les sciences.' },
  { emoji: '📚', label: 'Professeurs', desc: 'Transmettez vos conseils pédagogiques à la communauté.' },
  { emoji: '👨‍👩‍👧', label: 'Parents', desc: 'Témoignez de votre expérience d\'accompagnement scolaire.' },
];

export default function BlogPage({ onGoHome, onTuteurs }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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
            <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: '1.3rem', color: C.text }}>Le Blog</span>
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
              <Users size={15} /> Blog communautaire
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', color: C.text, fontWeight: 900, lineHeight: 1.1, margin: '0 0 16px 0' }}>
              Le Blog de{' '}
              <span style={{ color: C.primary, fontStyle: 'italic' }}>la Communauté</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: C.muted, maxWidth: '620px', lineHeight: 1.6, margin: 0 }}>
              Un espace ouvert où étudiants, chercheurs, professeurs et parents partagent leurs connaissances et expériences sur l'éducation au Sénégal.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Search & Category filters */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '20px 5%', position: 'sticky', top: '72px', zIndex: 40 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '999px', border: `1.5px solid ${C.border}`, backgroundColor: C.background, fontFamily: SANS, fontSize: '0.95rem', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES_BLOG.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ padding: '8px 14px', borderRadius: '999px', border: `1.5px solid ${activeCategory === cat.id ? C.primary : C.border}`, backgroundColor: activeCategory === cat.id ? C.primary : 'transparent', color: activeCategory === cat.id ? '#fff' : C.muted, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 5% 80px' }}>

        {/* Empty state */}
        <FadeIn>
          <div style={{ textAlign: 'center', padding: '64px 40px', backgroundColor: C.surface, borderRadius: '28px', border: `2px dashed ${C.border}`, marginBottom: '64px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✍️</div>
            <h2 style={{ fontFamily: SERIF, fontSize: '2rem', color: C.text, fontWeight: 800, margin: '0 0 14px 0' }}>
              Aucun article pour l'instant
            </h2>
            <p style={{ fontSize: '1.1rem', color: C.muted, lineHeight: 1.65, maxWidth: '520px', margin: '0 auto 32px' }}>
              Le blog est ouvert à toute la communauté e-Tutorat. Soyez le premier à partager vos conseils, témoignages ou réflexions sur l'éducation.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: C.accent, color: C.primary, padding: '10px 24px', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem' }}>
              <PenLine size={16} /> Les articles apparaîtront ici dès que des membres publieront
            </div>
          </div>
        </FadeIn>

        {/* Qui peut publier */}
        <FadeIn delay={0.15}>
          <div style={{ marginBottom: '64px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '1.9rem', color: C.text, fontWeight: 800, margin: '0 0 8px 0', textAlign: 'center' }}>
              Qui peut publier ?
            </h2>
            <p style={{ textAlign: 'center', color: C.light, fontSize: '1rem', marginBottom: '36px' }}>
              Le blog est ouvert à toute la communauté e-Tutorat
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {PROFILS.map((p, i) => (
                <motion.div key={p.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: '28px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '14px' }}>{p.emoji}</div>
                  <div style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 800, color: C.text, marginBottom: '8px' }}>{p.label}</div>
                  <div style={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.55 }}>{p.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Newsletter */}
        <FadeIn delay={0.3}>
          <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, borderRadius: '28px', padding: '52px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📬</div>
            <h2 style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 900, margin: '0 0 10px 0' }}>
              Restez informé
            </h2>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '480px', margin: '0 auto 28px' }}>
              Recevez nos meilleurs articles, conseils de tuteurs et actus de l'éducation sénégalaise dès leur publication.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto' }}>
              <input placeholder="votre@email.com" style={{ flex: 1, minWidth: '220px', padding: '13px 20px', borderRadius: '999px', border: 'none', fontFamily: SANS, fontSize: '0.95rem', outline: 'none' }} />
              <button style={{ backgroundColor: C.text, color: '#fff', border: 'none', padding: '13px 24px', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}>
                S'abonner
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
