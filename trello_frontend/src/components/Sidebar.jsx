import { useState } from 'react'

export default function Sidebar({
  orgs,
  currentOrgId,
  boards,
  currentBoardId,
  username,
  onOpenOrg,
  onCreateOrg,
  onTrackOrg,
  onOpenBoard,
  onCreateBoard,
  onSignOut,
}) {
  const [showNewOrg, setShowNewOrg] = useState(false)
  const [newOrgTitle, setNewOrgTitle] = useState('')
  const [newOrgDesc, setNewOrgDesc] = useState('')
  const [showTrack, setShowTrack] = useState(false)
  const [trackId, setTrackId] = useState('')
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')

  function submitNewOrg(e) {
    e.preventDefault()
    if (!newOrgTitle.trim()) return
    onCreateOrg(newOrgTitle.trim(), newOrgDesc.trim())
    setNewOrgTitle('')
    setNewOrgDesc('')
    setShowNewOrg(false)
  }

  function submitTrack(e) {
    e.preventDefault()
    if (!trackId.trim()) return
    onTrackOrg(trackId.trim())
    setTrackId('')
    setShowTrack(false)
  }

  function submitNewBoard(e) {
    e.preventDefault()
    if (!newBoardTitle.trim()) return
    onCreateBoard(newBoardTitle.trim())
    setNewBoardTitle('')
    setShowNewBoard(false)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">▚</span>
        <div>
          <div className="brand-name">DISPATCH</div>
          <div className="brand-sub">project index</div>
        </div>
      </div>

      <div className="rail-block">
        <div className="rail-head">
          <span>ORGANIZATIONS</span>
          <button className="mini-btn" onClick={() => setShowNewOrg((s) => !s)} aria-label="New organization">
            +
          </button>
        </div>

        {showNewOrg && (
          <form className="inline-create" onSubmit={submitNewOrg}>
            <input placeholder="Title" value={newOrgTitle} onChange={(e) => setNewOrgTitle(e.target.value)} autoFocus />
            <input
              placeholder="Description (optional)"
              value={newOrgDesc}
              onChange={(e) => setNewOrgDesc(e.target.value)}
            />
            <button className="btn small primary" type="submit">
              Create
            </button>
          </form>
        )}

        <ul className="rail-list">
          {orgs.length === 0 && <li className="rail-empty">none yet</li>}
          {orgs.map((o) => (
            <li key={o.id} className={o.id === currentOrgId ? 'active' : ''} onClick={() => onOpenOrg(o.id)}>
              {o.title}
            </li>
          ))}
        </ul>

        {!showTrack && (
          <button className="text-link" onClick={() => setShowTrack(true)}>
            track by ID →
          </button>
        )}
        {showTrack && (
          <form className="inline-create" onSubmit={submitTrack}>
            <input placeholder="Organization ID" value={trackId} onChange={(e) => setTrackId(e.target.value)} autoFocus />
            <button className="btn small" type="submit">
              Track
            </button>
          </form>
        )}
      </div>

      {currentOrgId && (
        <div className="rail-block">
          <div className="rail-head">
            <span>BOARDS</span>
            <button className="mini-btn" onClick={() => setShowNewBoard((s) => !s)} aria-label="New board">
              +
            </button>
          </div>

          {showNewBoard && (
            <form className="inline-create" onSubmit={submitNewBoard}>
              <input
                placeholder="Board title"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                autoFocus
              />
              <button className="btn small primary" type="submit">
                Create
              </button>
            </form>
          )}

          <ul className="rail-list">
            {boards.length === 0 && <li className="rail-empty">none yet</li>}
            {boards.map((b) => (
              <li key={b._id} className={b._id === currentBoardId ? 'active' : ''} onClick={() => onOpenBoard(b)}>
                {b.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rail-footer">
        <div className="who">
          signed in as <b>{username}</b>
        </div>
        <button className="text-link" onClick={onSignOut}>
          sign out
        </button>
      </div>
    </aside>
  )
}
