// Page d'accueil — landing page en 8 sections avec animations au scroll.
// Pas d'appels API : contenu entièrement statique, optimisé pour les performances initiales.
// FadeIn utilise useInView (framer-motion) avec margin:-80px pour déclencher avant que
// l'élément soit complètement visible — évite un effet "pop" trop tardif au scroll.
import { useState, useEffect } from 'react';
import useIsMobile from './useIsMobile';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Search, ChevronRight, Users, GraduationCap, BookOpen, Globe,
  Star, ArrowRight, Check, Menu, X, Calculator, FlaskConical,
  Languages, Atom, Globe2, Cpu, BookMarked, Landmark, Coins,
  MessageSquare, Share2, ExternalLink, Send, Mail, Phone,
  MapPin, PlayCircle, Shield, Clock, Award
} from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  primary: '#F97316',
  secondary: '#FBBF24',
  background: '#FFFDF5',
  surface: '#FFFFFF',
  accent: '#FEF3C7',
  text: '#3E2A1F',
  muted: '#524036',
  light: '#6B7280',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

// ─── Reusable components ─────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', onClick, style = {} }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    style={{
      padding: '1.15rem 2.6rem',
      fontSize: '1.15rem',
      fontWeight: 700,
      borderRadius: '999px',
      border: variant === 'primary' ? 'none' : `2px solid ${C.primary}`,
      backgroundColor: variant === 'primary' ? C.primary : C.surface,
      color: variant === 'primary' ? '#fff' : C.primary,
      boxShadow: variant === 'primary' ? '0 10px 25px -5px rgba(249,115,22,0.38)' : '0 4px 15px rgba(0,0,0,0.05)',
      display: 'inline-flex', alignItems: 'center', gap: '10px',
      cursor: 'pointer', fontFamily: SANS,
      ...style,
    }}
  >
    {children}
  </motion.button>
);

const SectionBadge = ({ children }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    backgroundColor: C.accent, padding: '8px 18px', borderRadius: '100px',
    color: C.primary, fontWeight: 700, fontSize: '0.9rem',
    border: '1px solid rgba(251,191,36,0.4)', marginBottom: '20px',
    fontFamily: SANS,
  }}>{children}</div>
);

const SectionTitle = ({ children, center }) => (
  <h2 style={{
    fontFamily: SERIF, fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
    color: C.text, lineHeight: 1.15, margin: '0 0 16px 0', fontWeight: 700,
    textAlign: center ? 'center' : 'left',
  }}>{children}</h2>
);

const FadeIn = ({ children, delay = 0, y = 30, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }} style={style}>
      {children}
    </motion.div>
  );
};

const Stars = ({ n = 5 }) => (
  <div style={{ display: 'flex', gap: '3px' }}>
    {Array.from({ length: n }).map((_, i) => (
      <Star key={i} size={16} fill={C.secondary} color={C.secondary} />
    ))}
  </div>
);

const GeoPatter = ({ opacity = 0.04 }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', opacity,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23F97316' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundSize: '40px 40px',
  }} />
);

