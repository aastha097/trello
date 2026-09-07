import { useState } from 'react'

export default function OrgView({ org, boards, onOpenBoard, onCreateBoard, onAddMember, onRemoveMember }) {
  const [addName, setAddName] = useState('')
  const [removeName, setRemoveName] = useState('')
  const [newBoard, setNewBoard] = useState('')

  return (
    <div className="org-view">
      <header className="sheet-header">
        <div className="sheet-eyebrow">ORG · {org.id}</div>
        <h2>{org.title}</h2>
        <p className="sheet-desc">{org.description || 'No description on file.'}</p>
      </header>

      <section className="panel">
        <div className="panel-title">
          MEMBERS <span>{org.members.length}</span>
        </div>
        <div className="member-grid">
          {org.members.length === 0 && <div className="rail-empty">no members yet</div>}
          {org.members.map((m) => (
            <div className="member-chip" key={m.id}>
              {m.username}
            </div>
          ))}
        </div>
        <div className="panel-forms">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (addName.trim()) {
                onAddMember(addName.trim())
                setAddName('')
              }
            }}
          >
            <input placeholder="username to add" value={addName} onChange={(e) => setAddName(e.target.value)} />
            <button className="btn small primary" type="submit">
              Add
            </button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (removeName.trim()) {
                onRemoveMember(removeName.trim())
                setRemoveName('')
              }
            }}
          >
            <input
              placeholder="username to remove"
              value={removeName}
              onChange={(e) => setRemoveName(e.target.value)}
            />
            <button className="btn small danger" type="submit">
              Remove
            </button>
          </form>
        </div>
        <p className="panel-note">
          Only the organization&rsquo;s admin can add or remove members — the server enforces this even though
          the form is shown to everyone here.
        </p>
      </section>

      <section>
        <div className="panel-title" style={{ marginBottom: 14 }}>
          BOARDS
        </div>
        <div className="board-grid">
          {boards.map((b) => (
            <button className="board-card" key={b._id} onClick={() => onOpenBoard(b)}>
              <span className="board-card-title">{b.title}</span>
              <span className="board-card-open">open →</span>
            </button>
          ))}
          <form
            className="board-card new"
            onSubmit={(e) => {
              e.preventDefault()
              if (newBoard.trim()) {
                onCreateBoard(newBoard.trim())
                setNewBoard('')
              }
            }}
          >
            <input placeholder="New board title" value={newBoard} onChange={(e) => setNewBoard(e.target.value)} />
            <button className="btn small" type="submit">
              Create
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
