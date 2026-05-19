// Gestionnaire de push SSE (Server-Sent Events) en mémoire.
// Chaque utilisateur connecté possède un Set de réponses HTTP ouvertes.
// Un même userId peut avoir plusieurs onglets/appareils connectés simultanément.
// Cette map est perdue au redémarrage du serveur — acceptable car SSE est transitoire.

// map userId (string) → Set<Express Response>
const clients = new Map();

// Enregistre une connexion SSE et retourne une fonction de nettoyage.
// La route SSE appelle unregister() quand le client ferme la connexion (req 'close').
function register(userId, res) {
  const key = String(userId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
  return () => {
    clients.get(key)?.delete(res);
    // Supprimer la clé quand plus aucun onglet n'est connecté pour éviter les fuites mémoire
    if (!clients.get(key)?.size) clients.delete(key);
  };
}

// Envoie une notification en temps réel à tous les onglets connectés d'un utilisateur.
// Si l'utilisateur n'est pas connecté, le push est silencieusement ignoré (pas d'erreur).
function push(userId, notif) {
  const key = String(userId);
  const set = clients.get(key);
  if (!set?.size) return;
  const payload = `event: notification\ndata: ${JSON.stringify(notif)}\n\n`;
  for (const res of set) {
    try { res.write(payload); } catch { /* client déconnecté entre-temps */ }
  }
}

module.exports = { register, push };
