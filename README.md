# Ziki Preview Test Frontend

A minimal mock React demo built with Vite. It has no backend: the sample tasks are hardcoded, and your changes are saved in the browser's `localStorage`.

The task board keeps several lists. The sidebar shows each list with its count of open tasks; on phones it opens as a drawer from the menu button. In a list you can add tasks, tick them off, rename them (double-click or the pencil button; Enter saves, Escape cancels) and reorder them (drag on desktop, or the arrow buttons). Lists can be created, renamed and deleted. **Reset demo data** restores the sample lists.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

The output goes to `dist/`.
