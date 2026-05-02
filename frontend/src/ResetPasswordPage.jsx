import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from './api';
import useIsMobile from './useIsMobile';

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

const focus = e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; };
const blur = (hasErr, errColor) => e => { e.target.style.borderColor = hasErr ? errColor : C.border; e.target.style.boxShadow = 'none'; };

export default function ResetPasswordPage({ token, onGoHome, onGoConnexion }) {
  const isMobile = useIsMobile();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');

  const strength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strengthLabel = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColor = ['#DC2626', '#F59E0B', '#FBBF24', '#10B981', '#059669'];
  const s = strength(password);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (password.length < 8) errs.password = 'Minimum 8 caractères';
    if (password !== confirm) errs.confirm = 'Les mots de passe ne correspondent pas';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      const data = await api.post('/auth/reset-password', { token, password });
      if (data.error) {
        setServerError(data.error);
      } else {
        setDone(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      setServerError('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '30vw', height: '30vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <header style={{ padding: '24px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
        <button onClick={onGoHome} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: '1rem', fontWeight: 600, fontFamily: SANS }}>
          <ArrowLeft size={20} /> Accueil
        </button>
        <img src="/logo.png" alt="e-Tutorat" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
        <div style={{ width: 120 }} />
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px 80px', position: 'relative', zIndex: 5 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '480px' }}>

          <div style={{ backgroundColor: C.surface, borderRadius: isMobile ? '20px' : '32px', padding: isMobile ? '32px 20px' : '52px 48px', boxShadow: '0 8px 48px rgba(62,42,31,0.08)', border: `1px solid ${C.accent}`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }} />

            {done ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={36} color="#10B981" />
                </div>
                <h2 style={{ fontFamily: SERIF, fontSize: '1.8rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>Mot de passe mis à jour !</h2>
                <p style={{ color: C.muted, fontSize: '1rem', lineHeight: 1.6, margin: '0 0 32px' }}>
                  Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <motion.button onClick={onGoConnexion} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  style={{ padding: '16px 40px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', fontFamily: SANS, boxShadow: '0 10px 25px rgba(249,115,22,0.35)' }}>
                  Se connecter →
                </motion.button>
              </motion.div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(249,115,22,0.18)' }}>
                    <Lock size={32} color={C.primary} />
                  </div>
                  <h1 style={{ fontFamily: SERIF, fontSize: '2rem', color: C.text, margin: '0 0 8px', fontWeight: 700 }}>
                    Nouveau mot de passe
                  </h1>
                  <p style={{ color: C.muted, fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>
                    Choisissez un mot de passe sécurisé pour votre compte.
                  </p>
                </div>

                {serverError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', marginBottom: '20px' }}>
                    <AlertCircle size={18} color={C.error} />
                    <span style={{ color: C.error, fontSize: '0.95rem', fontWeight: 600 }}>{serverError}</span>
                  </div>
                )}

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, display: 'block', marginBottom: '6px' }}>
                      Nouveau mot de passe <span style={{ color: C.primary }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
                      <input type={showP ? 'text' : 'password'} value={password}
                        onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                        placeholder="••••••••" style={{ ...inputStyle(errors.password), paddingRight: '46px' }}
                        onFocus={focus} onBlur={blur(errors.password, C.error)} />
                      <button type="button" onClick={() => setShowP(s => !s)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '4px' }}>
                        {showP ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '4px', backgroundColor: i < s ? strengthColor[s] : '#E9D5A0', transition: 'background-color 0.3s' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: strengthColor[s], fontWeight: 600 }}>{strengthLabel[s]}</span>
                      </div>
                    )}
                    {errors.password && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '4px', display: 'block' }}>{errors.password}</span>}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, display: 'block', marginBottom: '6px' }}>
                      Confirmer le mot de passe <span style={{ color: C.primary }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
                      <input type={showC ? 'text' : 'password'} value={confirm}
                        onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
                        placeholder="••••••••" style={{ ...inputStyle(errors.confirm), paddingRight: '46px' }}
                        onFocus={focus} onBlur={blur(errors.confirm, C.error)} />
                      <button type="button" onClick={() => setShowC(s => !s)}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '4px' }}>
                        {showC ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirm && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '4px', display: 'block' }}>{errors.confirm}</span>}
                  </div>

                  <motion.button type="submit" whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    style={{ padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: loading ? C.border : C.primary, color: '#fff', fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: loading ? 'none' : '0 10px 25px rgba(249,115,22,0.35)', fontFamily: SANS, transition: 'all 0.2s', marginTop: '4px' }}>
                    {loading ? (
                      <><div style={{ width: '22px', height: '22px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Réinitialisation…</>
                    ) : (
                      'Réinitialiser mon mot de passe'
                    )}
                  </motion.button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', height: '6px', zIndex: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>
    </div>
  );
}
