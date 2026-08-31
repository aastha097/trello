const TOKEN_KEY = "trello_token";
const ORGS_KEY = "trello_my_orgs"; // local cache: backend has no "list my orgs" route yet

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export type CachedOrg = { id: string; title: string };

// Workaround: the backend has no endpoint that lists organizations a user
// belongs to. We cache orgs the user creates (or is told about) locally so
// the dashboard has something to show. Replace this with a real
// `GET /my-organizations` call once that route exists on the backend.
export function getCachedOrgs(): CachedOrg[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ORGS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addCachedOrg(org: CachedOrg) {
  const orgs = getCachedOrgs();
  if (!orgs.find((o) => o.id === org.id)) {
    localStorage.setItem(ORGS_KEY, JSON.stringify([...orgs, org]));
  }
}
