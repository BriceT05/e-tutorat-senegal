import { useState, useRef, useEffect, useCallback } from 'react';
import api from './api.js';
import useIsMobile from './useIsMobile';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Clock, Star, Users, Bell,
  Check, X, Video, Settings, LogOut, Home,
  Award, GraduationCap, Wallet, Plus, CheckCircle2,
  Phone, Mail, Copy, UserCheck, Camera,
  MessageSquare, Send, Search,
} from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0',
};
const SERIF = '"Playfair Display", serif';
const SANS = '"Inter", sans-serif';


// ─── Helpers ──────────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const map = {
    CONFIRMEE: { bg: '#DCFCE7', color: '#166534', label: '✓ Confirmée' },
    EN_ATTENTE: { bg: '#FEF3C7', color: '#B45309', label: '⏳ En attente' },
    REFUSEE: { bg: '#FEE2E2', color: '#991B1B', label: '✕ Refusée' },
  };
  const s = map[status] || map['EN_ATTENTE'];
  return <span style={{ backgroundColor: s.bg, color: s.color, padding: '3px 10px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700 }}>{s.label}</span>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '24px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 16px rgba(62,42,31,0.05)', ...style }}>
    {children}
  </div>
);

const CardTitle = ({ children, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
    <h3 style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.text, margin: 0, fontWeight: 700 }}>{children}</h3>
    {action}
  </div>
);

