export default function TitleBlock({ orgTitle, boardTitle, username }) {
  const today = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <footer className="title-block">
      <div className="tb-cell">
        <span>PROJECT</span>
        <strong>{orgTitle || '—'}</strong>
      </div>
      <div className="tb-cell">
        <span>SHEET</span>
        <strong>{boardTitle || '—'}</strong>
      </div>
      <div className="tb-cell">
        <span>DRAWN BY</span>
        <strong>{username || '—'}</strong>
      </div>
      <div className="tb-cell">
        <span>DATE</span>
        <strong>{today}</strong>
      </div>
    </footer>
  )
}
