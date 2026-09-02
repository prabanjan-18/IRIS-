# Iris — Healthcare Chatbot UI/UX Prompt for Antigravity

> Copy the **MAIN PROMPT** block below directly into Antigravity. Everything above it is context for you; everything inside the fenced block is what you paste in.

---

## 0. Context (for you, not for Antigravity)

- **Product name:** Iris
- **Domain:** Healthcare (symptom triage / patient-facing medical Q&A assistant)
- **Inspiration:** ChatGPT's layout and interaction model, re-skinned with a healthcare identity
- **Scope of this task:** Frontend only (React + Vite + Tailwind CSS). Backend (RAG, OpenRouter API keys, model calls) comes later — leave clearly marked integration points (mock data + placeholder service functions) so wiring the backend later is a drop-in.
- **Why "Iris":** Iris is the part of the eye that controls how much light enters — a clean metaphor for a system that "sees" a patient's symptoms and controls/filters information responsibly. Lean into an eye/lens motif very subtly (e.g., the logo, the loading indicator) without being kitschy.

### Unique healthcare-specific visual ideas baked into the prompt below
1. **Clinical-calm palette** instead of ChatGPT's neutral dark gray — deep teal/navy background with a soft clinical blue-green accent (not clinical *white*, since we're keeping the dark ChatGPT-style theme the user asked for).
2. **Triage/urgency chip** on assistant responses (Self-care / See a doctor soon / Seek urgent care) — a small colored pill above relevant answers.
3. **Persistent, non-intrusive medical disclaimer bar** ("Iris provides general information, not a diagnosis") pinned near the composer — a pattern generic chatbots don't need but medical ones must have.
4. **Source/Citation drawer** — since the backend is RAG-based, every assistant message has a small "Sources (3)" expandable strip, like a mini evidence panel (think clinical reference cards).
5. **Symptom chips in the input area** — quick-tap suggestions like "Fever", "Headache", "Chest pain" instead of ChatGPT's generic "Create an image" tiles.
6. **Emergency escape hatch** — a subtle but always-visible "Emergency? Call local services" affordance, since a health chatbot has a duty-of-care UX pattern generic assistants skip.
7. **Vitals/Health card component** — a structured card renderer (for things like "possible causes," "when to seek care," "home care steps") instead of a wall of prose, so answers look like a clinician's structured note rather than a chat blob.

---

## MAIN PROMPT (paste everything below into Antigravity)

