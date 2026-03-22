# SlydCut — Instagram Grid Splitter

A browser-based tool to compose, preview, and export Instagram carousel grids at full quality — no backend, no uploads, no account needed.

**[Live demo →](https://symeond.github.io/Instagrid/)**

---

## What It Does

Instagram's carousel format rewards creators who post images as connected grid panels — a single photo split across multiple posts that locks together perfectly in the profile feed. SlydCut automates that workflow:

1. **Import** JPEG, PNG, WEBP or SVG images into a personal library
2. **Compose** a grid by placing images on a drag-and-drop canvas with resize handles
3. **Preview** exactly how each image crops and splits across panels in real time
4. **Export** full-quality tiles (1080×1350 px, Instagram standard) bundled in a ZIP

Everything runs in the browser. No server, no account, no image ever leaves your machine.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Angular 20 (standalone components) | Strong typing, reactive primitives, no NgModules overhead |
| State | RxJS `BehaviorSubject` | Lightweight reactive state — no extra library needed for a single-user app |
| Grid | `@katoid/angular-grid-layout` | Handles drag, resize, and auto-compaction out of the box |
| Image processing | HTML5 Canvas API | Full control over crop math and pixel output, zero backend cost |
| Export | JSZip | Client-side ZIP generation — files never leave the browser |
| UI | Angular Material 3 | Consistent design system with first-class dark mode theming |
| Styling | SCSS + CSS variables | Dynamic theming, responsive breakpoints |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         MainLayout                           │
│  ┌─────────────┐   ┌──────────────────────┐   ┌───────────┐ │
│  │ LeftColumn  │   │       AppGrid        │   │RightColumn│ │
│  │             │   │  drag · resize       │   │           │ │
│  │  preview    │   │  multi-select        │   │  image    │ │
│  │  download   │   │  keyboard delete     │   │  library  │ │
│  │  delete     │   │                      │   │           │ │
│  └─────────────┘   └──────────────────────┘   └───────────┘ │
│                  ┌───────────────────────────┐               │
│                  │       ImportPrompt        │               │
│                  │  grid size selector (1–9) │               │
│                  │  + live crop preview      │               │
│                  └───────────────────────────┘               │
└──────────────────────────────────────────────────────────────┘
                   ↕  RxJS BehaviorSubjects  ↕
┌──────────────────────────────────────────────────────────────┐
│                        Core Services                         │
│                                                              │
│  AppControllerService          ImageProcessingService        │
│  · globalImages$               · cropImage()                 │
│  · gridImages$                 · divideImage()               │
│  · selectedGridImage$          · createLowResImage()         │
│                                · createZip()                 │
│  ──────────────────────────────────────────────────────────  │
│  ImportPromptService     LeftColumnService                   │
│  · modal state           · panel open/close state           │
│                          RightColumnService                  │
└──────────────────────────────────────────────────────────────┘
                         ↕  Models  ↕
         globalImg  — library image + low-res preview cache
         gridImg    — positioned tile: (x, y, w, h) + cropped src
```

State flows in one direction: services own state as observables, components subscribe and render. No two-way bindings across component boundaries.

The image pipeline runs in two stages to keep the UI fast:
- **Import → low-res (≤400 px)** for grid rendering
- **Export → full resolution** reprocessed on demand via Canvas

---

## Getting Started

**Prerequisites:** Node.js ≥ 18, Angular CLI

```bash
# Clone
git clone https://github.com/symeond/Instagrid.git
cd Instagrid

# Install dependencies
npm install

# Start dev server
ng serve
# → http://localhost:4200
```

```bash
# Production build
ng build
# Output in /dist/

# Run tests
ng test
```

---

## Usage

1. Click **Add image** (or the `+` button on mobile) to import photos into your library
2. Click any library image to open the **grid size selector** — 1×1 up to 3×3
3. The preview updates live showing the exact crop that will be applied to your image
4. Confirm to place the tile on the grid; drag and resize freely to adjust the composition
5. Select a tile, then click **Download** in the left panel — a ZIP with all split tiles arrives instantly

---

## What I Learned

**Canvas API — more math than expected.**
This was my first time using the Canvas API for real image processing. Getting the crop geometry right, auto-centering the subject, preserving aspect ratio across arbitrary grid sizes (up to 3×3), then overlaying pixel-perfect grid lines as a live preview, required more iteration than expected. Pixel rounding errors caused subtle misalignments that took time to isolate and fix.

**Grid layout: from `<div>` to a dedicated library.**
The grid started as a plain HTML/CSS layout. It became unmanageable quickly, drag-and-drop, resize handles, gap calculation, and auto-compaction were each their own problem. Switching to `@katoid/angular-grid-layout` was the right call; it handled the structural complexity so I could focus on replicating Instagram's exact grid proportions.

**Performance through a two-stage image pipeline.**
When the grid felt sluggish my first instinct was compression, but the real problem was rendering full-resolution images in small cells. The solution was a two-stage pipeline: a low-res preview (≤400 px) generated on import for grid display, full resolution reprocessed only on export. The quality transition on the grid preview is something I'd like to refine, but the architecture paid off.

**No backend by design.**
Keeping all processing client-side (Canvas for cropping, JSZip for export) was a deliberate choice. It eliminates hosting costs, keeps the app instant, and means there's nothing to maintain server-side. For a focused single-purpose tool, it's the right trade-off.

---

## Roadmap

See [`src/ROADMAP.md`](src/ROADMAP.md) for the full backlog, improvements, and ideas.

---

## License

MIT
