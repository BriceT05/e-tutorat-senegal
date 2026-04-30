import { useState } from 'react';
import useIsMobile from './useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import api from './api';
import {
  BookOpen, ArrowRight, ArrowLeft, Check, Eye, EyeOff,
  GraduationCap, Users, User, Mail, Phone, Lock,
  MapPin, Star, FileText, ChevronDown, CheckCircle2,
} from 'lucide-react';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  primary: '#F97316',
  secondary: '#FBBF24',
  background: '#FFFDF5',
  surface: '#FFFFFF',
  accent: '#FEF3C7',
  text: '#3E2A1F',
  muted: '#524036',
  light: '#6B7280',
  border: '#E9D5A0',
  error: '#DC2626',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';

// ─── Data ─────────────────────────────────────────────────────────────────────
const REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Diourbel', 'Tambacounda', 'Kolda', 'Matam', 'Fatick', 'Kaffrine', 'Kédougou', 'Sédhiou'];
const NIVEAUX = ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale', 'Supérieur'];
const MATIERES = ['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'SVT', 'Histoire-Géo', 'Informatique', 'Arabe', 'Philosophie', 'Économie', 'Espagnol', 'LV2 Arabe'];
const DIPLOMES = ['BFEM', 'BAC', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GeoPatter = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23F97316' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    backgroundSize: '40px 40px',
  }} />
);

const Field = ({ label, required, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: SANS }}>
      {label} {required && <span style={{ color: C.primary }}>*</span>}
    </label>
    {children}
    {error && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600 }}>{error}</span>}
  </div>
);

const inputStyle = (hasError) => ({
  padding: '14px 18px',
  fontSize: '1.05rem',
  borderRadius: '14px',
  border: `2px solid ${hasError ? C.error : C.border}`,
  backgroundColor: C.surface,
  color: C.text,
  outline: 'none',
  fontFamily: SANS,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  width: '100%',
  boxSizing: 'border-box',
});

const InputField = ({ icon: Icon, label, required, type = 'text', value, onChange, placeholder, error, ...rest }) => (
  <Field label={label} required={required} error={error}>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }}>
          <Icon size={18} />
        </div>
      )}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...inputStyle(!!error), paddingLeft: Icon ? '46px' : '18px' }}
        onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
        onBlur={e => { e.target.style.borderColor = error ? C.error : C.border; e.target.style.boxShadow = 'none'; }}
        {...rest}
      />
    </div>
  </Field>
);

const SelectField = ({ icon: Icon, label, required, value, onChange, options, placeholder, error }) => (
  <Field label={label} required={required} error={error}>
    <div style={{ position: 'relative' }}>
      {Icon && <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none', zIndex: 1 }}><Icon size={18} /></div>}
      <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
      <select value={value} onChange={onChange}
        style={{ ...inputStyle(!!error), paddingLeft: Icon ? '46px' : '18px', paddingRight: '40px', appearance: 'none', cursor: 'pointer', backgroundColor: C.surface }}
        onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
        onBlur={e => { e.target.style.borderColor = error ? C.error : C.border; e.target.style.boxShadow = 'none'; }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  </Field>
);

const MatieresGrid = ({ selected, toggle }) => {
  const isMobile = useIsMobile();
  return (
  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '10px' }}>
    {MATIERES.map(m => {
      const active = selected.includes(m);
      return (
        <motion.button key={m} onClick={() => toggle(m)} whileTap={{ scale: 0.96 }} type="button"
          style={{
            padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600,
            cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', fontFamily: SANS,
            backgroundColor: active ? C.accent : C.surface,
            border: `2px solid ${active ? C.primary : C.border}`,
            color: active ? C.primary : C.muted,
          }}>
          {active && <Check size={12} style={{ display: 'inline', marginRight: '5px' }} />}
          {m}
        </motion.button>
      );
    })}
  </div>
  );
};

