# Plist Maker — Design Brainstorm

## Three possible directions

### Theme Name: Manifest Workshop
**Very Brief Intro:** A warm technical workbench that makes a specialized deployment task feel precise, calm, and approachable. It favors editorial composition and visible craft over generic dashboard chrome.
**Probability:** 0.043

### Theme Name: Device Field Notes
**Very Brief Intro:** A soft, document-inspired workspace built around annotation, validation, and handoff. The feeling is closer to a trusted deployment notebook than a web form.
**Probability:** 0.076

### Theme Name: Signal Terminal
**Very Brief Intro:** A dark, high-contrast command interface with a restrained electric accent and compact information density. It signals technical confidence without turning into a game UI.
**Probability:** 0.029

## Chosen Approach: Manifest Workshop

### Design Movement
Contemporary editorial tooling with Japanese stationery influences and a hint of early Apple documentation: tactile paper surfaces, considered rules, purposeful color, and careful typographic hierarchy.

### Core Principles
1. Treat each generated manifest as a small, inspectable artifact rather than an invisible background action.
2. Pair a clear left-to-right workflow with a live, legible output panel so progress is never ambiguous.
3. Use functional warmth—cream paper, ink, and a restrained blue—to reduce the intimidation of OTA deployment work.
4. Make validation and handoff visible, with friendly plain-language explanations alongside technical correctness.

### Color Philosophy
The interface uses a warm mineral background to make technical work feel human, dark ink for authority and readable code, and a saturated cobalt as the single signal color for actions, valid states, and link creation. A restrained orange-red appears only where input attention is needed.

### Layout Paradigm
An asymmetric workshop bench: a narrow left rail establishes product identity and workflow steps; the main canvas splits into an editable form column and an output artifact column. On small screens, the output follows the active form rather than competing with it.

### Signature Elements
1. Numbered cobalt step markers that double as workflow landmarks.
2. A fine red “binding thread” rule that moves through section headings and status elements.
3. A code-paper preview with line numbers, annotation tabs, and visible fold-like corners.

### Interaction Philosophy
The interface is direct and local. Every key action gives a compact, truthful response: the preview updates while typing, copied values confirm in context, and a generated manifest visually transitions from draft to ready.

### Animation
Use 160–220ms custom ease-out transitions for focus, hover, and copy states. Newly valid output enters with a 0.96-to-1 scale plus opacity transition; the binding thread and step markers use subtle transforms only. Respect reduced-motion preferences and never animate typing or keyboard navigation.

### Typography System
Use **DM Serif Display** for product and editorial headings, creating a crafted document feel, and **DM Sans** for form labels, instructions, and controls. Use **IBM Plex Mono** for URLs, filenames, values, and XML. Major heading tracking is slightly tight; labels are uppercase, small, and widely tracked.

### Brand Essence
**Plist Maker is the focused manifest workbench for iOS teams who need a dependable handoff from signed IPA to device installation.** Personality: meticulous, calm, practical.

### Brand Voice
Headlines are crisp and specific; CTAs name the real artifact or action; microcopy clarifies technical requirements without pretending to host or sign the app. Example lines: “Shape the manifest. Keep the chain intact.” and “Download the file, then point iOS at its HTTPS address.” Avoid generic welcomes, vague promises, and hype.

### Wordmark & Logo
The mark is an offset cobalt document with a single folded corner and an inset `< / >`-like glyph formed from three rounded strokes. The Plist Maker wordmark uses a compact serif “Plist” paired with a restrained sans “Maker,” not a default single-font treatment.

### Signature Brand Color
**Manifest Cobalt — #2457E6**. This blue is reserved for action, verification, and the identity mark.

## Style Decisions

- Hero imagery will always depict manifest-adjacent workshop material: annotated XML, signed IPA handoff notes, folded document surfaces, or device-install documentation—not generic office stock.
- Manifest Cobalt `#2457E6` is reserved for the identity, workflow markers, primary actions, links, and valid or ready states. Warm paper, ink, and rulework carry the atmospheric surfaces.
- The wordmark always pairs a crafted serif **Plist** with a restrained sans **Maker**, alongside the folded cobalt document mark.
- The generated plist is presented as the primary handoff artifact, with code-paper materiality, line-number rhythm, a folded corner, and a visible ready state.
