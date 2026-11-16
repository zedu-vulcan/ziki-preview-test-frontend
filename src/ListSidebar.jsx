export default function ListSidebar({ lists, activeListId, onSelect, onCreate, onReset, onClose, drawerOpen, sidebarRef }) {
  return (
    <nav
      ref={sidebarRef}
      id="list-sidebar"
      className={drawerOpen ? 'sidebar open' : 'sidebar'}
      aria-label="Task lists"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && drawerOpen) onClose()
      }}
    >
      <div className="sidebar-head">
        <p className="eyebrow">Ziki Preview Test</p>
        <button type="button" className="icon-button drawer-close" onClick={onClose} aria-label="Close lists">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>

      <h2 className="sidebar-title">Lists</h2>
      <ul className="list-nav">
        {lists.map((list) => {
          const open = list.tasks.filter((task) => !task.done).length
          const active = list.id === activeListId
          return (
            <li key={list.id}>
              <button
                type="button"
                className={active ? 'list-link active' : 'list-link'}
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(list.id)}
              >
                <span className="list-link-name">{list.name}</span>
                <span className="count" aria-label={`${open} open`}>
                  {open}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <button type="button" className="new-list" onClick={onCreate}>
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 3v10M3 8h10" />
        </svg>
        New list
      </button>

      <button type="button" className="text-button reset" onClick={onReset}>
        Reset demo data
      </button>
    </nav>
  )
}