```
You are building the frontend UI/UX for "Iris," a healthcare-domain conversational AI assistant.
This is a FRONTEND-ONLY task. Do not build any backend, RAG pipeline, or real API calls yet —
use mock data and clearly commented placeholder service functions so a backend can be wired in later.

====================================================================
1. TECH STACK & PROJECT SETUP
====================================================================
- React + Vite
- Tailwind CSS (utility-first, no CSS Modules, no styled-components)
- React Router for navigation (main chat page + "All conversations" page)
- lucide-react for icons (fallback: heroicons)
- Component-driven architecture: every UI piece is its own component under /src/components
- Use a global theme config (colors, spacing, radii) defined once in tailwind.config.js
  and referenced everywhere — no hardcoded hex colors inside components.
- Fully responsive: desktop-first layout that gracefully collapses to a mobile drawer sidebar.
- Accessible: proper aria-labels on icon-only buttons, keyboard navigation for dropdowns and
  the chat input, visible focus states, sufficient color contrast (WCAG AA minimum) despite
  the dark theme.
- Folder structure:
  /src
    /components
      /sidebar
      /chat
      /shared
    /pages
      ChatPage.jsx
      AllConversationsPage.jsx
    /data (mock data: mockChats.js, mockMessages.js)
    /services (placeholder functions: sendMessageToBackend.js — stubbed, clearly commented
      "// TODO: connect to RAG + OpenRouter backend")
    /styles (tailwind base layer, custom fonts if any)

====================================================================
2. BRAND & VISUAL IDENTITY — "IRIS"
====================================================================
Iris is a healthcare assistant. The UI should feel like ChatGPT's dark, minimal, spacious
layout, but re-themed to feel clinical-calm and trustworthy rather than generic-tech.

- Overall theme: dark mode, ChatGPT-inspired layout and spacing rhythm.
- Background: near-black with a very slight cool tone (e.g., #0E1416 base, not pure #000000).
- Primary accent color: a calm clinical teal/blue-green (e.g., #2FBFA3 or similar teal),
  used for the send button, active states, links, and the logo — replacing ChatGPT's blue.
- Secondary accent: a soft amber/gold reserved ONLY for urgency/triage indicators, so it
  reads as meaningful, not decorative.
- Sidebar background: a slightly lighter near-black than the main canvas, same relationship
  as ChatGPT's sidebar-vs-canvas contrast.
- Typography: clean humanist sans-serif (Inter or similar), generous line-height for
  readability of medical text, no dense paragraphs — favor structured content blocks.
- Logo/mark: a minimal circular "iris/eye" mark (concentric rings or a lens shape) in the
  top-left of the sidebar next to the wordmark "Iris," echoing an eye's iris without
  being a literal illustrated eye — abstract and modern, single-color, scalable to 20px.
- Micro-interactions: subtle fade/slide transitions on dropdowns, gentle pulse on the
  "thinking" state (avoid anything that feels alarming — no red flashing anywhere except
  the reserved urgent-care indicator).

====================================================================
3. GLOBAL LAYOUT
====================================================================
Two-column app shell, exactly like the reference ChatGPT screenshot:
- LEFT: fixed-width collapsible sidebar (~280px expanded, collapsible to icon-only rail).
- RIGHT: main content area containing the top bar and the active page (chat or all-conversations).

====================================================================
4. SIDEBAR — DETAILED SPEC
====================================================================
Build this as /src/components/sidebar/Sidebar.jsx composed of smaller subcomponents.

--- 4.1 Top row: two icon buttons ---
Two icon-only buttons side by side at the top of the sidebar:

A) OPTIONS ICON (a "hamburger-like" or grid/menu icon — use a simple 3-line or app-menu icon).
   Clicking it opens a DROPDOWN MENU with 4 top-level sections, laid out like a native
   desktop app menu (File / Edit / View / Help), where hovering or clicking each section
   reveals its own submenu flying out immediately to the right of that section (a nested
   flyout menu, not an accordion):

   - File
     - New conversation
     - Close window
     - Exit
   - Edit
     - Undo
     - Redo
     - Cut
     - Copy
     - Paste
     - Select All
   - View
     - Actual Size
     - Zoom In
     - Zoom Out
     - Full Screen
     - Reload
   - Help
     - Get Support
     - About Iris

   Implementation notes:
   - Build this as a small reusable NestedDropdownMenu component: a vertical list of 4
     items, each with a right-pointing chevron; on hover/focus, a submenu panel appears
     anchored to that item's right edge, vertically aligned with it.
   - Keyboard accessible: arrow keys move between top-level items, Enter/ArrowRight opens
     the submenu, Escape closes.
   - These actions can be no-ops or console.log stubs for now (frontend-only task) —
     just wire the UI interaction fully.

B) SEARCH ICON (magnifying glass).
   Clicking it turns into a search input inline (or opens a small search panel) for
   searching past conversations. Below the input, show a dropdown/list of "Recent chats"
   (from mock data) filtered live as the user types. Empty state: "No conversations found."

--- 4.2 "New chat" action ---
Directly below the two icons: a single full-width row with a "+" icon followed by the
label "New chat". Clicking it clears the active conversation and starts a fresh one
(resets ChatPage to its empty "Where should we begin?" state).

--- 4.3 "Chats" section ---
Below "New chat," a section labeled "Chats":
- By default it is a static list (not visually a dropdown).
- When the user hovers over the "Chats" label, a small chevron (down/up arrow) fades in
  on the right side of the label, indicating it can be collapsed/expanded.
- Clicking the label or the chevron toggles the section between expanded (full list) and
  collapsed (hidden).
- The list shows conversation titles (from mock data), most recent first, each row with:
  a truncated title, and on hover, a "..." kebab menu (Rename / Delete) matching ChatGPT's
  pattern.
- Show a maximum of 15 chats inline. If there are more than 15, after the 15th item show
  a "View all conversations" link/button. Clicking it navigates (React Router) to a
  separate AllConversationsPage that lists every conversation in a searchable, scrollable
  full-page list.

--- 4.4 Sidebar footer ---
Bottom of the sidebar: a user account row (avatar circle with initials, display name,
and a subtitle/status), matching the ChatGPT reference screenshot's bottom-left pattern.
Use mock user data.

====================================================================
5. TOP BAR (right panel header)
====================================================================
- A centered pill-shaped toggle with two modes, replacing ChatGPT's "Chat / Work":
  use "Chat" and "Clinical Mode" (Clinical Mode is a visual variant only for now — e.g.
  it could later show more structured/verbose answers; for this frontend task just make
  it a working toggle that changes a bit of styling/labeling, no real logic needed).
- Keep the top bar minimal and transparent over the dark background, exactly matching the
  reference screenshot's spacing.

====================================================================
6. MAIN CHAT PAGE — EMPTY STATE (matches attached screenshot)
====================================================================
- Vertically centered heading, healthcare-flavored instead of generic, e.g.
  "What's going on with your health today?"
- Below it, the message composer (see section 7).
- Below the composer, three quick-suggestion rows with icons (replacing ChatGPT's
  "Create an image / Write or edit / Search the web"), using domain-relevant actions:
  - "Check my symptoms" (stethoscope/activity icon)
  - "Understand a medication" (pill icon)
  - "Find urgent care guidance" (map-pin/alert icon)
- Additionally, render a row of tappable SYMPTOM CHIPS just above or below the composer
  (e.g., "Fever", "Headache", "Cough", "Chest pain", "Fatigue", "Rash") — small rounded
  pill buttons that, when clicked, insert that symptom into the composer input. This is
  unique to Iris and has no ChatGPT equivalent — build it as its own SymptomChips
  component so it's easy to reuse.

====================================================================
7. MESSAGE COMPOSER
====================================================================
- Rounded pill/rectangle input bar pinned at the bottom (or centered, in empty state),
  matching the reference screenshot: "+" attach icon on the left, placeholder text
  "Describe your symptoms or ask a health question...", and on the right a
  model/mode selector ("Think" equivalent — label it "Reasoning") plus a mic icon and a
  circular send button using the teal accent color.
- Directly beneath the composer (small, low-emphasis text, always visible, not
  dismissible): a one-line disclaimer bar:
  "Iris provides general health information, not a medical diagnosis. In an emergency,
  contact local emergency services immediately."
  Style it as a thin, quiet banner (small icon + text), never as a modal or anything
  that blocks interaction — it should feel like a permanent, calm safety footer.
- To the far right of that disclaimer line (or as a small persistent badge in the top bar),
  include an always-visible "Emergency" affordance — a small outlined button/badge reading
  "Emergency? Get help" in the reserved amber/urgent color, that on click opens a simple
  modal with emergency-contact style guidance (mock content is fine).

====================================================================
8. CHAT CONVERSATION VIEW (after first message)
====================================================================
- User messages: right-aligned bubble, subtle background tint.
- Assistant (Iris) messages: left-aligned, no heavy bubble background (like ChatGPT),
  prefixed with the small Iris mark as an avatar.
- Structure assistant answers as a STRUCTURED HEALTH CARD component, not a single prose
  blob, with optional sub-sections (only render the ones that have content):
  - A one-line summary
  - "Possible causes" (bullet list)
  - "Self-care steps" (bullet list)
  - "When to seek care" (bullet list)
  - A TRIAGE CHIP at the top of the card, one of three states with distinct colors:
      🟢 Self-care may be appropriate
      🟡 Consider seeing a doctor soon
      🔴 Seek urgent/emergency care
  - A collapsible "Sources (n)" strip at the bottom of the card — clicking it expands a
    small list of mock reference sources (title + snippet), styled like citation chips,
    representing where the future RAG backend will surface retrieved documents.
- Below each assistant message, small icon actions on hover: Copy, Regenerate,
  Good response / Bad response (thumbs), matching ChatGPT's pattern.
- A typing/"thinking" indicator: three soft pulsing dots using the teal accent, shown
  while a mock response is "loading" (simulate with a timeout using mock data).

====================================================================
9. ALL CONVERSATIONS PAGE
====================================================================
- Reached via the sidebar's "View all conversations" link.
- Full-page, searchable, scrollable list of every mock conversation with title, last
  message preview, and timestamp. Include a search bar at the top and a "Back to chat"
  affordance.

====================================================================
10. MOCK DATA & INTEGRATION POINTS
====================================================================
- /src/data/mockChats.js — an array of ~20+ fake conversation objects (id, title,
  lastMessagePreview, timestamp) so the 15-item-then-"View all" behavior is testable.
- /src/data/mockMessages.js — a couple of full mock conversations with structured
  assistant responses (summary, causes, self-care, when-to-seek-care, triage level,
  sources) so the Structured Health Card component has real shapes to render.
- /src/services/sendMessageToBackend.js — export a single async function
  `sendMessageToBackend(message, conversationHistory)` that currently just returns a
  mock structured response after a simulated delay. Add a clear comment block explaining
  this is the single integration point where the RAG + OpenRouter backend will be wired
  in later, and that it should keep the same return shape.

====================================================================
11. DELIVERABLE
====================================================================
Generate the full React + Vite + Tailwind project structure described above, fully
functional on the frontend (mock data, working dropdowns, working sidebar
collapse/expand, working navigation between ChatPage and AllConversationsPage, working
symptom chips, working structured health-card rendering, working triage chips, working
sources drawer, working emergency modal), styled to match the clinical-calm dark theme
described in section 2, with layout and spacing closely following the attached ChatGPT
reference screenshot for overall composition (sidebar width, top bar, centered composer,
message spacing) — but with every element re-skinned for the Iris healthcare identity as
specified above. Do not implement any real backend calls, authentication, or persistence.
```

---

### How to use this
1. Open Antigravity, create/point it at your React + Vite + Tailwind project.
2. Paste the whole fenced block above as your instruction.
3. Attach the ChatGPT reference screenshot alongside it for visual grounding.
4. Once the frontend scaffold is generated, you can iterate section-by-section (e.g., "now refine the nested File/Edit/View/Help dropdown animation") before moving on to wiring the RAG + OpenRouter backend into `sendMessageToBackend.js`.
