# Iris — Brand Guidelines

**Domain:** Healthcare conversational assistant
**Reference inspiration:** Mayo Clinic's editorial layout (trusted, clinical, legible) reinterpreted as a modern dark-themed chat product.

This document is the single source of truth for color, type, and iconography. Reference it directly in Antigravity prompts (e.g., "follow `brand_guidelines.md`") so every screen stays consistent.

---

## 1. Brand Personality

| Trait | What it means in the UI |
|---|---|
| **Trustworthy** | Calm palette, generous whitespace, no aggressive gradients or noisy motion |
| **Clinical, not cold** | Serif headings borrowed from editorial medical publishing (Mayo Clinic-style) paired with a friendly, readable sans-serif body |
| **Calm under pressure** | Color is used *functionally* — urgency colors (amber/red) are reserved only for triage signals, never decorative |
| **Modern** | Dark-first interface, soft glassy/"frosted" surfaces, rounded pill controls |

---

## 2. Color Palette

### 2.1 Brand core (as specified)

| Name | HEX | RGB | CMYK | Role |
|---|---|---|---|---|
| **Frosted Blue** | `#9FE2EE` | 159, 226, 238 | 33, 5, 0, 7 | Primary accent — buttons, active states, links, send button, focus rings |
| **Light Cyan** | `#E0FAFF` | 224, 250, 255 | 12, 2, 0, 0 | Secondary/highlight — hover states, subtle card backgrounds on light surfaces, badges |

### 2.2 Dark theme surfaces (extended to pair with the two core colors)

Iris is dark-first. These neutrals are tuned with a faint cool/teal undertone so Frosted Blue and Light Cyan sit naturally on top of them — never pure black, never pure gray.

| Name | HEX | Usage |
|---|---|---|
| Ink 900 (base canvas) | `#0B1416` | App background |
| Ink 800 (sidebar) | `#101B1E` | Sidebar, panels |
| Ink 700 (surface) | `#162326` | Cards, composer bar, modals |
| Ink 600 (raised surface) | `#1E2E32` | Hover states on cards, message bubbles |
| Ink 500 (border) | `#2A3B3F` | Dividers, input borders |
| Mist 300 (muted text) | `#8CA3A8` | Secondary/help text, timestamps |
| Mist 100 (primary text) | `#EAF6F7` | Body text on dark surfaces |

### 2.3 Frosted Blue / Light Cyan tint-shade ramp

Use this ramp instead of inventing new blues anywhere in the product.

| Step | HEX | Typical use |
|---|---|---|
| 100 | `#E0FAFF` (Light Cyan) | Faint highlight backgrounds, selected-row tint on dark surfaces (at 8–12% opacity) |
| 300 | `#C3EFF5` | Hover tint on Frosted Blue elements |
| 500 | `#9FE2EE` (Frosted Blue) | Primary buttons, links, active tab, focus ring, send button |
| 700 | `#5FB8C9` | Pressed/active state, icon-on-light |
| 900 | `#2E6E7A` | Text-on-light-cyan (ensures AA contrast), deep accent borders |

### 2.4 Semantic / triage colors (functional only — never decorative)

| Signal | HEX | Meaning |
|---|---|---|
| 🟢 Self-care | `#6FD6A0` | "Self-care may be appropriate" |
| 🟡 Caution | `#F0C15C` | "Consider seeing a doctor soon" |
| 🔴 Urgent | `#E8685E` | "Seek urgent/emergency care" |

**Rule:** these three colors may only appear on triage chips, the emergency badge, and status dots. If a designer/developer reaches for amber or red anywhere else, that's a signal something is being mis-prioritized visually.

### 2.5 Contrast rule
All body text must hit **WCAG AA (4.5:1)** against its background. On Ink 900/800/700, use Mist 100 for body copy and Frosted Blue 500 (not 100) for interactive text — raw Light Cyan text on dark surfaces is for large headings/icons only, not small body links.

---

## 3. Typography

Mirrors the reference layout's pairing: an editorial serif for headings (credibility, "this was written/reviewed carefully") over a clean grotesque sans for everything functional (chat text, UI labels, buttons).

| Role | Typeface | Notes |
|---|---|---|
| **Display / Headings** (H1–H3, hero "What's going on with your health today?", card section titles like "Overview," "Possible causes") | **Lora** (serif) — fallback: Georgia, "Noto Serif" | Bold weight for H1/H2, Medium for H3. High-contrast serif strokes echo the Mayo Clinic reference exactly. |
| **Body / UI** (chat messages, buttons, sidebar, nav, forms) | **Inter** (sans-serif) — fallback: "Public Sans", system-ui | Regular 400 for body, Medium 500 for labels/buttons, Semibold 600 for emphasis only |
| **Numerals / structured data** (timestamps, vitals-style values if ever shown) | Inter, tabular-nums | Keeps aligned columns |

### Type scale (desktop)

| Token | Size / Line-height | Weight | Font |
|---|---|---|---|
| H1 (hero) | 32px / 40px | 700 | Lora |
| H2 (page/card title) | 24px / 32px | 700 | Lora |
| H3 (section title, e.g. "Overview") | 20px / 28px | 600 | Lora |
| Body | 16px / 26px | 400 | Inter |
| Small / meta (timestamps, disclaimer bar) | 13px / 18px | 400 | Inter |
| Label / button | 14px / 20px | 500 | Inter |
| Nav link (like "Overview ↓" in the reference) | 15px / 20px | 500 | Inter |