const StatCard = ({ icon: Icon, value, label, color = C.primary }) => {
  const isMobile = useIsMobile();
  return (
    <Card style={{ padding: isMobile ? '14px' : '24px' }}>
      <div style={{ width: isMobile ? '34px' : '48px', height: isMobile ? '34px' : '48px', borderRadius: '12px', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '8px' : '16px' }}>
        <Icon size={isMobile ? 17 : 24} color={color} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: C.light, marginTop: '4px', fontWeight: 600, lineHeight: 1.3 }}>{label}</div>
    </Card>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <motion.button onClick={onClick} whileHover={{ x: 3 }}
    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '14px', border: 'none', backgroundColor: active ? C.accent : 'transparent', color: active ? C.primary : C.muted, cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: SANS, fontWeight: active ? 700 : 500, fontSize: '0.95rem', transition: 'all 0.2s' }}>
    <Icon size={20} />
    {label}
    {badge > 0 && <span style={{ marginLeft: 'auto', backgroundColor: C.primary, color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>{badge}</span>}
  </motion.button>
);

const UserAvatar = ({ user, size = 100, radius = '28px' }) => (
  <div style={{ width: size, height: size, borderRadius: radius, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent, flexShrink: 0 }}>
    {user?.photo
      ? <img src={user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
      : <span style={{ fontSize: size * 0.45 }}>{(user?.role === 'tuteur' || user?.role === 'TUTEUR') ? '👨🏾‍🏫' : '🎓'}</span>
    }
  </div>
);

// ─── Contact Modal ────────────────────────────────────────────────────────────
const ContactModal = ({ data, onClose }) => {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  const rows = [
    { icon: Phone, label: 'Téléphone', value: data.telephone, key: 'tel' },
    { icon: Phone, label: 'WhatsApp', value: data.whatsapp, key: 'wa' },
    { icon: Mail, label: 'Email', value: data.email, key: 'email' },
  ];
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(62,42,31,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          onClick={e => e.stopPropagation()}
          style={{ backgroundColor: C.surface, borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(62,42,31,0.18)', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', cursor: 'pointer', color: C.light, padding: '6px' }}><X size={20} /></button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: '#DCFCE7', display: 'grid', placeItems: 'center' }}>
              <UserCheck size={28} color="#166534" />
            </div>
            <h2 style={{ fontFamily: SERIF, fontSize: '1.4rem', color: C.text, margin: 0, fontWeight: 700, textAlign: 'center' }}>{data.titre}</h2>
            <p style={{ color: C.muted, fontSize: '0.92rem', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>{data.sousTitre}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rows.map(r => (
              <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', backgroundColor: C.background, border: `1px solid ${C.accent}` }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <r.icon size={18} color={C.primary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', color: C.light, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: C.text }}>{r.value}</div>
                </div>
                <button onClick={() => copy(r.value, r.key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === r.key ? '#22C55E' : C.light, padding: '6px', borderRadius: '8px' }}>
                  {copied === r.key ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
          <button onClick={onClose}
            style={{ marginTop: '24px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', backgroundColor: C.primary, color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', fontFamily: SANS }}>
            Fermer
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── DASHBOARD ÉLÈVE ─────────────────────────────────────────────────────────
const DashboardEleve = ({ user, requests, onTuteurs }) => {
  const [modal, setModal] = useState(null);
  const myReqs = requests;
  const confirmed = myReqs.filter(r => r.status === 'CONFIRMEE');
  const pending = myReqs.filter(r => r.status === 'EN_ATTENTE');
  const isMobile = useIsMobile();

  return (
    <>
      {modal && <ContactModal data={modal} onClose={() => setModal(null)} />}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: isMobile ? '10px' : '20px' }}>

        <StatCard icon={Calendar} value={myReqs.length} label="Demandes envoyées" />
        <StatCard icon={CheckCircle2} value={confirmed.length} label="Suivis confirmés" color="#22C55E" />
        <StatCard icon={Clock} value={pending.length} label="En attente" color={C.secondary} />
        <StatCard icon={Users} value={new Set(confirmed.map(r => r.tuteurId)).size} label="Tuteurs actifs" color="#7C3AED" />

        {/* Mes demandes */}
        <Card style={{ gridColumn: isMobile ? '1 / -1' : '1 / 3' }}>
          <CardTitle action={
            <motion.button whileHover={{ scale: 1.04 }} onClick={onTuteurs}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
              <Plus size={14} /> Trouver un tuteur
            </motion.button>
          }>Mes demandes de suivi</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myReqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: C.light, fontSize: '0.95rem' }}>
                Aucune demande pour l'instant.{' '}
                <span style={{ color: C.primary, cursor: 'pointer', fontWeight: 700 }} onClick={onTuteurs}>
                  Chercher un tuteur →
                </span>
              </div>
            ) : myReqs.slice().reverse().map(r => {
              const tuteurNom = r.tuteur ? `${r.tuteur.prenom} ${r.tuteur.nom}` : '—';
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', borderRadius: '14px', backgroundColor: C.background, border: `1px solid ${C.accent}` }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '22px' }}>📚</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem' }}>{tuteurNom}</div>
                    <div style={{ fontSize: '0.85rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.matiere} · {r.duree} · {(r.jours || []).join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <StatusPill status={r.status} />
                    {r.status === 'CONFIRMEE' && r.tuteur && (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => setModal({
                          titre: `Coordonnées de ${tuteurNom}`,
                          sousTitre: 'Contactez votre tuteur directement pour organiser votre suivi.',
                          telephone: r.tuteur.tel,
                          whatsapp: r.tuteur.whatsapp,
                          email: r.tuteur.email,
                        })}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '100px', border: 'none', backgroundColor: C.accent, color: C.primary, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                        <Phone size={12} /> Coordonnées
                      </motion.button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Infos compte */}
        <Card style={{ gridColumn: isMobile ? '1 / -1' : '3 / 5' }}>
          <CardTitle>Votre profil</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { label: 'Niveau', value: user.niveau || '—' },
              { label: 'Région', value: user.region || '—' },
              { label: 'Matières souhaitées', value: (user.matieres || []).join(', ') || '—' },
              { label: 'Mode préféré', value: user.typeCours || '—' },
              { label: 'Budget mensuel', value: user.budget || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.accent}` }}>
                <span style={{ color: C.light, fontSize: '0.9rem', fontFamily: SANS }}>{label}</span>
                <span style={{ fontWeight: 600, color: C.text, fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%', fontFamily: SANS }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

// ─── DASHBOARD TUTEUR ─────────────────────────────────────────────────────────
const DashboardTuteur = ({ user, requests, onUpdateRequests }) => {
  const [modal, setModal] = useState(null);
  const myReqs = requests;
  const pending = myReqs.filter(r => r.status === 'EN_ATTENTE');
  const confirmed = myReqs.filter(r => r.status === 'CONFIRMEE');
  const isMobile = useIsMobile();

  const accepter = async (req) => {
    await api.patch(`/requests/${req.id}`, { status: 'CONFIRMEE' }).catch(() => {});
    onUpdateRequests();
    setModal({
      titre: 'Demande acceptée !',
      sousTitre: `Vos coordonnées ont été partagées avec l'élève.`,
      telephone: user.tel,
      whatsapp: user.whatsapp,
      email: user.email,
    });
  };

  const refuser = async (req) => {
    await api.patch(`/requests/${req.id}`, { status: 'REFUSEE' }).catch(() => {});
    onUpdateRequests();
  };

  return (
    <>
      {modal && <ContactModal data={modal} onClose={() => setModal(null)} />}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: isMobile ? '10px' : '20px' }}>

        <StatCard icon={Calendar} value={myReqs.length} label="Demandes reçues" />
        <StatCard icon={CheckCircle2} value={confirmed.length} label="Suivis confirmés" color="#22C55E" />
        <StatCard icon={Clock} value={pending.length} label="En attente" color={C.secondary} />
        <StatCard icon={Users} value={new Set(confirmed.map(r => r.eleveId)).size} label="Élèves actifs" color="#7C3AED" />

        {/* Demandes */}
        <Card style={{ gridColumn: isMobile ? '1 / -1' : '1 / 3' }}>
          <CardTitle>Demandes de suivi</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myReqs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: C.light, fontSize: '0.95rem', lineHeight: 1.6 }}>
                Aucune demande reçue pour l'instant.<br />Votre profil est visible dans la liste des tuteurs.
              </div>
            ) : myReqs.slice().reverse().map(r => {
              const eleveNom = r.eleve ? `${r.eleve.prenom} ${r.eleve.nom}` : '—';
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 16px', borderRadius: '14px', backgroundColor: C.background, border: `1px solid ${r.status === 'EN_ATTENTE' ? 'rgba(249,115,22,0.3)' : C.accent}` }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '22px' }}>🎓</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem' }}>{eleveNom}</div>
                    <div style={{ fontSize: '0.85rem', color: C.muted }}>{r.matiere} · {r.duree}</div>
                    <div style={{ fontSize: '0.82rem', color: C.light, marginTop: '2px' }}>{(r.jours || []).join(', ')}</div>
                    {r.message && <div style={{ fontSize: '0.85rem', color: C.muted, marginTop: '6px', fontStyle: 'italic' }}>"{r.message}"</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <StatusPill status={r.status} />
                    {r.status === 'EN_ATTENTE' && (
                      <div style={{ display: 'flex', gap: '6px', flexDirection: isMobile ? 'column' : 'row' }}>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => accepter(r)}
                          style={{ padding: '4px 10px', borderRadius: '100px', border: 'none', backgroundColor: '#DCFCE7', color: '#166534', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Accepter</motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => refuser(r)}
                          style={{ padding: '4px 10px', borderRadius: '100px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Refuser</motion.button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Profil tuteur */}
        <Card style={{ gridColumn: isMobile ? '1 / -1' : '3 / 5' }}>
          <CardTitle>Votre profil tuteur</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { label: 'Matières', value: (user.matieres || []).join(', ') || '—' },
              { label: 'Niveaux', value: (user.niveaux || []).join(', ') || '—' },
              { label: 'Diplôme', value: user.diplome || '—' },
              { label: 'Région', value: user.region || '—' },
              { label: 'Tarif', value: user.tarif ? `${Number(user.tarif).toLocaleString('fr-FR')} FCFA/h` : '—' },
              { label: 'Mode de cours', value: user.modeCours || '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.accent}` }}>
                <span style={{ color: C.light, fontSize: '0.9rem', fontFamily: SANS }}>{label}</span>
                <span style={{ fontWeight: 600, color: C.text, fontSize: '0.9rem', textAlign: 'right', maxWidth: '60%', fontFamily: SANS }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

// ─── MON PROFIL ───────────────────────────────────────────────────────────────
const PF_REGIONS = ['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Touba', 'Mbour', 'Diourbel', 'Tambacounda', 'Kolda', 'Matam', 'Fatick', 'Kaffrine', 'Kédougou', 'Sédhiou'];
const PF_MATIERES = ['Mathématiques', 'Physique-Chimie', 'Français', 'Anglais', 'SVT', 'Histoire-Géo', 'Informatique', 'Arabe', 'Philosophie', 'Économie', 'Espagnol', 'LV2 Arabe'];
const PF_NIVEAUX_ELEVE = ['CI','CP','CE1','CE2','CM1','CM2','6ème','5ème','4ème','3ème','2nde','1ère','Terminale','Supérieur'];
const PF_NIVEAUX_TUTEUR = ['Primaire (CI–CM2)', 'Collège (6ème–3ème)', 'Lycée (2nde–Tle)', 'Supérieur'];
const PF_DIPLOMES = ['BFEM', 'BAC', 'BTS', 'Licence', 'Master', 'Doctorat', 'Autre'];
const PF_MODES = ['En ligne', 'À domicile', 'Les deux'];
const PF_LANGUES = ['Wolof', 'Français', 'Anglais', 'Arabe', 'Pulaar', 'Sérère', 'Diola', 'Mandingue', 'Espagnol'];

const DISPO_JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DISPO_HEURES = ['08h–10h', '10h–12h', '12h–14h', '14h–16h', '16h–18h', '18h–20h', '20h–22h'];
const DEFAULT_DISPO = Object.fromEntries(DISPO_JOURS.map(j => [j, Array(7).fill(false)]));

const DispoEditor = ({ value, onChange, readOnly = false }) => {
  const dispo = value || DEFAULT_DISPO;
  const toggle = (jour, hi) => {
    if (readOnly) return;
    const updated = { ...dispo, [jour]: dispo[jour].map((v, i) => i === hi ? !v : v) };
    onChange(updated);
  };
  const hasAny = Object.values(dispo).some(slots => slots.some(Boolean));
  return (
    <div>
      {!readOnly && (
        <p style={{ margin: '0 0 14px', fontSize: '0.85rem', color: C.muted, fontFamily: SANS }}>
          Cliquez sur les cases pour indiquer vos créneaux disponibles.
        </p>
      )}
      {!hasAny && readOnly && (
        <p style={{ color: C.light, fontSize: '0.9rem', fontFamily: SANS, margin: 0 }}>Aucun créneau renseigné pour l'instant.</p>
      )}
      {(hasAny || !readOnly) && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', minWidth: '460px' }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 8px', fontSize: '0.75rem', color: C.light, textAlign: 'left', fontFamily: SANS, fontWeight: 600 }}>Heure</th>
                {DISPO_JOURS.map(j => (
                  <th key={j} style={{ padding: '6px 8px', fontSize: '0.78rem', color: C.text, textAlign: 'center', fontFamily: SANS, fontWeight: 700 }}>{j.slice(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DISPO_HEURES.map((h, hi) => (
                <tr key={h}>
                  <td style={{ padding: '4px 8px', fontSize: '0.75rem', color: C.light, whiteSpace: 'nowrap', fontFamily: SANS }}>{h}</td>
                  {DISPO_JOURS.map(jour => {
                    const active = dispo[jour]?.[hi];
                    return (
                      <td key={jour} style={{ padding: '3px' }}>
                        <div
                          onClick={() => toggle(jour, hi)}
                          style={{
                            height: '32px', borderRadius: '8px',
                            backgroundColor: active ? C.accent : '#F3F4F6',
                            border: `1.5px solid ${active ? 'rgba(249,115,22,0.35)' : '#E5E7EB'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: readOnly ? 'default' : 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {active && <Check size={13} color={C.primary} />}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const FieldInput = ({ label, value, onChange, type = 'text', readOnly = false, placeholder = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>{label}</label>
    <input type={type} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder}
      style={{ padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${readOnly ? C.accent : C.border || '#E9D5A0'}`, backgroundColor: readOnly ? C.background : C.surface, fontSize: '0.93rem', fontFamily: SANS, color: readOnly ? C.light : C.text, outline: 'none', width: '100%', boxSizing: 'border-box', cursor: readOnly ? 'default' : 'text' }} />
  </div>
);

const FieldSelect = ({ label, value, onChange, options, placeholder = '' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>{label}</label>
    <select value={value} onChange={onChange}
      style={{ padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border || '#E9D5A0'}`, backgroundColor: C.surface, fontSize: '0.93rem', fontFamily: SANS, color: value ? C.text : C.light, outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const ChipToggle = ({ label, options, selected, onToggle }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>
      {label}{selected.length > 0 && <span style={{ color: C.primary, marginLeft: '8px' }}>({selected.length})</span>}
    </label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(o => {
        const active = selected.includes(o);
        return (
          <motion.button key={o} type="button" onClick={() => onToggle(o)} whileTap={{ scale: 0.95 }}
            style={{ padding: '6px 14px', borderRadius: '100px', border: `1.5px solid ${active ? C.primary : C.accent}`, backgroundColor: active ? C.primary : C.surface, color: active ? '#fff' : C.muted, fontSize: '0.84rem', fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: SANS, transition: 'all 0.15s' }}>
            {o}
          </motion.button>
        );
      })}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: `1px solid ${C.accent}` }}>
    <span style={{ color: C.light, fontSize: '0.9rem', fontFamily: SANS, flexShrink: 0, marginRight: '16px' }}>{label}</span>
    <span style={{ fontWeight: 600, color: value ? C.text : C.light, fontSize: '0.9rem', textAlign: 'right', fontFamily: SANS }}>{value || '—'}</span>
  </div>
);

const MonProfil = ({ user, onUserUpdate }) => {
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleArr = (k, v) => setForm(f => {
    const arr = f[k] || [];
    return { ...f, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] };
  });

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Image trop grande (max 3 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const photo = ev.target.result;
      const updated = { ...form, photo };
      setForm(updated);
      try {
        const saved = await api.put(`/users/${user.id}`, { photo });
        onUserUpdate({ ...user, ...saved });
        showToast('Photo mise à jour !');
      } catch {
        showToast('Erreur lors de l\'upload de la photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const cleanForm = {
        ...form,
        formations: (form.formations || []).filter(f => f.trim()),
      };
      const saved = await api.put(`/users/${user.id}`, cleanForm);
      onUserUpdate({ ...user, ...saved });
      setEditing(false);
      showToast('Profil mis à jour avec succès !');
    } catch {
      showToast('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => { setForm({ ...user }); setEditing(false); };
  const isMobile = useIsMobile();
  const isTuteur = user.role === 'tuteur' || user.role === 'TUTEUR';

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: '#DCFCE7', border: '1.5px solid #86EFAC', borderRadius: '14px', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 600, fontSize: '0.92rem', fontFamily: SANS }}>
            <CheckCircle2 size={17} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─ Header ─ */}
      <Card>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '96px', height: '96px', borderRadius: '22px', overflow: 'hidden', backgroundColor: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.border || '#E9D5A0'}` }}>
              {form.photo
                ? <img src={form.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <span style={{ fontSize: '42px' }}>{isTuteur ? '👨🏾‍🏫' : '🎓'}</span>}
            </div>
            <motion.button onClick={() => fileRef.current?.click()} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Changer la photo"
              style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${C.surface}`, backgroundColor: C.primary, color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Camera size={12} />
            </motion.button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <div style={{ fontFamily: SERIF, fontSize: '1.4rem', fontWeight: 800, color: C.text, lineHeight: 1.2 }}>{user.prenom} {user.nom}</div>
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ backgroundColor: isTuteur ? '#FEF3C7' : '#EDE9FE', color: isTuteur ? '#B45309' : '#5B21B6', padding: '3px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, fontFamily: SANS }}>
                {isTuteur ? '👨🏾‍🏫 Tuteur' : '🎓 Élève'}
              </span>
              {user.region && <span style={{ color: C.muted, fontSize: '0.83rem', fontFamily: SANS }}>📍 {user.region}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            {!editing ? (
              <motion.button onClick={() => setEditing(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: `2px solid ${C.primary}`, backgroundColor: 'transparent', color: C.primary, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
                ✏️ Modifier
              </motion.button>
            ) : (
              <>
                <motion.button onClick={cancel} whileTap={{ scale: 0.97 }}
                  style={{ padding: '10px 16px', borderRadius: '12px', border: `1.5px solid ${C.accent}`, backgroundColor: C.background, color: C.muted, fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
                  Annuler
                </motion.button>
                <motion.button onClick={save} disabled={saving} whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: saving ? C.muted : C.primary, color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: SANS }}>
                  {saving ? '⏳ Sauvegarde…' : <><Check size={15} /> Sauvegarder</>}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ─ Infos de base ─ */}
      <Card>
        <CardTitle>Informations personnelles</CardTitle>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <FieldInput label="Prénom" value={form.prenom || ''} onChange={e => set('prenom', e.target.value)} />
              <FieldInput label="Nom" value={form.nom || ''} onChange={e => set('nom', e.target.value)} />
            </div>
            <FieldInput label="Email (non modifiable)" value={form.email || ''} readOnly />
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <FieldInput label="Téléphone" value={form.tel || ''} onChange={e => set('tel', e.target.value)} placeholder="77 000 00 00" />
              <FieldInput label="WhatsApp" value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} placeholder="Si différent du tél." />
            </div>
            <FieldSelect label="Région" value={form.region || ''} onChange={e => set('region', e.target.value)} options={PF_REGIONS} placeholder="Choisir une région" />
          </div>
        ) : (
          <>
            <InfoRow label="Prénom" value={user.prenom} />
            <InfoRow label="Nom" value={user.nom} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Téléphone" value={user.tel} />
            <InfoRow label="WhatsApp" value={user.whatsapp} />
            <InfoRow label="Région" value={user.region} />
          </>
        )}
      </Card>

      {/* ─ Profil spécifique ─ */}
      <Card>
        <CardTitle>{isTuteur ? 'Profil tuteur' : 'Profil scolaire'}</CardTitle>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isTuteur ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Bio</label>
                  <textarea value={form.bio || ''} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Décrivez votre expérience et votre approche pédagogique…"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border || '#E9D5A0'}`, backgroundColor: C.surface, fontSize: '0.93rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Expérience</label>
                  <textarea value={form.experience || ''} onChange={e => set('experience', e.target.value)} rows={2} placeholder="Ex : 5 ans d'enseignement au lycée Mariama Bâ…"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border || '#E9D5A0'}`, backgroundColor: C.surface, fontSize: '0.93rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Méthodologie</label>
                  <textarea value={form.methodologie || ''} onChange={e => set('methodologie', e.target.value)} rows={2} placeholder="Ex : Cours structurés avec exercices pratiques et suivi hebdomadaire…"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border || '#E9D5A0'}`, backgroundColor: C.surface, fontSize: '0.93rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <FieldSelect label="Diplôme" value={form.diplome || ''} onChange={e => set('diplome', e.target.value)} options={PF_DIPLOMES} placeholder="Votre diplôme" />
                  <FieldSelect label="Mode de cours" value={form.modeCours || ''} onChange={e => set('modeCours', e.target.value)} options={PF_MODES} placeholder="Mode préféré" />
                </div>
                <FieldInput label="Tarif horaire (FCFA)" type="number" value={form.tarif || ''} onChange={e => set('tarif', e.target.value)} placeholder="ex: 5000" />
                <ChipToggle label="Matières enseignées" options={PF_MATIERES} selected={form.matieres || []} onToggle={v => toggleArr('matieres', v)} />
                <ChipToggle label="Niveaux" options={PF_NIVEAUX_TUTEUR} selected={form.niveaux || []} onToggle={v => toggleArr('niveaux', v)} />
                <ChipToggle label="Langues parlées" options={PF_LANGUES} selected={form.langues || []} onToggle={v => toggleArr('langues', v)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>
                    Formations <span style={{ color: C.light, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(une par ligne)</span>
                  </label>
                  <textarea
                    value={(form.formations || []).join('\n')}
                    onChange={e => set('formations', e.target.value.split('\n'))}
                    rows={3}
                    placeholder={'Ex :\nMaster Mathématiques — UCAD 2021\nBAC S mention Bien — Lycée Mariama Bâ 2018'}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border || '#E9D5A0'}`, backgroundColor: C.surface, fontSize: '0.93rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.65, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Disponibilités</label>
                  <DispoEditor
                    value={form.disponibilites}
                    onChange={v => set('disponibilites', v)}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <FieldSelect label="Niveau scolaire" value={form.niveau || ''} onChange={e => set('niveau', e.target.value)} options={PF_NIVEAUX_ELEVE} placeholder="Votre niveau" />
                  <FieldSelect label="Type de cours" value={form.typeCours || ''} onChange={e => set('typeCours', e.target.value)} options={PF_MODES} placeholder="Préférence" />
                </div>
                <FieldSelect label="Budget mensuel" value={form.budget || ''} onChange={e => set('budget', e.target.value)} options={['Moins de 20 000 FCFA', '20 000 – 50 000 FCFA', '50 000 – 100 000 FCFA', 'Plus de 100 000 FCFA']} placeholder="Votre budget" />
                <ChipToggle label="Matières souhaitées" options={PF_MATIERES} selected={form.matieres || []} onToggle={v => toggleArr('matieres', v)} />
              </>
            )}
          </div>
        ) : (
          <>
            {isTuteur ? (
              <>
                {user.bio && (
                  <div style={{ padding: '12px 0', borderBottom: `1px solid ${C.accent}` }}>
                    <div style={{ color: C.light, fontSize: '0.88rem', marginBottom: '5px', fontFamily: SANS }}>Bio</div>
                    <p style={{ color: C.text, fontSize: '0.93rem', lineHeight: 1.6, margin: 0, fontFamily: SANS }}>{user.bio}</p>
                  </div>
                )}
                {user.experience && (
                  <div style={{ padding: '12px 0', borderBottom: `1px solid ${C.accent}` }}>
                    <div style={{ color: C.light, fontSize: '0.88rem', marginBottom: '5px', fontFamily: SANS }}>Expérience</div>
                    <p style={{ color: C.text, fontSize: '0.93rem', lineHeight: 1.6, margin: 0, fontFamily: SANS }}>{user.experience}</p>
                  </div>
                )}
                {user.methodologie && (
                  <div style={{ padding: '12px 0', borderBottom: `1px solid ${C.accent}` }}>
                    <div style={{ color: C.light, fontSize: '0.88rem', marginBottom: '5px', fontFamily: SANS }}>Méthodologie</div>
                    <p style={{ color: C.text, fontSize: '0.93rem', lineHeight: 1.6, margin: 0, fontFamily: SANS }}>{user.methodologie}</p>
                  </div>
                )}
                <InfoRow label="Diplôme" value={user.diplome} />
                <InfoRow label="Tarif horaire" value={user.tarif ? `${Number(user.tarif).toLocaleString('fr-FR')} FCFA/h` : null} />
                <InfoRow label="Mode de cours" value={user.modeCours} />
                <InfoRow label="Matières" value={(user.matieres || []).join(', ')} />
                <InfoRow label="Niveaux" value={(user.niveaux || []).join(', ')} />
                <InfoRow label="Langues" value={(user.langues || []).join(', ')} />
                {(user.formations || []).length > 0 && (
                  <div style={{ padding: '12px 0', borderBottom: `1px solid ${C.accent}` }}>
                    <div style={{ color: C.light, fontSize: '0.88rem', marginBottom: '8px', fontFamily: SANS }}>Formations</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {user.formations.map((f, i) => (
                        <div key={i} style={{ fontSize: '0.9rem', color: C.text, fontWeight: 600, fontFamily: SANS }}>• {f}</div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ padding: '12px 0' }}>
                  <div style={{ color: C.light, fontSize: '0.88rem', marginBottom: '10px', fontFamily: SANS }}>Disponibilités</div>
                  <DispoEditor value={user.disponibilites} readOnly />
                </div>
              </>
            ) : (
              <>
                <InfoRow label="Niveau scolaire" value={user.niveau} />
                <InfoRow label="Type de cours" value={user.typeCours} />
                <InfoRow label="Budget mensuel" value={user.budget} />
                <InfoRow label="Matières souhaitées" value={(user.matieres || []).join(', ')} />
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

// ─── PAIEMENTS ────────────────────────────────────────────────────────────────
const PAY_KEY = 'etutorat_pay_';

const MOYENS = [
  { id: 'orange', label: 'Orange Money', color: '#FF6200', emoji: '🟠' },
  { id: 'wave',   label: 'Wave',         color: '#1A73E8', emoji: '🔵' },
  { id: 'free',   label: 'Free Money',   color: '#9333EA', emoji: '🟣' },
  { id: 'cash',   label: 'Espèces',      color: '#16A34A', emoji: '💵' },
];

const PaiementsPanel = ({ user, requests }) => {
  const key = PAY_KEY + user.id;
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || { actifs: [], numeros: {} }; }
    catch { return { actifs: [], numeros: {} }; }
  });
  const [saved, setSaved] = useState(false);
  const isMobile = useIsMobile();
  const isTuteur = user.role === 'tuteur' || user.role === 'TUTEUR';

  const toggle = (id) => setConfig(c => ({
    ...c,
    actifs: c.actifs.includes(id) ? c.actifs.filter(x => x !== id) : [...c.actifs, id],
  }));

  const setNum = (id, val) => setConfig(c => ({ ...c, numeros: { ...c.numeros, [id]: val } }));

  const save = () => {
    localStorage.setItem(key, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const confirmedReqs = requests.filter(r => r.status === 'CONFIRMEE');
  const now = new Date();
  const confirmedThisMonth = confirmedReqs.filter(r => {
    const d = new Date(r.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalEstime = confirmedReqs.reduce((s, r) => s + (r.tarif || 0), 0);

  return (
    <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: '#DCFCE7', border: '1.5px solid #86EFAC', borderRadius: '14px', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#166534', fontWeight: 600, fontSize: '0.92rem', fontFamily: SANS }}>
            <CheckCircle2 size={17} /> Moyens de paiement sauvegardés !
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─ Résumé ─ */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard icon={Wallet} value={totalEstime > 0 ? `${totalEstime.toLocaleString('fr-FR')} F` : '—'} label={isTuteur ? 'Revenus estimés' : 'Budget engagé'} color={isTuteur ? '#16A34A' : C.primary} />
        <StatCard icon={Calendar} value={confirmedThisMonth.length} label="Confirmées ce mois" color={C.secondary} />
        <StatCard icon={CheckCircle2} value={confirmedReqs.length} label="Total confirmées" color="#7C3AED" />
      </div>

      {/* ─ Mes moyens de paiement ─ */}
      <Card>
        <CardTitle>
          {isTuteur ? 'Comment je reçois mes paiements' : 'Comment je paie mes tuteurs'}
        </CardTitle>
        <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 20px', fontFamily: SANS }}>
          {isTuteur
            ? 'Indiquez vos moyens de paiement préférés. Ces informations seront partagées avec vos élèves lorsqu\'une séance est confirmée.'
            : 'Renseignez vos moyens de paiement préférés. Votre tuteur pourra ainsi vous indiquer comment procéder.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {MOYENS.map(m => {
            const active = config.actifs.includes(m.id);
            const needsNum = active && m.id !== 'cash';
            return (
              <div key={m.id}>
                <motion.div onClick={() => toggle(m.id)} whileTap={{ scale: 0.99 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', border: `2px solid ${active ? m.color : C.accent}`, backgroundColor: active ? `${m.color}10` : C.background, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '22px' }}>{m.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: C.text, fontSize: '0.95rem', fontFamily: SANS }}>{m.label}</div>
                    {m.id !== 'cash' && active && config.numeros[m.id] && (
                      <div style={{ fontSize: '0.82rem', color: C.muted, fontFamily: SANS }}>N° : {config.numeros[m.id]}</div>
                    )}
                  </div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${active ? m.color : C.light}`, backgroundColor: active ? m.color : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                    {active && <Check size={12} color="#fff" />}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {needsNum && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '10px 16px 4px' }}>
                        <input
                          value={config.numeros[m.id] || ''}
                          onChange={e => setNum(m.id, e.target.value)}
                          placeholder={`Votre numéro ${m.label} (ex: 77 000 00 00)`}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${m.color}50`, backgroundColor: C.surface, fontSize: '0.9rem', fontFamily: SANS, color: C.text, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <motion.button onClick={save} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '0.93rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
          <Check size={16} /> Sauvegarder mes préférences
        </motion.button>
      </Card>

      {/* ─ Séances confirmées avec infos paiement ─ */}
      {confirmedReqs.length > 0 && (
        <Card>
          <CardTitle>{isTuteur ? 'Paiements à recevoir' : 'Séances à régler'}</CardTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {confirmedReqs.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', borderRadius: '14px', backgroundColor: C.background, border: `1px solid ${C.accent}` }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#DCFCE710', border: '1.5px solid #86EFAC', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '20px' }}>📚</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: '0.93rem', fontFamily: SANS }}>{isTuteur ? (r.eleve ? `${r.eleve.prenom} ${r.eleve.nom}` : 'Élève') : (r.tuteur ? `${r.tuteur.prenom} ${r.tuteur.nom}` : '—')}</div>
                  <div style={{ fontSize: '0.83rem', color: C.muted, fontFamily: SANS }}>{r.matiere} · {r.duree}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: C.primary, fontSize: '1rem', fontFamily: SERIF }}>{r.tarif ? `${Number(r.tarif).toLocaleString('fr-FR')} FCFA` : 'À négocier'}</div>
                  <span style={{ fontSize: '0.75rem', backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 10px', borderRadius: '100px', fontWeight: 700 }}>✓ Confirmée</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', padding: '14px 16px', borderRadius: '12px', backgroundColor: C.accent, border: `1px solid ${C.secondary}50`, display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
            <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted, lineHeight: 1.55, fontFamily: SANS }}>
              {isTuteur
                ? 'Partagez vos coordonnées de paiement avec vos élèves via la messagerie ou directement lors de la séance.'
                : 'Contactez votre tuteur via Messages pour coordonner le règlement avant ou après la séance.'}
            </p>
          </div>
        </Card>
      )}

      {/* ─ Historique des séances ─ */}
      <Card>
        <CardTitle>{isTuteur ? 'Historique des séances confirmées' : 'Mes séances confirmées'}</CardTitle>
        {confirmedReqs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: C.light, fontFamily: SANS }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Aucune séance confirmée pour l'instant.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {confirmedReqs.map((r, i) => {
              const contact = isTuteur
                ? (r.eleve ? `${r.eleve.prenom} ${r.eleve.nom}` : '—')
                : (r.tuteur ? `${r.tuteur.prenom} ${r.tuteur.nom}` : '—');
              const date = new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '13px 0', borderBottom: i < confirmedReqs.length - 1 ? `1px solid ${C.accent}` : 'none' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#DCFCE7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '18px' }}>✅</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: C.text, fontSize: '0.9rem', fontFamily: SANS, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {contact} — {r.matiere}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: C.light, fontFamily: SANS }}>{date} · {r.duree || '—'}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: r.tarif ? '#16A34A' : C.light, fontFamily: SERIF, flexShrink: 0 }}>
                    {r.tarif ? `${Number(r.tarif).toLocaleString('fr-FR')} F` : 'À négocier'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── PARAMÈTRES ──────────────────────────────────────────────────────────────
const SettingsPanel = ({ user, onLogout }) => {
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const doReset = () => {
    setResetDone(true);
    setTimeout(() => { onLogout(); }, 1800);
  };

  return (
    <div style={{ maxWidth: '580px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Compte */}
      <Card>
        <CardTitle>Votre compte</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            { label: 'Nom', value: `${user.prenom} ${user.nom}` },
            { label: 'Email', value: user.email },
            { label: 'Rôle', value: (user.role === 'TUTEUR' || user.role === 'tuteur') ? 'Tuteur' : 'Élève' },
            { label: 'Membre depuis', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${C.accent}` }}>
              <span style={{ color: C.light, fontSize: '0.9rem' }}>{label}</span>
              <span style={{ fontWeight: 600, color: C.text, fontSize: '0.9rem' }}>{value}</span>
            </div>
          ))}
        </div>
        <motion.button onClick={onLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ marginTop: '18px', display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '12px', border: `2px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
          <LogOut size={16} /> Se déconnecter
        </motion.button>
      </Card>

      {/* Zone dev */}
      <Card style={{ border: '2px solid #FEE2E2' }}>
        <CardTitle>
          <span style={{ color: '#991B1B' }}>Zone développeur</span>
        </CardTitle>
        <p style={{ color: C.muted, fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 18px', fontFamily: SANS }}>
          Ces outils sont destinés aux tests. <strong>Toutes les données seront effacées</strong> (comptes, sessions, demandes).
        </p>

        {resetDone ? (
          <div style={{ backgroundColor: '#DCFCE7', borderRadius: '12px', padding: '14px 18px', color: '#166534', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> Données effacées. Redirection…
          </div>
        ) : !confirmReset ? (
          <motion.button onClick={() => setConfirmReset(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '12px', border: 'none', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
            Réinitialiser toutes les données
          </motion.button>
        ) : (
          <div style={{ backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '18px' }}>
            <p style={{ color: '#9A3412', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 14px' }}>
              Confirmer la suppression de tous les comptes et demandes ?
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button onClick={doReset} whileTap={{ scale: 0.96 }}
                style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#DC2626', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: SANS }}>
                Oui, tout effacer
              </motion.button>
              <button onClick={() => setConfirmReset(false)}
                style={{ padding: '10px 20px', borderRadius: '10px', border: `1.5px solid ${C.border}`, background: 'transparent', color: C.muted, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: SANS }}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const fmtNotifTime = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};
const fmtDay = (iso) => {
  const d = new Date(iso); const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Aujourd\'hui';
  if (diff === 1) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long' });
};

const MessagesPanel = ({ currentUser }) => {
  const [convs, setConvs] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    api.get('/messages').then(data => {
      if (Array.isArray(data)) { setConvs(data); if (data.length) setActiveId(prev => prev ?? data[0].id); }
    }).catch(() => {});
    const interval = setInterval(() => {
      api.get('/messages').then(data => {
        if (Array.isArray(data)) setConvs(data);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoadingMsgs(true);
    api.get(`/messages/${activeId}`).then(data => {
      if (Array.isArray(data)) setMsgs(data);
      setConvs(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
    }).catch(() => {}).finally(() => setLoadingMsgs(false));

    const interval = setInterval(() => {
      api.get(`/messages/${activeId}`).then(data => {
        if (Array.isArray(data)) setMsgs(data);
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeId]);

  const activeConv = convs.find(c => c.id === activeId);

  const sendMessage = async () => {
    if (!text.trim() || !activeId) return;
    const t = text.trim(); setText('');
    const data = await api.post('/messages', { conversationId: activeId, text: t }).catch(() => null);
    if (data?.message) {
      setMsgs(prev => [...prev, data.message]);
      setConvs(prev => prev.map(c => c.id === activeId ? { ...c, lastMessage: data.message } : c));
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const filtered = convs.filter(c => {
    const nom = c.contact ? `${c.contact.prenom} ${c.contact.nom}` : '';
    return nom.toLowerCase().includes(search.toLowerCase());
  });

  const showList = !isMobile || activeId === null;
  const showChat = !isMobile || activeId !== null;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 16px rgba(62,42,31,0.05)' }}>

      {/* ── Liste conversations ── */}
      {showList && <div style={{ width: isMobile ? '100%' : '300px', flexShrink: 0, borderRight: isMobile ? 'none' : `1px solid ${C.accent}`, display: 'flex', flexDirection: 'column', backgroundColor: C.background }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: `1px solid ${C.accent}` }}>
          <h2 style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.text, margin: '0 0 12px', fontWeight: 700 }}>
            Messages
            {convs.reduce((s, c) => s + c.unread, 0) > 0 && (
              <span style={{ fontSize: '0.75rem', backgroundColor: C.primary, color: '#fff', borderRadius: '100px', padding: '1px 8px', marginLeft: '8px' }}>
                {convs.reduce((s, c) => s + c.unread, 0)}
              </span>
            )}
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={14} color={C.light} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ width: '100%', padding: '9px 12px 9px 32px', borderRadius: '12px', border: `1px solid ${C.accent}`, backgroundColor: C.surface, fontSize: '0.85rem', fontFamily: SANS, color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: C.light, fontSize: '0.88rem', fontFamily: SANS }}>
              {convs.length === 0 ? 'Aucune conversation pour l\'instant.' : 'Aucune conversation trouvée.'}
            </div>
          )}
          {filtered.map(conv => {
            const nom = conv.contact ? `${conv.contact.prenom} ${conv.contact.nom}` : 'Contact';
            const isActive = conv.id === activeId;
            return (
              <motion.div key={conv.id} onClick={() => setActiveId(conv.id)} whileHover={{ backgroundColor: isActive ? C.accent : '#FFF8EE' }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', backgroundColor: isActive ? C.accent : 'transparent', borderLeft: `3px solid ${isActive ? C.primary : 'transparent'}`, transition: 'background 0.15s' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: isActive ? C.surface : C.accent, display: 'grid', placeItems: 'center', fontSize: '22px' }}>
                    {conv.contact?.role === 'TUTEUR' ? '👨🏾‍🏫' : '👩🏾‍🎓'}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontWeight: conv.unread ? 800 : 700, fontSize: '0.9rem', color: C.text }}>{nom}</span>
                    <span style={{ fontSize: '0.7rem', color: C.light, flexShrink: 0 }}>
                      {conv.lastMessage ? fmtDay(conv.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: conv.unread ? 600 : 400 }}>
                      {conv.lastMessage?.senderId === currentUser.id ? 'Vous : ' : ''}{conv.lastMessage?.text || ''}
                    </span>
                    {conv.unread > 0 && (
                      <span style={{ backgroundColor: C.primary, color: '#fff', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0, padding: '0 4px' }}>{conv.unread}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>}

      {/* ── Fenêtre de chat ── */}
      {showChat && (activeConv ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* En-tête */}
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.surface, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isMobile && (
                <button onClick={() => setActiveId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.primary, fontSize: '1.1rem', padding: '4px 8px 4px 0', fontWeight: 700, fontFamily: SANS }}>←</button>
              )}
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', fontSize: '20px' }}>
                {activeConv.contact?.role === 'TUTEUR' ? '👨🏾‍🏫' : '👩🏾‍🎓'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: '0.96rem' }}>
                  {activeConv.contact ? `${activeConv.contact.prenom} ${activeConv.contact.nom}` : 'Contact'}
                </div>
                <div style={{ fontSize: '0.76rem', color: C.light, fontWeight: 600 }}>
                  {activeConv.contact?.role === 'TUTEUR' ? 'Tuteur' : 'Élève'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[Video, Phone].map((Icon, i) => (
                <motion.button key={i} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  style={{ width: '38px', height: '38px', borderRadius: '12px', border: `1px solid ${C.accent}`, backgroundColor: C.background, cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.muted }}>
                  <Icon size={17} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bulles de messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: C.background }}>
            {loadingMsgs ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.light, fontSize: '0.88rem' }}>Chargement…</div>
            ) : msgs.map((msg, i) => {
              const isMe = msg.senderId === currentUser.id;
              const showDay = i === 0 || fmtDay(msgs[i - 1].createdAt) !== fmtDay(msg.createdAt);
              return (
                <div key={msg.id}>
                  {showDay && (
                    <div style={{ textAlign: 'center', margin: '6px 0 10px' }}>
                      <span style={{ fontSize: '0.72rem', color: C.light, fontWeight: 600, backgroundColor: C.accent, padding: '3px 12px', borderRadius: '100px' }}>{fmtDay(msg.createdAt)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '65%', padding: '11px 15px',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: isMe ? C.primary : C.surface,
                      color: isMe ? '#fff' : C.text,
                      fontSize: '0.9rem', lineHeight: 1.55,
                      boxShadow: isMe ? '0 4px 12px rgba(249,115,22,0.22)' : '0 2px 8px rgba(62,42,31,0.07)',
                      border: isMe ? 'none' : `1px solid ${C.accent}`,
                    }}>
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '0.68rem', marginTop: '4px', opacity: 0.65, textAlign: 'right' }}>{fmtTime(msg.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Zone de saisie */}
          <div style={{ padding: '14px 24px', borderTop: `1px solid ${C.accent}`, backgroundColor: C.surface, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Écrire un message..." rows={1}
                style={{ flex: 1, padding: '11px 15px', borderRadius: '14px', border: `1px solid ${C.accent}`, backgroundColor: C.background, fontSize: '0.9rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: '110px', overflowY: 'auto', boxSizing: 'border-box' }}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={sendMessage} disabled={!text.trim()}
                style={{ width: '44px', height: '44px', borderRadius: '13px', border: 'none', backgroundColor: text.trim() ? C.primary : C.accent, color: text.trim() ? '#fff' : C.light, cursor: text.trim() ? 'pointer' : 'default', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <Send size={19} />
              </motion.button>
            </div>
            <p style={{ margin: '5px 0 0 2px', fontSize: '0.7rem', color: C.light }}>Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: C.light }}>
          <MessageSquare size={44} color={C.accent} />
          <p style={{ fontFamily: SERIF, fontSize: '1.05rem', color: C.muted, margin: 0 }}>Sélectionnez une conversation</p>
        </div>
      ))}
    </div>
  );
};

// ─── NOTIFICATIONS — Bell dropdown (reçoit les notifs du parent) ──────────────
const NotifCenter = ({ notifications, unread, onMarkRead, onMarkAll }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button onClick={() => setOpen(o => !o)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
        style={{ width: '40px', height: '40px', borderRadius: '12px', border: `1px solid ${C.accent}`, backgroundColor: open ? C.accent : C.background, cursor: 'pointer', display: 'grid', placeItems: 'center', color: C.muted, position: 'relative' }}>
        <Bell size={18} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: C.primary, color: '#fff', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.97 }} transition={{ duration: 0.18 }}
            style={{ position: 'fixed', top: '68px', right: '12px', left: '12px', maxWidth: '360px', marginLeft: 'auto', maxHeight: '480px', backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.accent}`, boxShadow: '0 16px 48px rgba(62,42,31,0.14)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 200 }}>

            <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ fontFamily: SERIF, fontSize: '1.05rem', fontWeight: 700, color: C.text }}>
                Notifications
                {unread > 0 && <span style={{ fontSize: '0.75rem', backgroundColor: C.primary, color: '#fff', borderRadius: '100px', padding: '1px 7px', marginLeft: '8px' }}>{unread}</span>}
              </div>
              {unread > 0 && (
                <button onClick={onMarkAll} style={{ fontSize: '0.78rem', color: C.primary, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: SANS }}>
                  Tout lire
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: C.light, fontSize: '0.9rem', fontFamily: SANS }}>Aucune notification.</div>
              ) : notifications.map(n => (
                <motion.div key={n.id} onClick={() => onMarkRead(n.id)} whileHover={{ backgroundColor: C.background }}
                  style={{ display: 'flex', gap: '12px', padding: '13px 18px', cursor: 'pointer', backgroundColor: n.read ? 'transparent' : `${C.accent}70`, borderBottom: `1px solid ${C.accent}40`, transition: 'background 0.15s' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: n.read ? C.background : C.accent, display: 'grid', placeItems: 'center', fontSize: '17px', flexShrink: 0 }}>{n.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: n.read ? 600 : 800, fontSize: '0.87rem', color: C.text, fontFamily: SANS }}>{n.title}</span>
                      <span style={{ fontSize: '0.7rem', color: C.light, flexShrink: 0, fontFamily: SANS }}>{fmtNotifTime(n.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.81rem', color: C.muted, lineHeight: 1.45, fontFamily: SANS, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.body}</p>
                  </div>
                  {!n.read && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: C.primary, flexShrink: 0, marginTop: '7px' }} />}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── PANEL NOTIFICATIONS complet ─────────────────────────────────────────────
const NotificationsPanel = ({ notifications, onMarkRead, onMarkAll }) => {
  const unread = notifications.filter(n => !n.read).length;
  const isMobile = useIsMobile();

  const typeColors = {
    new_request:      { bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
    request_confirmed:{ bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
    request_refused:  { bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
    system:           { bg: C.accent,  border: C.border,  dot: C.primary  },
  };

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p style={{ color: C.light, fontSize: '0.9rem', margin: 0, fontFamily: SANS }}>
            {unread > 0 ? `${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unread > 0 && (
          <motion.button onClick={onMarkAll} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '100px', border: `1.5px solid ${C.border}`, background: 'transparent', color: C.primary, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: SANS }}>
            <Check size={14} /> Tout marquer comme lu
          </motion.button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '60px 24px', textAlign: 'center', border: `1px solid ${C.accent}` }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔔</div>
          <p style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.muted, margin: '0 0 6px', fontWeight: 700 }}>Aucune notification</p>
          <p style={{ color: C.light, fontSize: '0.9rem', margin: 0, fontFamily: SANS }}>Vous serez averti des nouvelles demandes et mises à jour ici.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map(n => {
            const c = typeColors[n.type] || typeColors.system;
            return (
              <motion.div key={n.id}
                onClick={() => !n.read && onMarkRead(n.id)}
                whileHover={{ scale: 1.005 }}
                style={{
                  display: 'flex', gap: '14px', padding: isMobile ? '14px' : '16px 20px',
                  borderRadius: '16px', cursor: n.read ? 'default' : 'pointer',
                  backgroundColor: n.read ? C.surface : c.bg,
                  border: `1.5px solid ${n.read ? C.accent : c.border}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '14px', backgroundColor: n.read ? C.background : C.accent, display: 'grid', placeItems: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {n.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: n.read ? 600 : 800, fontSize: '0.92rem', color: C.text, fontFamily: SANS }}>{n.title}</span>
                    <span style={{ fontSize: '0.72rem', color: C.light, flexShrink: 0, fontFamily: SANS, paddingTop: '2px' }}>{fmtNotifTime(n.createdAt)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: C.muted, lineHeight: 1.5, fontFamily: SANS }}>{n.body}</p>
                </div>
                {!n.read && (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.dot }} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
const NAV_ELEVE = [
  { id: 'dashboard',     icon: Home,           label: 'Tableau de bord' },
  { id: 'messages',      icon: MessageSquare,  label: 'Messages' },
  { id: 'notifications', icon: Bell,           label: 'Notifications' },
  { id: 'paiements',     icon: Wallet,         label: 'Paiements' },
  { id: 'profil',        icon: GraduationCap,  label: 'Mon profil' },
  { id: 'settings',      icon: Settings,       label: 'Paramètres' },
];
const NAV_TUTEUR = [
  { id: 'dashboard',     icon: Home,           label: 'Tableau de bord' },
  { id: 'messages',      icon: MessageSquare,  label: 'Messages' },
  { id: 'notifications', icon: Bell,           label: 'Notifications' },
  { id: 'paiements',     icon: Wallet,         label: 'Revenus' },
  { id: 'profil',        icon: Award,          label: 'Mon profil' },
  { id: 'settings',      icon: Settings,       label: 'Paramètres' },
];

const EmailVerifyBanner = ({ userId }) => {
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (dismissed) return null;

  const resend = async () => {
    setSending(true);
    try {
      await api.post('/auth/resend-verify', {});
      setSent(true);
    } catch { /* silently fail */ }
    finally { setSending(false); }
  };

  return (
    <div style={{ backgroundColor: '#FEF3C7', borderBottom: '1px solid #FDE68A', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '1.1rem' }}>📧</span>
      <span style={{ flex: 1, fontSize: '0.88rem', color: '#92400E', fontFamily: SANS, fontWeight: 500 }}>
        {sent ? 'Email de vérification renvoyé ! Vérifiez votre boîte mail.' : 'Vérifiez votre adresse email pour activer toutes les fonctionnalités.'}
      </span>
      {!sent && (
        <button onClick={resend} disabled={sending}
          style={{ fontSize: '0.82rem', fontWeight: 700, color: '#B45309', background: 'none', border: '1.5px solid #FDE68A', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer', fontFamily: SANS }}>
          {sending ? 'Envoi…' : 'Renvoyer l\'email'}
        </button>
      )}
      <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', fontSize: '1.1rem', lineHeight: 1, padding: '2px' }}>×</button>
    </div>
  );
};

export default function DashboardPage({ currentUser, onGoHome, onTuteurs, onLogout, onUserUpdate }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [requests, setRequests] = useState([]);

  const fetchRequests = useCallback(() => {
    api.get('/requests').then(data => { if (Array.isArray(data)) setRequests(data); }).catch(() => {});
  }, []);

  useEffect(() => { if (currentUser) fetchRequests(); }, [currentUser, fetchRequests]);

  // ─── Notifications : état centralisé + SSE + polling ────────────────────────
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Chargement initial
    api.get('/notifications').then(d => { if (Array.isArray(d)) setNotifications(d); }).catch(() => {});

    // SSE pour le temps réel (EventSource ne supporte pas les headers → token en query)
    const token = localStorage.getItem('etutorat_token');
    let es = null;
    if (token) {
      const base = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      es = new EventSource(`${base}/notifications/stream?token=${encodeURIComponent(token)}`);
      es.addEventListener('notification', (e) => {
        try {
          const n = JSON.parse(e.data);
          setNotifications(prev => [n, ...prev]);
        } catch {}
      });
      es.onerror = () => { es.close(); es = null; };
    }

    // Polling toutes les 30s comme fallback (si SSE coupé)
    const poll = setInterval(() => {
      api.get('/notifications').then(d => { if (Array.isArray(d)) setNotifications(d); }).catch(() => {});
    }, 30000);

    return () => {
      es?.close();
      clearInterval(poll);
    };
  }, [currentUser?.id]);

  const notifUnread = notifications.filter(n => !n.read).length;

  const markNotifRead = useCallback((id) => {
    api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotifsRead = useCallback(() => {
    api.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: C.background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS }}>
        <style>{`*, *::before, *::after { box-sizing: border-box; }`}</style>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: C.muted, marginBottom: '16px', fontFamily: SANS }}>Vous devez être connecté pour accéder au tableau de bord.</p>
          <button onClick={onGoHome} style={{ padding: '12px 24px', borderRadius: '100px', border: 'none', backgroundColor: C.primary, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const isEleve = currentUser.role === 'ELEVE' || currentUser.role === 'eleve';
  const navItems = isEleve ? NAV_ELEVE : NAV_TUTEUR;
  const pendingCount = requests.filter(r =>
    isEleve
      ? r.eleveId === currentUser.id && r.status === 'EN_ATTENTE'
      : r.tuteurId === currentUser.id && r.status === 'EN_ATTENTE'
  ).length;
  const [msgUnread, setMsgUnread] = useState(0);
  useEffect(() => {
    const fetchUnread = () => api.get('/messages').then(data => {
      if (Array.isArray(data)) setMsgUnread(data.reduce((s, c) => s + (c.unread || 0), 0));
    }).catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const isMobile = useIsMobile();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, display: 'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* ── SIDEBAR desktop ── */}
      {!isMobile && (
        <aside style={{ width: '260px', flexShrink: 0, backgroundColor: C.surface, borderRight: `1px solid ${C.accent}`, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', marginBottom: '28px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: C.primary, display: 'grid', placeItems: 'center' }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: '1.1rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>e-Tutorat</div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2px', color: C.primary, textTransform: 'uppercase' }}>Sénégal 🇸🇳</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: C.accent, borderRadius: '16px', marginBottom: '24px' }}>
            <UserAvatar user={currentUser} size={42} radius="12px" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.prenom} {currentUser.nom}</div>
              <div style={{ fontSize: '0.8rem', color: C.muted }}>{isEleve ? (currentUser.niveau || 'Élève') : (currentUser.matieres?.[0] || 'Tuteur')}</div>
            </div>
          </div>
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => (
              <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id}
                onClick={() => setActiveNav(item.id)}
                badge={item.id === 'dashboard' ? pendingCount : item.id === 'messages' ? msgUnread : item.id === 'notifications' ? notifUnread : 0} />
            ))}
          </nav>
          <div style={{ borderTop: `1px solid ${C.accent}`, paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <NavItem icon={Home} label="Retour à l'accueil" onClick={onGoHome} />
            <NavItem icon={LogOut} label="Déconnexion" onClick={onLogout} />
          </div>
        </aside>
      )}

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: isMobile ? '72px' : 0 }}>
        {/* Header */}
        <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.accent}`, padding: isMobile ? '0 16px' : '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: C.primary, display: 'grid', placeItems: 'center' }}>
                  <BookOpen size={17} color="#fff" />
                </div>
              </div>
            )}
            <h1 style={{ fontFamily: SERIF, fontSize: isMobile ? '1.1rem' : '1.5rem', color: C.text, margin: 0, fontWeight: 700 }}>
              {navItems.find(n => n.id === activeNav)?.label || 'Tableau de bord'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NotifCenter
              notifications={notifications}
              unread={notifUnread}
              onMarkRead={markNotifRead}
              onMarkAll={markAllNotifsRead}
            />
            <UserAvatar user={currentUser} size={32} radius="9px" />
            {!isMobile && <span style={{ fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{currentUser.prenom}</span>}
          </div>
        </header>

        {!currentUser.emailVerified && <EmailVerifyBanner userId={currentUser.id} />}

        <div style={{ flex: 1, padding: activeNav === 'messages' ? (isMobile ? '12px' : '20px') : (isMobile ? '16px' : '32px'), overflowY: activeNav === 'messages' ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              style={activeNav === 'messages' ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } : {}}>
              {activeNav === 'dashboard' && (isEleve
                ? <DashboardEleve user={currentUser} requests={requests} onTuteurs={onTuteurs} />
                : <DashboardTuteur user={currentUser} requests={requests} onUpdateRequests={fetchRequests} />
              )}
              {activeNav === 'messages'       && <MessagesPanel currentUser={currentUser} />}
              {activeNav === 'notifications'  && <NotificationsPanel notifications={notifications} onMarkRead={markNotifRead} onMarkAll={markAllNotifsRead} />}
              {activeNav === 'paiements'      && <PaiementsPanel user={currentUser} requests={requests} />}
              {activeNav === 'profil'         && <MonProfil user={currentUser} onUserUpdate={onUserUpdate} />}
              {activeNav === 'settings'       && <SettingsPanel user={currentUser} onLogout={onLogout} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── BOTTOM NAV mobile ── */}
      {isMobile && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTop: `1px solid ${C.accent}`, display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.slice(0, 4).map(item => {
            const Icon = item.icon;
            const badge = item.id === 'dashboard' ? pendingCount : item.id === 'messages' ? msgUnread : item.id === 'notifications' ? notifUnread : 0;
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', background: 'none', border: 'none', cursor: 'pointer', gap: '3px', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <Icon size={22} color={active ? C.primary : C.light} />
                  {badge > 0 && (
                    <div style={{ position: 'absolute', top: '-5px', right: '-7px', backgroundColor: C.primary, color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</div>
                  )}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: active ? 700 : 500, color: active ? C.primary : C.light, fontFamily: SANS }}>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button onClick={onGoHome}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 4px 8px', background: 'none', border: 'none', cursor: 'pointer', gap: '3px' }}>
            <Home size={22} color={C.light} />
            <span style={{ fontSize: '0.65rem', fontWeight: 500, color: C.light, fontFamily: SANS }}>Accueil</span>
          </button>
        </nav>
      )}
    </div>
  );
}
