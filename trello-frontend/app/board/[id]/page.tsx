"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

// The backend has no /issue routes yet (see index.js / in.js — the POST
// /issue handler is empty or commented out, and there's no GET/PUT for
// issues). Until those exist, issues live in localStorage keyed by board id
// so the Kanban UI is fully functional to build/demo against. lib/api.ts
// already has getIssues/createIssue/updateIssue stubs shaped to match the
// rest of the API — swap the local calls below for those once the backend
// routes are live.

type Status = "todo" | "in_progress" | "done";
type Issue = { id: string; title: string; status: Status };

const COLUMNS: { key: Status; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const storageKey = `trello_issues_${id}`;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }
    const raw = localStorage.getItem(storageKey);
    setIssues(raw ? JSON.parse(raw) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function persist(next: Issue[]) {
    setIssues(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const newIssue: Issue = { id: crypto.randomUUID(), title, status: "todo" };
    persist([...issues, newIssue]);
    setTitle("");
  }

  function moveIssue(issueId: string, status: Status) {
    persist(issues.map((i) => (i.id === issueId ? { ...i, status } : i)));
  }

  function removeIssue(issueId: string) {
    persist(issues.filter((i) => i.id !== issueId));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Board</h1>
      <p className="text-xs text-amber-600 mb-6">
        Issues are stored locally in this browser — wire up the backend
        /issue routes and swap in lib/api.ts's getIssues/createIssue/updateIssue
        to persist these for real.
      </p>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          className="border border-slate-300 rounded px-3 py-2 flex-1"
          placeholder="New issue title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit" className="bg-board text-white rounded px-4 py-2">
          Add issue
        </button>
      </form>

      <div className="grid sm:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.key} className="bg-white border border-slate-200 rounded-lg p-3">
            <h2 className="font-medium text-sm text-slate-600 mb-3">{col.label}</h2>
            <div className="space-y-2">
              {issues
                .filter((i) => i.status === col.key)
                .map((issue) => (
                  <div
                    key={issue.id}
                    className="border border-slate-200 rounded p-2 text-sm bg-slate-50"
                  >
                    <p className="mb-2">{issue.title}</p>
                    <div className="flex gap-2 flex-wrap">
                      {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => moveIssue(issue.id, c.key)}
                          className="text-xs text-board underline"
                        >
                          Move to {c.label}
                        </button>
                      ))}
                      <button
                        onClick={() => removeIssue(issue.id)}
                        className="text-xs text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
