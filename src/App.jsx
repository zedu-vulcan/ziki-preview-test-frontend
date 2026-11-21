import { useState } from 'react'
import { SAMPLE_TASKS, useStoredTasks } from './useStoredTasks.js'
import TaskRow from './TaskRow.jsx'

function move(list, from, to) {
  if (from === to || to < 0 || to >= list.length) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export default function App() {
  const [tasks, setTasks] = useStoredTasks()
  const [dragId, setDragId] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const doneCount = tasks.filter((task) => task.done).length
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0

  const toggle = (id) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )

  const rename = (id, title) =>
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, title } : task)))

  const moveTask = (from, to) => {
    if (to < 0 || to >= tasks.length) return
    setTasks((current) => move(current, from, to))
    setAnnouncement(`Moved "${tasks[from].title}" to position ${to + 1} of ${tasks.length}.`)
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

  const reset = () => {
    setTasks(SAMPLE_TASKS)
    setAnnouncement('Sample tasks restored.')
  }

  return (
    <main className="app">
      <header className="board-header">
        <p className="eyebrow">Ziki Preview Test</p>
        <h1>Task board</h1>
        <p className="subtitle">
          Mock demo. Your changes are saved in this browser. Double-click a task to rename it; drag
          it or use the arrows to reorder.
        </p>
      </header>

      <section className="card" aria-labelledby="progress-label">
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

        <ol className="tasks" onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDropIndex(null)
        }}>
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

        <footer className="card-footer">
          <button type="button" className="text-button" onClick={reset}>
            Reset sample tasks
          </button>
        </footer>
      </section>

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
    </main>
  )
}
