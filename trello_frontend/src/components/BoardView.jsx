import { useState } from 'react'
import WorkOrderCard from './WorkOrderCard.jsx'

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']
const LABEL = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' }

export default function BoardView({ board, org, issues, onCreateIssue, onAdvance, onReassign }) {
  const [openForm, setOpenForm] = useState(null)

  return (
    <div className="board-view">
      <header className="sheet-header">
        <div className="sheet-eyebrow">{org.title} · SHEET</div>
        <h2>{board.title}</h2>
      </header>

      <div className="lanes">
        {STATUSES.map((status) => {
          const items = issues.filter((i) => (i.status || 'TODO') === status)
          return (
            <div className="lane" key={status}>
              <div className="lane-head">
                <span className={`dot ${status}`} />
                <span className="lane-name">{LABEL[status]}</span>
                <span className="lane-count">{items.length}</span>
              </div>

              <div className="lane-body">
                {items.map((issue) => (
                  <WorkOrderCard
                    key={issue._id}
                    issue={issue}
                    members={org.members}
                    statuses={STATUSES}
                    onAdvance={onAdvance}
                    onReassign={onReassign}
                  />
                ))}
              </div>

              {openForm === status ? (
                <NewIssueForm
                  members={org.members}
                  onCancel={() => setOpenForm(null)}
                  onCreate={(payload) => {
                    onCreateIssue({ ...payload, status })
                    setOpenForm(null)
                  }}
                />
              ) : (
                <button className="lane-add" onClick={() => setOpenForm(status)}>
                  + new work order
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NewIssueForm({ members, onCancel, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({ title: title.trim(), description: description.trim(), assignedTo: assignedTo || undefined })
  }

  return (
    <form className="new-issue" onSubmit={submit}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
        <option value="">unassigned</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.username}
          </option>
        ))}
      </select>
      <div className="row">
        <button className="btn small primary" type="submit">
          Create
        </button>
        <button className="btn small ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
