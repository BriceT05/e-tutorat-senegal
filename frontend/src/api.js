// VITE_API_URL est remplacé au moment du build (pas au runtime)
// Doit être défini dans Vercel → Settings → Environment Variables
const _url = import.meta.env.VITE_API_URL;
const BASE = (_url && _url.trim()) ? _url.trim() : 'http://localhost:3001/api';

// Avertissement explicite si localhost utilisé en production
if (import.meta.env.PROD && BASE.includes('localhost')) {
  console.error(
    '[e-Tutorat] ⚠️ VITE_API_URL non défini — les appels API pointent vers localhost !\n' +
    'Ajouter VITE_API_URL=https://e-tutorat-senegal.onrender.com/api dans Vercel → Settings → Environment Variables'
  );
}

// Log de l'URL effective (dev uniquement)
if (import.meta.env.DEV) {
  console.log('[api] BASE =', BASE);
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('etutorat_token')
    ? { Authorization: `Bearer ${localStorage.getItem('etutorat_token')}` }
    : {}),
});

const req = async (method, path, body) => {
  const url = `${BASE}${path}`;

  // Log en dev pour traçabilité
  if (import.meta.env.DEV) {
    console.log(`[api] ${method} ${url}`);
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: authHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // Erreur réseau : CORS, serveur éteint, pas de connexion
    return { error: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
  }

  if (!res.ok && res.status === 405) {
    console.error(`[api] 405 Method Not Allowed → ${method} ${url}`);
    return { error: 'Erreur de configuration serveur (405). Contactez le support.' };
  }

  try {
    return await res.json();
  } catch {
    // Réponse non-JSON (HTML 503 Render cold start, etc.)
    return { error: `Erreur serveur (${res.status}). Réessayez dans quelques instants.` };
  }
};

const api = {
  get:    path        => req('GET',    path),
  post:   (path, b)   => req('POST',   path, b),
  put:    (path, b)   => req('PUT',    path, b),
  patch:  (path, b)   => req('PATCH',  path, b),
  delete: path        => req('DELETE', path),
};

export default api;
