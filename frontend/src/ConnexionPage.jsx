import { useState } from 'react';
import { motion } from 'framer-motion';
import api from './api';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, X, CheckCircle, AlertCircle } from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0', error: '#DC2626',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

const inputStyle = (err) => ({
  padding: '14px 18px 14px 46px', fontSize: '1.05rem', borderRadius: '14px',
  border: `2px solid ${err ? C.error : C.border}`, backgroundColor: C.surface,
  color: C.text, outline: 'none', fontFamily: SANS, width: '100%',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
});

const GeoPatter = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23F97316' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '40px 40px' }} />
);

const ForgotModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setEmailErr('Email invalide'); return; }
    setLoading(true);
    setServerErr('');
    try {
      const data = await api.post('/auth/forgot-password', { email });
      if (data.error) { setServerErr(data.error); }
      else { setSent(true); }
    } catch {
      setServerErr('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(62,42,31,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ backgroundColor: C.surface, borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(62,42,31,0.18)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: C.light }}><X size={20} /></button>

        {sent ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={32} color="#10B981" />
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: '1.5rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>Email envoyé !</h2>
            <p style={{ color: C.muted, fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 8px' }}>
              Si l'adresse <strong>{email}</strong> est enregistrée, vous recevrez un lien dans quelques secondes.
            </p>
            <p style={{ color: C.light, fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 28px' }}>
              Pensez à vérifier vos spams. Le lien expire dans 1 heure.
            </p>
            <button onClick={onClose}
              style={{ padding: '12px 32px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
              Fermer
            </button>
          </motion.div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
                <Lock size={26} color={C.primary} />
              </div>
              <h2 style={{ fontFamily: SERIF, fontSize: '1.5rem', color: C.text, margin: '0 0 8px', fontWeight: 700 }}>Mot de passe oublié</h2>
              <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                Entrez votre email, nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            {serverErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', marginBottom: '16px' }}>
                <AlertCircle size={16} color={C.error} />
                <span style={{ color: C.error, fontSize: '0.88rem', fontWeight: 600 }}>{serverErr}</span>
              </div>
            )}

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: C.text, display: 'block', marginBottom: '6px' }}>
                  Adresse email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                    placeholder="votre@email.com" autoFocus
                    style={{ ...inputStyle(emailErr), fontSize: '0.95rem', padding: '12px 16px 12px 40px' }} />
                </div>
                {emailErr && <span style={{ fontSize: '0.8rem', color: C.error, fontWeight: 600, marginTop: '4px', display: 'block' }}>{emailErr}</span>}
              </div>

              <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={loading}
                style={{ padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: loading ? C.border : C.primary, color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 8px 20px rgba(249,115,22,0.3)', fontFamily: SANS }}>
                {loading ? (
                  <><div style={{ width: '18px', height: '18px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Envoi…</>
                ) : (
                  'Envoyer le lien'
                )}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default function ConnexionPage({ onGoHome, onInscription, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const focus = e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; };
  const blur = (err) => e => { e.target.style.borderColor = err ? C.error : C.border; e.target.style.boxShadow = 'none'; };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Email invalide';
    if (!password) errs.password = 'Mot de passe requis';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.error) {
        setErrors({ email: data.error });
      } else {
        onSuccess?.(data.token, data.user);
      }
    } catch {
      setErrors({ email: 'Erreur de connexion. Réessayez.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>
      <GeoPatter />
      <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ padding: '24px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
        <button onClick={onGoHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1rem', fontWeight: 600, fontFamily: SANS }}>
          <ArrowLeft size={20} /> Accueil
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: C.primary, display: 'grid', placeItems: 'center' }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>e-Tutorat</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', color: C.primary, textTransform: 'uppercase' }}>Sénégal 🇸🇳</div>
          </div>
        </div>
        <div style={{ fontSize: '0.95rem', color: C.light }}>
          Pas encore inscrit ?{' '}
          <span onClick={onInscription} style={{ color: C.primary, fontWeight: 700, cursor: 'pointer' }}>S'inscrire</span>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px 80px', position: 'relative', zIndex: 5 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '480px' }}>

          {/* Card */}
          <div style={{ backgroundColor: C.surface, borderRadius: '32px', padding: '52px 48px', boxShadow: '0 8px 48px rgba(62,42,31,0.08)', border: `1px solid ${C.accent}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }} />

            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(249,115,22,0.18)' }}>
                <BookOpen size={32} color={C.primary} />
              </div>
              <h1 style={{ fontFamily: SERIF, fontSize: '2.2rem', color: C.text, margin: '0 0 8px', fontWeight: 700 }}>
                Bon retour <span style={{ color: C.primary, fontStyle: 'italic' }}>!</span>
              </h1>
              <p style={{ color: C.muted, fontSize: '1.05rem', margin: 0, lineHeight: 1.5 }}>
                Connectez-vous à votre espace e-Tutorat.
              </p>
            </div>

            {/* Social login */}
            <button style={{ width: '100%', padding: '14px', borderRadius: '14px', border: `2px solid ${C.border}`, background: C.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: C.text, fontFamily: SANS, marginBottom: '24px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.primary}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.2 6.5 29.4 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" /><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.7-2.7 4.9-5.1 6.4l6.2 5.2C40.4 36.5 44 30.7 44 24c0-1.3-.1-2.7-.4-4z" /></svg>
              Continuer avec Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: C.border }} />
              <span style={{ fontSize: '0.85rem', color: C.light, fontWeight: 500 }}>ou par email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: C.border }} />
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div>
                <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, display: 'block', marginBottom: '6px' }}>
                  Adresse email <span style={{ color: C.primary }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="votre@email.com" style={inputStyle(errors.email)} onFocus={focus}
                    onBlur={e => { e.target.style.borderColor = errors.email ? C.error : C.border; e.target.style.boxShadow = 'none'; }} />
                </div>
                {errors.email && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '4px', display: 'block' }}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text }}>
                    Mot de passe <span style={{ color: C.primary }}>*</span>
                  </label>
                  <span onClick={() => setForgotOpen(true)} style={{ fontSize: '0.85rem', color: C.primary, fontWeight: 600, cursor: 'pointer' }}>Mot de passe oublié ?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
                  <input type={show ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="••••••••" style={{ ...inputStyle(errors.password), paddingRight: '46px' }} onFocus={focus}
                    onBlur={e => { e.target.style.borderColor = errors.password ? C.error : C.border; e.target.style.boxShadow = 'none'; }} />
                  <button type="button" onClick={() => setShow(s => !s)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '4px' }}>
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '4px', display: 'block' }}>{errors.password}</span>}
              </div>

              {/* Remember me */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '18px', height: '18px', accentColor: C.primary }} />
                <span style={{ fontSize: '0.95rem', color: C.muted }}>Se souvenir de moi</span>
              </label>

              {/* Submit */}
              <motion.button type="submit" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                disabled={loading}
                style={{ padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: loading ? C.border : C.primary, color: '#fff', fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: loading ? 'none' : '0 10px 25px rgba(249,115,22,0.35)', fontFamily: SANS, transition: 'all 0.2s', marginTop: '4px' }}>
                {loading ? (
                  <><div style={{ width: '22px', height: '22px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Connexion…</>
                ) : (
                  <>Se connecter <ArrowRight size={20} /></>
                )}
              </motion.button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', color: C.muted, fontSize: '1rem' }}>
            Pas encore de compte ?{' '}
            <span onClick={onInscription} style={{ color: C.primary, fontWeight: 700, cursor: 'pointer' }}>
              Créer un compte gratuit →
            </span>
          </p>
        </motion.div>
      </main>

      {forgotOpen && <ForgotModal onClose={() => setForgotOpen(false)} />}

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', height: '6px', zIndex: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
