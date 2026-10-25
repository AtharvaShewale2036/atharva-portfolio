---
version: alpha
name: Cartridge Library
description: Portfolio system for Atharva Shewale, UE5 developer. Projects are physical game cartridges filed in a crate, read like a boxed game and its manual, for studio leads and ArchViz clients.

colors:
  primary: "#B91E2F"
  primary-deep: "#96182A"
  primary-bright: "#E8737C"
  surface: "#2A292E"
  surface-raised: "#3A393F"
  on-surface: "#F1E8D4"
  on-surface-muted: "#A9A6AE"
  border: "#5A585F"
  paper: "#F1E8D4"
  ink: "#1C1B1F"
  ink-muted: "#625F67"
  board: "#13201A"
  contact: "#C9A25C"
  spine-blue: "#2B5BA0"
  spine-green: "#2F6B3A"
  spine-purple: "#5B2D8C"
  spine-orange: "#A04516"
  spine-teal: "#1F6E66"

typography:
  display:
    fontFamily: Silkscreen
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: 0.04em
  headline-lg:
    fontFamily: Silkscreen
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: 0.06em
  headline-md:
    fontFamily: Silkscreen
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.08em
  title:
    fontFamily: Silkscreen
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.14em
  label-caps:
    fontFamily: Silkscreen
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.22em
  body-lg:
    fontFamily: IBM Plex Mono
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.5
  body-md:
    fontFamily: IBM Plex Mono
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  data:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0.02em

rounded:
  none: 0px
  sm: 2px
  md: 6px
  lg: 14px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  3xl: 96px

components:
  page:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
  page-muted:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
  role-tag:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-bright}"
    typography: "{typography.label-caps}"
  nav-link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps}"
  nav-link-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.paper}"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  button-ghost-on-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md}"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  panel-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    typography: "{typography.label-caps}"
    padding: "{spacing.md}"
  panel-meta:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
  panel-link:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
  cartridge-shell:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.lg}"
  cartridge-label:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.paper}"
    typography: "{typography.headline-md}"
    rounded: "{rounded.sm}"
  board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.xl}"
  chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.none}"
    padding: "{spacing.lg}"
  chip-selected:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.paper}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
  edge-contact:
    backgroundColor: "{colors.contact}"
    width: 8px
    height: 24px
  video-slot:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-sm}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  spine-blue:
    backgroundColor: "{colors.spine-blue}"
    textColor: "{colors.paper}"
    width: 8px
  spine-green:
    backgroundColor: "{colors.spine-green}"
    textColor: "{colors.paper}"
    width: 8px
  spine-purple:
    backgroundColor: "{colors.spine-purple}"
    textColor: "{colors.paper}"
    width: 8px
  spine-orange:
    backgroundColor: "{colors.spine-orange}"
    textColor: "{colors.paper}"
    width: 8px
  spine-teal:
    backgroundColor: "{colors.spine-teal}"
    textColor: "{colors.paper}"
    width: 8px
---

# Cartridge Library

## Overview

Every project Atharva has shipped is a game cartridge. The home page is a crate of them; pulling one out turns it into a boxed game. The back of the box is the 10-second summary a recruiter needs. The manual inside is the case study a technical lead reads. The circuit board inside the cartridge is the systems teardown, where each chip is one system he built.

The metaphor is chosen because the audience is game studios and real-time visualisation clients, people who grew up with physical media and who judge a developer by whether the work feels *made*. It also solves the portfolio's real structural problem: two depths of reader (skimmer and deep reader) served by one object that literally has an outside and an inside.

Register: late-90s console packaging seen under a desk lamp. Charcoal plastic, cream paper inserts, one signal red, a green PCB with gold contacts. Pixel display type, monospace body.

**What it gives up.** Photographic luminosity and lightness. This is not a gallery of hero renders on white; ArchViz imagery sits inside dark frames and video slots, never full-bleed. It also gives up neutrality: a studio looking for a clean corporate CV will find this playful. That is accepted, because the target reader is a game or real-time lead.

