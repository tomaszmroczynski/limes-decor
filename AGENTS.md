# Limes Dekor Agent Instructions

Before making product, architecture, UI, backend, checkout, rendering, or
deployment changes in this repository, read `PRODUCTION_PROMPT.md` and treat it
as the current production specification.

The non-negotiable product rule is:

```text
Forma jest moja. Treść jest Twoja.
```

The non-negotiable technical rule is:

```text
Text for personalization must be rendered deterministically as vectors by code.
Do not use image models for final text rendering or production artwork.
The customer preview and LightBurn SVG must come from the same render function.
```

Keep the Limes visual system dark, restrained, square-cornered, and amber-accented.
When implementation choices are open, prefer the sequence and acceptance criteria
defined in `PRODUCTION_PROMPT.md`.
