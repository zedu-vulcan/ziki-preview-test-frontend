import { useEffect, useRef, useState } from 'react'
import ListSidebar from './ListSidebar.jsx'
import ListView from './ListView.jsx'
import { sampleBoard, useStoredBoard } from './useStoredBoard.js'

// Matches the CSS breakpoint where the sidebar becomes a drawer.
const DRAWER_QUERY = '(max-width: 767.98px)'

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'

export default function App() {
  const [board, setBoard] = useStoredBoard()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [newListId, setNewListId] = useState(null)
  const [announcement, setAnnouncement] = useState('')
  const menuButton = useRef(null)
  const sidebar = useRef(null)

  const activeList = board.lists.find((list) => list.id === board.activeListId)

  // Close the drawer when the window grows past the breakpoint, so the page
  // never stays inert on desktop.
  useEffect(() => {
    const query = window.matchMedia(DRAWER_QUERY)
    const onChange = () => !query.matches && setDrawerOpen(false)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Drawer focus: move in on open, keep Tab inside, return to the menu button.
  useEffect(() => {
    if (!drawerOpen) return
    const panel = sidebar.current
    panel.querySelector('.list-link.active, .list-link')?.focus()

    const trap = (event) => {
      if (event.key !== 'Tab') return
      const items = [...panel.querySelectorAll(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trap)
    const opener = menuButton.current
    return () => {
      document.removeEventListener('keydown', trap)
      // Only take focus back if it was left in the closing drawer: a new
      // list's name field has already taken it.
      const focus = document.activeElement
      if (!focus || focus === document.body || panel.contains(focus)) opener?.focus()
    }
  }, [drawerOpen])

  const selectList = (id) => {
    setBoard((current) => ({ ...current, activeListId: id }))
    setNewListId(null)
    setDrawerOpen(false)
  }

  const createList = () => {
    const id = `list-${Date.now()}`
    setBoard((current) => ({
      activeListId: id,
      lists: [...current.lists, { id, name: 'Untitled list', tasks: [] }],
    }))
    setNewListId(id)
    setDrawerOpen(false)
    setAnnouncement('Created a new list. Type its name.')
  }

  const updateActive = (change) =>
    setBoard((current) => ({
      ...current,
      lists: current.lists.map((list) => (list.id === current.activeListId ? change(list) : list)),
    }))

  const deleteActive = () => {
    const name = activeList.name
    setBoard((current) => {
      const index = current.lists.findIndex((list) => list.id === current.activeListId)
      const rest = current.lists.filter((list) => list.id !== current.activeListId)
      if (rest.length === 0) {
        return { activeListId: 'my-tasks', lists: [{ id: 'my-tasks', name: 'My tasks', tasks: [] }] }
      }
      return { lists: rest, activeListId: rest[Math.max(0, index - 1)].id }
    })
    setNewListId(null)
    setAnnouncement(`Deleted "${name}".`)
  }

  const reset = () => {
    setBoard(sampleBoard())
    setNewListId(null)
    setDrawerOpen(false)
    setAnnouncement('Demo data restored.')
  }

  return (
    <div className="layout">
      <ListSidebar
        lists={board.lists}
        activeListId={board.activeListId}
        onSelect={selectList}
        onCreate={createList}
        onReset={reset}
        onClose={() => setDrawerOpen(false)}
        drawerOpen={drawerOpen}
        sidebarRef={sidebar}
      />

      {drawerOpen && <div className="backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

      <main className="content" inert={drawerOpen}>
        <header className="topbar">
          <button
            ref={menuButton}
            type="button"
            className="icon-button menu-button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Show lists"
            aria-expanded={drawerOpen}
            aria-controls="list-sidebar"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
            </svg>
          </button>
          <div>
            <h1>Task board</h1>
            <p className="subtitle">
              Mock demo, saved in this browser. Double-click to rename; drag or use the arrows to
              reorder.
            </p>
          </div>
        </header>

        <ListView
          key={activeList.id}
          list={activeList}
          autoEdit={activeList.id === newListId}
          onRename={(name) => updateActive((list) => ({ ...list, name }))}
          onDelete={deleteActive}
          onChangeTasks={(change) => updateActive((list) => ({ ...list, tasks: change(list.tasks) }))}
          announce={setAnnouncement}
        />
      </main>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}