Body line-height is intentionally generous (26px on 16px type) because medical explanations are read carefully, not skimmed — same reasoning as the reference page's spacious paragraphs.

---

## 4. Iconography

**Style:** outline / line icons only (no filled or duotone icons), consistent **1.5px stroke**, **rounded line caps and joins**, 20–24px default size. Recommended set: **lucide-react** (fallback: Heroicons outline).

| Context | Icon direction |
|---|---|
| Navigation chevrons (mirrors the reference's small `↓` next to "Overview," "Symptoms," etc.) | Small down-chevron beside expandable section labels; rotates to up-chevron when expanded |
| Sidebar utility icons (options, search, new chat) | Simple, geometric, single-color, no background unless active |
| Medical/domain icons (symptom chips, quick actions) | Line-style clinical icons: stethoscope, pill/capsule, activity/pulse, thermometer, bandage — never cartoonish or full-color medical clipart |
| Triage indicator | A small filled dot (not an outline icon) in the semantic color — the one place a "filled" shape is allowed, so urgency reads instantly |
| Emergency badge | Outline alert-triangle or cross-in-circle, colored in the Urgent red only when active |
| Iris mark / logo | Abstract concentric-ring "iris/lens" mark, single stroke color (Frosted Blue on dark, Ink 900 on light), scalable down to 20px, no gradient |

**Do:**
- Keep icon stroke weight identical across the whole app (1.5px)
- Use Frosted Blue for active/selected icon states, Mist 300 for default/inactive

**Don't:**
- Mix filled and outline icon styles in the same view
- Use photographic or 3D medical iconography (syringes, literal body organs) — keep everything abstract/diagrammatic to stay calm, not clinical-graphic

---

## 5. Layout & Surface Language

Borrowed directly from the reference screenshot's structure, adapted to dark mode:

- **Top bar:** a bold accent band is optional per-page (the reference uses a solid blue header); in Iris, reserve a solid Frosted-Blue band only for the very top navigation/mode-toggle area — everywhere else stays on Ink surfaces.
- **Pill-shaped tab/toggle controls:** rounded-full segmented controls (like the reference's "Symptoms & causes / Diagnosis & treatment / Doctors & departments" pills) — used for the Chat / Clinical Mode toggle and any future content-category switch. Active pill = solid Frosted Blue with Ink 900 text; inactive pill = Ink 700 background with Mist 100 text.
- **"On this page" style mini-nav:** reused as the "Sources" and structured health-card section jump-list pattern — small Mist 300 label, Frosted-Blue links with trailing chevron.
- **Cards:** Ink 700 background, 1px Ink 500 border, 12–16px radius, generous internal padding (20–24px) — echoing the reference's clean white content blocks, just inverted for dark mode.
- **Dividers:** 1px Ink 500 hairline, matching the reference's thin gray rule under the in-page nav.

---

## 6. Component Color Mapping (quick reference for Antigravity)

| Component | Background | Text | Accent |
|---|---|---|---|
| Sidebar | Ink 800 | Mist 100 | Frosted Blue (active item) |
| Composer bar | Ink 700 | Mist 100 (placeholder: Mist 300) | Frosted Blue send button |
| Primary button | Frosted Blue 500 | Ink 900 | Frosted Blue 700 on press |
| Secondary/outline button | transparent | Frosted Blue 500 | Frosted Blue 500 border |
| Assistant message / health card | Ink 700 | Mist 100 | Lora headings inside card |
| User message bubble | Ink 600 | Mist 100 | — |
| Triage chip — self-care | `#6FD6A0` at 15% bg, full color text/border | — | — |
| Triage chip — caution | `#F0C15C` at 15% bg, full color text/border | — | — |
| Triage chip — urgent | `#E8685E` at 15% bg, full color text/border | — | — |
| Disclaimer footer bar | Ink 800 | Mist 300 | — |
| Emergency badge (idle) | transparent | `#E8685E` | `#E8685E` outline |

---

## 7. Tailwind Config Reference

Add these as named tokens in `tailwind.config.js` so no component ever hardcodes a hex value:

```js
colors: {
  frosted: {
    100: '#E0FAFF',
    300: '#C3EFF5',
    500: '#9FE2EE',
    700: '#5FB8C9',
    900: '#2E6E7A',
  },
  ink: {
    900: '#0B1416',
    800: '#101B1E',
    700: '#162326',
    600: '#1E2E32',
    500: '#2A3B3F',
  },
  mist: {
    300: '#8CA3A8',
    100: '#EAF6F7',
  },
  triage: {
    self: '#6FD6A0',
    caution: '#F0C15C',
    urgent: '#E8685E',
  },
},
fontFamily: {
  display: ['Lora', 'Georgia', 'serif'],
  sans: ['Inter', 'Public Sans', 'system-ui', 'sans-serif'],
},
```

---

## 8. Usage Summary (one-liner per rule)

1. Frosted Blue = primary interactive color; Light Cyan = light-touch highlight only.
2. Dark Ink surfaces everywhere else — never pure black/white.
3. Lora for headings, Inter for everything else.
4. Line icons only, 1.5px stroke, rounded caps.
5. Triage red/amber/green never used outside triage, emergency, and status contexts.
6. Every text/background pairing must meet WCAG AA contrast.
