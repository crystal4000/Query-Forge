<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes. APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# QueryForge Agent Guide

Visual query builder (QueryForge) that lets users compose filter trees, preview SQL/Mongo/JSON output, and run queries against in-memory mock datasets.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript** (strict)
- **Zustand** (+ **zundo** for undo/redo on the query tree)
- **Tailwind CSS v4** with design tokens in `src/app/globals.css`
- **shadcn/ui** (radix-nova style); primitives live in `src/components/ui/`
- **dnd-kit** for drag-and-drop reordering of rules/groups
- **Vitest** + **Testing Library** for tests
- **ESLint** (`eslint`, not `next lint`) + **Prettier** via lint-staged on commit

## Directory layout

```
src/
├── app/                    # Next.js routes, layout, global CSS, mock data
│   └── data/mock-datasets.ts
├── components/
│   ├── layout/             # Navbar, Sidebar, ThemeToggle
│   ├── query-builder/      # Condition tree UI (rules, groups, DnD)
│   ├── query-preview/      # PreviewPanel (SQL/Mongo/JSON tabs, Run)
│   ├── results/            # ResultsPanel
│   ├── toolbar/            # Undo/redo, reset, import/export
│   └── ui/                 # shadcn primitives (Button, Input, Select, ...)
├── lib/
│   ├── query-engine/       # Pure logic: types, validator, generator, executor
│   └── schema/             # Schema definitions and operator helpers
└── store/                  # Zustand stores (query, ui, history)
```

Use the `@/` path alias (`@/components/...`, `@/lib/...`, `@/store/...`).

## Domain model

All query types live in `src/lib/query-engine/types.ts`. Do not duplicate them elsewhere.

- **QueryTree**: `{ schemaId, root: ConditionGroup }`
- **ConditionGroup**: nested AND/OR group with `children: QueryNode[]`
- **ConditionRule**: `{ field, operator, value }` leaf node
- **Schema / SchemaField**: field metadata; schemas defined in `src/lib/schema/schema.ts`
- **Operator**: typed union; valid operators per field type are in `src/lib/schema/schema-utils.ts`

Use the type guards `isConditionGroup`, `isConditionRule`, `isDateRange`, `isNumberRange` from `types.ts` instead of manual `type` checks.

## Layer boundaries

| Layer  | Location                | Responsibility                                   |
| ------ | ----------------------- | ------------------------------------------------ |
| UI     | `src/components/`       | Rendering, user interaction, store subscriptions |
| State  | `src/store/`            | Mutable app state, persistence, undo history     |
| Engine | `src/lib/query-engine/` | Pure functions; no React, no Zustand             |
| Schema | `src/lib/schema/`       | Static schema data and operator metadata         |

**Generator** (`generator.ts`) turns a `QueryTree` into SQL / Mongo / JSON preview output.
**Executor** (`executor.ts`) evaluates a tree against `MOCK_DATASETS`; client-side only, not a real DB.
**Validator** (`validator.ts`) returns `{ valid, errors[] }` with `nodeId` for inline error highlighting.

When adding operators or field types, update **types**, **schema-utils**, **validator**, **generator**, and **executor** together.

## State management

Three Zustand stores. Keep concerns separated:

### `useQueryStore` (`query-store.ts`)

- Holds the `QueryTree`; wrapped in **zundo** `temporal()` for undo/redo
- Tree mutations are immutable; helper functions (`updateNodeInTree`, `addChildToGroup`, etc.) deep-copy the root
- **Default tree uses stable IDs** (`root`, `default-rule`). Do not call `nanoid()` on initial state; random IDs on the server cause hydration mismatches with dnd-kit
- New rules/groups added at runtime use `nanoid()`
- `useUndoRedo()` exposes undo/redo from the temporal store; wired in `Toolbar.tsx` with Cmd/Ctrl+Z / Shift+Z
- Changing field resets operator + value; changing operator resets value

### `useUIStore` (`ui-store.ts`)

- Ephemeral UI: `previewFormat` (sql | mongo | json), `resultsOpen`
- Not persisted, not undoable

### `useHistoryStore` (`history-store.ts`)

- Persisted to localStorage (`qb-history`) via zustand `persist`
- Run history + saved presets; capped at 50 history entries

## UI conventions

- Client components use `"use client"` at the top
- Prefer existing shadcn primitives in `src/components/ui/` over raw HTML
- Use Tailwind utility classes and CSS variables from `globals.css` (`bg-background`, `text-text-muted`, `border-border`, `text-accent`, etc.)
- Lucide icons for iconography
- `cn()` from `@/lib/utils` for conditional class merging

### Page layout (`src/app/page.tsx`)

```
Navbar
├── Sidebar | main(Toolbar + QueryBuilder) | PreviewPanel
```

## SSR and hydration

This app is mostly client-rendered. Known patterns; do not regress these:

1. **dnd-kit**: `DndConditionList` is loaded with `dynamic(..., { ssr: false })` in `ConditionGroup.tsx`
2. **QueryBuilder**: returns `null` on the server via `useSyncExternalStore` client check
3. **Stable default IDs** in `makeDefaultTree()`: required for SSR/client ID parity
4. **Theme**: `ThemeToggle` reads localStorage/cookie on the client; `Navbar` passes `initialTheme` from the server cookie. Do **not** persist theme in a `useEffect` on mount; that overwrites the user's saved preference

## Adding a new schema

1. Add entry to `SCHEMAS` in `src/lib/schema/schema.ts`
2. Add mock rows to `MOCK_DATASETS` in `src/app/data/mock-datasets.ts` (key must match schema `id`)
3. Sidebar schema picker picks it up automatically via `SCHEMAS`

## Testing

- Run: `npm test -- --run` (CI uses Vitest 3.x; do not upgrade to Vitest 4 without fixing Rolldown native binding on Linux)
- Tests live colocated: `src/app/__tests__/`
- Mock heavy layout pieces (e.g. `Navbar`) in page tests to keep assertions focused
- Also verify locally: `npm run lint`, `npm run type-check`, `npm run build`

## Code style

- No semicolons, double quotes, 100-char print width (see `.prettierrc`)
- Minimize scope; match existing patterns and do not refactor unrelated code
- No debug `console.log` left in components
- Avoid unused imports and parameters (ESLint warns on these)
- Comments only for non-obvious logic

## Common pitfalls

- Do not put query-engine logic inside React components; keep it in `src/lib/query-engine/`
- Do not use `nanoid()` for the initial/default query tree IDs
- Do not add server actions or API routes unless explicitly requested; execution is in-memory mock data
- When extending undo support, only tree mutations should be recorded (see `partialize` in query-store)
- New shadcn components: use `npx shadcn@latest add <component>` to match `components.json` config
