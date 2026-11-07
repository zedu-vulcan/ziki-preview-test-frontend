import { useState } from 'react'

const INITIAL_TASKS = [
  { id: 1, title: 'Set up the preview environment', done: true },
  { id: 2, title: 'Open a test pull request', done: false },
  { id: 3, title: 'Check the preview link', done: true },
]

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [hideDone, setHideDone] = useState(false)

  const toggle = (id) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )

  const doneCount = tasks.filter((task) => task.done).length
  const visibleTasks = hideDone ? tasks.filter((task) => !task.done) : tasks

  return (
    <main className="app">
      <h1>Ziki Preview Test</h1>
      <p className="subtitle">Mock demo. Tasks are sample data and reset on reload.</p>
      <p className="subtitle">Merged from test pull request 2.</p>

      <div className="toolbar">
        <p className="progress">
          {doneCount} of {tasks.length} done
        </p>
        <label className="filter">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(event) => setHideDone(event.target.checked)}
          />
          Hide completed
        </label>
      </div>

      <ul className="tasks">
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <label className={task.done ? 'done' : undefined}>
              <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} />
              {task.title}
            </label>
          </li>
        ))}
      </ul>
    </main>
  )
}
