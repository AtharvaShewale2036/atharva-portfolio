# Atharva Shewale Portfolio: Design Spec

Date: 2026-10-25
Status: Draft for review
Visual system: [`DESIGN.md`](../../../DESIGN.md) ("Cartridge Library", lints clean)

## 1. Intent

**Outcome.** A live portfolio site, reachable by link and QR code, that gets Atharva interviews at game/real-time studios and freelance ArchViz/XR clients.

**Audience.**
- Studio leads and recruiters (games, simulation): skim in 10 seconds, then go deep on one project.
- ArchViz/XR clients: want to see finished interactive work on their kind of hardware (touch, VR, PC).

**What the user said.** Audience is studios + clients. Home + case studies. Free Vercel URL first. Phone/WhatsApp public. eVaColregs shown as systems + role, no code. Frequency Zero role titled "Lead Gameplay Programmer". Visual direction from user mockups (crate, box & manual, chip teardown, quick start list).

**Assumptions (correct if wrong).**
- Domain: `*.vercel.app` at launch; custom domain later.
- English only.
- No CMS; content edited as Markdown files in the repo.
- User's own Vercel/GitHub accounts; Claude cannot create accounts.

**Success criteria.**
1. Recruiter path: from QR scan to "role + strongest project + résumé" in under 10 seconds on a phone.
2. Lead path: from home to a system-level breakdown (problem / approach / result) in 2 clicks.
3. Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
4. Full keyboard operation; every 3D interaction has a flat equivalent.
5. No placeholder text in production.

## 2. Scope

**In v1**
- Home: crate (full mode) + Quick Start list (default on phone / reduced motion).
- About, Experience, Contact sections (inside Quick Start view, also reachable by nav anchors).
- Project pages for 6 cartridges. Two get the full Box & Manual + chip teardown (eVaColregs, Frequency Zero). Four get a light Box page (back of box + video + features).
- Résumé PDF download.
- SND toggle (off by default): two short sounds (cartridge flip, chip select).
- Open Graph image, favicon, sitemap, robots.txt.
- Deploy to Vercel; QR code PNG + SVG pointing to the live URL.

**Not in v1 (YAGNI, revisit later)**
- Concept 4 "exploded teardown" scroll animation.
- Contact form, blog, analytics, CMS, i18n, dark/light toggle (the system is dark by design).
- Code links ("View C++"): eVaColregs code is private and Frequency Zero is 100% Blueprint. Replaced with "View Blueprint" image links where a screenshot exists; otherwise hidden.

## 3. Stack

**Astro (static output) + plain CSS + small vanilla JS islands.** Chosen over Next.js (server features unused, heavier JS) and hand-written HTML (two case-study pages would duplicate layout).

- Content: Astro content collections, one Markdown file per project, schema-validated frontmatter.
- Styling: CSS custom properties generated from `DESIGN.md` tokens (`designmd export --format css-vars`), one global stylesheet plus scoped component styles.
- Fonts: `@fontsource/silkscreen` and `@fontsource/ibm-plex-mono` (self-hosted WOFF2, `font-display: swap`, latin subset).
- 3D: CSS transforms only. No WebGL, no animation library.
- Video: YouTube "lite" embed (static thumbnail, iframe injected on click, `youtube-nocookie.com`).
- Hosting: Vercel static deploy from a GitHub repo; preview deploys per push.

## 4. Information architecture

```
/                       Home: crate (full) or Quick Start list + About/Experience/Contact
/work/evacolregs        Box & Manual + teardown
/work/frequency-zero    Box & Manual + teardown
/work/saridena-archviz  Light box page (Resort + Apartment videos)
/work/ctrlaltexp-touch  Light box page
/work/ctrlaltexp-vr     Light box page
/work/trapped-in-terror Light box page
/resume.pdf
```

Header on every page: name (home link), role line, nav (Projects, About, Experience, Contact), Résumé (PDF), Quick Start / Full Mode toggle, SND.

### Cartridge order and spine colours

