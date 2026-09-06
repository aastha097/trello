export default function WorkOrderCard({ issue, members, statuses, onAdvance, onReassign }) {
  const status = issue.status || 'TODO'
  const idx = statuses.indexOf(status)
  const next = statuses[idx + 1]

  return (
    <div className="work-order">
      <span className="reg-mark tl" />
      <span className="reg-mark tr" />
      <span className="reg-mark bl" />
      <span className="reg-mark br" />

      <div className="wo-top">
        <span className={`chip ${status}`}>{status.replace('_', ' ')}</span>
      </div>
      <div className="wo-title">{issue.title}</div>
      {issue.description && <div className="wo-desc">{issue.description}</div>}

      <div className="wo-foot">
        <select
          className="wo-assignee"
          value={issue.assignedTo || ''}
          onChange={(e) => onReassign(issue, e.target.value)}
        >
          <option value="">unassigned</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.username}
            </option>
          ))}
        </select>
        {next ? (
          <button className="wo-advance" onClick={() => onAdvance(issue, next)}>
            → {next.replace('_', ' ')}
          </button>
        ) : (
          <span className="wo-done">closed</span>
        )}
      </div>
    </div>
  )
}
