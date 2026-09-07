# Dispatch — Kanban-Style Work Order Tracker

A Trello-style issue tracker: organizations → boards → work orders (TODO / IN_PROGRESS / DONE). Node/Express/MongoDB API on the backend, a React (Vite) frontend styled as a drafting sheet on the front.

```
dispatch/
├── backend/
│ ├── index.js – routes, auth middleware, server entry
│ ├── models.js – Mongoose schemas + DB connection
│ ├── package.json
│ └── .env – JWT_SECRET (you create this)
└── frontend/
 ├── index.html
 ├── vite.config.js – pinned to port 3001
 ├── package.json
 └── src/
 ├── main.jsx
 ├── App.jsx – top-level state & view routing
 ├── api.js – fetch wrapper for every backend route
 ├── styles.css – design system (CSS variables at top)
 └── components/
 ├── AuthScreen.jsx
 ├── Sidebar.jsx
 ├── OrgView.jsx
 ├── BoardView.jsx
 ├── WorkOrderCard.jsx
 ├── TitleBlock.jsx
 └── Toast.jsx
```

## Prerequisites

- Node.js 18+
- npm
- MongoDB running locally on the default port (`mongodb://localhost:27017`)

## 1. Backend setup

```bash
cd backend
npm install express mongoose jsonwebtoken cors bcrypt dotenv
```

Create a `.env` file in `backend/`:

```
JWT_SECRET=replace_with_any_long_random_string
```

Make sure MongoDB is running (`mongod`, or your usual local setup — it connects to the `trelloapp` database automatically), then start the API:

```bash
node index.js
```

The server listens on **http://localhost:3000**.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3001** — pinned on purpose in `vite.config.js`, because the backend's CORS is locked to that exact origin:

```js
app.use(cors({ origin: 'http://localhost:3001', credentials: true }))
```

If you ever change one port, change the other to match.

## Run order

1. Start MongoDB
2. `node index.js` (backend, port 3000)
3. `npm run dev` in `frontend/` (port 3001)
4. Open http://localhost:3001, register a user, sign in

## API reference

| Method | Route | Auth | Body / Query |
|--------|---------------------------------|------|-------------------------------------------------|
| POST | `/signup` | – | `username`, `password` |
| POST | `/signin` | – | `username`, `password` → returns `token` |
| POST | `/organization` | ✔ | `title`, `description` |
| GET | `/organization?organizationId=` | ✔ | member or admin only |
| POST | `/add-member-to-organization` | ✔ admin | `organizationId`, `memberusername` |
| DELETE | `/members` | ✔ admin | `organizationId`, `memberusername` |
| GET | `/members?organizationId=` | ✔ admin | — |
| POST | `/board` | ✔ member/admin | `title`, `organizationId` |
| GET | `/boards?organizationId=` | ✔ member/admin | — |
| POST | `/issue` | ✔ member/admin | `title`, `description`, `boardId`, `assignedTo` |
| GET | `/issues?boardId=` | ✔ member/admin | — |
| PUT | `/issues` | ✔ member/admin | `issueId` + any of `title`, `description`, `status`, `assignedTo` |

`✔` routes need a `token` header (returned from `/signin`).

## Known limitation

There's no "list my organizations" endpoint — only `GET /organization?organizationId=X` for one org at a time. The frontend works around this by remembering org IDs you've created or manually added via "track by ID" in the sidebar (stored in `localStorage`). To fix properly, add:

```js
app.get("/organizations", middleware, async (req, res) => {
  const orgs = await organizationmodel.find({ $or: [{ admin: req.userId }, { members: req.userId }] })
  res.json({ organizations: orgs })
})
```

## Notes

- Admin-only actions (add/remove member) are shown to every org member in the UI — the server is the real gatekeeper (returns `411` if you're not admin), so there's no client-side identity check to get out of sync.
- Passwords are hashed with bcrypt; auth uses a JWT signed with `JWT_SECRET`, sent back on every authenticated request via a `token` header.
