import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api.js';
import useIsMobile from './useIsMobile';
import {
  ArrowLeft, ArrowRight, Search,
  BookOpen, GraduationCap, TrendingUp, Lightbulb, Globe, Star,
  PenLine, Users, Calendar, ChevronLeft,
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
  { id: 'all',         label: 'Tous les articles',      icon: BookOpen    },
  { id: 'conseils',    label: 'Conseils scolaires',     icon: Lightbulb   },
  { id: 'bac',         label: 'BAC & Examens',          icon: GraduationCap },
  { id: 'orientation', label: 'Orientation',            icon: TrendingUp  },
  { id: 'numerique',   label: 'Numérique & Éducation',  icon: Globe       },
  { id: 'succes',      label: 'Témoignages',            icon: Star        },
];

const CAT_COLORS = {
  conseils:    { bg: '#DBEAFE', color: '#1D4ED8' },
  bac:         { bg: '#FEE2E2', color: '#991B1B' },
  orientation: { bg: '#DCFCE7', color: '#166534' },
  numerique:   { bg: '#EDE9FE', color: '#5B21B6' },
  succes:      { bg: '#FEF3C7', color: '#B45309' },
};

const catStyle = (id) => CAT_COLORS[id] || { bg: C.accent, color: C.primary };
const catLabel = (id) => CATEGORIES_BLOG.find(c => c.id === id)?.label || id;

const fmtDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── Carte article ────────────────────────────────────────────────────────────
const ArticleCard = ({ article, onClick }) => {
  const cs = catStyle(article.categorie);
  return (
    <motion.div onClick={onClick} whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(62,42,31,0.12)' }}
      style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
      {article.coverUrl && (
        <div style={{ height: '180px', overflow: 'hidden', backgroundColor: C.accent }}>
          <img src={article.coverUrl} alt={article.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '22px 20px' }}>
        <span style={{ backgroundColor: cs.bg, color: cs.color, padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, fontFamily: SANS }}>
          {catLabel(article.categorie)}
        </span>
        <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', fontWeight: 700, color: C.text, margin: '12px 0 8px', lineHeight: 1.3 }}>
          {article.titre}
        </h3>
        {article.extrait && (
          <p style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.6, margin: '0 0 14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.extrait}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: C.light, fontFamily: SANS }}>
          <span>{article.auteur ? `${article.auteur.prenom} ${article.auteur.nom}` : 'e-Tutorat'}</span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {fmtDate(article.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Vue détail article ───────────────────────────────────────────────────────
const ArticleDetail = ({ article, onBack }) => {
  const cs = catStyle(article.categorie);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background }}>
      {article.coverUrl && (
        <div style={{ height: '320px', overflow: 'hidden', backgroundColor: C.accent }}>
          <img src={article.coverUrl} alt={article.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 5% 80px' }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', fontFamily: SANS, marginBottom: '32px', padding: 0 }}>
          <ChevronLeft size={20} /> Retour au blog
        </button>
        <span style={{ backgroundColor: cs.bg, color: cs.color, padding: '5px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700, fontFamily: SANS }}>
          {catLabel(article.categorie)}
        </span>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: C.text, fontWeight: 900, margin: '16px 0 12px', lineHeight: 1.2 }}>
          {article.titre}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: C.light, fontSize: '0.88rem', fontFamily: SANS, marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontWeight: 600, color: C.muted }}>
            {article.auteur ? `${article.auteur.prenom} ${article.auteur.nom}` : 'e-Tutorat'}
          </span>
          <span>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={14} /> {fmtDate(article.createdAt)}
          </span>
        </div>
        {article.extrait && (
          <p style={{ fontSize: '1.1rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.7, marginBottom: '28px', paddingLeft: '16px', borderLeft: `4px solid ${C.primary}` }}>
            {article.extrait}
          </p>
        )}
        <div style={{ fontSize: '1rem', color: C.text, lineHeight: 1.85, whiteSpace: 'pre-wrap', fontFamily: SANS }}>
          {article.contenu}
        </div>
      </div>
    </div>
  );
};

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function BlogPage({ onGoHome, onTuteurs }) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (activeCategory !== 'all') params.set('categorie', activeCategory);
    if (search.trim()) params.set('q', search.trim());
    api.get(`/articles?${params}`).then(data => {
      if (data.articles) { setArticles(data.articles); setTotal(data.total || 0); }
      setLoading(false);
    });
  }, [page, activeCategory, search]);

  useEffect(() => { setPage(1); }, [activeCategory, search]);

  if (selectedArticle) {
    return (
      <div>
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}>
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
        </nav>
        <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      </div>
    );
  }

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS }}>
      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.border}` }}>
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
            <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: C.muted, maxWidth: '620px', lineHeight: 1.6, margin: 0 }}>
              Un espace ouvert où étudiants, chercheurs, professeurs et parents partagent leurs connaissances et expériences sur l'éducation au Sénégal.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: isMobile ? '12px 5%' : '20px 5%', position: 'sticky', top: '72px', zIndex: 40 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un article..."
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: '999px', border: `1.5px solid ${C.border}`, backgroundColor: C.background, fontFamily: SANS, fontSize: '0.95rem', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES_BLOG.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ padding: '7px 14px', borderRadius: '999px', border: `1.5px solid ${activeCategory === cat.id ? C.primary : C.border}`, backgroundColor: activeCategory === cat.id ? C.primary : 'transparent', color: activeCategory === cat.id ? '#fff' : C.muted, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 5% 80px' }}>

        {/* Articles */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: C.light, fontFamily: SANS, fontSize: '1rem' }}>Chargement…</div>
        ) : articles.length === 0 ? (
          <FadeIn>
            <div style={{ textAlign: 'center', padding: '64px 40px', backgroundColor: C.surface, borderRadius: '28px', border: `2px dashed ${C.border}`, marginBottom: '64px' }}>
              <div style={{ fontSize: '5rem', marginBottom: '20px' }}>✍️</div>
              <h2 style={{ fontFamily: SERIF, fontSize: '2rem', color: C.text, fontWeight: 800, margin: '0 0 14px 0' }}>
                {search || activeCategory !== 'all' ? 'Aucun article trouvé' : "Aucun article pour l'instant"}
              </h2>
              <p style={{ fontSize: '1.05rem', color: C.muted, lineHeight: 1.65, maxWidth: '520px', margin: '0 auto 28px' }}>
                {search || activeCategory !== 'all'
                  ? "Essayez d'autres mots-clés ou une autre catégorie."
                  : 'Le blog est ouvert à toute la communauté e-Tutorat. Les articles apparaîtront dès que des membres publieront.'}
              </p>
              {(search || activeCategory !== 'all') && (
                <button onClick={() => { setSearch(''); setActiveCategory('all'); }}
                  style={{ padding: '10px 24px', borderRadius: '999px', border: 'none', backgroundColor: C.primary, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                  Voir tous les articles
                </button>
              )}
            </div>
          </FadeIn>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              {articles.map((a, i) => (
                <FadeIn key={a.id} delay={i * 0.05}>
                  <ArticleCard article={a} onClick={() => setSelectedArticle(a)} />
                </FadeIn>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '9px 20px', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'transparent', color: page === 1 ? C.light : C.muted, cursor: page === 1 ? 'default' : 'pointer', fontWeight: 600, fontFamily: SANS, opacity: page === 1 ? 0.5 : 1 }}>
                  ← Précédent
                </button>
                <span style={{ fontSize: '0.88rem', color: C.muted, fontFamily: SANS }}>
                  Page <strong>{page}</strong> / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '9px 20px', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'transparent', color: page === totalPages ? C.light : C.muted, cursor: page === totalPages ? 'default' : 'pointer', fontWeight: 600, fontFamily: SANS, opacity: page === totalPages ? 0.5 : 1 }}>
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}

        {/* Newsletter */}
        {!loading && (
          <FadeIn delay={0.2}>
            <div style={{ marginTop: '64px', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, borderRadius: '28px', padding: isMobile ? '32px 20px' : '52px', textAlign: 'center', color: '#fff' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📬</div>
              <h2 style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 900, margin: '0 0 10px 0' }}>Restez informé</h2>
              <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: '480px', margin: '0 auto 28px' }}>
                Recevez nos meilleurs articles, conseils de tuteurs et actus de l'éducation sénégalaise dès leur publication.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto' }}>
                <input placeholder="votre@email.com" style={{ flex: 1, minWidth: 0, padding: '13px 20px', borderRadius: '999px', border: 'none', fontFamily: SANS, fontSize: '0.95rem', outline: 'none' }} />
                <button style={{ backgroundColor: C.text, color: '#fff', border: 'none', padding: '13px 24px', borderRadius: '999px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: SANS, whiteSpace: 'nowrap' }}>
                  S'abonner
                </button>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
