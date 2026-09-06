# Dispatch — frontend for the Trello-style backend

A React (Vite) frontend styled as a drafting sheet: dark blueprint canvas,
work-order cards with corner registration marks, and a title-block footer
(project / sheet / drawn by / date) instead of a generic top nav.

## Run it

```bash
cd dispatch-frontend
npm install
npm run dev
```

This starts on **http://localhost:3001** — pinned in `vite.config.js` on
purpose, because your backend's CORS is locked to that exact origin:

```js
app.use(cors({ origin: 'http://localhost:3001', credentials: true }))
```

Make sure your backend (`node index.js`) is running on port 3000 at the
same time. If you ever change one port, change the other to match.

## Before you run it — two backend fixes worth making

1. **`models.js` typo**: `issueSchema` has `decsription` instead of
   `description`. Because Mongoose schemas are strict by default, every
   issue description you create or edit is silently dropped until this is
   fixed:
   ```js
   const issueSchema = mongoose.Schema({
       title: String,
       description: String, // was "decsription"
       status: String,
       boardId: mongoose.Types.ObjectId,
       createdBy: mongoose.Types.ObjectId,
       assignedTo: mongoose.Types.ObjectId
   })
   ```

2. **No "list my organizations" endpoint.** The backend only has
   `GET /organization?organizationId=X` for one specific org — there's no
   route that lists every org a given user belongs to. The frontend works
   around this by remembering org IDs you've created or manually tracked
   in `localStorage` (see "track by ID" in the sidebar). If you want this
   to work properly for someone added to an org they didn't create, add a
   route like:
   ```js
   app.get("/organizations", middleware, async (req, res) => {
       const orgs = await organizationmodel.find({
           $or: [{ admin: req.userId }, { members: req.userId }]
       })
       res.json({ organizations: orgs })
   })
   ```

## Structure

```
src/
  api.js                  – fetch wrapper for every backend route
  App.jsx                 – top-level state and view routing
  styles.css              – the whole design system (CSS variables at top)
  components/
    AuthScreen.jsx         – sign in / register
    Sidebar.jsx             – organization + board index
    OrgView.jsx             – members ledger + board tiles
    BoardView.jsx           – kanban lanes (TODO / IN_PROGRESS / DONE)
    WorkOrderCard.jsx       – individual issue card
    TitleBlock.jsx          – footer stamp bar
    Toast.jsx               – notification popup
```

Admin-only actions (add/remove member) are shown to every org member in
the UI — the *server* is the real gatekeeper (returns a 411 if you're not
admin), so there's no client-side identity check to get out of sync.
