import { useState } from 'react'

const INITIAL_TASKS = [
  { id: 1, title: 'Set up the preview environment', done: true },
  { id: 2, title: 'Open a test pull request', done: false },
  { id: 3, title: 'Check the preview link', done: true },
]

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)

  const toggle = (id) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    )

  const doneCount = tasks.filter((task) => task.done).length

  return (
    <main className="app">
      <h1>Ziki Preview Test</h1>
      <p className="subtitle">Mock demo. Tasks are sample data and reset on reload.</p>
      <p className="subtitle">Merged from test pull request 2.</p>

      <p className="progress">
        {doneCount} of {tasks.length} done
      </p>

      <ul className="tasks">
        {tasks.map((task) => (
          <li key={task.id}>
            <label className={task.done ? 'done' : undefined}>
              <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} />
              <span className="task-title">{task.title}</span>
            </label>
          </li>
        ))}
      </ul>
    </main>
  )
}
