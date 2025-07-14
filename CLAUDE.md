# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based demo showcase website for Timeplus, featuring interactive demos of real-time data processing, analytics, and streaming solutions. The site is built with Vite, TypeScript, and Tailwind CSS, using React Router for navigation.

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run linting
pnpm run lint

# Type checking
pnpm run build  # This runs tsc -b as part of the build process
```

## Architecture & Structure

### Core Components
- **Single Page Application**: Built with React Router (`HashRouter`) for client-side routing
- **Data Source**: All demo content centralized in `src/data/demos.ts` as TypeScript objects
- **Routing**: Three main routes:
  - `/` - Main grid view with search and category filters
  - `/tag/:tagName` - Filtered view by keyword/tag
  - `/id/:demoId` - Individual demo detail page

### Key Files
- `src/data/demos.ts` - Central data source containing all demo configurations
- `src/App.tsx` - Main routing logic and state management
- `src/components/demos/` - Demo-specific components (Grid, Card, Detail)
- `src/components/ui/` - Reusable UI components (Radix UI + shadcn/ui)

### Data Structure
Each demo follows the `Demo` interface with:
- `id`: Unique identifier for routing
- `title/subtitle`: Display content
- `category`: Used for filtering (Real-Time Analytics, Observability, etc.)
- `keywords`: Tags for filtering and SEO
- `coverImage`: 2:1 ratio cover image
- `introduction/challenges/solution`: Markdown content for detail view
- `screenshots`: Array of 4:3 ratio images with descriptions
- `steps`: Implementation steps as array of strings
- `sqlExample`: Code examples with syntax highlighting
- `demoLinks`: External demo URLs with icons
- `rank`: Sorting priority (lower = higher)

### Styling System
- **Tailwind CSS** with custom Timeplus brand colors
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Dark theme**: Consistent dark UI with Timeplus branding
- **Responsive**: Mobile-first design with grid layouts

### Image Guidelines
- **Cover images**: 2:1 ratio, stored in `/public/`
- **Screenshots**: 4:3 ratio, organized in `/public/screenshots/[demo-id]/`
- **Formats**: SVG for icons/graphics, WebP/optimized JPG for photos

## Common Development Tasks

### Adding New Demos
1. Add demo object to `demos.ts` array following the `Demo` interface
2. Add cover image to `/public/` (2:1 ratio)
3. Add screenshots to `/public/screenshots/[demo-id]/` (4:3 ratio)
4. Test locally with `pnpm run dev`

### Updating Content
- Edit `src/data/demos.ts` for content changes
- Images go in `/public/` directory
- Reformat `demos.ts` on save for consistency

### Navigation Flow
- Main grid → Demo detail → Back navigation
- Tag filtering via keyword clicks
- Search and category filters on main view

### External Integration
- **Netlify**: Auto-deploys from main branch
- **Demo URLs**: External links use demo/demo123 credentials
- **Kafka UI**: Uses kafka.demo.timeplus.com:8080 for raw data viewing