// ─── 1. NAVBAR ───────────────────────────────────────────────────────────────
const Navbar = ({ onConnexion, onInscription, onTuteurs, onMatieres, onBlog, currentUser, onDashboard }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const links = [
    { label: 'Tuteurs', action: onTuteurs },
    { label: 'Matières', action: onMatieres },
    { label: 'Blog', action: onBlog },
  ];

  const closeAndGo = (action) => { setOpen(false); action(); };

  // `open` force aussi le fond opaque pour que le menu mobile reste lisible
  // même quand la navbar est tout en haut de la page (scrollY === 0).
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backgroundColor: scrolled || open ? 'rgba(255,253,245,0.97)' : 'transparent',
      backdropFilter: scrolled || open ? 'blur(16px)' : 'none',
      boxShadow: scrolled || open ? '0 1px 20px rgba(62,42,31,0.08)' : 'none',
      transition: 'all 0.3s ease', fontFamily: SANS,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: isMobile ? '64px' : '80px' }}>
        {/* Logo */}
        <img src="/logo.svg" alt="e-Tutorat" style={{ height: isMobile ? '60px' : '80px', width: 'auto', objectFit: 'contain' }} />

        {/* Links desktop */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
            {links.map(({ label, action }) => (
              <span key={label} onClick={action}
                style={{ fontWeight: 600, fontSize: '1rem', color: C.muted, cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = C.primary}
                onMouseLeave={e => e.target.style.color = C.muted}>{label}</span>
            ))}
          </div>
        )}

        {/* CTA desktop / Hamburger mobile */}
        {isMobile ? (
          <button onClick={() => setOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text, padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {currentUser ? (
              <Btn style={{ padding: '10px 22px', fontSize: '0.95rem' }} onClick={onDashboard}>Mon espace <ArrowRight size={18} /></Btn>
            ) : (
              <>
                <button onClick={onConnexion} style={{ padding: '10px 22px', borderRadius: '999px', border: `2px solid ${C.primary}`, background: 'transparent', color: C.primary, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: SANS }}>Connexion</button>
                <Btn style={{ padding: '10px 22px', fontSize: '0.95rem' }} onClick={onInscription}>S'inscrire <ArrowRight size={18} /></Btn>
              </>
            )}
          </div>
        )}
      </div>

      {/* Menu mobile déroulant */}
      {isMobile && open && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: 'rgba(255,253,245,0.98)', borderTop: `1px solid ${C.accent}`, padding: '16px 5% 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {links.map(({ label, action }) => (
            <button key={label} onClick={() => closeAndGo(action)}
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '14px 12px', fontSize: '1.1rem', fontWeight: 600, color: C.muted, cursor: 'pointer', fontFamily: SANS, borderRadius: '12px' }}>
              {label}
            </button>
          ))}
          <div style={{ height: '1px', backgroundColor: C.accent, margin: '8px 0' }} />
          {currentUser ? (
            <button onClick={() => closeAndGo(onDashboard)}
              style={{ padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
              Mon espace →
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => closeAndGo(onConnexion)}
                style={{ padding: '14px', borderRadius: '14px', border: `2px solid ${C.primary}`, background: 'transparent', color: C.primary, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                Connexion
              </button>
              <button onClick={() => closeAndGo(onInscription)}
                style={{ padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                S'inscrire →
              </button>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
};

// ─── 2. HERO ─────────────────────────────────────────────────────────────────
const Hero = ({ onInscription, onTuteurs }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{
    position: 'relative', minHeight: '100vh', backgroundColor: C.background,
    overflow: 'hidden', padding: isMobile ? '0 6%' : '0 5%',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    fontFamily: SANS, paddingTop: isMobile ? '64px' : '80px',
  }}>
    <GeoPatter />
    <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.15fr 1fr', gap: isMobile ? '32px' : '60px', alignItems: 'center', zIndex: 1, padding: isMobile ? '48px 0 64px' : '80px 0' }}>
      {/* Left */}
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, ease: 'easeOut' }}>
        <SectionBadge><Globe size={16} /> L'excellence éducative au Sénégal</SectionBadge>

        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2rem, 7vw, 4.8rem)', color: C.text, lineHeight: 1.1, margin: '0 0 20px 0', fontWeight: 900 }}>
          Le savoir partagé avec la{' '}
          <span style={{ color: C.primary, fontStyle: 'italic' }}>Teranga.</span>
        </h1>

        <p style={{ fontSize: isMobile ? '1.05rem' : '1.35rem', color: C.muted, lineHeight: 1.65, marginBottom: isMobile ? '32px' : '48px', maxWidth: '560px', borderLeft: `4px solid ${C.secondary}`, paddingLeft: isMobile ? '16px' : '24px' }}>
          Connectez vos enfants aux meilleurs tuteurs du pays pour transformer leur avenir scolaire. Une plateforme conçue par et pour les Sénégalais.
        </p>

        <div style={{ display: 'flex', gap: isMobile ? '12px' : '20px', flexWrap: 'wrap' }}>
          <Btn onClick={onTuteurs} style={{ padding: isMobile ? '0.9rem 1.6rem' : '1.15rem 2.6rem', fontSize: isMobile ? '1rem' : '1.15rem' }}><Search size={isMobile ? 18 : 22} /> Trouver un tuteur</Btn>
          <Btn variant="secondary" onClick={onInscription} style={{ padding: isMobile ? '0.9rem 1.6rem' : '1.15rem 2.6rem', fontSize: isMobile ? '1rem' : '1.15rem' }}>Devenir tuteur <ChevronRight size={isMobile ? 18 : 22} /></Btn>
        </div>

        {/* Stats */}
        <div style={{ marginTop: isMobile ? '28px' : '72px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { icon: Users, value: '100%', label: 'Tuteurs vérifiés' },
            { icon: GraduationCap, value: 'CI → Bac', label: 'Tous niveaux' },
            { icon: BookOpen, value: '20+', label: 'Matières' },
          ].map(({ icon: Icon, value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }}
              style={{ backgroundColor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)', padding: isMobile ? '0.8rem 1rem' : '1.4rem 1.8rem', borderRadius: '20px', border: `1px solid ${C.accent}`, flex: '1', minWidth: isMobile ? '0' : '155px', boxShadow: '0 4px 20px rgba(62,42,31,0.04)' }}>
              <div style={{ backgroundColor: C.accent, padding: isMobile ? '6px' : '8px', borderRadius: '10px', marginBottom: '8px', display: 'inline-block' }}>
                <Icon size={isMobile ? 16 : 24} color={C.primary} />
              </div>
              <div style={{ fontSize: isMobile ? '1.25rem' : '2rem', fontWeight: 900, color: C.text }}>{value}</div>
              <div style={{ fontSize: isMobile ? '0.68rem' : '0.78rem', color: C.light, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Right illustration — masquée sur mobile */}
      {!isMobile && (
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: 'circOut' }}
          style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '460px', height: '560px', borderRadius: '40px', overflow: 'hidden', boxShadow: `28px 28px 0px ${C.secondary}`, border: `8px solid ${C.surface}`, position: 'relative' }}>
            <img src="/Education sans limite.jpg" alt="Éducation sans limites" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </motion.div>
      )}
    </div>

    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '10px', background: `repeating-linear-gradient(45deg, ${C.primary}, ${C.primary} 40px, ${C.secondary} 40px, ${C.secondary} 80px)` }} />
  </section>
  );
};

