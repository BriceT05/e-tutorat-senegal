// Page d'administration — accès réservé aux comptes ADMIN (garde dans main.jsx).
// Gère : statistiques globales, liste paginée des utilisateurs/demandes, articles du blog.
// Toutes les mutations (suppression, changement de rôle) passent par /admin/* côté serveur
// qui re-vérifie le rôle — le token JWT ne suffit pas, le backend vérifie aussi.
import { useState, useEffect, useCallback } from 'react';
import api from './api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, BookOpen, LogOut, Search, Trash2,
  ChevronLeft, ChevronRight, Shield, RefreshCw,
  TrendingUp, MessageSquare, CheckCircle2, Clock, X,
  PenLine, Plus, Eye, EyeOff, FileText,
} from 'lucide-react';

const C = {
  primary: '#F97316', secondary: '#FBBF24', background: '#FFFDF5',
  surface: '#FFFFFF', accent: '#FEF3C7', text: '#3E2A1F',
  muted: '#524036', light: '#6B7280', border: '#E9D5A0',
};
const SERIF = '"Playfair Display", serif';
const SANS  = '"Inter", sans-serif';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const RoleBadge = ({ role }) => {
  const map = {
    ADMIN:  { bg: '#FEE2E2', color: '#991B1B',  label: 'Admin'  },
    TUTEUR: { bg: '#FEF3C7', color: '#B45309',  label: 'Tuteur' },
    ELEVE:  { bg: '#EDE9FE', color: '#5B21B6',  label: 'Élève'  },
  };
  const s = map[role] || map.ELEVE;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, fontFamily: SANS }}>
      {s.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    CONFIRMEE:  { bg: '#DCFCE7', color: '#166534', label: '✓ Confirmée'  },
    EN_ATTENTE: { bg: '#FEF3C7', color: '#B45309',  label: '⏳ En attente' },
    REFUSEE:    { bg: '#FEE2E2', color: '#991B1B',  label: '✕ Refusée'   },
  };
  const s = map[status] || map.EN_ATTENTE;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, fontFamily: SANS }}>
      {s.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, value, label, color = C.primary, sub }) => (
  <div style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '22px', border: `1px solid ${C.accent}`, boxShadow: '0 4px 16px rgba(62,42,31,0.05)' }}>
    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
      <Icon size={22} color={color} />
    </div>
    <div style={{ fontFamily: SERIF, fontSize: '2rem', fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '0.85rem', color: C.light, marginTop: '4px', fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: '0.78rem', color: C.muted, marginTop: '6px' }}>{sub}</div>}
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.button onClick={onClick} whileHover={{ x: 3 }}
    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '14px', border: 'none', backgroundColor: active ? C.accent : 'transparent', color: active ? C.primary : C.muted, cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: SANS, fontWeight: active ? 700 : 500, fontSize: '0.95rem', transition: 'all 0.2s' }}>
    <Icon size={20} />
    {label}
  </motion.button>
);

const Pagination = ({ page, total, limit, onPage }) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
      <motion.button onClick={() => onPage(page - 1)} disabled={page === 1} whileTap={{ scale: 0.95 }}
        style={{ width: '34px', height: '34px', borderRadius: '10px', border: `1px solid ${C.accent}`, background: 'transparent', cursor: page === 1 ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: page === 1 ? 0.4 : 1 }}>
        <ChevronLeft size={16} color={C.muted} />
      </motion.button>
      <span style={{ fontSize: '0.88rem', color: C.muted, fontFamily: SANS }}>
        Page <strong>{page}</strong> / {totalPages} — {total} résultat{total > 1 ? 's' : ''}
      </span>
      <motion.button onClick={() => onPage(page + 1)} disabled={page === totalPages} whileTap={{ scale: 0.95 }}
        style={{ width: '34px', height: '34px', borderRadius: '10px', border: `1px solid ${C.accent}`, background: 'transparent', cursor: page === totalPages ? 'default' : 'pointer', display: 'grid', placeItems: 'center', opacity: page === totalPages ? 0.4 : 1 }}>
        <ChevronRight size={16} color={C.muted} />
      </motion.button>
    </div>
  );
};

