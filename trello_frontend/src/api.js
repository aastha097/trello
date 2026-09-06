const API_BASE = 'http://localhost:3000'

export function getToken() {
  return localStorage.getItem('dispatch_token')
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (auth && token) headers.token = token

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let data = {}
  try {
    data = await res.json()
  } catch (_) {
    // some error responses are plain HTML, not JSON
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  signup: (username, password) =>
    request('/signup', { method: 'POST', body: { username, password }, auth: false }),
  signin: (username, password) =>
    request('/signin', { method: 'POST', body: { username, password }, auth: false }),

  createOrg: (title, description) =>
    request('/organization', { method: 'POST', body: { title, description } }),
  getOrg: (organizationId) =>
    request(`/organization?organizationId=${organizationId}`),

  addMember: (organizationId, memberusername) =>
    request('/add-member-to-organization', {
      method: 'POST',
      body: { organizationId, memberusername },
    }),
  removeMember: (organizationId, memberusername) =>
    request('/members', { method: 'DELETE', body: { organizationId, memberusername } }),

  createBoard: (title, organizationId) =>
    request('/board', { method: 'POST', body: { title, organizationId } }),
  getBoards: (organizationId) =>
    request(`/boards?organizationId=${organizationId}`),

  createIssue: (payload) => request('/issue', { method: 'POST', body: payload }),
  getIssues: (boardId) => request(`/issues?boardId=${boardId}`),
  updateIssue: (payload) => request('/issues', { method: 'PUT', body: payload }),
}
