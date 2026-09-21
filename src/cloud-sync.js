const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
const sessionKey = 'lydia.cloud.session.v1';
const refreshRequests = new Map();

export const cloudSyncConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const authHeaders = (accessToken) => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${accessToken || supabaseAnonKey}`,
  'Content-Type': 'application/json'
});

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.msg || payload.message || payload.error_description || payload.error || '请求失败');
  }
  return payload;
};

export const readCloudSession = () => {
  try {
    return JSON.parse(localStorage.getItem(sessionKey) || 'null');
  } catch {
    return null;
  }
};

export const saveCloudSession = (session) => {
  if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
  else localStorage.removeItem(sessionKey);
};

export async function signInWithPassword(email, password) {
  if (!cloudSyncConfigured) throw new Error('云同步尚未配置');
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  });
  const session = await parseResponse(response);
  saveCloudSession(session);
  return session;
}

export async function signUpWithPassword(email, password) {
  if (!cloudSyncConfigured) throw new Error('云同步尚未配置');
  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  });
  const session = await parseResponse(response);
  if (session.access_token) saveCloudSession(session);
  return session;
}

export async function refreshCloudSession(session) {
  if (!session?.refresh_token || !cloudSyncConfigured) return null;
  if (!refreshRequests.has(session.refresh_token)) {
    const request = (async () => {
      const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      const refreshed = await parseResponse(response);
      saveCloudSession(refreshed);
      return refreshed;
    })().finally(() => refreshRequests.delete(session.refresh_token));
    refreshRequests.set(session.refresh_token, request);
  }
  return refreshRequests.get(session.refresh_token);
}

const validSession = async (session) => {
  if (!session?.access_token) return null;
  const expiresAt = Number(session.expires_at || 0) * 1000;
  if (!expiresAt || expiresAt > Date.now() + 60000) return session;
  return refreshCloudSession(session);
};

export async function loadProgressField(session, field) {
  const activeSession = await validSession(session);
  if (!activeSession?.user?.id) return { session: activeSession, value: undefined };
  const response = await fetch(
    `${supabaseUrl}/rest/v1/user_progress?user_id=eq.${encodeURIComponent(activeSession.user.id)}&select=${encodeURIComponent(field)}`,
    { headers: authHeaders(activeSession.access_token) }
  );
  const rows = await parseResponse(response);
  return { session: activeSession, value: rows[0]?.[field] };
}

export async function saveProgressField(session, field, value) {
  const activeSession = await validSession(session);
  if (!activeSession?.user?.id) return activeSession;
  const userId = activeSession.user.id;
  const createResponse = await fetch(`${supabaseUrl}/rest/v1/user_progress?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      ...authHeaders(activeSession.access_token),
      Prefer: 'resolution=ignore-duplicates,return=minimal'
    },
    body: JSON.stringify({ user_id: userId })
  });
  if (!createResponse.ok) await parseResponse(createResponse);
  const response = await fetch(`${supabaseUrl}/rest/v1/user_progress?user_id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: { ...authHeaders(activeSession.access_token), Prefer: 'return=minimal' },
    body: JSON.stringify({ [field]: value, updated_at: new Date().toISOString() })
  });
  if (!response.ok) await parseResponse(response);
  return activeSession;
}