const PasswordInput = ({ label, required, value, onChange, error, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required={required} error={error}>
      <div style={{ position: 'relative' }}>
        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder || '••••••••'}
          style={{ ...inputStyle(!!error), paddingLeft: '46px', paddingRight: '46px' }}
          onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
          onBlur={e => { e.target.style.borderColor = error ? C.error : C.border; e.target.style.boxShadow = 'none'; }} />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '4px' }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
};

// ─── Stepper ──────────────────────────────────────────────────────────────────
const STEPS_LABELS = ['Profil', 'Infos personnelles', 'Détails', 'Confirmation'];

const Stepper = ({ step }) => {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '36px' }}>
      {STEPS_LABELS.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: isMobile ? '36px' : '44px', height: isMobile ? '36px' : '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: isMobile ? '0.85rem' : '1rem', fontFamily: SANS, transition: 'all 0.3s',
                backgroundColor: done || active ? C.primary : C.accent,
                color: done || active ? '#fff' : C.light,
                boxShadow: active ? `0 8px 20px rgba(249,115,22,0.35)` : 'none',
                border: `3px solid ${done || active ? C.primary : C.border}`,
              }}>
                {done ? <Check size={isMobile ? 16 : 20} /> : idx}
              </div>
              {!isMobile && <span style={{ fontSize: '0.78rem', fontWeight: active ? 700 : 500, color: active ? C.primary : C.light, fontFamily: SANS, whiteSpace: 'nowrap' }}>{label}</span>}
            </div>
            {i < STEPS_LABELS.length - 1 && (
              <div style={{ width: isMobile ? '40px' : '80px', height: '2px', backgroundColor: step > idx ? C.primary : C.border, margin: isMobile ? '0 2px' : '0 4px', marginBottom: isMobile ? 0 : '26px', transition: 'background-color 0.3s' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── ÉTAPE 1 — Choix du profil ───────────────────────────────────────────────
const Step1 = ({ role, setRole }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h2 style={{ fontFamily: SERIF, fontSize: '2.4rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>
        Qui êtes-<span style={{ color: C.primary, fontStyle: 'italic' }}>vous ?</span>
      </h2>
      <p style={{ fontSize: '1.1rem', color: C.muted, fontFamily: SANS }}>Choisissez votre profil pour personnaliser votre expérience.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '600px', margin: '0 auto' }}>
      {[
        { id: 'eleve', emoji: '🎓', title: 'Élève / Parent', desc: "Je cherche un tuteur pour moi ou mon enfant. Du CI à la Terminale.", color: '#DBEAFE', accent: '#2563EB' },
        { id: 'tuteur', emoji: '👨🏾‍🏫', title: 'Tuteur', desc: "Je veux enseigner et accompagner des élèves sénégalais.", color: C.accent, accent: C.primary },
      ].map(({ id, emoji, title, desc, color, accent }) => {
        const active = role === id;
        return (
          <motion.div key={id} onClick={() => setRole(id)} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}
            style={{
              padding: '36px 28px', borderRadius: '24px', cursor: 'pointer', textAlign: 'center',
              border: `3px solid ${active ? accent : C.border}`,
              backgroundColor: active ? color : C.surface,
              boxShadow: active ? `0 12px 32px rgba(249,115,22,0.15)` : '0 4px 16px rgba(62,42,31,0.05)',
              transition: 'all 0.25s', position: 'relative',
            }}>
            {active && (
              <div style={{ position: 'absolute', top: '14px', right: '14px', width: '26px', height: '26px', borderRadius: '50%', backgroundColor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={15} color="#fff" />
              </div>
            )}
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>{emoji}</div>
            <h3 style={{ fontFamily: SERIF, fontSize: '1.4rem', color: C.text, margin: '0 0 10px', fontWeight: 700 }}>{title}</h3>
            <p style={{ fontSize: '0.95rem', color: C.muted, lineHeight: 1.55, margin: 0, fontFamily: SANS }}>{desc}</p>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

// ─── ÉTAPE 2 — Infos personnelles ────────────────────────────────────────────
const Step2 = ({ data, set, errors }) => {
  const isMobile = useIsMobile();
  return (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
      <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? '1.8rem' : '2.2rem', color: C.text, margin: '0 0 10px', fontWeight: 700 }}>
        Vos <span style={{ color: C.primary, fontStyle: 'italic' }}>informations</span>
      </h2>
      <p style={{ fontSize: '1.05rem', color: C.muted, fontFamily: SANS }}>Ces informations restent confidentielles.</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
      <InputField icon={User} label="Prénom" required value={data.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Moussa" error={errors.prenom} />
      <InputField icon={User} label="Nom de famille" required value={data.nom} onChange={e => set('nom', e.target.value)} placeholder="Diallo" error={errors.nom} />
      <InputField icon={Mail} label="Adresse email" required type="email" value={data.email} onChange={e => set('email', e.target.value)} placeholder="moussa@email.com" error={errors.email} />
      <InputField icon={Phone} label="Téléphone" required value={data.tel} onChange={e => set('tel', e.target.value)} placeholder="+221 77 000 00 00" error={errors.tel} />
      <div style={{ gridColumn: '1 / -1' }}>
        <PasswordField label="Mot de passe" required value={data.password} onChange={e => set('password', e.target.value)} error={errors.password} />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <PasswordField label="Confirmer le mot de passe" required value={data.confirm} onChange={e => set('confirm', e.target.value)} error={errors.confirm} placeholder="Répétez votre mot de passe" />
      </div>
    </div>

    {/* Password strength */}
    {data.password && (
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
          {[1, 2, 3, 4].map(i => {
            const strength = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(data.password)).length;
            return <div key={i} style={{ flex: 1, height: '4px', borderRadius: '99px', backgroundColor: strength >= i ? (strength <= 2 ? '#EF4444' : strength === 3 ? C.secondary : '#22C55E') : C.border, transition: 'background-color 0.3s' }} />;
          })}
        </div>
        <span style={{ fontSize: '0.82rem', color: C.light, fontFamily: SANS }}>Force du mot de passe</span>
      </div>
    )}
  </motion.div>
  );
};

// sub-component to avoid duplicate declaration
const PasswordField = ({ label, required, value, onChange, error, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} required={required} error={error}>
      <div style={{ position: 'relative' }}>
        <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: C.light, pointerEvents: 'none' }} />
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder || '••••••••'}
          style={{ ...inputStyle(!!error), paddingLeft: '46px', paddingRight: '46px' }}
          onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
          onBlur={e => { e.target.style.borderColor = error ? C.error : C.border; e.target.style.boxShadow = 'none'; }} />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '4px' }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
};

// ─── ÉTAPE 3A — Profil Élève / Parent ────────────────────────────────────────
const Step3Eleve = ({ data, set, errors }) => {
  const isMobile = useIsMobile();
  const toggle = (m) => {
    const cur = data.matieres || [];
    set('matieres', cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? '1.8rem' : '2.2rem', color: C.text, margin: '0 0 10px', fontWeight: 700 }}>
          Votre <span style={{ color: C.primary, fontStyle: 'italic' }}>profil élève</span>
        </h2>
        <p style={{ fontSize: '1.05rem', color: C.muted, fontFamily: SANS }}>Ces informations nous aident à vous proposer les meilleurs tuteurs.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
          <SelectField icon={GraduationCap} label="Niveau scolaire" required value={data.niveau || ''} onChange={e => set('niveau', e.target.value)} options={NIVEAUX} placeholder="Choisir un niveau" error={errors.niveau} />
          <SelectField icon={MapPin} label="Région" required value={data.region || ''} onChange={e => set('region', e.target.value)} options={REGIONS} placeholder="Votre région" error={errors.region} />
        </div>

        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: SANS, marginBottom: '10px', display: 'block' }}>
            Matières souhaitées <span style={{ color: C.primary }}>*</span>
            {data.matieres?.length > 0 && <span style={{ color: C.primary, fontWeight: 800, marginLeft: '8px' }}>({data.matieres.length} choisie{data.matieres.length > 1 ? 's' : ''})</span>}
          </label>
          <MatieresGrid selected={data.matieres || []} toggle={toggle} />
          {errors.matieres && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '6px', display: 'block' }}>{errors.matieres}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
          <SelectField icon={Users} label="Type de cours" value={data.typeCours || ''} onChange={e => set('typeCours', e.target.value)} options={['En ligne', 'À domicile', 'Les deux']} placeholder="Préférence" />
          <SelectField label="Budget mensuel" value={data.budget || ''} onChange={e => set('budget', e.target.value)} options={['Moins de 20 000 FCFA', '20 000 – 50 000 FCFA', '50 000 – 100 000 FCFA', 'Plus de 100 000 FCFA']} placeholder="Votre budget" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── ÉTAPE 3B — Profil Tuteur ─────────────────────────────────────────────────
const Step3Tuteur = ({ data, set, errors }) => {
  const isMobile = useIsMobile();
  const toggleMatiere = (m) => {
    const cur = data.matieres || [];
    set('matieres', cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m]);
  };
  const toggleNiveau = (n) => {
    const cur = data.niveaux || [];
    set('niveaux', cur.includes(n) ? cur.filter(x => x !== n) : [...cur, n]);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: isMobile ? '1.8rem' : '2.2rem', color: C.text, margin: '0 0 10px', fontWeight: 700 }}>
          Votre <span style={{ color: C.primary, fontStyle: 'italic' }}>profil tuteur</span>
        </h2>
        <p style={{ fontSize: '1.05rem', color: C.muted, fontFamily: SANS }}>Présentez vos compétences pour attirer les meilleurs élèves.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
          <SelectField icon={FileText} label="Diplôme le plus élevé" required value={data.diplome || ''} onChange={e => set('diplome', e.target.value)} options={DIPLOMES} placeholder="Votre diplôme" error={errors.diplome} />
          <SelectField icon={MapPin} label="Région" required value={data.region || ''} onChange={e => set('region', e.target.value)} options={REGIONS} placeholder="Votre région" error={errors.region} />
        </div>

        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: SANS, marginBottom: '10px', display: 'block' }}>
            Matières enseignées <span style={{ color: C.primary }}>*</span>
            {data.matieres?.length > 0 && <span style={{ color: C.primary, fontWeight: 800, marginLeft: '8px' }}>({data.matieres.length} choisie{data.matieres.length > 1 ? 's' : ''})</span>}
          </label>
          <MatieresGrid selected={data.matieres || []} toggle={toggleMatiere} />
          {errors.matieres && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '6px', display: 'block' }}>{errors.matieres}</span>}
        </div>

        <div>
          <label style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: SANS, marginBottom: '10px', display: 'block' }}>
            Niveaux enseignés <span style={{ color: C.primary }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['Primaire (CI–CM2)', 'Collège (6ème–3ème)', 'Lycée (2nde–Tle)', 'Supérieur'].map(n => {
              const active = (data.niveaux || []).includes(n);
              return (
                <motion.button key={n} type="button" onClick={() => toggleNiveau(n)} whileTap={{ scale: 0.96 }}
                  style={{ padding: '10px 18px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS, transition: 'all 0.2s', backgroundColor: active ? C.accent : C.surface, border: `2px solid ${active ? C.primary : C.border}`, color: active ? C.primary : C.muted }}>
                  {active && <Check size={12} style={{ display: 'inline', marginRight: '5px' }} />}{n}
                </motion.button>
              );
            })}
          </div>
          {errors.niveaux && <span style={{ fontSize: '0.82rem', color: C.error, fontWeight: 600, marginTop: '6px', display: 'block' }}>{errors.niveaux}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
          <InputField icon={Star} label="Tarif horaire (FCFA)" value={data.tarif || ''} onChange={e => set('tarif', e.target.value)} placeholder="ex: 5000" type="number" />
          <SelectField label="Mode de cours" value={data.modeCours || ''} onChange={e => set('modeCours', e.target.value)} options={['En ligne', 'À domicile', 'Les deux']} placeholder="Mode préféré" />
        </div>

        <Field label="Bio (présentation courte)">
          <textarea value={data.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Ex : Professeur certifié avec 5 ans d'expérience, spécialisé en Terminale S..."
            style={{ ...inputStyle(false), resize: 'vertical', lineHeight: 1.6 }}
            onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.boxShadow = `0 0 0 3px rgba(249,115,22,0.12)`; }}
            onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }} />
        </Field>
      </div>
    </motion.div>
  );
};

