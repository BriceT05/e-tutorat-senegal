import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, X, Coins, Shield, Clock,
  Users, Star, ChevronDown, ChevronUp, Smartphone, Zap, BookOpen,
} from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

function useIsMobile(bp = 768) {
  const [m, setM] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const h = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [bp]);
  return m;
}

const FadeIn = ({ children, delay = 0, style = {} }) => (
  <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }} style={style}>
    {children}
  </motion.div>
);

const PLANS = [
  {
    id: 'decouverte',
    name: 'Découverte',
    emoji: '🌱',
    color: '#10B981',
    bg: '#ECFDF5',
    description: 'Parfait pour tester la plateforme',
    seances: 1,
    tagline: 'Séance unique',
    highlight: false,
    features: [
      { ok: true, text: '1 séance de tutorat (1h)' },
      { ok: true, text: 'Choix libre du tuteur' },
      { ok: true, text: 'En ligne ou à domicile' },
      { ok: true, text: 'Annulation 24h avant' },
      { ok: false, text: 'Suivi de progression' },
      { ok: false, text: 'Tuteur dédié' },
    ],
    prix: {
      'Primaire (CI–CM2)': 4000,
      'Collège (6ème–3ème)': 5500,
      'Lycée (2nde–Tle)': 7000,
      'Supérieur': 9000,
    },
  },
  {
    id: 'standard',
    name: 'Standard',
    emoji: '⭐',
    color: '#F97316',
    bg: '#FFF7ED',
    description: 'Le choix des familles sénégalaises',
    seances: 8,
    tagline: '8 séances / mois',
    highlight: true,
    badge: 'Le plus populaire',
    features: [
      { ok: true, text: '8 séances de tutorat (1h chacune)' },
      { ok: true, text: 'Tuteur dédié tout le mois' },
      { ok: true, text: 'En ligne ou à domicile' },
      { ok: true, text: 'Annulation flexible' },
      { ok: true, text: 'Suivi de progression mensuel' },
      { ok: false, text: 'Rapport détaillé aux parents' },
    ],
    prix: {
      'Primaire (CI–CM2)': 28000,
      'Collège (6ème–3ème)': 38000,
      'Lycée (2nde–Tle)': 48000,
      'Supérieur': 64000,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    emoji: '🏆',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    description: 'Pour une progression rapide et assurée',
    seances: 16,
    tagline: '16 séances / mois',
    highlight: false,
    features: [
      { ok: true, text: '16 séances de tutorat (1h chacune)' },
      { ok: true, text: 'Tuteur dédié + tuteur de remplacement' },
      { ok: true, text: 'En ligne ou à domicile' },
      { ok: true, text: 'Annulation flexible' },
      { ok: true, text: 'Suivi de progression hebdomadaire' },
      { ok: true, text: 'Rapport mensuel détaillé aux parents' },
    ],
    prix: {
      'Primaire (CI–CM2)': 52000,
      'Collège (6ème–3ème)': 68000,
      'Lycée (2nde–Tle)': 86000,
      'Supérieur': 112000,
    },
  },
];

const NIVEAUX = ['Primaire (CI–CM2)', 'Collège (6ème–3ème)', 'Lycée (2nde–Tle)', 'Supérieur'];

const FAQ_ITEMS = [
  { q: 'Comment se font les paiements ?', a: 'Vous payez directement votre tuteur via Orange Money, Wave, Free Money ou en espèces. Aucune commission prélevée par e-Tutorat sur vos paiements.' },
  { q: 'Peut-on changer de tuteur en cours de formule ?', a: 'Oui, vous pouvez demander un changement de tuteur à tout moment. Notre équipe vous proposera un tuteur de remplacement dans les 48h.' },
  { q: 'Les cours sont-ils en ligne ou à domicile ?', a: 'Les deux modes sont disponibles selon les tuteurs. Précisez votre préférence lors de la recherche et filtrez par mode de cours.' },
  { q: 'Y a-t-il un engagement de durée ?', a: 'Non, aucun engagement. Vous réservez séance par séance ou par forfait mensuel sans abonnement automatique.' },
  { q: 'Que faire si le tuteur annule une séance ?', a: 'Le tuteur doit annuler au moins 24h à l\'avance. La séance est alors reprogrammée sans frais supplémentaires.' },
  { q: 'Y a-t-il des réductions pour plusieurs enfants ?', a: 'Oui ! À partir du 2e enfant inscrit dans la même famille, vous bénéficiez de 10 % de réduction sur toutes les séances.' },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.border}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS, textAlign: 'left' }}>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: C.text }}>{item.q}</span>
        {open ? <ChevronUp size={20} color={C.primary} /> : <ChevronDown size={20} color={C.light} />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          style={{ paddingBottom: '20px', fontSize: '1rem', color: C.muted, lineHeight: 1.65 }}>
          {item.a}
        </motion.div>
      )}
    </div>
  );
}

