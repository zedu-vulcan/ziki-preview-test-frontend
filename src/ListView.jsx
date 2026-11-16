import { useRef, useState } from 'react'
import TaskRow from './TaskRow.jsx'
import { newId } from './useStoredBoard.js'

function move(list, from, to) {
  if (from === to || to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

function ListName({ name, autoEdit, onRename }) {
  const [draft, setDraft] = useState(autoEdit ? name : null)
  // Cleared on save or cancel so a blur fired as the input unmounts can't
  // save a cancelled edit.
  const open = useRef(autoEdit)

  const start = () => {
    open.current = true
    setDraft(name)
  }
  const cancel = () => {
    open.current = false
    setDraft(null)
  }
  const save = () => {
    if (!open.current) return
    open.current = false
    const next = draft.trim()
    if (next && next !== name) onRename(next)
    setDraft(null)
  }

  if (draft === null) {
    return (
      <div className="list-name">
        <h2 id="list-title" onDoubleClick={start}>
          {name}
        </h2>
        <button type="button" className="icon-button" onClick={start} aria-label={`Rename list "${name}"`}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M11.3 2.3a1 1 0 0 1 1.4 0l1 1a1 1 0 0 1 0 1.4L6 12.4 3 13l.6-3z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <form
      className="list-name"
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      <input
        className="rename-input list-rename-input"
        aria-label="List name"
        value={draft}
        autoFocus
        onFocus={(event) => event.target.select()}
        maxLength={60}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === 'Escape') cancel()
        }}
      />
    </form>
  )
}

export default function ListView({ list, autoEdit, onRename, onDelete, onChangeTasks, announce }) {
  const { tasks } = list
  const [dragId, setDragId] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const doneCount = tasks.filter((task) => task.done).length
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const toggle = (id) =>
    onChangeTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )

  const rename = (id, title) =>
    onChangeTasks((current) => current.map((task) => (task.id === id ? { ...task, title } : task)))

  const moveTask = (from, to) => {
    if (to < 0 || to >= tasks.length) return
    onChangeTasks((current) => move(current, from, to))
    announce(`Moved "${tasks[from].title}" to position ${to + 1} of ${tasks.length}.`)
  }

  const endDrag = () => {
    setDragId(null)
    setDropIndex(null)
  }

  const drop = (toIndex) => {
    const from = tasks.findIndex((task) => task.id === dragId)
    if (from !== -1) moveTask(from, toIndex)
    endDrag()
  }

  const addTask = (event) => {
    event.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    onChangeTasks((current) => [...current, { id: newId(), title, done: false }])
    setNewTitle('')
    announce(`Added "${title}".`)
  }

  return (
    <section className="card list-view" aria-labelledby="list-title">
      <header className="list-header">
        <ListName key={list.id} name={list.name} autoEdit={autoEdit} onRename={onRename} />

        {confirmingDelete ? (
          <div className="confirm" role="group" aria-label="Confirm delete">
            <span className="confirm-text">Delete this list?</span>
            <button type="button" className="danger-button" onClick={onDelete} autoFocus>
              Delete
            </button>
            <button type="button" className="text-button" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="icon-button"
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Delete list "${list.name}"`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
            </svg>
          </button>
        )}
      </header>

      {tasks.length > 0 ? (
        <>
          <div className="progress-row">
            <span id="progress-label" className="progress-label">
              {doneCount} of {tasks.length} done
            </span>
            <span className="progress-percent">{percent}%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-labelledby="progress-label"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>

          <ol
            className="tasks"
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setDropIndex(null)
            }}
          >
            {tasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                count={tasks.length}
                dragging={dragId === task.id}
                dropTarget={dropIndex === index && dragId !== task.id}
                onToggle={() => toggle(task.id)}
                onRename={(title) => rename(task.id, title)}
                onMove={(to) => moveTask(index, to)}
                onDragStart={() => setDragId(task.id)}
                onDragOver={() => setDropIndex(index)}
                onDrop={() => drop(index)}
                onDragEnd={endDrag}
              />
            ))}
          </ol>
        </>
      ) : (
        <div className="empty">
          <svg viewBox="0 0 48 48" aria-hidden="true" className="empty-icon">
            <rect x="9" y="7" width="30" height="36" rx="5" />
            <path d="M17 19h14M17 26h14M17 33h8" />
          </svg>
          <p className="empty-title">No tasks yet</p>
          <p className="empty-text">Add the first one below.</p>
        </div>
      )}

      <form className="add-task" onSubmit={addTask}>
        <input
          className="add-input"
          aria-label={`New task in "${list.name}"`}
          placeholder="Add a task"
          value={newTitle}
          maxLength={120}
          onChange={(event) => setNewTitle(event.target.value)}
        />
        <button type="submit" className="primary-button" disabled={!newTitle.trim()}>
          Add
        </button>
      </form>
    </section>
  )
}