// ─── ÉTAPE 4 — Succès ─────────────────────────────────────────────────────────
const StepSuccess = ({ role, prenom, onGoHome, onSuccess }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: 'backOut' }}
    style={{ textAlign: 'center', padding: '20px 0' }}>
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, duration: 0.5, ease: 'backOut' }}
      style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: `0 16px 40px rgba(249,115,22,0.25)` }}>
      <CheckCircle2 size={56} color={C.primary} />
    </motion.div>

    <h2 style={{ fontFamily: SERIF, fontSize: '2.5rem', color: C.text, margin: '0 0 16px', fontWeight: 700 }}>
      Bienvenue, <span style={{ color: C.primary, fontStyle: 'italic' }}>{prenom} !</span>
    </h2>
    <p style={{ fontSize: '1.15rem', color: C.muted, lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 40px', fontFamily: SANS }}>
      {role === 'tuteur'
        ? "Votre profil tuteur est en cours de validation. Nous vous contacterons dans les 24h. Merci de rejoindre la famille e-Tutorat 🇸🇳"
        : "Votre compte est créé ! Vous pouvez maintenant rechercher des tuteurs et commencer vos séances d'apprentissage."
      }
    </p>

    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <motion.button whileHover={{ scale: 1.03, y: -2 }} onClick={onSuccess}
        style={{ padding: '1.1rem 2.4rem', borderRadius: '999px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px rgba(249,115,22,0.35)', fontFamily: SANS }}>
        {role === 'tuteur' ? 'Accéder à mon dashboard' : 'Trouver un tuteur'} <ArrowRight size={20} />
      </motion.button>
      <motion.button whileHover={{ scale: 1.03, y: -2 }} onClick={onGoHome}
        style={{ padding: '1.1rem 2.4rem', borderRadius: '999px', border: `2px solid ${C.primary}`, backgroundColor: 'transparent', color: C.primary, fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
        Retour à l'accueil
      </motion.button>
    </div>

    {/* Confetti dots */}
    {['#F97316', '#FBBF24', '#F97316', '#FBBF24', '#F97316'].map((color, i) => (
      <motion.div key={i}
        initial={{ y: 0, x: 0, opacity: 1 }}
        animate={{ y: [-20, -80 - i * 20], x: [(i - 2) * 40], opacity: [1, 1, 0] }}
        transition={{ delay: 0.3 + i * 0.08, duration: 1.2, ease: 'easeOut' }}
        style={{ position: 'absolute', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, top: '30%', left: `${30 + i * 10}%`, pointerEvents: 'none' }}
      />
    ))}
  </motion.div>
);

// ─── VALIDATION ───────────────────────────────────────────────────────────────
const validate = (step, role, info, profile) => {
  const errs = {};
  if (step === 2) {
    if (!info.prenom.trim()) errs.prenom = 'Le prénom est requis';
    if (!info.nom.trim()) errs.nom = 'Le nom est requis';
    if (!info.email.trim() || !/\S+@\S+\.\S+/.test(info.email)) errs.email = 'Email invalide';
    if (!info.tel.trim()) errs.tel = 'Le téléphone est requis';
    if (!info.password || info.password.length < 8) errs.password = 'Minimum 8 caractères';
    if (info.password !== info.confirm) errs.confirm = 'Les mots de passe ne correspondent pas';
  }
  if (step === 3) {
    if (role === 'eleve') {
      if (!profile.niveau) errs.niveau = 'Choisissez un niveau';
      if (!profile.region) errs.region = 'Choisissez une région';
      if (!profile.matieres?.length) errs.matieres = 'Choisissez au moins une matière';
    } else {
      if (!profile.diplome) errs.diplome = 'Choisissez un diplôme';
      if (!profile.region) errs.region = 'Choisissez une région';
      if (!profile.matieres?.length) errs.matieres = 'Choisissez au moins une matière';
      if (!profile.niveaux?.length) errs.niveaux = 'Choisissez au moins un niveau';
    }
  }
  return errs;
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function InscriptionPage({ onGoHome, onSuccess, onGoConnexion }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [info, setInfo] = useState({ prenom: '', nom: '', email: '', tel: '', password: '', confirm: '' });
  const [profile, setProfile] = useState({});
  const [errors, setErrors] = useState({});
  const [savedUser, setSavedUser] = useState(null);
  const [savedToken, setSavedToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const setI = (k, v) => { setInfo(p => ({ ...p, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };
  const setP = (k, v) => { setProfile(p => ({ ...p, [k]: v })); setErrors(e => ({ ...e, [k]: undefined })); };

  const next = async () => {
    if (step === 1 && !role) return;
    const errs = validate(step, role, info, profile);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (step === 3) {
      setLoading(true);
      setSubmitError(null);
      try {
        const body = {
          prenom: info.prenom, nom: info.nom, email: info.email,
          password: info.password, role, tel: info.tel,
          ...(role === 'eleve'
            ? { niveau: profile.niveau, region: profile.region, matieres: profile.matieres || [], typeCours: profile.typeCours, budget: profile.budget }
            : { region: profile.region, diplome: profile.diplome, matieres: profile.matieres || [], niveaux: profile.niveaux || [], tarif: profile.tarif ? Number(profile.tarif) : undefined, modeCours: profile.modeCours, bio: profile.bio }
          ),
        };
        const data = await api.post('/auth/register', body);
        if (data.error) {
          setSubmitError(data.error);
          return;
        }
        setSavedUser(data.user);
        setSavedToken(data.token);
      } catch {
        setSubmitError('Erreur de connexion au serveur. Réessayez.');
        return;
      } finally {
        setLoading(false);
      }
    }

    setErrors({});
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  const canNext = step === 1 ? !!role : true;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, fontFamily: SANS, position: 'relative', overflow: 'hidden' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>
      <GeoPatter />

      {/* Gold glow */}
      <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, padding: '24px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.accent}`, backgroundColor: 'rgba(255,253,245,0.8)', backdropFilter: 'blur(12px)' }}>
        <button onClick={onGoHome} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: isMobile ? '0.85rem' : '1rem', fontWeight: 600, fontFamily: SANS }}>
          <ArrowLeft size={18} /> {!isMobile && 'Retour à l\'accueil'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: C.primary, display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>e-Tutorat</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', color: C.primary, textTransform: 'uppercase' }}>Sénégal 🇸🇳</div>
          </div>
        </div>

        <div style={{ fontSize: isMobile ? '0.82rem' : '0.95rem', color: C.light, fontFamily: SANS }}>
          {!isMobile && 'Déjà inscrit ? '}
          <span style={{ color: C.primary, fontWeight: 700, cursor: 'pointer' }} onClick={onGoConnexion}>{isMobile ? 'Connexion' : 'Se connecter'}</span>
        </div>
      </header>

      {/* Main content */}
      <main style={{ position: 'relative', zIndex: 5, maxWidth: '780px', margin: '0 auto', padding: isMobile ? '28px 16px 100px' : '60px 24px 100px' }}>

        {step < 4 && <Stepper step={step} />}

        <div style={{ backgroundColor: step < 4 ? C.surface : 'transparent', borderRadius: isMobile ? '20px' : '32px', padding: step < 4 ? (isMobile ? '28px 20px' : '52px 56px') : '0', boxShadow: step < 4 ? '0 8px 48px rgba(62,42,31,0.08)' : 'none', border: step < 4 ? `1px solid ${C.accent}` : 'none', position: 'relative', overflow: 'hidden' }}>
          {step < 4 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }} />}

          <AnimatePresence mode="wait">
            {step === 1 && <Step1 key="s1" role={role} setRole={setRole} />}
            {step === 2 && <Step2 key="s2" data={info} set={setI} errors={errors} />}
            {step === 3 && role === 'eleve' && <Step3Eleve key="s3e" data={profile} set={setP} errors={errors} />}
            {step === 3 && role === 'tuteur' && <Step3Tuteur key="s3t" data={profile} set={setP} errors={errors} />}
            {step === 4 && <StepSuccess key="s4" role={role} prenom={info.prenom} onGoHome={onGoHome} onSuccess={() => onSuccess?.(savedToken, savedUser)} />}
          </AnimatePresence>

          {/* Navigation buttons */}
          {step < 4 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '44px', paddingTop: '28px', borderTop: `1px solid ${C.accent}` }}>
              <button onClick={back} disabled={step === 1}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '100px', border: `2px solid ${step === 1 ? C.border : C.primary}`, backgroundColor: 'transparent', color: step === 1 ? C.light : C.primary, fontSize: '1rem', fontWeight: 700, cursor: step === 1 ? 'default' : 'pointer', fontFamily: SANS, opacity: step === 1 ? 0.4 : 1 }}>
                <ArrowLeft size={18} /> Précédent
              </button>

              <div style={{ fontSize: '0.9rem', color: C.light, fontFamily: SANS }}>Étape {step} sur 3</div>

              <motion.button onClick={next} disabled={loading} whileHover={canNext && !loading ? { scale: 1.03, y: -2 } : {}} whileTap={canNext && !loading ? { scale: 0.97 } : {}}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 32px', borderRadius: '100px', border: 'none', backgroundColor: canNext && !loading ? C.primary : C.border, color: '#fff', fontSize: '1.05rem', fontWeight: 700, cursor: canNext && !loading ? 'pointer' : 'default', boxShadow: canNext && !loading ? '0 10px 25px rgba(249,115,22,0.35)' : 'none', fontFamily: SANS, transition: 'all 0.2s' }}>
                {step === 3 && loading
                  ? <><div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Création…</>
                  : <>{step === 3 ? 'Créer mon compte' : 'Continuer'} <ArrowRight size={20} /></>
                }
              </motion.button>
            </div>
          )}
        </div>

        {/* Trust badges */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
            {['🔒 100% sécurisé', '✅ Inscription gratuite', '🇸🇳 Données hébergées au Sénégal'].map(b => (
              <span key={b} style={{ fontSize: '0.9rem', color: C.light, fontFamily: SANS, fontWeight: 500 }}>{b}</span>
            ))}
          </div>
        )}
      </main>

      {/* Bottom stripe */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', display: 'flex', height: '6px', zIndex: 20 }}>
        <div style={{ flex: 1, backgroundColor: '#00853F' }} />
        <div style={{ flex: 1, backgroundColor: '#FDEF42' }} />
        <div style={{ flex: 1, backgroundColor: '#E31B23' }} />
      </div>
    </div>
  );
}
