# Agent Guidelines for Slipwise

## 🚫 FORBIDDEN COMMANDS - NEVER RUN THESE:
- `npm run dev` or `next dev` - **NEVER USE**
- `npm start` or `next start` - **NEVER USE**
- `npm run lint` - **NEVER USE**

## Build/Test Commands

- **Build**: `next build`
- **No tests configured** - add Jest/Playwright if needed

## Code Style Guidelines

### Framework & Language

- Next.js 15 with React 19 and TypeScript
- Strict TypeScript mode enabled
- Target ES2017

### Component Patterns

- Functional components with hooks
- Use `"use client"` directive for client components
- Named exports: `export default function ComponentName`
- Explicit TypeScript interfaces for props

### Imports & Path Aliases

- Use path aliases: `@/lib`, `@/components`, `@/ui`
- Import types: `import type React from "react"`
- Group imports: React/hooks, then external libs, then internal

### Styling

- Tailwind CSS with CSS variables
- shadcn/ui components (new-york style)
- Lucide icons for UI elements
- Mix of Tailwind classes and inline styles for complex layouts

### Type Safety

- Zod schemas for data validation
- Infer types from Zod: `z.infer<typeof Schema>`
- Explicit typing for state, props, and functions

### Error Handling

- Try/catch blocks for async operations
- Console logging for debugging
- Graceful error states in UI

### Naming Conventions

- camelCase for variables, functions, components
- PascalCase for component names and types
- kebab-case for file names
- Descriptive names: `handleFileUpload`, `processFiles`

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
