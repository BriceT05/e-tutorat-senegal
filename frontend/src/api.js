const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('etutorat_token')
    ? { Authorization: `Bearer ${localStorage.getItem('etutorat_token')}` }
    : {}),
});

const req = async (method, path, body) => {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: authHeaders(),
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // Erreur réseau : CORS, serveur éteint, pas de connexion
    return { error: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
  }

  try {
    return await res.json();
  } catch {
    // Réponse non-JSON (HTML 503 Render, etc.)
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
