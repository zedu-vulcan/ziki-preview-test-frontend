import { useRef, useState } from 'react'

export default function TaskRow({
  task,
  index,
  count,
  dragging,
  dropTarget,
  onToggle,
  onRename,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const [draft, setDraft] = useState(null)
  const editing = draft !== null
  const inputId = `task-${task.id}`

  // Set while an edit is open; cleared on save or cancel so a blur fired as
  // the input unmounts can't save a cancelled edit.
  const open = useRef(false)

  const startEditing = () => {
    open.current = true
    setDraft(task.title)
  }
  const cancel = () => {
    open.current = false
    setDraft(null)
  }
  const save = () => {
    if (!open.current) return
    open.current = false
    const title = draft.trim()
    if (title && title !== task.title) onRename(title)
    setDraft(null)
  }

  const className = ['task', task.done && 'done', dragging && 'dragging', dropTarget && 'drop-target']
    .filter(Boolean)
    .join(' ')

  return (
    <li
      className={className}
      draggable={!editing}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', String(task.id))
        onDragStart()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        onDragOver()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDrop()
      }}
      onDragEnd={onDragEnd}
    >
      <span className="grip" aria-hidden="true" />

      <input
        id={inputId}
        type="checkbox"
        className="checkbox"
        checked={task.done}
        onChange={onToggle}
      />

      {editing ? (
        <form
          className="rename"
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <input
            className="rename-input"
            aria-label={`Rename "${task.title}"`}
            value={draft}
            autoFocus
            maxLength={120}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
            onKeyDown={(event) => {
              if (event.key === 'Escape') cancel()
            }}
          />
        </form>
      ) : (
        <label htmlFor={inputId} className="title" onDoubleClick={startEditing}>
          {task.title}
        </label>
      )}

      {!editing && (
        <div className="row-actions">
          <button type="button" className="icon-button" onClick={startEditing} aria-label={`Rename "${task.title}"`}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M11.3 2.3a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1 0 1.4L6 12.4 3 13l.6-3z" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => onMove(index - 1)}
            disabled={index === 0}
            aria-label={`Move "${task.title}" up`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 10l4-4 4 4" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-button"
            onClick={() => onMove(index + 1)}
            disabled={index === count - 1}
            aria-label={`Move "${task.title}" down`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 6l4 4 4-4" />
            </svg>
          </button>
        </div>
      )}
    </li>
  )
}