// ─── Modal confirmation suppression ──────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <AnimatePresence>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(62,42,31,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 24px 64px rgba(62,42,31,0.18)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FEE2E2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <Trash2 size={22} color="#DC2626" />
        </div>
        <h3 style={{ fontFamily: SERIF, fontSize: '1.2rem', color: C.text, margin: '0 0 10px', textAlign: 'center' }}>Confirmer la suppression</h3>
        <p style={{ color: C.muted, fontSize: '0.9rem', textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', borderRadius: '12px', border: `1.5px solid ${C.accent}`, background: 'transparent', color: C.muted, fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
            Annuler
          </button>
          <motion.button onClick={onConfirm} whileTap={{ scale: 0.97 }}
            style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', backgroundColor: '#DC2626', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
            Supprimer
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Section : Tableau de bord ────────────────────────────────────────────────
const AdminDashboard = ({ stats, onRefresh, loading }) => {
  if (!stats) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: C.light, fontFamily: SANS }}>
      Chargement…
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: SERIF, fontSize: '1.3rem', color: C.text, margin: 0 }}>Vue d'ensemble</h2>
        <motion.button onClick={onRefresh} whileTap={{ scale: 0.95 }} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', borderRadius: '10px', border: `1px solid ${C.accent}`, background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: '0.85rem', fontFamily: SANS }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Actualiser
        </motion.button>
      </div>

      {/* Stats utilisateurs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard icon={Users} value={stats.totalUsers} label="Utilisateurs total" color={C.primary} />
        <StatCard icon={Shield} value={stats.totalTuteurs} label="Tuteurs" color="#B45309"
          sub={`${stats.totalEleves} élèves inscrits`} />
        <StatCard icon={BookOpen} value={stats.totalRequests} label="Demandes de suivi" color="#7C3AED"
          sub={`${stats.requestsConfirmees} confirmées`} />
      </div>

      {/* Stats activité */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard icon={CheckCircle2} value={stats.requestsConfirmees} label="Séances confirmées" color="#16A34A" />
        <StatCard icon={Clock} value={stats.requestsEnAttente} label="En attente" color={C.secondary} />
        <StatCard icon={MessageSquare} value={stats.totalMessages} label="Messages échangés" color="#0EA5E9"
          sub={`${stats.totalConversations} conversations`} />
      </div>

      {/* Taux de confirmation */}
      {stats.totalRequests > 0 && (
        <div style={{ backgroundColor: C.surface, borderRadius: '20px', padding: '24px', border: `1px solid ${C.accent}` }}>
          <h3 style={{ fontFamily: SERIF, fontSize: '1.1rem', color: C.text, margin: '0 0 16px' }}>Répartition des demandes</h3>
          {[
            { label: 'Confirmées', count: stats.requestsConfirmees, color: '#16A34A', bg: '#DCFCE7' },
            { label: 'En attente', count: stats.requestsEnAttente,  color: '#B45309', bg: '#FEF3C7' },
            { label: 'Refusées',   count: stats.requestsRefusees,   color: '#991B1B', bg: '#FEE2E2' },
          ].map(({ label, count, color, bg }) => {
            const pct = Math.round((count / stats.totalRequests) * 100);
            return (
              <div key={label} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.88rem', color: C.muted, fontFamily: SANS }}>{label}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color, fontFamily: SANS }}>{count} ({pct}%)</span>
                </div>
                <div style={{ height: '8px', borderRadius: '100px', backgroundColor: '#F3F4F6', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: '100px', backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Section : Utilisateurs ────────────────────────────────────────────────────
const AdminUsers = ({ currentAdminId }) => {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]   = useState('');
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search)     params.set('q', search);
    if (roleFilter) params.set('role', roleFilter);
    api.get(`/admin/users?${params}`)
      .then(data => { setUsers(data.users || []); setTotal(data.total || 0); })
      .catch(() => showToast('Erreur lors du chargement'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);
  // Reset page à 1 dès que les filtres changent pour ne pas rester sur une page inexistante
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  const changeRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast('Rôle modifié avec succès');
    } catch { showToast('Erreur lors de la modification'); }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setTotal(t => t - 1);
      showToast('Utilisateur supprimé');
    } catch { showToast('Erreur lors de la suppression'); }
    setConfirm(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {confirm && (
        <ConfirmModal
          message={`Supprimer définitivement ${confirm.prenom} ${confirm.nom} ? Cette action est irréversible.`}
          onConfirm={() => deleteUser(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: '#DCFCE7', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '12px 18px', color: '#166534', fontWeight: 600, fontSize: '0.9rem', fontFamily: SANS }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} color={C.light} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email…"
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: `1.5px solid ${C.border}`, backgroundColor: C.surface, fontSize: '0.9rem', fontFamily: SANS, color: C.text, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {['', 'ELEVE', 'TUTEUR', 'ADMIN'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            style={{ padding: '9px 16px', borderRadius: '10px', border: `1.5px solid ${roleFilter === r ? C.primary : C.accent}`, backgroundColor: roleFilter === r ? C.accent : 'transparent', color: roleFilter === r ? C.primary : C.muted, fontWeight: roleFilter === r ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer', fontFamily: SANS }}>
            {r || 'Tous'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.accent}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.light, fontFamily: SANS }}>Chargement…</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.light, fontFamily: SANS }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
            Aucun utilisateur trouvé.
          </div>
        ) : users.map((u, i) => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < users.length - 1 ? `1px solid ${C.accent}` : 'none' }}>
            {/* Avatar */}
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '18px' }}>
              {u.photo
                ? <img src={u.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : (u.role === 'TUTEUR' ? '👨🏾‍🏫' : u.role === 'ADMIN' ? '🛡️' : '🎓')}
            </div>

            {/* Infos */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: '0.93rem', fontFamily: SANS }}>
                {u.prenom} {u.nom}
                {u.id === currentAdminId && <span style={{ fontSize: '0.75rem', color: C.primary, marginLeft: '8px', fontWeight: 600 }}>(vous)</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: C.light, fontFamily: SANS }}>{u.email} · {u.region || 'Région —'} · {fmtDate(u.createdAt)}</div>
            </div>

            {/* Stats */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '0.75rem', color: C.light, fontFamily: SANS }}>
                {u.role === 'TUTEUR'
                  ? `${u._count?.requestsAsTuteur ?? 0} demandes reçues`
                  : u.role === 'ELEVE'
                    ? `${u._count?.requestsAsEleve ?? 0} demandes envoyées`
                    : '—'}
              </div>
            </div>

            {/* Rôle */}
            <div style={{ flexShrink: 0 }}><RoleBadge role={u.role} /></div>

            {/* Actions */}
            {u.id !== currentAdminId && (
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <select
                  value={u.role}
                  onChange={e => changeRole(u.id, e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '9px', border: `1px solid ${C.accent}`, backgroundColor: C.background, fontSize: '0.8rem', fontFamily: SANS, color: C.text, cursor: 'pointer', outline: 'none' }}>
                  <option value="ELEVE">Élève</option>
                  <option value="TUTEUR">Tuteur</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <motion.button onClick={() => setConfirm(u)} whileTap={{ scale: 0.93 }}
                  style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1px solid #FEE2E2', backgroundColor: '#FFF5F5', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <Trash2 size={15} color="#DC2626" />
                </motion.button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination page={page} total={total} limit={15} onPage={setPage} />
    </div>
  );
};

// ─── Section : Demandes ────────────────────────────────────────────────────────
const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search)       params.set('q', search);
    if (statusFilter) params.set('status', statusFilter);
    api.get(`/admin/requests?${params}`)
      .then(data => { setRequests(data.requests || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filtres */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} color={C.light} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher matière, élève ou tuteur…"
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '12px', border: `1.5px solid ${C.border}`, backgroundColor: C.surface, fontSize: '0.9rem', fontFamily: SANS, color: C.text, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        {[
          { v: '',           l: 'Toutes' },
          { v: 'EN_ATTENTE', l: 'En attente' },
          { v: 'CONFIRMEE',  l: 'Confirmées' },
          { v: 'REFUSEE',    l: 'Refusées' },
        ].map(({ v, l }) => (
          <button key={v} onClick={() => setStatusFilter(v)}
            style={{ padding: '9px 16px', borderRadius: '10px', border: `1.5px solid ${statusFilter === v ? C.primary : C.accent}`, backgroundColor: statusFilter === v ? C.accent : 'transparent', color: statusFilter === v ? C.primary : C.muted, fontWeight: statusFilter === v ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer', fontFamily: SANS }}>
            {l}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.accent}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.light, fontFamily: SANS }}>Chargement…</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.light, fontFamily: SANS }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
            Aucune demande trouvée.
          </div>
        ) : requests.map((r, i) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < requests.length - 1 ? `1px solid ${C.accent}` : 'none', flexWrap: 'wrap' }}>
            {/* Élève → Tuteur */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: '0.9rem', fontFamily: SANS }}>
                {r.eleve ? `${r.eleve.prenom} ${r.eleve.nom}` : '—'}
                <span style={{ color: C.light, fontWeight: 400, margin: '0 6px' }}>→</span>
                {r.tuteur ? `${r.tuteur.prenom} ${r.tuteur.nom}` : '—'}
              </div>
              <div style={{ fontSize: '0.8rem', color: C.light, fontFamily: SANS, marginTop: '2px' }}>
                {r.matiere} · {r.duree || '—'} · {fmtDate(r.createdAt)}
              </div>
            </div>
            {r.tarif && (
              <div style={{ fontWeight: 700, color: C.primary, fontFamily: SERIF, fontSize: '0.93rem', flexShrink: 0 }}>
                {Number(r.tarif).toLocaleString('fr-FR')} FCFA
              </div>
            )}
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>

      <Pagination page={page} total={total} limit={15} onPage={setPage} />
    </div>
  );
};

// ─── Helpers slug ─────────────────────────────────────────────────────────────
const slugify = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const CATEGORIES = [
  { id: 'conseils',    label: 'Conseils scolaires'    },
  { id: 'bac',         label: 'BAC & Examens'          },
  { id: 'orientation', label: 'Orientation'            },
  { id: 'numerique',   label: 'Numérique & Éducation'  },
  { id: 'succes',      label: 'Témoignages'            },
];

const EMPTY_FORM = { titre: '', slug: '', extrait: '', contenu: '', categorie: 'conseils', coverUrl: '', publie: false };

// ─── Section : Blog ───────────────────────────────────────────────────────────
const AdminBlog = () => {
  const [articles, setArticles] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState('');
  const [confirm, setConfirm] = useState(null);
  const [formErr, setFormErr] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/admin/articles?page=${page}&limit=15`)
      .then(data => { setArticles(data.articles || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY_FORM); setFormErr(''); setCreating(true); setEditing(null); };
  const openEdit   = (a) => { setForm({ titre: a.titre, slug: a.slug, extrait: a.extrait || '', contenu: a.contenu, categorie: a.categorie, coverUrl: a.coverUrl || '', publie: a.publie }); setFormErr(''); setEditing(a); setCreating(false); };
  const closeForm  = () => { setCreating(false); setEditing(null); };

  // Auto-génère le slug depuis le titre uniquement à la création (pas en édition
  // pour éviter de casser les liens existants si le titre est retouché).
  const handleTitre = (v) => {
    setF('titre', v);
    if (!editing) setF('slug', slugify(v));
  };

  const save = async () => {
    if (!form.titre.trim() || !form.contenu.trim()) { setFormErr('Le titre et le contenu sont obligatoires.'); return; }
    setSaving(true); setFormErr('');
    const body = { ...form, publie: Boolean(form.publie) };
    const res = editing
      ? await api.put(`/admin/articles/${editing.id}`, body)
      : await api.post('/admin/articles', body);
    setSaving(false);
    if (res.error) { setFormErr(res.error); return; }
    showToast(editing ? 'Article mis à jour !' : 'Article créé !');
    closeForm();
    load();
  };

  const togglePublish = async (a) => {
    const res = await api.put(`/admin/articles/${a.id}`, { publie: !a.publie });
    if (!res.error) {
      setArticles(prev => prev.map(x => x.id === a.id ? { ...x, publie: !a.publie } : x));
      showToast(a.publie ? 'Article dépublié' : 'Article publié !');
    }
  };

  const deleteArticle = async (id) => {
    await api.delete(`/admin/articles/${id}`);
    setArticles(prev => prev.filter(a => a.id !== id));
    setTotal(t => t - 1);
    showToast('Article supprimé');
    setConfirm(null);
  };

  const formView = creating || editing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {confirm && (
        <ConfirmModal
          message={`Supprimer définitivement "${confirm.titre}" ?`}
          onConfirm={() => deleteArticle(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: '#DCFCE7', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '12px 18px', color: '#166534', fontWeight: 600, fontSize: '0.9rem', fontFamily: SANS }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontFamily: SANS, fontSize: '0.88rem', color: C.light }}>{total} article{total > 1 ? 's' : ''} au total</span>
        </div>
        {!formView && (
          <motion.button onClick={openCreate} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', backgroundColor: C.primary, color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: SANS }}>
            <Plus size={16} /> Nouvel article
          </motion.button>
        )}
      </div>

      {/* Formulaire create/edit */}
      <AnimatePresence>
        {formView && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1.5px solid ${C.primary}`, padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: SERIF, fontSize: '1.15rem', color: C.text, margin: 0 }}>
                {editing ? "Modifier l'article" : 'Nouvel article'}
              </h3>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.light }}><X size={20} /></button>
            </div>

            {/* Titre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Titre *</label>
              <input value={form.titre} onChange={e => handleTitre(e.target.value)}
                placeholder="Ex : 5 astuces pour réussir le BAC de maths"
                style={{ padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '0.95rem', fontFamily: SANS, color: C.text, outline: 'none', boxSizing: 'border-box', width: '100%' }} />
            </div>

            {/* Slug */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Slug (URL)</label>
              <input value={form.slug} onChange={e => setF('slug', e.target.value)}
                placeholder="genere-automatiquement"
                style={{ padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '0.88rem', fontFamily: 'monospace', color: C.muted, outline: 'none', boxSizing: 'border-box', width: '100%' }} />
            </div>

            {/* Catégorie */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Catégorie *</label>
              <select value={form.categorie} onChange={e => setF('categorie', e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '0.95rem', fontFamily: SANS, color: C.text, outline: 'none', backgroundColor: C.surface, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            {/* Extrait */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Extrait (résumé court)</label>
              <textarea value={form.extrait} onChange={e => setF('extrait', e.target.value)} rows={2}
                placeholder="Un court résumé visible dans la liste d'articles…"
                style={{ padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '0.9rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.55, boxSizing: 'border-box', width: '100%' }} />
            </div>

            {/* Contenu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>Contenu * <span style={{ color: C.light, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(texte libre, sauts de ligne respectés)</span></label>
              <textarea value={form.contenu} onChange={e => setF('contenu', e.target.value)} rows={10}
                placeholder="Rédigez votre article ici…"
                style={{ padding: '12px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '0.93rem', fontFamily: SANS, color: C.text, outline: 'none', resize: 'vertical', lineHeight: 1.65, boxSizing: 'border-box', width: '100%' }} />
            </div>

            {/* Cover URL */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: C.light, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: SANS }}>URL de l'image de couverture (optionnel)</label>
              <input value={form.coverUrl} onChange={e => setF('coverUrl', e.target.value)}
                placeholder="https://…"
                style={{ padding: '10px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '0.9rem', fontFamily: SANS, color: C.text, outline: 'none', boxSizing: 'border-box', width: '100%' }} />
            </div>

            {/* Publié */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', fontFamily: SANS, fontSize: '0.93rem', fontWeight: 600, color: C.text }}>
              <div onClick={() => setF('publie', !form.publie)}
                style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: form.publie ? C.primary : C.border, position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: '2px', left: form.publie ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
              {form.publie ? 'Publié (visible sur le blog)' : 'Brouillon (non visible)'}
            </label>

            {formErr && <p style={{ color: '#DC2626', fontSize: '0.85rem', margin: 0, fontFamily: SANS }}>{formErr}</p>}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={closeForm} style={{ padding: '10px 20px', borderRadius: '12px', border: `1.5px solid ${C.accent}`, background: 'transparent', color: C.muted, fontWeight: 600, cursor: 'pointer', fontFamily: SANS }}>
                Annuler
              </button>
              <motion.button onClick={save} disabled={saving} whileTap={{ scale: 0.97 }}
                style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: saving ? C.muted : C.primary, color: '#fff', fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: SANS }}>
                {saving ? 'Enregistrement…' : editing ? 'Mettre à jour' : "Créer l'article"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      <div style={{ backgroundColor: C.surface, borderRadius: '20px', border: `1px solid ${C.accent}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.light, fontFamily: SANS }}>Chargement…</div>
        ) : articles.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: C.light, fontFamily: SANS }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✍️</div>
            Aucun article. Créez le premier !
          </div>
        ) : articles.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < articles.length - 1 ? `1px solid ${C.accent}` : 'none', flexWrap: 'wrap' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: C.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <FileText size={18} color={C.primary} />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={{ fontWeight: 700, color: C.text, fontSize: '0.92rem', fontFamily: SANS }}>{a.titre}</div>
              <div style={{ fontSize: '0.78rem', color: C.light, fontFamily: SANS, marginTop: '2px' }}>
                {fmtDate(a.createdAt)} · {a.auteur ? `${a.auteur.prenom} ${a.auteur.nom}` : '—'}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', backgroundColor: a.publie ? '#DCFCE7' : '#F3F4F6', color: a.publie ? '#166534' : C.light, fontFamily: SANS, flexShrink: 0 }}>
              {a.publie ? '✓ Publié' : '○ Brouillon'}
            </span>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <motion.button onClick={() => togglePublish(a)} whileTap={{ scale: 0.93 }} title={a.publie ? 'Dépublier' : 'Publier'}
                style={{ width: '34px', height: '34px', borderRadius: '9px', border: `1px solid ${C.accent}`, backgroundColor: C.background, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                {a.publie ? <EyeOff size={15} color={C.muted} /> : <Eye size={15} color={C.primary} />}
              </motion.button>
              <motion.button onClick={() => openEdit(a)} whileTap={{ scale: 0.93 }} title="Modifier"
                style={{ width: '34px', height: '34px', borderRadius: '9px', border: `1px solid ${C.accent}`, backgroundColor: C.background, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <PenLine size={15} color={C.muted} />
              </motion.button>
              <motion.button onClick={() => setConfirm(a)} whileTap={{ scale: 0.93 }} title="Supprimer"
                style={{ width: '34px', height: '34px', borderRadius: '9px', border: '1px solid #FEE2E2', backgroundColor: '#FFF5F5', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <Trash2 size={15} color="#DC2626" />
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} total={total} limit={15} onPage={setPage} />
    </div>
  );
};

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function AdminPage({ currentUser, onGoHome, onLogout }) {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [stats, setStats]       = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = useCallback(() => {
    setLoadingStats(true);
    api.get('/admin/stats')
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const navItems = [
    { id: 'dashboard', icon: TrendingUp, label: 'Tableau de bord' },
    { id: 'users',     icon: Users,      label: 'Utilisateurs'   },
    { id: 'requests',  icon: BookOpen,   label: 'Demandes'       },
    { id: 'blog',      icon: PenLine,    label: 'Blog'           },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.background, display: 'flex', fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap'); *, *::before, *::after { box-sizing: border-box; }`}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: '256px', flexShrink: 0, backgroundColor: C.surface, borderRight: `1px solid ${C.accent}`, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 16px', overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px', marginBottom: '8px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '12px', backgroundColor: '#991B1B', display: 'grid', placeItems: 'center' }}>
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: '1.05rem', fontWeight: 900, color: C.text, lineHeight: 1 }}>e-Tutorat</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '2px', color: '#991B1B', textTransform: 'uppercase' }}>Admin</div>
          </div>
        </div>

        {/* Profil admin */}
        <div style={{ padding: '12px 14px', backgroundColor: '#FEE2E2', borderRadius: '14px', marginBottom: '24px' }}>
          <div style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.88rem', fontFamily: SANS }}>{currentUser.prenom} {currentUser.nom}</div>
          <div style={{ fontSize: '0.75rem', color: '#B91C1C', fontFamily: SANS }}>Administrateur</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <NavItem key={item.id} icon={item.icon} label={item.label} active={activeNav === item.id} onClick={() => setActiveNav(item.id)} />
          ))}
        </nav>

        <div style={{ borderTop: `1px solid ${C.accent}`, paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem icon={Home}   label="Retour à l'accueil" onClick={onGoHome} />
          <NavItem icon={LogOut} label="Déconnexion"        onClick={onLogout} />
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{ backgroundColor: C.surface, borderBottom: `1px solid ${C.accent}`, padding: '0 32px', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ fontFamily: SERIF, fontSize: '1.4rem', color: C.text, margin: 0, fontWeight: 700 }}>
              {navItems.find(n => n.id === activeNav)?.label}
            </h1>
            <p style={{ color: C.light, fontSize: '0.82rem', margin: 0 }}>
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '4px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, fontFamily: SANS }}>
              🛡️ Admin
            </div>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: C.text }}>{currentUser.prenom}</span>
          </div>
        </header>

        {/* Contenu */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
              {activeNav === 'dashboard' && <AdminDashboard stats={stats} onRefresh={fetchStats} loading={loadingStats} />}
              {activeNav === 'users'     && <AdminUsers currentAdminId={currentUser.id} />}
              {activeNav === 'requests'  && <AdminRequests />}
              {activeNav === 'blog'      && <AdminBlog />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
