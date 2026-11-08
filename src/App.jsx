import { useRef, useState } from 'react'

const INITIAL_TASKS = [
  { id: 1, title: 'Set up the preview environment', done: true },
  { id: 2, title: 'Open a test pull request', done: false },
  { id: 3, title: 'Check the preview link', done: true },
]

const MAX_TITLE_LENGTH = 200

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [draft, setDraft] = useState('')
  const nextId = useRef(INITIAL_TASKS.length + 1)
  const inputRef = useRef(null)

  const toggle = (id) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )

  const remove = (id) => setTasks((current) => current.filter((task) => task.id !== id))

  const title = draft.trim()

  const add = (event) => {
    event.preventDefault()
    if (!title) return
    const id = nextId.current++
    setTasks((current) => [...current, { id, title, done: false }])
    setDraft('')
    inputRef.current?.focus()
  }

  const doneCount = tasks.filter((task) => task.done).length

  return (
    <main className="app">
      <h1>Ziki Preview Test</h1>
      <p className="subtitle">Mock demo. Tasks are sample data and reset on reload.</p>
      <p className="subtitle">Merged from test pull request 2.</p>

      <form className="add-task" onSubmit={add}>
        <label htmlFor="new-task" className="visually-hidden">
          New task
        </label>
        <input
          id="new-task"
          ref={inputRef}
          type="text"
          placeholder="New task"
          autoComplete="off"
          maxLength={MAX_TITLE_LENGTH}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={!title}>
          Add
        </button>
      </form>

      <p className="progress">
        {doneCount} of {tasks.length} done
      </p>

      <ul className="tasks">
        {tasks.length === 0 && <li className="empty">No tasks yet. Add one above.</li>}
        {tasks.map((task) => (
          <li key={task.id}>
            <label className={task.done ? 'done' : undefined}>
              <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} />
              {task.title}
            </label>
            <button
              type="button"
              className="delete"
              aria-label={`Delete ${task.title}`}
              onClick={() => remove(task.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
