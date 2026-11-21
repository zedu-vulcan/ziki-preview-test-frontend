import { useEffect, useState } from 'react'

const STORAGE_KEY = 'ziki-preview-board'
// Written by the single-list task board; migrated into the first list.
const LEGACY_TASKS_KEY = 'ziki-preview-tasks'

export const SAMPLE_TASKS = [
  { id: 1, title: 'Set up the preview environment', done: true },
  { id: 2, title: 'Open a test pull request', done: false },
  { id: 3, title: 'Check the preview link', done: true },
]

export const sampleBoard = () => ({
  activeListId: 'my-tasks',
  lists: [
    { id: 'my-tasks', name: 'My tasks', tasks: SAMPLE_TASKS },
    {
      id: 'release',
      name: 'Release checklist',
      tasks: [
        { id: 4, title: 'Write the changelog', done: false },
        { id: 5, title: 'Tag the release', done: false },
      ],
    },
  ],
})

const isTask = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Number.isFinite(value.id) &&
  typeof value.title === 'string' &&
  value.title.trim() !== '' &&
  typeof value.done === 'boolean'

const isList = (value) =>
  value !== null &&
  typeof value === 'object' &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  value.name.trim() !== '' &&
  Array.isArray(value.tasks) &&
  value.tasks.every(isTask)

const isBoard = (value) =>
  value !== null &&
  typeof value === 'object' &&
  Array.isArray(value.lists) &&
  value.lists.length > 0 &&
  value.lists.every(isList) &&
  value.lists.some((list) => list.id === value.activeListId)

const read = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key))
  } catch {
    return null
  }
}

function loadBoard() {
  const stored = read(STORAGE_KEY)
  if (isBoard(stored)) return stored

  const board = sampleBoard()
  const legacy = read(LEGACY_TASKS_KEY)
  if (Array.isArray(legacy) && legacy.every(isTask)) board.lists[0].tasks = legacy
  return board
}

// Every list and the open one, kept across reloads. Storage failures
// (private mode, blocked site data) are ignored so the board keeps working
// in memory.
export function useStoredBoard() {
  const [board, setBoard] = useState(loadBoard)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
      window.localStorage.removeItem(LEGACY_TASKS_KEY)
    } catch {
      // Nothing to do: the board just won't persist.
    }
  }, [board])

  return [board, setBoard]
}

let lastId = 0
// Unique, increasing ids that also stay unique across reloads.
export const newId = () => {
  lastId = Math.max(Date.now(), lastId + 1)
  return lastId
}
