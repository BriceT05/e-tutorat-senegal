const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('etutorat_token')
    ? { Authorization: `Bearer ${localStorage.getItem('etutorat_token')}` }
    : {}),
});

const req = (method, path, body) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const api = {
  get:    path        => req('GET',    path),
  post:   (path, b)   => req('POST',   path, b),
  put:    (path, b)   => req('PUT',    path, b),
  patch:  (path, b)   => req('PATCH',  path, b),
  delete: path        => req('DELETE', path),
};

export default api;