// ─── 3. COMMENT ÇA MARCHE ────────────────────────────────────────────────────
const HowItWorks = () => {
  const isMobile = useIsMobile();
  const steps = [
    { icon: Users, n: '01', title: 'Créez votre profil', desc: "Inscrivez-vous gratuitement en 2 minutes. Indiquez le niveau scolaire, les matières et vos disponibilités." },
    { icon: Search, n: '02', title: 'Trouvez votre tuteur', desc: "Parcourez notre sélection de tuteurs vérifiés, lisez les avis et choisissez celui qui correspond à votre enfant." },
    { icon: PlayCircle, n: '03', title: 'Commencez à apprendre', desc: "Démarrez vos séances de tutorat en ligne ou en présentiel. Suivez les progrès en temps réel." },
  ];

  return (
    <section style={{ position: 'relative', backgroundColor: C.background, padding: isMobile ? '60px 5%' : '100px 5%', overflow: 'hidden', fontFamily: SANS }}>
      <GeoPatter opacity={0.03} />
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <FadeIn style={{ textAlign: 'center', marginBottom: '72px' }}>
          <SectionBadge><Clock size={16} /> Simple et rapide</SectionBadge>
          <SectionTitle center>Comment ça <span style={{ color: C.primary, fontStyle: 'italic' }}>marche ?</span></SectionTitle>
          <p style={{ fontSize: '1.2rem', color: C.muted, maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            En 3 étapes simples, votre enfant bénéficie d'un accompagnement sur mesure.
          </p>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '20px' : '40px' }}>
          {steps.map(({ icon: Icon, n, title, desc }, i) => (
            <FadeIn key={n} delay={i * 0.15}>
              <div style={{ background: C.surface, borderRadius: '28px', padding: isMobile ? '28px 20px' : '44px 36px', border: `1px solid ${C.accent}`, boxShadow: '0 8px 32px rgba(62,42,31,0.06)', position: 'relative', overflow: 'hidden', height: '100%' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '20px', fontFamily: SERIF, fontSize: isMobile ? '4rem' : '6rem', fontWeight: 900, color: C.accent, lineHeight: 1, userSelect: 'none' }}>{n}</div>
                <div style={{ width: isMobile ? '52px' : '64px', height: isMobile ? '52px' : '64px', borderRadius: '20px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '20px' : '28px', boxShadow: `0 8px 20px rgba(249,115,22,0.15)` }}>
                  <Icon size={isMobile ? 26 : 32} color={C.primary} />
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: isMobile ? '1.3rem' : '1.6rem', color: C.text, margin: '0 0 12px 0', fontWeight: 700 }}>{title}</h3>
                <p style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', color: C.muted, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                {i < steps.length - 1 && !isMobile && (
                  <div style={{ position: 'absolute', top: '50%', right: '-20px', zIndex: 2, backgroundColor: C.primary, borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249,115,22,0.35)' }}>
                    <ArrowRight size={20} color="#fff" />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── 4. TUTEURS EN VEDETTE ────────────────────────────────────────────────────
const TUTORS = [];

const BADGE_COLORS = {
  'Top tuteur': { bg: '#FEF3C7', color: '#B45309' },
  'Nouveau': { bg: '#DCFCE7', color: '#166534' },
  'Populaire': { bg: '#EDE9FE', color: '#7C3AED' },
};

const TutorCard = ({ tutor, delay }) => (
  <FadeIn delay={delay}>
    <motion.div whileHover={{ y: -8, boxShadow: '0 24px 60px rgba(62,42,31,0.12)' }}
      style={{ background: C.surface, borderRadius: '24px', padding: '32px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 20px rgba(62,42,31,0.06)', cursor: 'pointer', fontFamily: SANS }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '20px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>{tutor.emoji}</div>
        <div style={{ backgroundColor: BADGE_COLORS[tutor.badge].bg, color: BADGE_COLORS[tutor.badge].color, padding: '5px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>{tutor.badge}</div>
      </div>
      <h3 style={{ fontFamily: SERIF, fontSize: '1.4rem', color: C.text, margin: '0 0 4px 0', fontWeight: 700 }}>{tutor.name}</h3>
      <div style={{ fontSize: '1rem', color: C.primary, fontWeight: 700, marginBottom: '4px' }}>{tutor.subject}</div>
      <div style={{ fontSize: '0.9rem', color: C.light, marginBottom: '16px' }}>{tutor.level}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Stars n={5} />
        <span style={{ fontWeight: 700, color: C.text }}>{tutor.rating}</span>
        <span style={{ color: C.light, fontSize: '0.9rem' }}>({tutor.reviews} avis)</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.accent}`, paddingTop: '18px' }}>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: C.text }}>{tutor.price}</span>
        <motion.button whileHover={{ scale: 1.05 }}
          style={{ padding: '10px 20px', borderRadius: '100px', backgroundColor: C.accent, border: 'none', color: C.primary, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: SANS }}>
          Voir le profil →
        </motion.button>
      </div>
    </motion.div>
  </FadeIn>
);

const FeaturedTutors = ({ onTuteurs }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{ backgroundColor: '#FFF9F0', padding: isMobile ? '60px 5%' : '100px 5%', fontFamily: SANS }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <FadeIn style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '56px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <SectionBadge><Award size={16} /> Sélectionnés pour vous</SectionBadge>
          <SectionTitle>Nos tuteurs <span style={{ color: C.primary, fontStyle: 'italic' }}>vedettes</span></SectionTitle>
          <p style={{ fontSize: '1.15rem', color: C.muted, maxWidth: '500px', lineHeight: 1.6 }}>Tous nos tuteurs sont vérifiés, diplômés et évalués par nos élèves.</p>
        </div>
        <Btn variant="secondary" onClick={onTuteurs}>Voir tous les tuteurs <ArrowRight size={20} /></Btn>
      </FadeIn>

      {TUTORS.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '14px' : '24px' }}>
          {TUTORS.map((t, i) => <TutorCard key={t.name} tutor={t} delay={i * 0.1} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.light, fontFamily: SANS }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👨🏾‍🏫</div>
          <p style={{ fontSize: '1.1rem' }}>Les profils tuteurs seront bientôt disponibles.</p>
        </div>
      )}
    </div>
  </section>
  );
};

// ─── 5. MATIÈRES ─────────────────────────────────────────────────────────────
const SUBJECTS = [
  { icon: Calculator, label: 'Mathématiques', color: '#FEF3C7', image: '/Mathématique.jpg' },
  { icon: Atom, label: 'Physique-Chimie', color: '#EDE9FE', image: '/Physique chimie.jpg' },
  { icon: Languages, label: 'Français', color: '#DCFCE7', image: '/Français.jpg' },
  { icon: Globe2, label: 'Anglais', color: '#DBEAFE', image: '/Anglais.jpg' },
  { icon: FlaskConical, label: 'SVT', color: '#FEE2E2', image: '/SVT.jpg' },
  { icon: Landmark, label: 'Histoire-Géo', color: '#FEF3C7', image: '/Histoire Géograhie.jpg' },
  { icon: Cpu, label: 'Informatique', color: '#EDE9FE', image: '/Informatique.jpg' },
  { icon: BookMarked, label: 'Arabe', color: '#DCFCE7', image: '/Arabe.jpg' },
  { icon: MessageSquare, label: 'Philosophie', color: '#DBEAFE', image: '/Philosophie.jpg' },
  { icon: Coins, label: 'Économie', color: '#FEE2E2', image: '/Economie.jpg' },
  { icon: GraduationCap, label: 'Espagnol', color: '#FEF3C7', image: '/Espagnol.jpg' },
  { icon: BookOpen, label: 'LV2 Arabe', color: '#EDE9FE', image: '/Arabe.jpg' },
];

const Subjects = () => {
  const isMobile = useIsMobile();
  return (
  <section style={{ backgroundColor: C.background, padding: isMobile ? '60px 5%' : '100px 5%', fontFamily: SANS }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <FadeIn style={{ textAlign: 'center', marginBottom: '60px' }}>
        <SectionBadge><BookOpen size={16} /> 50+ matières disponibles</SectionBadge>
        <SectionTitle center>Toutes les matières,<br /><span style={{ color: C.primary, fontStyle: 'italic' }}>tous les niveaux</span></SectionTitle>
      </FadeIn>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? '12px' : '20px' }}>
        {SUBJECTS.map(({ icon: Icon, label, image }, i) => (
          <FadeIn key={label} delay={i * 0.05}>
            <motion.div whileHover={{ y: -6, boxShadow: '0 20px 48px rgba(62,42,31,0.18)' }}
              style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative', height: isMobile ? '110px' : '160px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 16px rgba(62,42,31,0.06)', cursor: 'pointer' }}>
              <img src={image} alt={label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,8,0,0.85) 0%, rgba(20,8,0,0.25) 55%, transparent 100%)' }} />
              <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: isMobile ? '8px 4px' : '14px 8px', textAlign: 'center' }}>
                <div style={{ width: isMobile ? '28px' : '38px', height: isMobile ? '28px' : '38px', borderRadius: '10px', backgroundColor: 'rgba(249,115,22,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '5px', flexShrink: 0 }}>
                  <Icon size={isMobile ? 14 : 19} color="#fff" />
                </div>
                <div style={{ fontSize: isMobile ? '0.65rem' : '0.82rem', fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>{label}</div>
              </div>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
  );
};

// ─── 6. TÉMOIGNAGES ──────────────────────────────────────────────────────────
const TESTIMONIALS = [];

const Testimonials = () => {
  const isMobile = useIsMobile();
  return (
  <section style={{ backgroundColor: '#FFF9F0', padding: isMobile ? '60px 5%' : '100px 5%', fontFamily: SANS }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <FadeIn style={{ textAlign: 'center', marginBottom: '64px' }}>
        <SectionBadge><Star size={16} fill={C.primary} color={C.primary} /> Ils nous font confiance</SectionBadge>
        <SectionTitle center>Ce que disent nos <span style={{ color: C.primary, fontStyle: 'italic' }}>familles</span></SectionTitle>
      </FadeIn>

      {TESTIMONIALS.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '28px' }}>
          {TESTIMONIALS.map(({ emoji, name, role, quote }, i) => (
            <FadeIn key={name} delay={i * 0.15}>
              <div style={{ background: C.surface, borderRadius: '28px', padding: '40px', border: `1px solid ${C.accent}`, boxShadow: '0 8px 32px rgba(62,42,31,0.06)', position: 'relative' }}>
                <div style={{ fontSize: '3rem', color: C.secondary, fontFamily: SERIF, lineHeight: 1, marginBottom: '16px' }}>"</div>
                <p style={{ fontSize: '1.1rem', color: C.muted, lineHeight: 1.75, marginBottom: '28px', fontStyle: 'italic' }}>{quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: `1px solid ${C.accent}`, paddingTop: '20px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{emoji}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text }}>{name}</div>
                    <div style={{ fontSize: '0.85rem', color: C.light }}>{role}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}><Stars /></div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.light, fontFamily: SANS }}>
          <p style={{ fontSize: '1.05rem' }}>Les premiers témoignages seront affichés ici.</p>
        </div>
      )}
    </div>
  </section>
  );
};

// ─── 7. BANDEAU CTA ──────────────────────────────────────────────────────────
const CtaBanner = ({ onInscription }) => {
  const isMobile = useIsMobile();
  return (
  <section style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${C.primary} 0%, #EA580C 50%, #F59E0B 100%)`, padding: isMobile ? '60px 5%' : '100px 5%', fontFamily: SANS }}>
    <GeoPatter opacity={0.08} />
    <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)', filter: 'blur(40px)' }} />

    <FadeIn style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '100px', color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '24px', backdropFilter: 'blur(8px)' }}>
        <Shield size={16} /> Inscription 100% gratuite
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', color: '#fff', lineHeight: 1.15, margin: '0 0 20px 0', fontWeight: 900 }}>
        Prêt à transformer l'avenir de votre enfant ?
      </h2>
      <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
        Rejoignez les premières familles sénégalaises qui font confiance à e-Tutorat pour la réussite de leurs enfants.
      </p>
      <div style={{ display: 'flex', gap: isMobile ? '12px' : '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <motion.button whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} onClick={onInscription}
          style={{ padding: isMobile ? '1rem 2rem' : '1.3rem 3rem', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 800, borderRadius: '999px', border: 'none', backgroundColor: '#fff', color: C.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.15)', fontFamily: SANS }}>
          <Search size={isMobile ? 18 : 22} /> Trouver un tuteur
        </motion.button>
        <motion.button whileHover={{ scale: 1.04, y: -3 }} onClick={onInscription}
          style={{ padding: isMobile ? '1rem 2rem' : '1.3rem 3rem', fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 800, borderRadius: '999px', border: '2.5px solid rgba(255,255,255,0.7)', backgroundColor: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: SANS }}>
          Devenir tuteur <ArrowRight size={isMobile ? 18 : 22} />
        </motion.button>
      </div>
      <div style={{ display: 'flex', gap: isMobile ? '14px' : '32px', justifyContent: 'center', marginTop: isMobile ? '32px' : '48px', flexWrap: 'wrap' }}>
        {['Sans engagement', 'Tuteurs vérifiés', 'Satisfait ou remboursé'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.9)', fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 600 }}>
            <Check size={16} /> {item}
          </div>
        ))}
      </div>
    </FadeIn>
  </section>
  );
};

// ─── 8. FOOTER ───────────────────────────────────────────────────────────────
const SOCIAL_LINKS = [
  { Icon: Send, href: 'https://wa.me/221783476174', label: 'WhatsApp' },
];

const Footer = ({ onLegal, onTuteurs, onInscription, onBlog, onMatieres }) => {
  const isMobile = useIsMobile();
  const [newsletter, setNewsletter] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = () => {
    if (newsletter.includes('@')) {
      setSubscribed(true);
      setNewsletter('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const QUICK_LINKS = [
    { label: 'Trouver un tuteur', action: onTuteurs },
    { label: 'Devenir tuteur',    action: onInscription },
    { label: 'Blog',              action: onBlog },
    { label: 'Matières',          action: onMatieres },
    { label: 'Nous contacter',    action: () => { window.location.href = 'mailto:etutorat2026@gmail.com'; } },
  ];

  const CONTACT_ITEMS = [
    { icon: Mail,  text: 'etutorat2026@gmail.com', href: 'mailto:etutorat2026@gmail.com' },
    { icon: Phone, text: '+221 78 347 61 74',       href: 'tel:+221783476174' },
    { icon: MapPin, text: 'Dakar, Sénégal',         href: null },
  ];

  const linkStyle = { marginBottom: '12px', cursor: 'pointer', transition: 'color 0.2s', color: 'rgba(255,253,245,0.7)' };

  return (
  <footer style={{ backgroundColor: C.text, color: 'rgba(255,253,245,0.7)', fontFamily: SANS }}>
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '48px 5% 32px' : '80px 5% 48px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1.4fr', gap: isMobile ? '36px' : '60px' }}>

      {/* Brand */}
      <div>
        <div style={{ marginBottom: '20px' }}>
          <img src="/logo.svg" alt="e-Tutorat" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <p style={{ fontSize: '1rem', lineHeight: 1.7, maxWidth: '300px', marginBottom: '28px' }}>
          La première plateforme de tutorat en ligne dédiée aux élèves sénégalais. Du CI à la Terminale.
        </p>
        <div style={{ display: 'flex', gap: '14px' }}>
          {SOCIAL_LINKS.map(({ Icon, href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
              style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,253,245,0.08)', display: 'grid', placeItems: 'center', cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(249,115,22,0.3)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,253,245,0.08)'}>
              <Icon size={20} color="rgba(255,253,245,0.8)" />
            </a>
          ))}
        </div>
      </div>

      {/* Liens rapides */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.secondary, marginBottom: '20px' }}>Liens rapides</div>
        {QUICK_LINKS.map(({ label, action }) => (
          <div key={label} onClick={action} style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = C.secondary}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,253,245,0.7)'}>
            {label}
          </div>
        ))}
      </div>

      {/* Matières */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.secondary, marginBottom: '20px' }}>Matières populaires</div>
        {['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'SVT', 'Histoire-Géo'].map(s => (
          <div key={s} onClick={onMatieres} style={linkStyle}
            onMouseEnter={e => e.currentTarget.style.color = C.secondary}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,253,245,0.7)'}>
            {s}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.secondary, marginBottom: '20px' }}>Contact</div>
        {CONTACT_ITEMS.map(({ icon: Icon, text, href }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <Icon size={18} color={C.primary} style={{ flexShrink: 0 }} />
            {href ? (
              <a href={href} style={{ color: 'rgba(255,253,245,0.7)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = C.secondary}
                onMouseLeave={e => e.target.style.color = 'rgba(255,253,245,0.7)'}>{text}</a>
            ) : (
              <span>{text}</span>
            )}
          </div>
        ))}

        <div style={{ marginTop: '28px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: C.secondary, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Newsletter</div>
          {subscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4ADE80', fontWeight: 600, fontSize: '0.95rem' }}>
              <Check size={18} /> Merci, vous êtes inscrit(e) !
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newsletter}
                onChange={e => setNewsletter(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNewsletter()}
                placeholder="Votre email"
                style={{ flex: 1, minWidth: 0, padding: '10px 16px', borderRadius: '100px', border: '1px solid rgba(255,253,245,0.15)', backgroundColor: 'rgba(255,253,245,0.06)', color: '#FFFDF5', fontSize: '0.9rem', outline: 'none', fontFamily: SANS }}
              />
              <button onClick={handleNewsletter}
                style={{ padding: '10px 18px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', cursor: 'pointer', fontWeight: 700, flexShrink: 0, fontFamily: SANS }}>
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div style={{ borderTop: '1px solid rgba(255,253,245,0.08)', padding: '24px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', flexWrap: 'wrap', gap: '12px' }}>
      <span style={{ fontSize: '0.9rem' }}>© 2026 e-Tutorat Sénégal. Tous droits réservés.</span>
      <div style={{ display: 'flex', gap: '24px', fontSize: '0.9rem' }}>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
          onClick={() => onLegal?.('privacy')}
          onMouseEnter={e => e.target.style.color = C.secondary}
          onMouseLeave={e => e.target.style.color = 'rgba(255,253,245,0.7)'}>Confidentialité</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
          onClick={() => onLegal?.('cgu')}
          onMouseEnter={e => e.target.style.color = C.secondary}
          onMouseLeave={e => e.target.style.color = 'rgba(255,253,245,0.7)'}>CGU</span>
      </div>
    </div>

    {/* Senegalese flag stripe */}
    <div style={{ display: 'flex', height: '8px' }}>
      <div style={{ flex: 1, backgroundColor: '#00853F' }} />
      <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
      <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
    </div>
  </footer>
  );
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function HomePage({ onInscription, onConnexion, onTuteurs, onMatieres, onBlog, currentUser, onDashboard, onLegal }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background-color: #FFFDF5; }
        html { scroll-behavior: smooth; }
      `}</style>
      <Navbar onConnexion={onConnexion} onInscription={onInscription} onTuteurs={onTuteurs} onMatieres={onMatieres} onBlog={onBlog} currentUser={currentUser} onDashboard={onDashboard} />
      <Hero onInscription={onInscription} onTuteurs={onTuteurs} />
      <HowItWorks />
      <FeaturedTutors onTuteurs={onTuteurs} />
      <Subjects />
      <Testimonials />
      <CtaBanner onInscription={onInscription} />
      <Footer onLegal={onLegal} onTuteurs={onTuteurs} onInscription={onInscription} onBlog={onBlog} onMatieres={onMatieres} />
    </>
  );
}