export default function TarifsPage({ onGoHome, onInscription, onTuteurs }) {
  const [activeNiveau, setActiveNiveau] = useState('Lycée (2nde–Tle)');
  const isMobile = useIsMobile();

  const fmt = (n) => n.toLocaleString('fr-FR') + ' FCFA';

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
            <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: '1.3rem', color: C.text }}>Tarifs</span>
          </div>
          <button onClick={onInscription} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: C.primary, border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: SANS, padding: '8px 18px', borderRadius: '999px' }}>
            S'inscrire <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.accent} 0%, rgba(251,191,36,0.1) 100%)`, padding: '64px 5% 52px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(249,115,22,0.1)', padding: '7px 16px', borderRadius: '100px', color: C.primary, fontWeight: 700, fontSize: '0.85rem', marginBottom: '20px' }}>
              <Coins size={15} /> Tarifs en FCFA — transparents & sans surprise
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.4rem, 4vw, 3.6rem)', color: C.text, fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px 0' }}>
              Des tarifs adaptés à{' '}
              <span style={{ color: C.primary, fontStyle: 'italic' }}>chaque famille</span>
            </h1>
            <p style={{ fontSize: isMobile ? '1rem' : '1.2rem', color: C.muted, lineHeight: 1.6, margin: '0 auto 40px', maxWidth: '620px' }}>
              Payez directement votre tuteur. Aucune commission cachée, aucun abonnement automatique. Juste du tutorat de qualité en FCFA.
            </p>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: Shield, text: 'Tuteurs vérifiés' },
                { icon: Clock, text: 'Pas d\'engagement' },
                { icon: Smartphone, text: 'Paiement mobile money' },
                { icon: Zap, text: 'Premier cours garanti' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontWeight: 600, fontSize: '0.9rem' }}>
                  <Icon size={16} color={C.primary} /> {text}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Niveau selector */}
      <div style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, padding: '20px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 14px 0', fontWeight: 700, color: C.muted, fontSize: '0.9rem' }}>Afficher les tarifs pour :</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {NIVEAUX.map(n => (
              <button key={n} onClick={() => setActiveNiveau(n)}
                style={{ padding: '9px 20px', borderRadius: '999px', border: `1.5px solid ${activeNiveau === n ? C.primary : C.border}`, backgroundColor: activeNiveau === n ? C.primary : 'transparent', color: activeNiveau === n ? '#fff' : C.muted, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: SANS }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '24px', alignItems: 'start' }}>
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.id} delay={i * 0.12}>
              <div style={{
                backgroundColor: C.surface,
                borderRadius: '24px',
                border: plan.highlight ? `2.5px solid ${C.primary}` : `1.5px solid ${C.border}`,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: plan.highlight ? '0 20px 50px rgba(249,115,22,0.18)' : '0 4px 20px rgba(62,42,31,0.05)',
                transform: plan.highlight && !isMobile ? 'scale(1.03)' : 'scale(1)',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: C.primary, color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', letterSpacing: '0.5px' }}>
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div style={{ padding: '28px 28px 24px', backgroundColor: plan.bg, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{plan.emoji}</div>
                  <h3 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: C.text, fontWeight: 800, margin: '0 0 6px 0' }}>{plan.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: C.light, margin: '0 0 20px 0' }}>{plan.description}</p>
                  <div style={{ fontFamily: SERIF, fontSize: '2.4rem', fontWeight: 900, color: plan.highlight ? C.primary : C.text, lineHeight: 1 }}>
                    {fmt(plan.prix[activeNiveau])}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: C.light, marginTop: '4px' }}>{plan.tagline}</div>
                  {plan.seances > 1 && (
                    <div style={{ marginTop: '8px', fontSize: '0.85rem', color: plan.color, fontWeight: 700 }}>
                      ≈ {fmt(Math.round(plan.prix[activeNiveau] / plan.seances))} / séance
                    </div>
                  )}
                </div>

                {/* Features */}
                <div style={{ padding: '24px 28px' }}>
                  <ul style={{ listStyle: 'none', margin: '0 0 28px 0', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {plan.features.map((f, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: f.ok ? C.text : C.light, fontSize: '0.95rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: f.ok ? (plan.highlight ? C.primary : plan.bg) : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                          {f.ok ? <Check size={12} color={plan.highlight ? '#fff' : plan.color} strokeWidth={3} /> : <X size={11} color='#9CA3AF' strokeWidth={2.5} />}
                        </div>
                        {f.text}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onInscription} style={{
                    width: '100%', padding: '13px', borderRadius: '14px',
                    backgroundColor: plan.highlight ? C.primary : 'transparent',
                    border: `2px solid ${plan.highlight ? C.primary : C.border}`,
                    color: plan.highlight ? '#fff' : C.primary,
                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: SANS,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    Commencer <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Tarifs par niveau tableau */}
        <FadeIn delay={0.3}>
          <div style={{ marginTop: '80px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '2rem', color: C.text, fontWeight: 800, margin: '0 0 8px 0', textAlign: 'center' }}>
              Grille tarifaire complète
            </h2>
            <p style={{ textAlign: 'center', color: C.light, marginBottom: '32px', fontSize: '1rem' }}>Tous les tarifs sont en FCFA par séance d'1 heure</p>

            <div style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SANS, minWidth: '480px' }}>
                <thead>
                  <tr style={{ backgroundColor: C.accent }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 800, color: C.text, fontSize: '0.95rem' }}>Niveau scolaire</th>
                    {PLANS.map(p => (
                      <th key={p.id} style={{ padding: '16px 24px', textAlign: 'center', fontWeight: 800, color: p.highlight ? C.primary : C.text, fontSize: '0.95rem' }}>
                        {p.emoji} {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {NIVEAUX.map((n, ni) => (
                    <tr key={n} style={{ backgroundColor: ni % 2 === 0 ? C.surface : C.background, borderTop: `1px solid ${C.border}` }}>
                      <td style={{ padding: '16px 24px', fontWeight: 700, color: C.text, fontSize: '0.95rem' }}>{n}</td>
                      {PLANS.map(p => (
                        <td key={p.id} style={{ padding: '16px 24px', textAlign: 'center', color: p.highlight ? C.primary : C.muted, fontWeight: p.highlight ? 800 : 600, fontSize: '0.95rem' }}>
                          {fmt(p.seances === 1 ? p.prix[n] : Math.round(p.prix[n] / p.seances))}
                          {p.seances > 1 && <span style={{ fontSize: '0.78rem', color: C.light, display: 'block' }}>/ séance</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        {/* Paiement */}
        <FadeIn delay={0.4}>
          <div style={{ marginTop: '64px', backgroundColor: C.surface, borderRadius: '24px', border: `1.5px solid ${C.border}`, padding: isMobile ? '24px 20px' : '40px', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: C.accent, padding: '6px 14px', borderRadius: '100px', color: C.primary, fontWeight: 700, fontSize: '0.82rem', marginBottom: '16px' }}>
                <Smartphone size={14} /> Moyens de paiement acceptés
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: C.text, fontWeight: 800, margin: '0 0 12px 0' }}>Paiement direct & sécurisé</h3>
              <p style={{ color: C.muted, lineHeight: 1.6, margin: 0, fontSize: '1rem' }}>
                Vous payez directement votre tuteur sans intermédiaire. Pas de commission e-Tutorat. Le tuteur définit son numéro de paiement dans son profil.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { name: 'Orange Money', emoji: '🟠', color: '#FF6600' },
                { name: 'Wave', emoji: '🔵', color: '#0EA5E9' },
                { name: 'Free Money', emoji: '🟢', color: '#16A34A' },
                { name: 'Espèces', emoji: '💵', color: '#D97706' },
              ].map(m => (
                <div key={m.name} style={{ backgroundColor: C.background, border: `1.5px solid ${C.border}`, borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{m.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text }}>{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* FAQ */}
        <FadeIn delay={0.5}>
          <div style={{ marginTop: '72px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: '2rem', color: C.text, fontWeight: 800, margin: '0 0 8px 0', textAlign: 'center' }}>Questions fréquentes</h2>
            <p style={{ textAlign: 'center', color: C.light, marginBottom: '40px' }}>Tout ce que vous devez savoir sur les tarifs</p>
            <div style={{ maxWidth: '720px', margin: '0 auto', backgroundColor: C.surface, borderRadius: '20px', border: `1.5px solid ${C.border}`, padding: isMobile ? '0 16px' : '0 32px' }}>
              {FAQ_ITEMS.map(item => <FaqItem key={item.q} item={item} />)}
            </div>
          </div>
        </FadeIn>

        {/* CTA */}
        <FadeIn delay={0.6}>
          <div style={{ marginTop: '72px', background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, borderRadius: '28px', padding: isMobile ? '36px 20px' : '52px', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🇸🇳</div>
            <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', fontWeight: 900, margin: '0 0 12px 0' }}>Prêt à commencer ?</h2>
            <p style={{ fontSize: isMobile ? '1rem' : '1.15rem', opacity: 0.9, margin: '0 0 32px 0' }}>
              Inscrivez-vous gratuitement et trouvez votre tuteur idéal en moins de 5 minutes.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={onInscription} style={{ backgroundColor: '#fff', color: C.primary, border: 'none', padding: '14px 32px', borderRadius: '999px', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', fontFamily: SANS, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                S'inscrire gratuitement <ArrowRight size={18} />
              </button>
              <button onClick={onTuteurs} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', padding: '14px 32px', borderRadius: '999px', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', fontFamily: SANS }}>
                Voir les tuteurs
              </button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
