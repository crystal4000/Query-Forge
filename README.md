# QueryForge

A visual query builder for composing nested filter trees, previewing output as SQL / Mongo / JSON, and running queries against in-memory mock datasets.

Built with Next.js 16, React 19, TypeScript, Zustand, Tailwind CSS v4, and shadcn/ui.

## Features

- **Nested condition groups** with AND/OR logic, collapsible groups, and drag-and-drop reordering
- **Schema-aware fields** for `users`, `orders`, and `products` with type-specific operators (string, number, boolean, date, enum)
- **Live preview** in SQL, MongoDB filter, or raw JSON tree format, with one-click copy
- **Run queries** against mock data and view matching rows in a results panel
- **Validation** with inline error highlighting on incomplete rules
- **Undo / redo** on query tree edits (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`)
- **Import / export** query trees as JSON files
- **Presets and run history** persisted in localStorage
- **Light and dark themes** with cookie + localStorage persistence

## Getting started

**Requirements:** Node.js 20+, npm

```bash
git clone <repo-url>
cd query-builder
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                     |
| -------------------- | ------------------------------- |
| `npm run dev`        | Start the development server    |
| `npm run build`      | Production build                |
| `npm run start`      | Serve the production build      |
| `npm run lint`       | Run ESLint                      |
| `npm run type-check` | Run TypeScript (`tsc --noEmit`) |
| `npm test`           | Run Vitest in watch mode        |
| `npm run test:run`   | Run Vitest once (used in CI)    |
| `npm run test:ui`    | Open the Vitest UI              |

Pre-commit hooks (Husky + lint-staged) auto-fix ESLint issues and format staged files with Prettier.

## Project structure

```
src/
├── app/                 # Next.js App Router, layout, global CSS, mock data
├── components/
│   ├── layout/          # Navbar, Sidebar, ThemeToggle
│   ├── query-builder/   # Condition tree UI (rules, groups, DnD)
│   ├── query-preview/   # Preview panel (SQL / Mongo / JSON, Run)
│   ├── results/         # Results table
│   ├── toolbar/         # Undo, reset, import/export, save preset
│   └── ui/              # shadcn/ui primitives
├── lib/
│   ├── query-engine/    # Types, validator, generator, executor (pure logic)
│   └── schema/          # Schema definitions and operator metadata
└── store/               # Zustand stores (query, ui, history)
```

## How it works

### Query tree

The core data structure is a recursive `QueryTree`: a schema ID plus a root `ConditionGroup` containing rules and nested groups.

```
QueryTree
└── ConditionGroup (AND)
    ├── ConditionRule  (field + operator + value)
    └── ConditionGroup (OR)
        ├── ConditionRule
        └── ConditionRule
```

All types live in `src/lib/query-engine/types.ts`.

### Query engine

| Module         | Role                                                                  |
| -------------- | --------------------------------------------------------------------- |
| `validator.ts` | Checks rules for missing fields, values, and type mismatches          |
| `generator.ts` | Converts a tree to SQL, MongoDB filter, or JSON output                |
| `executor.ts`  | Evaluates a tree against mock rows in `src/app/data/mock-datasets.ts` |

The engine is pure TypeScript with no React dependencies. UI components subscribe to Zustand stores and call into these modules.

### State

| Store           | Purpose                                         |
| --------------- | ----------------------------------------------- |
| `query-store`   | Query tree state with zundo-powered undo/redo   |
| `ui-store`      | Preview format tab and results panel visibility |
| `history-store` | Saved presets and run history (localStorage)    |

## Adding a schema

1. Add a schema to `SCHEMAS` in `src/lib/schema/schema.ts`
2. Add mock rows to `MOCK_DATASETS` in `src/app/data/mock-datasets.ts` (key must match the schema `id`)
3. The sidebar picker picks it up automatically

When adding operators or field types, update `types.ts`, `schema-utils.ts`, `validator.ts`, `generator.ts`, and `executor.ts` together.

## Keyboard shortcuts

| Shortcut               | Action |
| ---------------------- | ------ |
| `Cmd/Ctrl + Z`         | Undo   |
| `Cmd/Ctrl + Shift + Z` | Redo   |

## CI

GitHub Actions runs on push and pull requests to `main`:

- ESLint (`npm run lint`)
- TypeScript (`tsc --noEmit`)
- Vitest (`npm test -- --run`)

## Deployment

The project includes a `vercel.json` for Vercel deployment. Any platform that supports Next.js 16 will work:

```bash
npm run build
npm run start
```

## Contributing

See [AGENTS.md](./AGENTS.md) for architecture notes, conventions, SSR/hydration patterns, and common pitfalls aimed at contributors and coding agents.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Zustand](https://zustand.docs.pmnd.rs) + [zundo](https://github.com/charkour/zundo) (undo/redo)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [@dnd-kit](https://dndkit.com) (drag and drop)
- [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
