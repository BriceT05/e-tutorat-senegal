import { useState } from 'react';
import api from './api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Star, MapPin, Clock, Users, Check,
  Heart, Share2, MessageCircle, Video, Home, Globe,
  GraduationCap, Award, ChevronRight, X, Calendar,
  CheckCircle2, AlertCircle, Briefcase,
} from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0', error: '#DC2626',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

// ─── Données enrichies d'un tuteur (depuis le backend) ───────────────────────
const buildTuteur = (t) => ({
  ...t,
  experience: t.experience || null,
  langues: t.langues || [],
  methodologie: t.methodologie || '',
  formations: t.formations || [],
  avis: t.avis || [],
  disponibilites: t.disponibilites || {
    Lundi: [false, false, false, false, false, false, false],
    Mardi: [false, false, false, false, false, false, false],
    Mercredi: [false, false, false, false, false, false, false],
    Jeudi: [false, false, false, false, false, false, false],
    Vendredi: [false, false, false, false, false, false, false],
    Samedi: [false, false, false, false, false, false, false],
    Dimanche: [false, false, false, false, false, false, false],
  },
  heures: ['08h–10h', '10h–12h', '12h–14h', '14h–16h', '16h–18h', '18h–20h', '20h–22h'],
  tauxReponse: t.tauxReponse || null,
  delaiReponse: t.delaiReponse || null,
  totalEleves: t.totalEleves || 0,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Stars = ({ n, size = 16 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(i => <Star key={i} size={size} fill={i <= Math.round(n) ? C.secondary : 'transparent'} color={i <= Math.round(n) ? C.secondary : C.border} />)}
  </div>
);

const Tab = ({ label, active, onClick, count }) => (
  <button onClick={onClick}
    style={{ padding: '14px 24px', background: 'none', border: 'none', borderBottom: `3px solid ${active ? C.primary : 'transparent'}`, color: active ? C.primary : C.light, fontWeight: active ? 700 : 500, fontSize: '1rem', cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
    {label}
    {count !== undefined && <span style={{ backgroundColor: active ? C.accent : '#F3F4F6', color: active ? C.primary : C.light, padding: '2px 8px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 700 }}>{count}</span>}
  </button>
);

// ─── MODAL DEMANDE DE SUIVI ───────────────────────────────────────────────────
const DUREES_SUIVI = ['1 mois', '2 mois', '3 mois', '6 mois ou plus'];
const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const JOURS_COURT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const PLAGES = [
  { label: 'Matin', detail: '8h – 12h' },
  { label: 'Après-midi', detail: '12h – 18h' },
  { label: 'Soir', detail: '18h – 22h' },
];

const ModalReservation = ({ tuteur, onClose, onConfirm }) => {
  const [step, setStep] = useState(1); // 1=suivi 2=planning 3=confirmation
  const [duree, setDuree] = useState('1 mois');
  const [matiere, setMatiere] = useState(tuteur.matieres[0]);
  const [mode, setMode] = useState(tuteur.mode === 'Les deux' ? 'En ligne' : tuteur.mode);
  const [jours, setJours] = useState([]);
  const [plages, setPlages] = useState([]);
  const [message, setMessage] = useState('');

  const toggleJour = j => setJours(p => p.includes(j) ? p.filter(x => x !== j) : [...p, j]);
  const togglePlage = p => setPlages(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(62,42,31,0.5)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.35, ease: 'backOut' }}
        style={{ backgroundColor: C.surface, borderRadius: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 32px 80px rgba(62,42,31,0.2)', position: 'relative' }}>

        {/* Header */}
        <div style={{ position: 'sticky', top: 0, backgroundColor: C.surface, zIndex: 10, padding: '24px 32px 0', borderBottom: `1px solid ${C.accent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: C.primary, marginBottom: '4px' }}>Demande de suivi</div>
              <h2 style={{ fontFamily: SERIF, fontSize: '1.6rem', color: C.text, margin: 0, fontWeight: 700 }}>{tuteur.prenom} {tuteur.nom}</h2>
            </div>
            <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={18} color={C.light} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px', paddingBottom: '16px' }}>
            {['Suivi', 'Planning', 'Confirmation'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step > i+1 ? C.primary : step === i+1 ? C.primary : C.accent, color: step >= i+1 ? '#fff' : C.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                  {step > i+1 ? <Check size={14} /> : i+1}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: step === i+1 ? 700 : 500, color: step >= i+1 ? C.primary : C.light, fontFamily: SANS }}>{s}</span>
                {i < 2 && <div style={{ flex: 1, height: '2px', backgroundColor: step > i+1 ? C.primary : C.border, marginLeft: '4px' }} />}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '24px 32px 32px', fontFamily: SANS }}>
          <AnimatePresence mode="wait">

            {/* Step 1 — Suivi */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                {/* Durée */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, display: 'block', marginBottom: '10px' }}>Durée souhaitée du suivi</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {DUREES_SUIVI.map(d => (
                      <motion.button key={d} onClick={() => setDuree(d)} whileTap={{ scale: 0.96 }}
                        style={{ padding: '14px', borderRadius: '14px', border: `2px solid ${duree === d ? C.primary : C.border}`, backgroundColor: duree === d ? C.accent : C.surface, color: duree === d ? C.primary : C.muted, fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {duree === d && <Check size={15} />} {d}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Matière */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, display: 'block', marginBottom: '10px' }}>Matière</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {tuteur.matieres.map(m => (
                      <motion.button key={m} onClick={() => setMatiere(m)} whileTap={{ scale: 0.95 }}
                        style={{ padding: '10px 18px', borderRadius: '100px', border: `2px solid ${matiere === m ? C.primary : C.border}`, backgroundColor: matiere === m ? C.accent : C.surface, color: matiere === m ? C.primary : C.muted, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
                        {matiere === m && <Check size={13} style={{ display: 'inline', marginRight: '5px' }} />}{m}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Mode */}
                {tuteur.mode === 'Les deux' && (
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, display: 'block', marginBottom: '10px' }}>Mode de cours</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {['En ligne', 'À domicile'].map(m => (
                        <motion.button key={m} onClick={() => setMode(m)} whileTap={{ scale: 0.95 }}
                          style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${mode === m ? C.primary : C.border}`, backgroundColor: mode === m ? C.accent : C.surface, color: mode === m ? C.primary : C.muted, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {m === 'En ligne' ? <Video size={16} /> : <Home size={16} />} {m}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.button onClick={() => setStep(2)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: '13px 28px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 8px 20px rgba(249,115,22,0.3)', fontFamily: SANS }}>
                    Continuer <ChevronRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Planning */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                <div style={{ backgroundColor: C.accent, borderRadius: '14px', padding: '14px 18px', fontSize: '0.9rem', color: C.muted, lineHeight: 1.5 }}>
                  Ces préférences seront transmises au tuteur. Vous discuterez ensemble du planning définitif après acceptation.
                </div>

                {/* Jours */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, display: 'block', marginBottom: '10px' }}>Jours préférés <span style={{ color: C.light, fontWeight: 400 }}>(plusieurs choix possibles)</span></label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {JOURS.map((j, i) => {
                      const active = jours.includes(j);
                      return (
                        <motion.button key={j} onClick={() => toggleJour(j)} whileTap={{ scale: 0.93 }}
                          style={{ padding: '10px 14px', borderRadius: '12px', border: `2px solid ${active ? C.primary : C.border}`, backgroundColor: active ? C.accent : C.surface, color: active ? C.primary : C.muted, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                          {JOURS_COURT[i]}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Plages horaires */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, display: 'block', marginBottom: '10px' }}>Horaires préférés <span style={{ color: C.light, fontWeight: 400 }}>(plusieurs choix possibles)</span></label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {PLAGES.map(p => {
                      const active = plages.includes(p.label);
                      return (
                        <motion.button key={p.label} onClick={() => togglePlage(p.label)} whileTap={{ scale: 0.98 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '14px', border: `2px solid ${active ? C.primary : C.border}`, backgroundColor: active ? C.accent : C.surface, cursor: 'pointer', textAlign: 'left' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: active ? C.primary : '#F3F4F6', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                            <Clock size={18} color={active ? '#fff' : C.light} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: active ? C.primary : C.text, fontSize: '0.95rem', fontFamily: SANS }}>{p.label}</div>
                            <div style={{ fontSize: '0.85rem', color: C.light, fontFamily: SANS }}>{p.detail}</div>
                          </div>
                          {active && <Check size={18} color={C.primary} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>← Retour</button>
                  <motion.button onClick={() => { if (jours.length > 0 && plages.length > 0) setStep(3); }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: '13px 28px', borderRadius: '100px', border: 'none', backgroundColor: jours.length > 0 && plages.length > 0 ? C.primary : C.border, color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: jours.length > 0 && plages.length > 0 ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: jours.length > 0 && plages.length > 0 ? '0 8px 20px rgba(249,115,22,0.3)' : 'none', fontFamily: SANS }}>
                    Vérifier <ChevronRight size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Confirmation */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div style={{ backgroundColor: C.accent, borderRadius: '20px', padding: '24px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: C.text, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color={C.primary} /> Récapitulatif de la demande
                  </div>
                  {[
                    { label: 'Tuteur', value: `${tuteur.prenom} ${tuteur.nom}` },
                    { label: 'Matière', value: matiere },
                    { label: 'Mode', value: mode },
                    { label: 'Durée souhaitée', value: duree },
                    { label: 'Jours préférés', value: jours.join(', ') },
                    { label: 'Horaires', value: plages.join(', ') },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid rgba(249,115,22,0.1)` }}>
                      <span style={{ color: C.muted, fontSize: '0.9rem', fontFamily: SANS }}>{label}</span>
                      <span style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem', fontFamily: SANS, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: C.text, display: 'block', marginBottom: '8px' }}>Message au tuteur <span style={{ color: C.light, fontWeight: 400 }}>(optionnel)</span></label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                    placeholder="Ex : Mon fils est en Terminale S, il a besoin d'aide en trigonométrie…"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '14px', border: `2px solid ${C.border}`, fontSize: '0.95rem', color: C.text, fontFamily: SANS, resize: 'vertical', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={{ backgroundColor: '#F0FDF4', borderRadius: '14px', padding: '14px 18px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color="#166534" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <p style={{ fontSize: '0.88rem', color: '#166534', margin: 0, lineHeight: 1.5, fontFamily: SANS }}>
                    Le tuteur recevra votre demande et vous contactera directement pour finaliser le planning et les modalités.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>← Retour</button>
                  <motion.button onClick={() => onConfirm({ matiere, mode, duree, jours, plages, message })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ padding: '14px 32px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1.05rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 28px rgba(249,115,22,0.35)', fontFamily: SANS }}>
                    <CheckCircle2 size={20} /> Envoyer la demande
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── TOAST SUCCESS ────────────────────────────────────────────────────────────
const Toast = ({ onClose }) => (
  <motion.div initial={{ opacity: 0, y: 60, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
    style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: C.text, color: '#FFFDF5', padding: '16px 28px', borderRadius: '100px', boxShadow: '0 20px 50px rgba(62,42,31,0.3)', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 300, fontFamily: SANS, whiteSpace: 'nowrap' }}>
    <CheckCircle2 size={22} color={C.secondary} />
    <span style={{ fontWeight: 700, fontSize: '1rem' }}>Demande envoyée ! Le tuteur va vous contacter pour fixer le planning. 🎉</span>
    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,253,245,0.5)', cursor: 'pointer', marginLeft: '4px', padding: '2px' }}><X size={16} /></button>
  </motion.div>
);

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function ProfilTuteurPage({ tuteurBase, onBack, onGoTuteurs, currentUser, onNeedAuth }) {
  const tuteur = buildTuteur(tuteurBase);
  const [tab, setTab] = useState('apropos');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState(false);
  const [fav, setFav] = useState(false);

  const handleConfirm = async (requestData) => {
    if (currentUser) {
      await api.post('/requests', {
        tuteurId: tuteur.id,
        matiere: requestData.matiere,
        niveau: requestData.niveau || null,
        jours: requestData.jours || [],
        duree: requestData.duree,
        mode: requestData.mode,
        message: requestData.message,
        tarif: tuteur.tarif,
      }).catch(() => {});
    }
    setModal(false);
    setToast(true);
    setTimeout(() => setToast(false), 5000);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,253,245,0.95)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.accent}`, padding: '0 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', height: '68px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontWeight: 600, fontSize: '0.95rem', flexShrink: 0 }}>
            <ArrowLeft size={18} /> Retour
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: C.primary, display: 'grid', placeItems: 'center' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 900, color: C.text }}>e-Tutorat <span style={{ color: C.primary }}>SN</span></span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <button onClick={() => setFav(f => !f)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '100px', border: `1.5px solid ${fav ? C.primary : C.border}`, backgroundColor: fav ? C.accent : 'transparent', color: fav ? C.primary : C.light, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
              <Heart size={16} fill={fav ? C.primary : 'transparent'} /> {fav ? 'Favori' : 'Ajouter'}
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '100px', border: `1.5px solid ${C.border}`, backgroundColor: 'transparent', color: C.light, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
              <Share2 size={16} /> Partager
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5% 100px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '40px', alignItems: 'start' }}>

        {/* ── COLONNE GAUCHE ── */}
        <div>
          {/* Hero card */}
          <div style={{ backgroundColor: C.surface, borderRadius: '28px', padding: '36px', border: `1px solid ${C.accent}`, boxShadow: '0 8px 32px rgba(62,42,31,0.07)', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }} />

            <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '28px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '52px', boxShadow: `0 8px 24px rgba(249,115,22,0.15)`, overflow: 'hidden' }}>
                  {tuteur.photo ? <img src={tuteur.photo} alt={tuteur.prenom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨🏾‍🏫'}
                </div>
                {tuteur.online && (
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#22C55E', border: '3px solid white', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: SERIF, fontSize: '2rem', color: C.text, margin: 0, fontWeight: 700 }}>{tuteur.prenom} {tuteur.nom}</h1>
                  {tuteur.badge && (
                    <span style={{ backgroundColor: C.accent, color: C.primary, padding: '4px 12px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700 }}>{tuteur.badge}</span>
                  )}
                  {tuteur.online && <span style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '4px 12px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700 }}>● En ligne</span>}
                </div>
                <div style={{ fontSize: '1.05rem', color: C.primary, fontWeight: 700, marginBottom: '8px' }}>{tuteur.matieres.join(' · ')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Stars n={tuteur.rating} />
                    <span style={{ fontWeight: 700, color: C.text }}>{tuteur.rating}</span>
                    <span style={{ color: C.light, fontSize: '0.9rem' }}>({tuteur.reviews} avis)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.light, fontSize: '0.9rem' }}>
                    <MapPin size={14} /> {tuteur.region}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.light, fontSize: '0.9rem' }}>
                    <GraduationCap size={14} /> {tuteur.diplome}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '28px', paddingTop: '24px', borderTop: `1px solid ${C.accent}` }}>
              {[
                { icon: Star,     value: tuteur.noteAvg   ? tuteur.noteAvg.toFixed(1) : '—',          label: 'Note moyenne' },
                { icon: Users,    value: tuteur.totalEleves ?? 0,                                        label: 'Élèves' },
                { icon: Award,    value: tuteur.tauxReponse ? `${tuteur.tauxReponse}%` : '—',           label: 'Taux réponse' },
                { icon: Clock,    value: tuteur.delaiReponse || '—',                                    label: 'Délai réponse' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} style={{ textAlign: 'center', padding: '16px', backgroundColor: C.accent, borderRadius: '16px' }}>
                  <Icon size={20} color={C.primary} style={{ marginBottom: '6px' }} />
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: C.text }}>{value}</div>
                  <div style={{ fontSize: '0.78rem', color: C.light, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ backgroundColor: C.surface, borderRadius: '28px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 20px rgba(62,42,31,0.05)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.accent}`, overflowX: 'auto', paddingLeft: '8px' }}>
              <Tab label="À propos" active={tab === 'apropos'} onClick={() => setTab('apropos')} />
              <Tab label="Avis" active={tab === 'avis'} onClick={() => setTab('avis')} count={tuteur.avis.length} />
              <Tab label="Disponibilités" active={tab === 'dispo'} onClick={() => setTab('dispo')} />
            </div>

            <div style={{ padding: '32px 36px' }}>
              <AnimatePresence mode="wait">

                {/* À propos */}
                {tab === 'apropos' && (
                  <motion.div key="apropos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {tuteur.bio ? (
                      <Section title="Bio">
                        <p style={{ fontSize: '1.05rem', color: C.muted, lineHeight: 1.75, margin: 0 }}>{tuteur.bio}</p>
                      </Section>
                    ) : null}
                    {tuteur.experience ? (
                      <Section title="Expérience">
                        <p style={{ fontSize: '1.05rem', color: C.muted, lineHeight: 1.75, margin: 0 }}>{tuteur.experience}</p>
                      </Section>
                    ) : null}
                    {tuteur.methodologie ? (
                      <Section title="Méthodologie">
                        <p style={{ fontSize: '1.05rem', color: C.muted, lineHeight: 1.75, margin: 0 }}>{tuteur.methodologie}</p>
                      </Section>
                    ) : null}
                    <Section title="Matières & niveaux">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {tuteur.matieres.map(m => <Tag key={m} primary>{m}</Tag>)}
                        {tuteur.niveaux.map(n => <Tag key={n}>{n}</Tag>)}
                      </div>
                    </Section>
                    {(tuteur.langues || []).length > 0 && (
                      <Section title="Langues d'enseignement">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {tuteur.langues.map(l => <Tag key={l}>{l}</Tag>)}
                        </div>
                      </Section>
                    )}
                    <Section title="Mode de cours">
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {tuteur.mode === 'En ligne' || tuteur.mode === 'Les deux' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#DBEAFE', padding: '10px 18px', borderRadius: '12px', color: '#1D4ED8', fontWeight: 600 }}>
                            <Video size={16} /> En ligne
                          </div>
                        ) : null}
                        {tuteur.mode === 'À domicile' || tuteur.mode === 'Les deux' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#DCFCE7', padding: '10px 18px', borderRadius: '12px', color: '#166534', fontWeight: 600 }}>
                            <Home size={16} /> À domicile
                          </div>
                        ) : null}
                      </div>
                    </Section>
                    {(tuteur.formations || []).length > 0 && (
                      <Section title="Formations" last>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {tuteur.formations.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                <GraduationCap size={18} color={C.primary} />
                              </div>
                              <span style={{ fontSize: '0.95rem', color: C.text, fontWeight: 600 }}>{f}</span>
                            </div>
                          ))}
                        </div>
                      </Section>
                    )}
                  </motion.div>
                )}

                {/* Avis */}
                {tab === 'avis' && (
                  <motion.div key="avis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {tuteur.avis.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '48px 20px', color: C.light, fontFamily: SANS }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⭐</div>
                        <p style={{ margin: 0, fontSize: '1rem' }}>Aucun avis pour le moment.</p>
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Les avis apparaîtront après les premières séances.</p>
                      </div>
                    ) : (
                      <>
                        {/* Résumé */}
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', backgroundColor: C.accent, borderRadius: '20px', padding: '24px 28px', marginBottom: '28px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: SERIF, fontSize: '4rem', fontWeight: 700, color: C.primary, lineHeight: 1 }}>{tuteur.rating}</div>
                            <Stars n={tuteur.rating} size={20} />
                            <div style={{ fontSize: '0.85rem', color: C.light, marginTop: '4px' }}>{tuteur.reviews} avis</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            {[5,4,3,2,1].map(n => {
                              const count = tuteur.avis.filter(a => a.note === n).length;
                              const pct = tuteur.avis.length > 0 ? Math.round((count / tuteur.avis.length) * 100) : 0;
                              return (
                                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '0.85rem', color: C.light, width: '12px', textAlign: 'right' }}>{n}</span>
                                  <Star size={12} fill={C.secondary} color={C.secondary} />
                                  <div style={{ flex: 1, height: '8px', borderRadius: '100px', backgroundColor: C.border, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, backgroundColor: C.secondary, borderRadius: '100px', transition: 'width 0.6s ease' }} />
                                  </div>
                                  <span style={{ fontSize: '0.82rem', color: C.light, width: '28px' }}>{pct}%</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {tuteur.avis.map((a, i) => (
                          <div key={i} style={{ padding: '24px 0', borderBottom: i < tuteur.avis.length - 1 ? `1px solid ${C.accent}` : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                                <div>
                                  <div style={{ fontWeight: 700, color: C.text }}>{a.auteur}</div>
                                  <div style={{ fontSize: '0.85rem', color: C.light }}>{a.role}</div>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <Stars n={a.note} />
                                <div style={{ fontSize: '0.82rem', color: C.light, marginTop: '2px' }}>{a.date}</div>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.98rem', color: C.muted, lineHeight: 1.7, margin: 0 }}>{a.texte}</p>
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}

                {/* Disponibilités */}
                {tab === 'dispo' && (
                  <motion.div key="dispo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {Object.values(tuteur.disponibilites).every(slots => slots.every(s => !s)) ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: C.light, fontFamily: SANS }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🗓️</div>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>Ce tuteur n'a pas encore renseigné ses disponibilités.</p>
                        <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Contactez-le directement pour convenir d'un créneau.</p>
                      </div>
                    ) : (
                    <>
                    <p style={{ color: C.muted, marginBottom: '24px', fontSize: '1rem' }}>Créneaux disponibles cette semaine. Cliquez sur <strong>Réserver une séance</strong> pour choisir votre date.</p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', minWidth: '500px' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '10px', fontSize: '0.8rem', color: C.light, textAlign: 'left', fontFamily: SANS, fontWeight: 600 }}>Heure</th>
                            {Object.keys(tuteur.disponibilites).map(j => (
                              <th key={j} style={{ padding: '10px', fontSize: '0.82rem', color: C.text, textAlign: 'center', fontFamily: SANS, fontWeight: 700 }}>{j.slice(0,3)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tuteur.heures.map((h, hi) => (
                            <tr key={h}>
                              <td style={{ padding: '8px 10px', fontSize: '0.8rem', color: C.light, whiteSpace: 'nowrap', fontFamily: SANS }}>{h}</td>
                              {Object.values(tuteur.disponibilites).map((slots, ji) => (
                                <td key={ji} style={{ padding: '4px' }}>
                                  <div style={{ height: '36px', borderRadius: '10px', backgroundColor: slots[hi] ? C.accent : '#F3F4F6', border: `1.5px solid ${slots[hi] ? 'rgba(249,115,22,0.3)' : '#E5E7EB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {slots[hi] && <Check size={14} color={C.primary} />}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: C.accent, border: `1.5px solid rgba(249,115,22,0.3)` }} />
                        <span style={{ fontSize: '0.85rem', color: C.muted, fontFamily: SANS }}>Disponible</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#F3F4F6', border: '1.5px solid #E5E7EB' }} />
                        <span style={{ fontSize: '0.85rem', color: C.muted, fontFamily: SANS }}>Indisponible</span>
                      </div>
                    </div>
                    </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR DROITE ── */}
        <div style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Booking card */}
          <div style={{ backgroundColor: C.surface, borderRadius: '24px', padding: '28px', border: `1px solid ${C.accent}`, boxShadow: '0 8px 32px rgba(62,42,31,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontWeight: 900, fontSize: '1.8rem', color: C.text }}>{tuteur.tarif.toLocaleString('fr-FR')}</span>
                <span style={{ fontSize: '0.9rem', color: C.light }}> FCFA / heure</span>
              </div>
              <div style={{ backgroundColor: '#F0FDF4', color: '#166534', padding: '6px 12px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 700 }}>
                Répond en {tuteur.delaiReponse}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {[
                { icon: Globe, text: tuteur.mode },
                { icon: MapPin, text: tuteur.region },
                { icon: GraduationCap, text: tuteur.diplome },
                { icon: Users, text: `${tuteur.totalEleves} élèves formés` },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: C.muted }}>
                  <Icon size={17} color={C.primary} style={{ flexShrink: 0 }} /> {text}
                </div>
              ))}
            </div>

            <motion.button onClick={() => { if (!currentUser) { onNeedAuth?.(); return; } setModal(true); }} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 28px rgba(249,115,22,0.35)', fontFamily: SANS }}>
              <Calendar size={20} /> Demander un suivi
            </motion.button>
          </div>

          {/* Trust */}
          <div style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '20px 22px', border: `1px solid ${C.accent}` }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.text, marginBottom: '14px' }}>Engagements e-Tutorat</div>
            {['Tuteur vérifié par notre équipe', 'Contact direct après acceptation', 'Planning flexible à discuter', 'Satisfaction garantie'].map(g => (
              <div key={g} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <Check size={15} color="#22C55E" />
                <span style={{ fontSize: '0.88rem', color: C.muted }}>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && <ModalReservation tuteur={tuteur} onClose={() => setModal(false)} onConfirm={handleConfirm} />}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast onClose={() => setToast(false)} />}
      </AnimatePresence>

      <div style={{ display: 'flex', height: '6px' }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>
    </div>
  );
}

// ─── Micro-composants internes ────────────────────────────────────────────────
const Section = ({ title, children, last }) => (
  <div style={{ marginBottom: last ? 0 : '28px', paddingBottom: last ? 0 : '28px', borderBottom: last ? 'none' : `1px solid ${C.accent}` }}>
    <h3 style={{ fontFamily: SERIF, fontSize: '1.2rem', color: C.text, margin: '0 0 14px', fontWeight: 700 }}>{title}</h3>
    {children}
  </div>
);

const Tag = ({ children, primary }) => (
  <span style={{ padding: '7px 14px', borderRadius: '100px', fontSize: '0.88rem', fontWeight: 600, backgroundColor: primary ? C.accent : '#F3F4F6', color: primary ? C.primary : C.muted, border: `1.5px solid ${primary ? 'rgba(249,115,22,0.3)' : '#E5E7EB'}` }}>
    {children}
  </span>
);
