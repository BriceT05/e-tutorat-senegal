// Page 404 — affichée par main.jsx quand `page` ne correspond à aucune route connue.
import { motion } from 'framer-motion';
import { BookOpen, Home, Search } from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280',
};
const SERIF = '"Playfair Display", serif';
const SANS  = '"Inter", sans-serif';

export default function NotFoundPage({ onGoHome, onTuteurs }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* Fond décoratif */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
        <img src="/logo.svg" alt="e-Tutorat" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        style={{ textAlign: 'center', maxWidth: '540px' }}>

        {/* Grand 404 */}
        <div style={{ fontFamily: SERIF, fontSize: 'clamp(6rem, 20vw, 10rem)', fontWeight: 900, lineHeight: 1, color: 'transparent', WebkitTextStroke: `3px ${C.primary}`, opacity: 0.15, marginBottom: '-20px', userSelect: 'none' }}>
          404
        </div>

        <div style={{ fontSize: '5rem', marginBottom: '16px' }}>📚</div>

        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: C.text, margin: '0 0 16px', fontWeight: 700 }}>
          Page introuvable
        </h1>
        <p style={{ color: C.muted, fontSize: '1.05rem', lineHeight: 1.7, margin: '0 0 40px' }}>
          Oops ! Cette page n'existe pas ou a été déplacée.<br />
          Pas de panique — retournez à l'accueil ou trouvez un tuteur.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button onClick={onGoHome} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 32px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', fontFamily: SANS, boxShadow: '0 10px 25px rgba(249,115,22,0.35)' }}>
            <Home size={18} /> Retour à l'accueil
          </motion.button>
          <motion.button onClick={onTuteurs} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 32px', borderRadius: '100px', border: `2px solid ${C.accent}`, backgroundColor: 'transparent', color: C.muted, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
            <Search size={18} /> Trouver un tuteur
          </motion.button>
        </div>
      </motion.div>

      {/* Bande drapeau sénégalais */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', height: '6px', zIndex: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>
    </div>
  );
}
