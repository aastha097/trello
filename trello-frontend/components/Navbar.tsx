"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, isAuthenticated } from "@/lib/auth";

export default function Navbar() {
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  function handleLogout() {
    clearToken();
    setAuthed(false);
    router.push("/signin");
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={authed ? "/dashboard" : "/signin"} className="font-semibold text-board">
          Trello Clone
        </Link>
        {authed && (
          <button
            onClick={handleLogout}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Log out
          </button>
        )}
      </div>
    </nav>
  );
}
