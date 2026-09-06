import { useState, useEffect, useCallback } from 'react'
import { api, getToken } from './api.js'
import AuthScreen from './components/AuthScreen.jsx'
import Sidebar from './components/Sidebar.jsx'
import OrgView from './components/OrgView.jsx'
import BoardView from './components/BoardView.jsx'
import TitleBlock from './components/TitleBlock.jsx'
import Toast from './components/Toast.jsx'

function loadOrgsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('dispatch_orgs') || '[]')
  } catch {
    return []
  }
}

export default function App() {
  const [token, setToken] = useState(getToken())
  const [username, setUsername] = useState(localStorage.getItem('dispatch_username') || '')

  const [orgs, setOrgs] = useState(loadOrgsFromStorage())
  const [currentOrgId, setCurrentOrgId] = useState(null)
  const [currentOrg, setCurrentOrg] = useState(null)
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const [issues, setIssues] = useState([])
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, isError = false) => {
    setToast({ message, isError, key: Date.now() })
  }, [])

  useEffect(() => {
    localStorage.setItem('dispatch_orgs', JSON.stringify(orgs))
  }, [orgs])

  function handleSignedIn(tok, uname) {
    localStorage.setItem('dispatch_token', tok)
    localStorage.setItem('dispatch_username', uname)
    setToken(tok)
    setUsername(uname)
  }

  function handleSignOut() {
    localStorage.removeItem('dispatch_token')
    localStorage.removeItem('dispatch_username')
    setToken(null)
    setUsername('')
    setCurrentOrg(null)
    setCurrentOrgId(null)
    setBoards([])
    setCurrentBoard(null)
    setIssues([])
  }

  async function openOrg(orgId) {
    try {
      const data = await api.getOrg(orgId)
      setCurrentOrg(data.organization)
      setCurrentOrgId(orgId)
      setCurrentBoard(null)
      setIssues([])
      setOrgs((prev) => {
        const exists = prev.find((o) => o.id === orgId)
        if (exists) {
          return prev.map((o) => (o.id === orgId ? { ...o, title: data.organization.title } : o))
        }
        return [...prev, { id: orgId, title: data.organization.title }]
      })
      const boardsData = await api.getBoards(orgId)
      setBoards(boardsData.allboards || [])
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function refreshCurrentOrg() {
    if (currentOrgId) await openOrg(currentOrgId)
  }

  async function createOrg(title, description) {
    try {
      const data = await api.createOrg(title, description)
      notify('Organization created')
      await openOrg(data.id)
    } catch (err) {
      notify(err.message, true)
    }
  }

  function trackOrg(id) {
    setOrgs((prev) => (prev.find((o) => o.id === id) ? prev : [...prev, { id, title: '(loading…)' }]))
    openOrg(id)
  }

  async function createBoard(title) {
    if (!currentOrgId) return
    try {
      await api.createBoard(title, currentOrgId)
      const boardsData = await api.getBoards(currentOrgId)
      setBoards(boardsData.allboards || [])
      notify('Board created')
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function openBoard(board) {
    setCurrentBoard(board)
    try {
      const data = await api.getIssues(board._id)
      setIssues(data.issues || [])
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function refreshIssues(boardId) {
    try {
      const data = await api.getIssues(boardId)
      setIssues(data.issues || [])
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function addMember(memberusername) {
    try {
      await api.addMember(currentOrgId, memberusername)
      notify('Member added')
      await refreshCurrentOrg()
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function removeMember(memberusername) {
    try {
      await api.removeMember(currentOrgId, memberusername)
      notify('Member removed')
      await refreshCurrentOrg()
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function createIssue(payload) {
    try {
      await api.createIssue({ ...payload, boardId: currentBoard._id })
      await refreshIssues(currentBoard._id)
      notify('Work order created')
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function advanceIssue(issue, nextStatus) {
    try {
      await api.updateIssue({ issueId: issue._id, status: nextStatus })
      await refreshIssues(currentBoard._id)
    } catch (err) {
      notify(err.message, true)
    }
  }

  async function reassignIssue(issue, assignedTo) {
    try {
      await api.updateIssue({ issueId: issue._id, assignedTo: assignedTo || null })
      await refreshIssues(currentBoard._id)
    } catch (err) {
      notify(err.message, true)
    }
  }

  if (!token) {
    return <AuthScreen onSignedIn={handleSignedIn} />
  }

  return (
    <div className="shell">
      <div className="shell-body">
        <Sidebar
          orgs={orgs}
          currentOrgId={currentOrgId}
          boards={boards}
          currentBoardId={currentBoard?._id}
          username={username}
          onOpenOrg={openOrg}
          onCreateOrg={createOrg}
          onTrackOrg={trackOrg}
          onOpenBoard={openBoard}
          onCreateBoard={createBoard}
          onSignOut={handleSignOut}
        />
        <main className="canvas">
          {!currentOrg && (
            <div className="void">
              <div className="void-mark">+</div>
              <h2>No sheet open</h2>
              <p>Start a new organization from the index on the left, or open one you already belong to.</p>
            </div>
          )}
          {currentOrg && !currentBoard && (
            <OrgView
              org={currentOrg}
              boards={boards}
              onOpenBoard={openBoard}
              onCreateBoard={createBoard}
              onAddMember={addMember}
              onRemoveMember={removeMember}
            />
          )}
          {currentOrg && currentBoard && (
            <BoardView
              board={currentBoard}
              org={currentOrg}
              issues={issues}
              onCreateIssue={createIssue}
              onAdvance={advanceIssue}
              onReassign={reassignIssue}
            />
          )}
        </main>
      </div>
      <TitleBlock orgTitle={currentOrg?.title} boardTitle={currentBoard?.title} username={username} />
      <Toast data={toast} />
    </div>
  )
}
