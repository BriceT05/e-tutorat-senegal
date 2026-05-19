// Page de vérification d'email — affichée quand l'utilisateur clique le lien dans son email.
// Le token (?verify=...) est extrait par main.jsx et passé en prop.
// Trois états : loading → success | error. L'appel API est déclenché dès le montage.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, Loader } from 'lucide-react';
import api from './api';
import useIsMobile from './useIsMobile';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280',
};
const SERIF = '"Playfair Display", serif';
const SANS  = '"Inter", sans-serif';

export default function VerifyEmailPage({ token, onGoHome, onGoConnexion }) {
  const isMobile = useIsMobile();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  // Vérification automatique au montage — le token est à usage unique côté serveur
  useEffect(() => {
    api.get(`/auth/verify-email?token=${token}`)
      .then(data => setStatus(data.error ? 'error' : 'success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS, display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <header style={{ padding: '24px 5%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
        <img src="/logo.png" alt="e-Tutorat" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px 80px', position: 'relative', zIndex: 5 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ backgroundColor: C.surface, borderRadius: isMobile ? '20px' : '32px', padding: isMobile ? '32px 20px' : '52px 48px', boxShadow: '0 8px 48px rgba(62,42,31,0.08)', border: `1px solid ${C.accent}`, maxWidth: '480px', width: '100%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }} />

          {status === 'loading' && (
            <div style={{ padding: '20px 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: C.accent, display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <Loader size={36} color={C.primary} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: '1.8rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>Vérification en cours…</h2>
              <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.6, margin: 0 }}>Veuillez patienter quelques secondes.</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '20px 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={36} color="#10B981" />
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: '1.8rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>Email vérifié !</h2>
              <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                Votre adresse email a été confirmée avec succès. Bienvenue sur e-Tutorat Sénégal !
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button onClick={onGoConnexion} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '14px 32px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', fontFamily: SANS, boxShadow: '0 10px 25px rgba(249,115,22,0.35)' }}>
                  Se connecter →
                </motion.button>
                <button onClick={onGoHome}
                  style={{ padding: '14px 32px', borderRadius: '100px', border: `2px solid ${C.accent}`, backgroundColor: 'transparent', color: C.muted, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                  Accueil
                </button>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '20px 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                <XCircle size={36} color="#DC2626" />
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: '1.8rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>Lien invalide</h2>
              <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                Ce lien de vérification est invalide ou a déjà été utilisé. Reconnectez-vous et renvoyez un email depuis votre tableau de bord.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button onClick={onGoConnexion} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '14px 32px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', fontFamily: SANS }}>
                  Se connecter
                </motion.button>
                <button onClick={onGoHome}
                  style={{ padding: '14px 32px', borderRadius: '100px', border: `2px solid ${C.accent}`, backgroundColor: 'transparent', color: C.muted, fontSize: '1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                  Accueil
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', height: '6px', zIndex: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
