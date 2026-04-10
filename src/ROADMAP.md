# Instagrid — Roadmap

Quick reference for what's done, what's next, and what's coming later.

---

## Status Overview

| Category | Done | Open |
|---|---|---|
| V0.1 — Foundation | 14 / 14 | 0 |
| V0.2 — Polish | 6 / 7 | 1 |
| Improvements | 0 / 9 | 9 |
| Ideas | 0 / 7 | 7 |

---

## 🔴 Open — Next Up

> Immediate backlog. These ship in the next version.

- [ ] **V0.2** Add image crop settings — moveable crop zone linked to the left panel
- [ ] **V0.2** Add onboarding
- [ ] Fix header when import modal is open
- [ ] Change right panel mobile state management to a dedicated service
- [ ] Make "Add image" button background truly transparent
- [ ] Sometimes the grid snaps back into place after dragging but not to the right spots — investigate and fix
- [x] Fix preview quality, it is too low on mobile and some desktop screens; consider adding a "preview quality" setting in the right panel
- [ ] Change grid background color, from Red to a more neutral tone

---

## 🟡 Improvements

> Technical debt, UX polish, and performance work.

- [ ] **Canvas performance**
  - [ ] Use signals and `OnPush` change detection where possible (not on `MainLayout` — side column transitions prevent it)
  - [ ] Move image processing to Web Workers to unblock the UI thread
- [ ] Add swipe gestures to open/close side panels on mobile
- [ ] Improve styling system including Material component overrides
- [ ] Enable selection of output image format (PNG / JPEG / WEBP)
- [ ] Add visible image separation lines on grid tiles in the canvas view
- [ ] Multi-item selection and batch download
- [ ] Add Instagram account header mock (profile pic + username) for feed preview

---

## 💡 Ideas

> Longer-term features. Scope not yet defined.

- [ ] Drag and drop to reorder images directly on the grid
- [ ] Drag and drop to import images (replace file picker)
- [ ] Direct Instagram upload (OAuth)
- [ ] Cloud upload integrations: Google Drive, Dropbox, OneDrive, iCloud, Nextcloud
- [ ] Multi-language support
- [ ] Loading indicator during image processing
- [ ] Progress bar when importing multiple images at once

---

## ✅ Done — V0.2

- [x] Close backdrop when photos are imported
- [x] Open modal when photos are imported
- [x] Close modal when photos are deleted
- [x] Fix import prompt display when image is set to 3×1
- [x] Fix modal not closing when clicking above "Add image" button
- [x] Scale grid lines on mobile

---

## ✅ Done — V0.1

- [x] Remove or implement edit buttons
- [x] Check and enforce image format on import
- [x] Add dark mode
- [x] Fix images stacking on top of each other on import
- [x] Rework UI — new Figma design
  - [x] Right column
  - [x] Left column
  - [x] Header
  - [x] Grid
  - [x] Import menu
- [x] Mobile version
  - [x] Chevron direction
  - [x] Import prompt layout
  - [x] Font sizes
  - [x] Header
  - [x] "Add image" button outside the modal
  - [x] Right modal narrowed to account for outside button
  - [x] Backdrop on side panels, close on click
- [x] Publish to GitHub Pages

---

## ✅ Done — Initial Backlog

- [x] Show cropped image in correct format in left column
- [x] Verify Instagram-optimal dimensions (1010 × 1350 px)
- [x] Delete / Backspace key removes selected grid image
- [x] Click outside grid item deselects it

---

## ❌ Discarded

- ~~Add explanatory text in import prompts about preview quality~~ — removed; not needed with live preview
