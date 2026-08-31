"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  addMember,
  createBoard,
  getBoards,
  getOrganization,
  removeMember,
} from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

type Member = { id: string; username: string };
type Board = { _id: string; title: string };

export default function OrganizationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [orgTitle, setOrgTitle] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [orgError, setOrgError] = useState<string | null>(null);

  const [memberUsername, setMemberUsername] = useState("");
  const [memberError, setMemberError] = useState<string | null>(null);

  const [boardTitle, setBoardTitle] = useState("");
  const [boardError, setBoardError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/signin");
      return;
    }
    loadOrg();
    loadBoards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadOrg() {
    try {
      const { organization } = await getOrganization(id);
      setOrgTitle(organization.title);
      setMembers(organization.members);
      setOrgError(null);
    } catch (err) {
      // Backend only returns org details to the admin right now, so members
      // of the org will hit a 411 here. Boards still load independently.
      setOrgError(
        err instanceof Error
          ? `Couldn't load full org details (${err.message}). You may not be the admin.`
          : "Couldn't load org details"
      );
    }
  }

  async function loadBoards() {
    try {
      const { allboards } = await getBoards(id);
      setBoards(allboards ? [].concat(allboards as any) : []);
    } catch {
      setBoards([]);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setMemberError(null);
    try {
      await addMember(id, memberUsername);
      setMemberUsername("");
      loadOrg();
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : "Could not add member");
    }
  }

  async function handleRemoveMember(username: string) {
    try {
      await removeMember(id, username);
      loadOrg();
    } catch (err) {
      setMemberError(err instanceof Error ? err.message : "Could not remove member");
    }
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    setBoardError(null);
    try {
      await createBoard(boardTitle, id);
      setBoardTitle("");
      loadBoards();
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : "Could not create board");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">{orgTitle || "Organization"}</h1>
      {orgError && <p className="text-sm text-amber-600 mb-4">{orgError}</p>}

      <section className="mb-10">
        <h2 className="font-medium mb-3">Boards</h2>
        <form onSubmit={handleCreateBoard} className="flex gap-2 mb-4">
          <input
            className="border border-slate-300 rounded px-3 py-2 flex-1"
            placeholder="New board name"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            required
          />
          <button type="submit" className="bg-board text-white rounded px-4 py-2">
            Add board
          </button>
        </form>
        {boardError && <p className="text-sm text-red-600 mb-2">{boardError}</p>}

        {boards.length === 0 ? (
          <p className="text-slate-500 text-sm">No boards yet.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {boards.map((board) => (
              <Link
                key={board._id}
                href={`/board/${board._id}`}
                className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition"
              >
                {board.title}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-medium mb-3">Members</h2>
        <form onSubmit={handleAddMember} className="flex gap-2 mb-4">
          <input
            className="border border-slate-300 rounded px-3 py-2 flex-1"
            placeholder="Username to add"
            value={memberUsername}
            onChange={(e) => setMemberUsername(e.target.value)}
            required
          />
          <button type="submit" className="bg-board text-white rounded px-4 py-2">
            Add member
          </button>
        </form>
        {memberError && <p className="text-sm text-red-600 mb-2">{memberError}</p>}

        {members.length === 0 ? (
          <p className="text-slate-500 text-sm">No members listed.</p>
        ) : (
          <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-4 py-2">
                <span>{m.username}</span>
                <button
                  onClick={() => handleRemoveMember(m.username)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
