// SSE push manager — map userId → Set<res>
const clients = new Map();

function register(userId, res) {
  const key = String(userId);
  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);
  return () => {
    clients.get(key)?.delete(res);
    if (!clients.get(key)?.size) clients.delete(key);
  };
}

// Push a notification object to all connected SSE clients for a user
function push(userId, notif) {
  const key = String(userId);
  const set = clients.get(key);
  if (!set?.size) return;
  const payload = `event: notification\ndata: ${JSON.stringify(notif)}\n\n`;
  for (const res of set) {
    try { res.write(payload); } catch { /* client disconnected */ }
  }
}

module.exports = { register, push };