| # | Cartridge | Spine | Role line | Status |
|---|---|---|---|---|
| 01 | eVaColregs | blue | Game Developer, eDot Solutions · C++ | Shipped |
| 02 | Frequency Zero | red | Lead Gameplay Programmer · Blueprints | Prototype on itch.io |
| 03 | Saridena ArchViz (Resort + Apartment) | green | UE5 Artist & Developer (Intern) | Delivered |
| 04 | CtrlAltExp Touch + PC ArchViz | purple | Freelance UE5 Developer | Delivered |
| 05 | CtrlAltExp VR ArchViz | teal | Freelance UE5 Developer | Delivered |
| 06 | Trapped in Terror | orange | Solo developer | Prototype |

## 5. Page specs

### 5.1 Home: full mode (≥768px, motion allowed)
- Left: headline "DIG THROUGH MY CRATE", sub-line "> Every project I've shipped or prototyped, filed like records."
- Centre: crate with 6 cartridges. Input: wheel, ←/→, click a spine. Front cartridge tilts out. `aria-live="polite"` announces "01 of 06, eVaColregs".
- Right: flipped-to card (index, name, genre · engine · platform, role, one line, PULL OUT → project page, LIST VIEW → Quick Start).
- Below the fold: About, Experience, Contact (same components as Quick Start).

### 5.2 Home: Quick Start (default <768px or `prefers-reduced-motion`; toggle elsewhere)
- Name in display type, role line in lamp red, one-sentence intro, availability line ("Open to full-time roles · Remote / relocate · Goa, India").
- Buttons: Résumé (PDF) primary, LinkedIn, Email, WhatsApp.
- Cartridge list (best first), each row links to its project page.
- About: photo slot, 3–4 sentence bio, skills grouped as in résumé (Visualisation, Interactivity, Programming, Platforms & tools).
- Experience: timeline from résumé (eDot, freelance UE5, Saridena, freelance 3D/motion), education + Epic certificate.
- Contact: email, phone, WhatsApp (`wa.me` link), LinkedIn, YouTube, itch.io.
- The mode choice persists in `localStorage` (wrapped in try/catch; default applies on failure).

### 5.3 Full project page (eVaColregs, Frequency Zero)
Tabs: BACK OF BOX · MANUAL · PLAY ↗ (external: colregs.ai / itch.io).
- **Back of box:** box with cover art and tagline; summary card with role, engine, team size, dates, platform, one-paragraph pitch, main video, 3 headline facts.
- **Manual ch.01 Systems I Built:** chip board + teardown panel. Each chip = one system with: title, 5–15 s clip or still, Problem / Approach / Result (one line each), optional "View Blueprint" image. Spec sheet lists all chips. Esc closes, ←/→ moves between chips.
- **Manual ch.02 Troubleshooting:** 3–5 stories as Challenge / Tried / Fix, taken from the source docs' engineering stories.
- **Manual ch.03 Credits:** Atharva's exact contributions first, then team credits.

