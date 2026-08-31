# Trello Clone — Frontend

Next.js (App Router) + TypeScript + Tailwind frontend built against your `in.js` / `models.js` backend.

## Setup

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

Runs on http://localhost:3001 by default if your backend is on :3000 (set `PORT=3001 npm run dev`, or change the backend's port).

## Pages

- `/signup`, `/signin` — auth, JWT stored in localStorage
- `/dashboard` — create organizations, lists orgs you've created
- `/org/[id]` — view/add/remove members, create + list boards
- `/board/[id]` — Kanban board (todo / in progress / done)

## Backend gaps you'll want to fix before this is fully wired up

1. **No "list my organizations" route.** The dashboard currently caches
   orgs you create in localStorage as a workaround. Add something like
   `GET /my-organizations` that returns orgs where `admin === userId` or
   `members` includes `userId`, and swap it into `lib/api.ts` +
   `app/dashboard/page.tsx`.
2. **`GET /organizations` only returns data to the admin.** A member added
   via `add-membertoorganization` currently gets a 411 when visiting their
   own org page. Relax the check to `isMember || isAdmin`.
3. **`GET /members` is dead/broken code** — it references an in-memory
   `org` array (not the Mongo model) and does `organization.members.username`
   which isn't valid. It's unused by this frontend since `GET /organizations`
   already returns members; safe to delete or rewrite.
4. **No `/issue` routes exist yet** (`POST /issue` is commented out in
   `in.js`, absent from routes for GET/PUT). The board page stores issues in
   `localStorage` for now. `lib/api.ts` has `getIssues` / `createIssue` /
   `updateIssue` stubs shaped to match your existing route conventions —
   once you build the backend routes, swap those in for the localStorage
   calls in `app/board/[id]/page.tsx`.
5. **`package.json` has `"mongoose": "^9.9.3"`** — that major version
   doesn't exist (latest is 8.x as of writing); `npm install` on the backend
   will fail on this. Pin to a real version, e.g. `^8.6.0`.
6. **`index.js`** (the in-memory draft) has several bugs if you ever go back
   to it: `description=req.body.description` (assignment, not `:`, inside an
   object literal — syntax error), and several handlers reference `organization`
   /`org`/`userid` inconsistently (wrong case, undefined vars). `in.js` is the
   one this frontend targets and doesn't have these issues.
