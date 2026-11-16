import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ziki-preview-tasks'

export const SAMPLE_TASKS = [
  { id: 1, title: 'Set up the preview environment', done: true },
  { id: 2, title: 'Open a test pull request', done: false },
  { id: 3, title: 'Check the preview link', done: true },
]

const isTask = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Number.isFinite(value.id) &&
  typeof value.title === 'string' &&
  value.title.trim() !== '' &&
  typeof value.done === 'boolean'

function loadTasks() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(parsed) && parsed.every(isTask)) return parsed
  } catch {
    // Storage blocked or data corrupt: fall back to the sample tasks.
  }
  return SAMPLE_TASKS
}

// Tasks that survive a reload. Storage failures (private mode, blocked
// site data) are ignored so the list keeps working in memory.
export function useStoredTasks() {
  const [tasks, setTasks] = useState(loadTasks)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Nothing to do: the tasks just won't persist.
    }
  }, [tasks])

  return [tasks, setTasks]
}
