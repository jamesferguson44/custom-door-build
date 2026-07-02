# Project: Pane & Simple — Window Configurator Website

## Business Overview

Pane & Simple is a Utah-based window and door installation company. The core concept is that customers configure and price replacement windows entirely online — no in-home sales presentations, no phone calls required. After a customer builds their quote online, a professional verifies measurements on-site before anything is ordered. Installation is included.

The main differentiator is transparency: instant online pricing, no sales pressure, and a clear process from estimate to installation.

---

## Tech Stack

- Built with **Lovable** (AI web app builder)
- React, TypeScript, Tailwind CSS
- TanStack Router for navigation
- shadcn/ui components
- Sonner for toast notifications
- Lucide React for icons
- Hosted on Lovable's preview infrastructure
- Version controlled on GitHub

**Live Preview URL:** https://preview--custom-door-build.lovable.app/

---

## How We Work

- Simple one-line or CSS-only fixes → done directly in GitHub browser editor (saves Lovable credits)
- Logic, state, or multi-file changes → done via Lovable prompts
- James is comfortable with GitHub browser editing but is a beginner with code — explain changes clearly and give exact line edits when possible
- When writing Lovable prompts: write as a professional developer who knows the codebase, be specific about what to change, and always include "do not break" guardrails
- Group related changes into a single consolidated prompt to minimize credit usage
- After significant changes, update this file to reflect current state

---

## Site Structure

| Route | Description |
|---|---|
| `/` | Homepage — hero, how it works, pricing ranges, social proof |
| `/configure/window` | Main window configurator (highest priority page) |
| `/configure/door` | Door configurator |
| `/configure/sliding_door` | Sliding door configurator |
| `/quote` | Quote review and scheduling page |
| `/admin` | Admin panel (hidden from public nav) |

---

## Configurator Flow

1. Customer picks **window style** (Picture, Single Hung, Double Hung, Slider, Casement, Awning, Specialty)
2. Customer picks **product line** (Good — AMSCO / Better — ProVia / Best — ProVia Aeris)
3. Customer picks **glass type** (Standard / Low-E / Triple Pane)
4. Customer picks **color** (White / Black / Custom) and **grid style** (None / Colonial / Prairie)
5. Customer enters **approximate dimensions** — exact measurements verified on-site before ordering
6. Customer enters a **room/location label** — organizes quote by room
7. Customer clicks **Add Window** to add it to their project
8. Customer reviews their full project and **schedules a measurement appointment**

---

## Key Business Rules

- Always emphasize that approximate measurements are fine — a professional verifies exact dimensions before production
- Pricing is always shown as a **range (low–high)**, never a single number
- Final price is confirmed after on-site measurement verification
- No in-home sales presentations — this is a core brand promise
- Products are selected for Utah weather and energy efficiency
- **Site must remain in "coming soon" mode** (no live pricing or scheduling) until Utah DOPL contractor license is active — advertising with pricing before licensure is an enforcement risk

---

## Tone & Copy Guidelines

- Confident and direct — avoid weak phrases like "Installation available"
- Use "Professional installation included" not "Installation available"
- Reassure customers about measurements at every opportunity
- Keep copy concise — customers are homeowners, not contractors

---

## Current State of the Build

### ✅ Completed
- Window configurator 5-step flow (style, product line, glass, color/grid, dimensions)
- Live preview panel updates in real time with all selections (frame color, glass tint, grid overlays, style indicators)
- Right sidebar is sticky with internal scroll — price and Add button stay reachable
- Progress bar (`ProgressBar`) reflects completed steps
- "What Happens Next" section removed from right sidebar (to be added to `/quote` page)
- Redundant bullet checklist card removed from right sidebar
- `CurrentConfigCard` removed from render (component definition kept)
- Hero eyebrow updated to "Online Window Configurator · Instant Pricing"
- Hero H1 updated to "Build Your Replacement Windows"
- Room/Location moved to left column as Step 6
- Completeness bar now includes Step 6 (location) — only hits 100% when all fields including room name are complete
- Grid overlays now render per-pane (respecting Single Hung, Double Hung, and Slider sash bars)
- White frame contrast and overlay line visibility improved

### 🔧 In Progress / Known Issues
- White frame styling: overlay lines (hinge/opening indicators) still low contrast — needs `overlayStroke` separate from `frameStroke` for white frames
- Door and sliding door configurator lacks parity with window configurator (no progress bar, no step highlighting, no sticky sidebar, no Step 6 room/location)
- Placeholder review section on homepage is hidden until real customer reviews are available
- Admin link is hidden from public nav
- `/quote` page needs "What Happens Next" content added (removed from configurator sidebar)
- Financing section in `PriceSummary` has a copy formatting issue — "Financing Available Estimated payments..." runs together without a line break

### 🗓 Up Next (in order)
1. White frame overlay contrast fix (small — possible GitHub edit)
2. Financing copy formatting fix in `PriceSummary.tsx` (GitHub edit — add a `<br />` or split into two elements)
3. Door/sliding door configurator parity with window configurator
4. `/quote` page build-out — project review, "What Happens Next", scheduling CTA
5. Homepage polish — activate review section once real testimonials exist

---

## Completeness Bar Logic

Steps 1–4 = 13 / 13 / 12 / 12% (total 50% without dimensions or location)
Step 5 (valid dimensions) = 40%
Step 6 (room/location entered) = 10%
**Total = 100% only when all six steps are complete**

---

## Files Most Likely To Be Relevant

| File | Purpose |
|---|---|
| `src/routes/configure.$type.tsx` | Main configurator page layout and state |
| `src/components/configurator/PriceSummary.tsx` | Right sidebar: price, actions, Add button |
| `src/components/configurator/ProductPreview.tsx` | Live SVG window/door preview |
| `src/components/configurator/ProjectSummary.tsx` | In-progress project item list |
| `src/components/configurator/SizeInputs.tsx` | Dimension input fields |
| `src/components/configurator/OptionGroup.tsx` | Step option selector cards |
| `src/routes/index.tsx` | Homepage |
| `src/routes/quote.tsx` | Quote review and scheduling |
| `src/lib/pricing.ts` | All pricing logic and types |
| `src/components/SiteHeader.tsx` | Navigation header |

---

## Supplier Context (for copy and product descriptions)

- **AMSCO** — "Good" tier, locally manufactured in Salt Lake City, best budget option, energy efficient
- **ProVia** — "Better" tier, premium vinyl construction, Low-E glass standard, most popular choice
- **ProVia Aeris** — "Best" tier, maximum efficiency, real wood interior option, premium upgrade
