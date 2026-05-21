// Page de listing et recherche des tuteurs.
// La recherche texte libre (q) est envoyée en query param et filtrée en SQL côté serveur (ILIKE + unnest).
// Les filtres structurés (matière, région, niveau, mode, tarif) sont appliqués localement via useMemo
// sur le sous-ensemble déjà filtré par texte retourné par l'API.
import { useState, useMemo, useEffect, useRef } from 'react';
import useIsMobile from './useIsMobile';
import api from './api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Star, MapPin, Filter, X, ChevronDown,
  ArrowLeft, SlidersHorizontal, Check, Users, Clock,
  GraduationCap, ArrowRight, Heart,
} from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

// ─── Normalisation des données backend ────────────────────────────────────────
// Garantit des valeurs par défaut pour tous les champs optionnels du profil tuteur.
// Évite les undefined qui provoqueraient des erreurs dans les composants d'affichage.
const normalizeTuteur = (u) => ({
  id: u.id,
  photo: u.photo || null,
  prenom: u.prenom, nom: u.nom,
  matieres: u.matieres || [],
  niveaux: u.niveaux || [],
  region: u.region || '',
  rating: u.noteAvg || 0,
  reviews: u.nbAvis || 0,
  tarif: Number(u.tarif) || 0,
  mode: u.modeCours || 'En ligne',
  diplome: u.diplome || '',
  totalEleves: u.totalEleves || 0,
  badge: null,
  online: true,
  bio: u.bio || '',
  tel: u.tel,
  email: u.email,
});

const MATIERES_LIST = ['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'SVT', 'Histoire-Géo', 'Informatique', 'Arabe', 'Philosophie', 'Économie', 'Espagnol'];
const NIVEAUX_LIST = ['Primaire (CI–CM2)', 'Collège (6ème–3ème)', 'Lycée (2nde–Tle)'];
const REGIONS_LIST = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour'];
const MODES = ['En ligne', 'À domicile', 'Les deux'];
const SORT_OPTIONS = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'reviews', label: 'Plus d\'avis' },
];

const BADGE_STYLE = {
  'Top tuteur': { bg: '#FEF3C7', color: '#B45309' },
  'Nouveau': { bg: '#DCFCE7', color: '#166534' },
  'Populaire': { bg: '#EDE9FE', color: '#7C3AED' },
  'Expert': { bg: '#FEE2E2', color: '#991B1B' },
};

// ─── Components ───────────────────────────────────────────────────────────────
const Stars = ({ n }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill={i <= Math.round(n) ? C.secondary : 'transparent'} color={i <= Math.round(n) ? C.secondary : C.border} />)}
  </div>
);

const FilterPill = ({ label, active, onClick }) => (
  <motion.button onClick={onClick} whileTap={{ scale: 0.95 }} type="button"
    style={{ padding: '7px 14px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS, transition: 'all 0.18s', backgroundColor: active ? C.accent : C.surface, border: `2px solid ${active ? C.primary : C.border}`, color: active ? C.primary : C.muted, whiteSpace: 'nowrap' }}>
    {active && <Check size={11} style={{ display: 'inline', marginRight: '4px' }} />}{label}
  </motion.button>
);

const RangeSlider = ({ value, onChange, min, max, step, format }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ fontSize: '0.82rem', color: C.light, fontFamily: SANS }}>Jusqu'à</span>
      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: C.primary, fontFamily: SANS }}>{format(value)}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: C.primary, cursor: 'pointer' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
      <span style={{ fontSize: '0.75rem', color: C.light, fontFamily: SANS }}>{format(min)}</span>
      <span style={{ fontSize: '0.75rem', color: C.light, fontFamily: SANS }}>{format(max)}</span>
    </div>
  </div>
);