Every 3D gesture (crate tilt, box flip, chip select) has a flat equivalent in **Quick Start** mode, a cream list view that is the default on phones and under `prefers-reduced-motion`. The metaphor is the reward, never the gate.

## Colors

The palette is sampled from one object: a grey console cartridge with a red label, its cream instruction manual, and the green board inside. Nothing comes from a framework default.

- **Signal red (primary):** the cartridge label red. The only colour for action: primary buttons, the selected chip outline, the active nav underline, panel headers. Under 5% of any screen.
- **Pressed red (primary-deep):** the hover/pressed state of signal red. Never used at rest.
- **Lamp red (primary-bright):** signal red lifted to read as text on charcoal (role line under the name, "Lead Gameplay Programmer" tags). Signal red itself fails AA on charcoal, so text on dark always uses this.
- **Cartridge charcoal (surface):** the page. Slightly violet-tinted, never pure grey. A soft radial lift toward the centre, like a desk lamp, is allowed; nothing else is.
- **Shell grey (surface-raised):** cartridge shells, box shells, selected chips. One step up from the page.
- **Manual cream (paper / on-surface):** the insert paper, and the main text colour on charcoal. One value, two jobs: it is the same paper whether you read on it or it is the ink.
- **Faded label (on-surface-muted):** secondary text and nav on charcoal.
- **Print ink (ink) / pencil (ink-muted):** text on cream; ink also fills chips and video slots.
- **Seam grey (border):** rules and 1px button outlines on charcoal.
- **PCB green (board) / gold contact (contact):** only inside the cartridge (teardown board and edge connector). Never used for UI chrome.
- **Spine colours (spine-blue/green/purple/orange/teal, plus signal red):** one per project, used only for that project's crate spine, list-row bar and "VIEW →" link. A spine colour never appears outside its own project.

Assignment: eVaColregs blue, Frequency Zero red, Saridena ArchViz green, CtrlAltExp Touch purple, CtrlAltExp VR teal, Trapped in Terror orange.

## Typography

Two faces, split by job:

- **Silkscreen** (OFL, Google Fonts): pixel display face. Names, headings, button labels, nav, chip labels. Always uppercase. Pixel faces render crisp only on their grid, so display sizes snap to multiples of 8px (16, 24, 40, 64). Tracking is positive at every size, the one deliberate exception to "negative tracking at display": bitmap letterforms collide without air.
- **IBM Plex Mono** (OFL): everything you actually read. Body, problem/approach/result lines, spec-sheet rows, metadata. Weights 400 and 600 only. The `>` prompt prefix on short statements is part of the voice.

Fallback stacks: `Silkscreen, "Courier New", monospace` and `"IBM Plex Mono", ui-monospace, Consolas, monospace`. Self-host both as WOFF2 subsets with `font-display: swap`.

Never set paragraphs in Silkscreen. Never set more than three lines of anything in display size.

## Layout

8px base, all spacing on the scale. Content max width 1440px with 64px side gutters on desktop, 16px on phone.

- **Header:** name left, then role in muted label caps, then actions right (Résumé PDF ghost button, Quick Start / Full Mode paper button, SND toggle).
- **Crate (home, full mode):** asymmetric three-column composition: headline left (~30%), crate centre, flipped-to card right (~30%). The crate is the visual centre of mass, not the headline.
- **Box & Manual (project page):** box left (~30%), open two-page manual right. Tabs above: BACK OF BOX / MANUAL / PLAY ↗.
- **Teardown (inside manual):** board left, detail panel right (~50/50).
- **Quick Start:** single column, panel spans the 1440px content width, rows of fixed height.
- **Body measure:** 60–72ch.

Breakpoints: ≥1200px full composition; 768–1199px crate/box stacks above its card; <768px Quick Start is forced and 3D is not rendered at all.

