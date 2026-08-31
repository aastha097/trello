"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrganization } from "@/lib/api";
import { addCachedOrg, getCachedOrgs, isAuthenticated, CachedOrg } from "@/lib/auth";

export default function DashboardPage() {
  const [orgs, setOrgs] = useState<CachedOrg[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }
    setOrgs(getCachedOrgs());
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const { id } = await createOrganization(title, description);
      const newOrg = { id, title };
      addCachedOrg(newOrg);
      setOrgs((prev) => [...prev, newOrg]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create organization");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Your organizations</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-8 flex-wrap">
        <input
          className="border border-slate-300 rounded px-3 py-2 flex-1 min-w-[160px]"
          placeholder="Organization name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="border border-slate-300 rounded px-3 py-2 flex-1 min-w-[160px]"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-board text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create org"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {orgs.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No organizations yet — create one above, or if you were added to one by
          someone else, ask them for the organization ID (there's no "list my
          orgs" endpoint on the backend yet).
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/org/${org.id}`}
              className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition"
            >
              <p className="font-medium">{org.title}</p>
              <p className="text-xs text-slate-400 mt-1">{org.id}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
