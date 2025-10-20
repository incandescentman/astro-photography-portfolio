# Repository Guidelines

## Project Structure & Module Organization
- Source: `src/`
  - Pages: `src/pages/**.astro`
  - Components: `src/components/**.astro`
  - Layouts: `src/layouts/**.astro`
  - Data layer: `src/data/**.ts` (YAML gallery, image store)
  - Styles: `src/styles/**.css`
- Assets: `public/**` (static), `src/gallery/**` (YAML-driven images)
- Galleries: YAML at `src/gallery/gallery.yaml`; filesystem galleries under `src/gallery/photos/**`.
- Tests: `src/data/__tests__/*.test.ts`
- Config: `site.config.mts`, `astro.config.mts`, `tailwind.config.js`, `eslint.config.js`, `prettier.config.js`.

## Build, Test, and Development Commands
- `npm run dev`: Start Astro dev server.
- `npm run build`: Production build.
- `npm run preview`: Preview built site.
- `npm run test`: Run Vitest tests.
- `npm run lint`: ESLint for TS/JS/Astro files.
- `npm run prettier`: Format with Prettier.
- `npm run generate`: Generate/update `src/gallery/gallery.yaml` from `src/gallery/**`.
- `npm run generate-tags`: Create `tags.json` for `src/gallery/photos/<folder>`.

## Coding Style & Naming Conventions
- Use TypeScript for logic; Astro components for UI.
- Components: `PascalCase.astro` (e.g., `PhotoGrid.astro`).
- Files/modules: `camelCase.ts` (e.g., `galleryData.ts`).
- Run `npm run lint` and `npm run prettier` before submitting.
- Tailwind v4 utility-first CSS; prefer semantic class composition over custom CSS when possible.

## Testing Guidelines
- Framework: Vitest.
- Location: `src/data/__tests__/`.
- Naming: `*.test.ts` next to or grouped under `__tests__`.
- Run tests: `npm run test`.

## Commit & Pull Request Guidelines
- Commits: Clear, imperative mood (e.g., "Fix gallery data validation").
- Reference related issues (e.g., `Fixes #123`).
- For visual changes, include screenshots or short clips.
- PRs: Describe scope, rationale, testing steps, and any config changes.

## Architecture Notes & Tips
- Two gallery modes exist: YAML (`src/gallery/gallery.yaml`) and filesystem (`src/gallery/photos/**`). Avoid route conflicts; prefer one source per route.
- Site settings live in `site.config.mts`.
- GLightbox is used for lightbox; ensure CSS is imported where needed.
- Comments use Giscus; set valid `data-repo-id` and `data-category-id` in `PhotoComments.astro`.

## Agent-Specific Instructions
- Keep changes minimal and focused; avoid unrelated refactors.
- Prefer small, reviewable patches; update tests when touching data layer.
- Validate locally with `dev`, `build`, and `test` before requesting review.

## User preferences
- User prefers documents in org-mode format instead of markdown
- For org, remember that backticks aren't valid Org emphasis markers. Use ~ instead  