## Elevation & Depth

Depth is physical, not material-design. Objects are drawn as isometric CSS 3D (`transform: rotateX/rotateY` with `perspective`), lit from the top-left like a desk lamp.

- Shadows fall down-right only, coloured from the page (charcoal at 60% darker), never neutral black: `8px 10px 0 rgba(14,13,16,.55)` for paper panels, giving a hard offset like a printed insert lifted off a table.
- Buttons have a 3px solid bottom edge one tone darker than their face (pressed red under signal red). On press it collapses to 0 and the button moves down 3px.
- Cartridge shells have two parallel hairline grooves near the top edge in seam grey; that groove is the shell's signature and appears on box, cartridge and crate.
- No blur, no glassmorphism, no glow, except the selected chip's 2px signal-red outline.

## Shapes

Hierarchical radius, matched to real objects:

- **none:** chips (ICs are square).
- **sm (2px):** buttons, labels, tags. Reads as die-cut card.
- **md (6px):** paper panels and the board.
- **lg (14px):** cartridge and box shells, the only soft object.

Borders: 1.5px seam grey on ghost buttons on charcoal; 1.5px ink on ghost buttons on cream; hairline (1px) seam grey or ink-at-15% for table rows. Edge contacts are an 8px gold stripe pattern with 6px gaps.

## Components

- **Crate:** 6 cartridges standing in a box, spines showing project colours. Scroll wheel, ←/→, or click flips; the front cartridge tilts 12° out. The right-hand card shows: index (01 / 06), project name, one-line genre/engine/platform, role in signal red (it sits on cream, where signal red passes AA), one-line "what I built", PULL OUT (primary) and LIST VIEW (ghost).
- **Box (back of box):** title band in the project spine colour, cover art in the window, studio/engine badge. Click to flip.
- **Manual:** cream two-page spread, page numbers bottom corners, chapter labels in signal red label caps. Chapters: 01 Systems I Built, 02 Troubleshooting (Challenge / Tried / Fix), 03 Credits.
- **Board + chips:** 4–6 chips per project, wired with signal-red traces to the selected chip and contact-gold traces otherwise. Selected chip: shell-grey fill, 2px signal-red outline. Board footnote: "> Every chip is a system I built. Select one to see it running."
- **Teardown panel:** signal-red header bar ("TEARDOWN · CHIP 02 SELECTED", "ESC CLOSE"), system title, video slot (5–15s clip), Problem / Approach / Result lines, link buttons, spec sheet table of all chips.
- **Quick Start row:** spine bar, index, project name in title type, role · status · engine, one-line summary, "VIEW →" in spine colour.
- **Video slot:** ink rectangle with a bracketed muted caption until a clip loads. YouTube embeds load only on click (thumbnail first).
- **Focus:** every interactive element shows a 2px lamp-red outline at 2px offset on charcoal, or signal-red on cream. Keyboard order follows reading order; Esc closes panels.

## Do's and Don'ts

- Do give every 3D interaction a keyboard path and a Quick Start equivalent.
- Do keep signal red for actions and selection only; emphasis elsewhere uses Silkscreen or weight 600.
- Do use lamp red, not signal red, for any red text on charcoal.
- Do keep each spine colour inside its own project.
- Do snap Silkscreen sizes to multiples of 8px from 16px up.
- Don't set body copy, bullet lists or anything over three lines in Silkscreen.
- Don't add a second accent colour, gradients, glow or glass effects.
- Don't use neutral black drop shadows or blurred shadows; offsets are hard and charcoal-tinted.
- Don't show PCB green or contact gold outside the cartridge interior.
- Don't autoplay video or load YouTube iframes before a click.
- Don't render the crate, box flip or exploded views under `prefers-reduced-motion` or below 768px.
- Don't put placeholder brackets ("[one line]") in production; an empty field hides its row.