Chip plan:
- **eVaColregs** (from "My contributions" only): Multiplayer dedicated server · Abnormal situations & BAM · Collision & hazard handling · First-person deck walking & binoculars · Time control & question UI · Front end & Pixel Streaming ops.
- **Frequency Zero** (from Atharva's commit areas only): Ping pool priority & eviction fix · Shared enemy senses AI · Purge & look-directed dash · Tutorial system (non-pausing prompts) · Adaptive music director · Optimisation pass.

Claims rule: a system is presented as Atharva's work only if it appears in his contribution list in the source docs. Team systems he integrated are labelled as "integrated" or credited.

### 5.4 Light project page (ArchViz ×3, Trapped in Terror)
Back of box only: cover (YouTube thumbnail until real art arrives), client, role, duration, platforms (touch / PC / VR / Quest / AR), video(s), features list from video descriptions, tools.

## 6. Content model

`src/content/projects/<slug>.md` frontmatter (validated with zod):

```yaml
order: 1
slug: evacolregs
title: eVaColregs
spine: blue            # blue | red | green | purple | teal | orange
tier: full             # full | light
genre: COLREGs training simulator
engine: UE5.5 (source build)
platform: Windows · Browser (Pixel Streaming)
role: Game Developer · eDot Solutions
status: Shipped
dates: Nov 2025 – present
team: string?          # optional
oneLine: string
tagline: string?
cover: image?          # optional; falls back to YouTube thumbnail
videos: [{ youtubeId, title }]
links: [{ label, href }]     # PLAY ↗ etc.
facts: [string]              # 3 headline facts, full tier only
chips: [{ id, title, problem, approach, result, clip?, blueprint? }]   # full tier only
troubleshooting: [{ challenge, tried, fix }]                           # full tier only
credits: { mine: [string], team: [{ name, role }] }
```

Missing optional fields hide their UI. Placeholder text is a build error: a check fails the build if any rendered page contains `[` followed by a known placeholder word (`one line`, `role`, `what`, `ADD`).

## 7. Assets

| Asset | Source | Status | Use |
|---|---|---|---|
| Frequency Zero poster | user (chat) | received | Cartridge label + box cover |
| COLREGs promo video | eDOT share, `COLREGs-Promo-Compressed.mp4` | **needs eDOT permission**, upload to YouTube unlisted | eVaColregs main video |
| COLREGs brochure PDF, standee JPG | eDOT share | **needs eDOT permission** | Stills for eVaColregs chips/box |
| 5 playlist videos | YouTube | public | Light pages + crate covers |
| Headshot | user | pending | About |
| Showreel | user | pending | Home (slot hidden until provided) |
| System clips / screenshots | user | pending | Chips (still image fallback, else text-only chip) |
| Résumé PDF | folder | received (contains placeholder showreel URL) | Download |

Images: AVIF/WebP via Astro `<Image>`, explicit width/height, lazy below the fold. Promo MP4 is not self-hosted (size); YouTube unlisted embed instead.

## 8. Interaction, accessibility, performance

- All 3D in CSS; JS only for crate input, mode toggle, chip selection, lite-YouTube, SND. Target JS < 20 KB gzipped per page.
- `prefers-reduced-motion`: Quick Start forced on home, box flip replaced by tab switch, no tilts.
- Crate and board are `role="listbox"` / buttons with visible focus; ←/→/Home/End supported; Esc closes teardown.
- Contrast pairs are AA-checked in `DESIGN.md`.
- Fonts preloaded (2 files). LCP element on phone is the name text, not an image.
- SND: Web Audio, off by default, choice stored per viewer, never plays before a user gesture.

## 9. SEO and sharing

- Title pattern: `Atharva Shewale · UE5 Developer` / `<Project> · Atharva Shewale`.
- Meta description per page; Open Graph image 1200×630 per project (cartridge render) and for home.
- `sitemap.xml`, `robots.txt`, canonical URLs, JSON-LD `Person` on home.

## 10. Deployment and QR

1. `git init`, GitHub repo under the user's account (user creates it or authorises `gh`).
2. Vercel project linked to the repo (user logs in); framework preset Astro; production branch `main`.
3. After first deploy, generate `public/qr.svg` and `qr.png` (high error correction, cream on charcoal with quiet zone) for the production URL; also export a print-ready PNG for the résumé.
4. Custom domain later: add in Vercel, update QR only if the URL changes (point QR at the domain once bought).

## 11. Testing

- `astro check` + zod schema validation on build.
- Placeholder scan (section 6) on build.
- Playwright smoke test: home loads in both modes, crate keyboard nav, project page tabs, chip select + Esc, every internal link resolves, no console errors.
- Lighthouse CI run on mobile for `/` and `/work/evacolregs` against section 1 targets.
- Manual check on a real phone via the QR code before sharing.

## 12. Open items for the user

1. eDOT written OK to use promo video, brochure and standee publicly.
2. Frequency Zero dates: résumé says Oct 2025–present, project doc says Jan–Oct 2026.
3. Résumé PDF still has `[ADD YOUTUBE URL]`; send updated PDF or showreel link.
4. Headshot, showreel, system clips/screenshots as they become available.
5. GitHub and Vercel accounts for deployment.
