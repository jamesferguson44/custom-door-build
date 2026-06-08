# Pane & Simple — Project Notes

## Business Overview

Pane & Simple is a window and door installation company based in Utah. Customers configure and price replacement windows entirely online — no in-home sales presentations, no phone calls required. After a customer builds their quote online, a professional is sent out to verify measurements before anything is ordered. Installation is included and handled by our team.

**Core differentiator:** Transparent instant online pricing, no sales pressure, simple process from estimate to installation.

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

**Live Preview:** https://preview--custom-door-build.lovable.app/

---

## Site Structure

| Route | Description |
|---|---|
| `/` | Homepage — hero, how it works, pricing ranges, social proof |
| `/configure/window` | Main window configurator (most important page) |
| `/configure/door` | Door configurator |
| `/configure/sliding_door` | Sliding door configurator |
| `/quote` | Quote review and scheduling page |
| `/admin` | Admin panel (hidden from public nav) |

---

## Configurator Flow

1. Customer picks **window style** — Picture, Single Hung, Double Hung, Slider, Casement, Awning, Specialty
2. Customer picks **product line** — Good (AMSCO), Better (ProVia), Best (ProVia Aeris)
3. Customer picks **glass type** — Standard, Low-E, Triple Pane
4. Customer picks **color** — White, Black, Custom
5. Customer picks **grid style** — None, Colonial, Prairie
6. Customer enters **approximate dimensions** — exact measurements verified on-site before ordering
7. Customer adds a **room/location label** and adds window to their project
8. Customer reviews full project and **schedules a measurement appointment**

---

## Key Business Rules

- Always emphasize that **approximate measurements are fine** — a professional verifies exact dimensions before production
- Pricing is always shown as a **range (low–high)**, never a single number
- Final price is confirmed after on-site measurement verification
- **No in-home sales presentations** — this is a core brand promise
- Products are selected for Utah weather and energy efficiency

---

## Tone & Copy Guidelines

- Confident and direct — avoid weak phrases like "Installation available"
- Use **"Professional installation included"** not "Installation available"
- Reassure customers about measurements at every opportunity
- Keep copy concise — customers are homeowners, not contractors

---

## Key Files

| File | Purpose |
|---|---|
| `src/components/configurator/PriceSummary.tsx` | Price sidebar with add to cart |
| `src/components/configurator/ProjectSummary.tsx` | Project summary panel |
| `src/components/configurator/ProductPreview.tsx` | Live window preview |
| `src/components/configurator/SizeInputs.tsx` | Dimension inputs |
| `src/components/configurator/OptionGroup.tsx` | Step option selector |
| `src/routes/configure.$type.tsx` | Main configurator page layout |
| `src/routes/index.tsx` | Homepage |
| `src/lib/pricing.ts` | Pricing logic |
| `src/components/SiteHeader.tsx` | Navigation |

---

## How We Work

- Simple one-line or CSS-only fixes are done directly in **GitHub via the browser** to save Lovable credits
- Larger changes involving logic, state, or multiple files are done via **Lovable prompts**
- When writing Lovable prompts, write as a professional developer who knows the codebase — be specific about what to change and always include "do not break" guardrails

---

## Known Issues / Work In Progress

- [ ] Live preview panel does not update in real time with selections
- [ ] Preview panel is not sticky on scroll
- [ ] Frame color, grid overlays, and window style do not render visually in the preview
- [ ] Project Completeness bar shows too high before dimensions are entered
- [ ] Placeholder review section on homepage is hidden until real customer reviews are available
- [ ] Admin link is hidden from public nav (intentional)

---

## Changelog

| Date | Change |
|---|---|
| 2026-06-07 | Initial PROJECT_NOTES.md created |

