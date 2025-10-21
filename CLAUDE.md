# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Commands
- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build

### Development Workflow
- `npm i` - Install dependencies
- Server runs on `http://localhost:8080` (configured to bind to all interfaces `::`)

## Architecture Overview

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with tailwindcss-animate
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation

### Project Structure
```
src/
├── components/       # Reusable components
│   ├── ui/          # shadcn/ui components (50+ pre-built components)
│   ├── CalendarView.tsx
│   ├── ChatbotPanel.tsx
│   └── ListView.tsx
├── pages/           # Route components
│   ├── Index.tsx    # Home page
│   ├── Dashboard.tsx
│   └── NotFound.tsx
├── hooks/           # Custom React hooks
├── lib/            # Utility functions
├── types/          # TypeScript type definitions
└── data/           # Static data or constants
```

### Key Architectural Patterns

1. **Routing Structure**: All routes are defined in `App.tsx` using React Router. Custom routes should be added above the catch-all `*` route.

2. **Component Organization**:
   - UI components from shadcn/ui are pre-configured in `src/components/ui/`
   - Page-level components in `src/pages/`
   - Feature components directly in `src/components/`

3. **Path Aliasing**: Use `@/` alias for imports from `src/` directory (configured in vite.config.ts and tsconfig.json)

4. **Provider Hierarchy** (App.tsx):
   - QueryClientProvider (TanStack Query)
   - TooltipProvider
   - BrowserRouter

5. **TypeScript Configuration**:
   - Relaxed type checking enabled (noImplicitAny: false, strictNullChecks: false)
   - Path alias `@/*` mapped to `./src/*`

### Important Notes

- This is a Lovable.dev project with automatic deployment capabilities
- Component tagger is enabled in development mode for Lovable integration
- The project uses both Toaster (from ui/toaster) and Sonner (from ui/sonner) for notifications