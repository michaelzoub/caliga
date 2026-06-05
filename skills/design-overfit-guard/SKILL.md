---
name: design-overfit-guard
description: Use when implementing UI from a visual reference, especially when the user gives specific deltas. Prevents overfitting, wholesale redesigns, oversized typography, and invented layout changes.
---

# Design Overfit Guard

When a user asks for UI to match a reference and gives specific updates, treat the reference as the layout contract and the updates as surgical deltas.

## Workflow

1. List the reference invariants before editing:
   - first-viewport composition
   - relative type scale
  - navigation treatment
  - footer treatment
  - spacing density
  - color hierarchy
  - media placement
2. List the user deltas separately.
3. Edit only where the deltas require it.
4. Before finalizing, run an overfit check:
   - Did I redesign the page instead of modifying it?
   - Did I inflate typography because the reference has a large hero?
   - Did I copy mood while losing structure?
   - Did I add decorative elements the user did not ask for?
   - Did I preserve the requested copy/media?

## Guardrails

- Do not convert a reference into a different editorial system unless explicitly asked.
- Do not make hero text larger than the reference when the copy is longer.
- Prefer matching layout proportions over matching isolated visual motifs.
- If the user says “make these specific updates,” keep the existing/reference layout and apply those updates only.
- Animated components should support the composition, not become the composition.
- Footer must share the landing page’s typography and color system. Do not introduce a separate footer mood, oversized text wordmark, extra decorative animation, or off-palette accent; use the actual logo when the page uses logo branding.
