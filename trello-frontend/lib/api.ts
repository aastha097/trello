import { getToken } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["token"] = token; // backend reads req.headers.token, not Authorization
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data?.message || "Request failed", res.status);
  }
  return data as T;
}

// ---- Auth ----
export const signup = (username: string, password: string) =>
  request<{ id: string; message: string }>("/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const signin = (username: string, password: string) =>
  request<{ token: string }>("/signin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// ---- Organizations ----
export const createOrganization = (title: string, description: string) =>
  request<{ id: string; message: string }>(
    "/organization",
    { method: "POST", body: JSON.stringify({ title, description }) },
    true
  );

export const getOrganization = (organizationid: string) =>
  request<{
    organization: {
      title: string;
      description: string;
      members: { id: string; username: string }[];
    };
  }>(`/organizations?organizationid=${organizationid}`, {}, true);

export const addMember = (organizationid: string, memberUsername: string) =>
  request<{ message: string }>(
    "/add-membertoorganization",
    { method: "POST", body: JSON.stringify({ organizationid, memberUsername }) },
    true
  );

export const removeMember = (organizationid: string, memberUsername: string) =>
  request<{ message: string }>(
    "/members",
    { method: "DELETE", body: JSON.stringify({ organizationid, memberUsername }) },
    true
  );

// ---- Boards ----
export const getBoards = (organizationid: string) =>
  request<{ allboards: { _id: string; title: string; organizationId: string }[] }>(
    `/boards?organizationid=${organizationid}`,
    {},
    true
  );

export const createBoard = (title: string, organizationId: string) =>
  request<{ id: string; message: string }>(
    "/board",
    { method: "POST", body: JSON.stringify({ title, organizationId }) },
    true
  );

// ---- Issues ----
// NOT yet implemented on the backend (no POST/GET /issue routes exist).
// These stubs assume routes shaped like the rest of the API so wiring them
// up later is a drop-in swap for the local-state version used in the UI.
export type Issue = { id: string; title: string; status: "todo" | "in_progress" | "done"; boardId: string };

export const getIssues = (_boardId: string) =>
  request<{ issues: Issue[] }>(`/issues?boardId=${_boardId}`, {}, true);

export const createIssue = (title: string, boardId: string) =>
  request<{ id: string; message: string }>(
    "/issue",
    { method: "POST", body: JSON.stringify({ title, boardId }) },
    true
  );

export const updateIssue = (id: string, status: Issue["status"]) =>
  request<{ message: string }>(
    "/issues",
    { method: "PUT", body: JSON.stringify({ id, status }) },
    true
  );