// Carte tuteur animée avec délai progressif (staggered) pour un effet de chargement fluide.
const TuteurCard = ({ t, onView, delay }) => {
  const [fav, setFav] = useState(() => {
    try { return (JSON.parse(localStorage.getItem('etutorat_favoris')) || []).includes(t.id); }
    catch { return false; }
  });
  const toggleFav = e => {
    e.stopPropagation();
    setFav(f => {
      const next = !f;
      try {
        const ids = JSON.parse(localStorage.getItem('etutorat_favoris')) || [];
        localStorage.setItem('etutorat_favoris', JSON.stringify(
          next ? [...new Set([...ids, t.id])] : ids.filter(id => id !== t.id)
        ));
      } catch {}
      return next;
    });
  };
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(62,42,31,0.12)' }}
      style={{ backgroundColor: C.surface, borderRadius: '24px', padding: '28px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 20px rgba(62,42,31,0.06)', cursor: 'pointer', position: 'relative', fontFamily: SANS }}>

      {/* Fav button */}
      <button onClick={toggleFav}
        style={{ position: 'absolute', top: '20px', right: '20px', background: fav ? C.accent : 'transparent', border: `1.5px solid ${fav ? C.primary : C.border}`, borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
        <Heart size={16} fill={fav ? C.primary : 'transparent'} color={fav ? C.primary : C.light} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: C.accent, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
            {t.photo
              ? <img src={t.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : '👨🏾‍🏫'
            }
          </div>
          {t.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#22C55E', border: '2px solid white' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', color: C.text, margin: '0 0 2px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.prenom} {t.nom}</h3>
          <div style={{ fontSize: '0.88rem', color: C.primary, fontWeight: 700, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.matieres.join(' · ')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} color={C.light} />
            <span style={{ fontSize: '0.85rem', color: C.light }}>{t.region}</span>
            {t.badge && (
              <span style={{ marginLeft: '4px', backgroundColor: BADGE_STYLE[t.badge].bg, color: BADGE_STYLE[t.badge].color, padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>{t.badge}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.6, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.bio}</p>

      {/* Niveaux pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {t.niveaux.map(n => (
          <span key={n} style={{ backgroundColor: C.accent, color: C.muted, padding: '3px 10px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600 }}>{n}</span>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px', paddingBottom: '16px', borderBottom: `1px solid ${C.accent}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Stars n={t.rating} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text }}>{t.rating}</span>
          <span style={{ color: C.light, fontSize: '0.82rem' }}>({t.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.light, fontSize: '0.82rem' }}>
          <Clock size={13} /> {t.totalEleves} élève{t.totalEleves !== 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: C.light, fontSize: '0.82rem' }}>
          {t.mode === 'En ligne' ? '💻' : t.mode === 'À domicile' ? '🏠' : '🌐'} {t.mode}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontWeight: 900, fontSize: '1.15rem', color: C.text }}>{t.tarif.toLocaleString('fr-FR')} FCFA</span>
          <span style={{ fontSize: '0.82rem', color: C.light }}>/heure</span>
        </div>
        <motion.button onClick={() => onView(t)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ padding: '10px 20px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 16px rgba(249,115,22,0.3)', fontFamily: SANS }}>
          Voir le profil <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── SIDEBAR FILTRES ──────────────────────────────────────────────────────────
// Tous les filtres sont appliqués en mémoire dans le composant parent (useMemo).
// Le compteur activeCount affiche le nombre de filtres actifs sur le badge.
const Sidebar = ({ filters, setFilters, count }) => {
  // Bascule un élément dans un tableau de filtre (ajoute/retire)
  const toggle = (key, val) => {
    setFilters(f => {
      const arr = f[key] || [];
      return { ...f, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });
  };
  const clear = () => setFilters({ matieres: [], niveaux: [], regions: [], modes: [], maxTarif: 10000 });
  const activeCount = (filters.matieres?.length || 0) + (filters.niveaux?.length || 0) + (filters.regions?.length || 0) + (filters.modes?.length || 0) + (filters.maxTarif < 10000 ? 1 : 0);

  return (
    <aside style={{ backgroundColor: C.surface, borderRadius: '24px', padding: '28px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 20px rgba(62,42,31,0.05)', height: 'fit-content', position: 'sticky', top: '96px', fontFamily: SANS }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={20} color={C.primary} />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text }}>Filtres</span>
          {activeCount > 0 && <span style={{ backgroundColor: C.primary, color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{activeCount}</span>}
        </div>
        {activeCount > 0 && (
          <button onClick={clear} style={{ background: 'none', border: 'none', color: C.primary, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>Effacer tout</button>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', color: C.light, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '8px' }}>{count} tuteur{count > 1 ? 's' : ''} trouvé{count > 1 ? 's' : ''}</div>

      {[
        { key: 'matieres', label: 'Matière', list: MATIERES_LIST },
        { key: 'niveaux', label: 'Niveau', list: NIVEAUX_LIST },
        { key: 'regions', label: 'Région', list: REGIONS_LIST },
        { key: 'modes', label: 'Mode de cours', list: MODES },
      ].map(({ key, label, list }) => (
        <div key={key} style={{ marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid ${C.accent}` }}>{label}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {list.map(item => {
              const active = (filters[key] || []).includes(item);
              return (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px 8px', borderRadius: '8px', transition: 'background 0.15s', backgroundColor: active ? C.accent : 'transparent' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `2px solid ${active ? C.primary : C.border}`, backgroundColor: active ? C.primary : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}
                    onClick={() => toggle(key, item)}>
                    {active && <Check size={12} color="#fff" />}
                  </div>
                  <span style={{ fontSize: '0.9rem', color: active ? C.primary : C.muted, fontWeight: active ? 700 : 500 }} onClick={() => toggle(key, item)}>{item}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: '12px', paddingBottom: '8px', borderBottom: `1px solid ${C.accent}` }}>Tarif horaire</div>
        <RangeSlider value={filters.maxTarif} onChange={v => setFilters(f => ({ ...f, maxTarif: v }))} min={1000} max={10000} step={500} format={v => `${v.toLocaleString('fr-FR')} F`} />
      </div>
    </aside>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TuteursPage({ onGoHome, onViewTuteur, currentUser }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [filters, setFilters] = useState({ matieres: [], niveaux: [], regions: [], modes: [], maxTarif: 10000 });
  const [mobileFilter, setMobileFilter] = useState(false);
  const [TUTEURS, setTUTEURS] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const activeCount = (filters.matieres?.length || 0) + (filters.niveaux?.length || 0) + (filters.regions?.length || 0) + (filters.modes?.length || 0) + (filters.maxTarif < 10000 ? 1 : 0);
  const searchTimeout = useRef(null);
  const isFirstRender = useRef(true);

  // Recharge les tuteurs depuis l'API à chaque changement de la recherche texte.
  // Premier rendu : immédiat. Saisies suivantes : debounce 300 ms pour éviter un appel par touche.
  useEffect(() => {
    const delay = isFirstRender.current ? 0 : 300;
    isFirstRender.current = false;
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const url = search.trim() ? `/tuteurs?q=${encodeURIComponent(search.trim())}` : '/tuteurs';
      setLoading(true);
      api.get(url)
        .then(data => setTUTEURS(Array.isArray(data) ? data.map(normalizeTuteur) : []))
        .catch(() => setTUTEURS([]))
        .finally(() => setLoading(false));
    }, delay);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  // Filtres structurés + tri appliqués localement sur le sous-ensemble retourné par l'API.
  // La recherche texte (q) est déjà effectuée côté serveur — TUTEURS ne contient que les résultats correspondants.
  // Le mode "Les deux" côté tuteur est compatible avec "En ligne" et "À domicile" dans les filtres.
  const filtered = useMemo(() => {
    let list = TUTEURS.filter(t => {
      if (filters.matieres.length && !filters.matieres.some(m => t.matieres.includes(m))) return false;
      if (filters.niveaux.length && !filters.niveaux.some(n => t.niveaux.includes(n))) return false;
      if (filters.regions.length && !filters.regions.includes(t.region)) return false;
      // Un tuteur "Les deux" est inclus quel que soit le filtre de mode
      if (filters.modes.length && filters.modes[0] !== 'Les deux' && !filters.modes.includes(t.mode) && t.mode !== 'Les deux') return false;
      if (t.tarif > filters.maxTarif) return false;
      return true;
    });
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'price_asc') list.sort((a, b) => a.tarif - b.tarif);
    else if (sort === 'price_desc') list.sort((a, b) => b.tarif - a.tarif);
    else if (sort === 'reviews') list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [sort, filters, TUTEURS]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.accent}`, padding: '0 5%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', minHeight: '64px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: isMobile ? 'wrap' : 'nowrap', padding: isMobile ? '10px 0' : '0' }}>
          <nav aria-label="breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, fontFamily: SANS }}>
            <button onClick={onGoHome} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '0.88rem', fontWeight: 600, padding: 0 }}>Accueil</button>
            <span style={{ color: C.light, fontSize: '0.85rem' }}>›</span>
            <span style={{ color: C.text, fontSize: '0.88rem', fontWeight: 700 }}>Tuteurs</span>
          </nav>
          {!isMobile && (
            <img src="/logo.svg" alt="e-Tutorat" style={{ height: '40px', width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
          )}

          {/* Search bar */}
          <div style={{ flex: 1, position: 'relative', width: isMobile ? '100%' : 'auto', maxWidth: isMobile ? '100%' : '560px', margin: isMobile ? '0' : '0 auto', order: isMobile ? 3 : 0 }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isMobile ? 'Rechercher…' : 'Rechercher un tuteur, une matière, une région…'}
              style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '100px', border: `2px solid ${C.border}`, backgroundColor: C.surface, fontSize: '0.9rem', color: C.text, outline: 'none', fontFamily: SANS }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border} />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '2px' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <span style={{ fontSize: '0.85rem', color: C.light, fontWeight: 500 }}>Trier :</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ padding: '8px 32px 8px 12px', borderRadius: '100px', border: `2px solid ${C.border}`, backgroundColor: C.surface, fontSize: '0.9rem', fontWeight: 600, color: C.text, cursor: 'pointer', outline: 'none', fontFamily: SANS, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </nav>

      {/* Page header */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.accent}`, padding: '32px 5%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: C.text, margin: '0 0 8px', fontWeight: 700 }}>
            Nos <span style={{ color: C.primary, fontStyle: 'italic' }}>tuteurs</span>
          </h1>
          <p style={{ color: C.muted, fontSize: '1.05rem', margin: '0 0 20px' }}>
            {filtered.length} tuteur{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''} — sélectionnés et vérifiés par notre équipe.
          </p>

          {/* Quick filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'En ligne', 'Dakar'].map(pill => {
              const isMatiere = MATIERES_LIST.includes(pill);
              const isMode = MODES.includes(pill);
              const isRegion = REGIONS_LIST.includes(pill);
              const key = isMatiere ? 'matieres' : isMode ? 'modes' : 'regions';
              const active = (filters[key] || []).includes(pill);
              return (
                <FilterPill key={pill} label={pill} active={active}
                  onClick={() => setFilters(f => ({ ...f, [key]: active ? f[key].filter(x => x !== pill) : [...(f[key] || []), pill] }))} />
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px 5% 100px' : '36px 5% 80px', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start' }}>
        {!isMobile && <Sidebar filters={filters} setFilters={setFilters} count={filtered.length} />}

        <div>
          {/* Barre filtre + tri mobile */}
          {isMobile && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <motion.button onClick={() => setMobileFilter(true)} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '100px', border: `2px solid ${activeCount > 0 ? C.primary : C.border}`, backgroundColor: activeCount > 0 ? C.accent : C.surface, color: activeCount > 0 ? C.primary : C.muted, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS, flexShrink: 0 }}>
                <SlidersHorizontal size={16} /> Filtres{activeCount > 0 ? ` (${activeCount})` : ''}
              </motion.button>
              <select value={sort} onChange={e => setSort(e.target.value)}
                style={{ flex: 1, padding: '10px 32px 10px 14px', borderRadius: '100px', border: `2px solid ${C.border}`, backgroundColor: C.surface, fontSize: '0.88rem', fontWeight: 600, color: C.text, cursor: 'pointer', outline: 'none', fontFamily: SANS, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: C.surface, borderRadius: '24px', border: `1px solid ${C.accent}` }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⏳</div>
                <p style={{ color: C.muted, fontSize: '1rem', fontFamily: SANS }}>Chargement des tuteurs…</p>
              </motion.div>
            ) : TUTEURS.length === 0 ? (
              <motion.div key="no-tuteurs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: C.surface, borderRadius: '24px', border: `1px solid ${C.accent}` }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨🏾‍🏫</div>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: C.text, margin: '0 0 12px' }}>Aucun tuteur inscrit pour l'instant</h3>
                <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.6 }}>Les premiers tuteurs qui créeront leur compte apparaîtront ici.</p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: C.surface, borderRadius: '24px', border: `1px solid ${C.accent}` }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: C.text, margin: '0 0 10px' }}>Aucun tuteur trouvé</h3>
                <p style={{ color: C.muted, fontSize: '1rem' }}>Essayez d'élargir vos critères de recherche.</p>
                <button onClick={() => { setSearch(''); setFilters({ matieres: [], niveaux: [], regions: [], modes: [], maxTarif: 10000 }); }}
                  style={{ marginTop: '20px', padding: '12px 24px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                  Réinitialiser les filtres
                </button>
              </motion.div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '24px' }}>
                {filtered.map((t, i) => (
                  <TuteurCard key={t.id} t={t} onView={onViewTuteur} delay={i * 0.06} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Drawer filtre mobile */}
      <AnimatePresence>
        {isMobile && mobileFilter && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileFilter(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(62,42,31,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxHeight: '85vh', backgroundColor: C.surface, borderRadius: '24px 24px 0 0', overflowY: 'auto', padding: '20px 20px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: SERIF, fontSize: '1.2rem', color: C.text, margin: 0, fontWeight: 700 }}>Filtres</h3>
                <button onClick={() => setMobileFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '4px' }}><X size={22} /></button>
              </div>
              <Sidebar filters={filters} setFilters={setFilters} count={filtered.length} />
              <motion.button onClick={() => setMobileFilter(false)} whileTap={{ scale: 0.97 }}
                style={{ width: '100%', marginTop: '20px', padding: '15px', borderRadius: '14px', border: 'none', backgroundColor: C.primary, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: SANS }}>
                Voir {filtered.length} tuteur{filtered.length > 1 ? 's' : ''}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom stripe */}
      <div style={{ display: 'flex', height: '6px' }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>
    </div>
  );
}
