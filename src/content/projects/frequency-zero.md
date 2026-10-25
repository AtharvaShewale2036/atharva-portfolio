---
order: 2
title: Frequency Zero
spine: red
tier: full
genre: First-person horror shooter
engine: UE5.6 · 100% Blueprints
platform: Windows
role: Lead Gameplay Programmer
status: Prototype on itch.io · IGDC 2026 (planned)
dates: Oct 2025 – Present
team: 8 developers
oneLine: You are blind; every shot flashes the world into view and tells the monsters where you are.
tagline: You don't need eyes to survive.
cover: ../../assets/covers/frequency-zero.webp
links:
  - label: Play on itch.io
    href: https://gamersaurusrex.itch.io/frequency-zero
facts:
  - No scene lights; the only light is the player's pulse
  - Shared perception AI across three enemy types
  - Purge reveal lifetime fixed from 1.3 s to 15 s
chips:
  - id: ping-pool
    title: Ping pool priority fix
    problem: The purge's reveal disappeared about 1.3 s after firing, whatever its hold and fade times.
    approach: Inspected the live ping array; the 16-slot pool was always full of med kit, alarm and invisible player pings. Made the purge a protected priority and distance-gated ambient emitters.
    result: Purge reveal 1.3 s → 15 s; pool use 16/16 → about 6–7/16.
  - id: senses
    title: Shared enemy senses
    problem: The old setup gave enemies 360° vision and no shared awareness.
    approach: An awareness component with Unaware, Suspicious, Alert and Searching states, a 60° sight cone plus close-range detection, hearing halved through walls, and one-hop alerts to nearby allies.
    result: Every enemy type reacts to noise the same way, which turned noise management into the stealth mechanic.
  - id: purge-dash
    title: Purge & look-directed dash
    problem: The first dash launched along current velocity and went 13–28° off when the player changed direction.
    approach: Rebuilt as a look-directed burst with a 3 s cooldown bar; the purge scales radius and damage with charge, locks targets on key press and runs its slow motion on a timeline.
    result: Dash direction error 0°, cooldown 3.02–3.03 s; shooting mid-purge can no longer strand the game in slow motion.
  - id: tutorial
    title: Tutorial system
    problem: Players had to learn six abilities in a pitch-black level without being stopped.
    approach: A 15-step director with timed, non-pausing prompt cards; each ability is locked by an input context until its prompt appears.
    result: Each ability closes its own prompt early; verified with real keyboard and mouse input in automated play sessions.
  - id: music
    title: Adaptive music director
    problem: Exploration and combat music played on top of each other, triggered by where the player stood.
    approach: One director owns both tracks; combat means any alerted enemy in range, with 6 s hysteresis, a 2 s crossfade and FMOD pause handling.
    result: Combat music starts within 0.8 s of an alert and fades 6–7 s after the last one, with no flip-flopping.
  - id: optimisation
    title: Optimisation pass
    problem: Enemy brains, HUD bindings and cosmetic effects all ran every frame.
    approach: Enemy brains on 0.2 s timers, senses on staggered 0.1 s ticks, cosmetics only when rendered, HUD on timers, and dead Blueprint code removed.
    result: About 420 dead nodes and every debug print removed; remaining hitches measured as editor-only.
credits:
  mine:
    - Ping system integration and ping pool fixes
    - Purge and dash rework
    - Enemy AI rework (shared senses, Muties, exploders, drone bridge, drone death physics)
    - Optimisation pass, keycards, enemy health bars and damage numbers
    - UI redesign, main menu, loading screen, pause menu
    - Tutorial (three versions), music director, bug fixing
  team:
    - name: Spandon Adhikary
      role: Project setup, core prototyping, VFX, wall tool, FMOD setup
    - name: Akil Shetty
      role: Level layout, blockout, asset dressing
    - name: Adarsh Gupta
      role: Explosive Mutant, lasers, doors and inventory, boss
    - name: Arpit Bendre
      role: Packaging, project settings, enemy spawner
    - name: Abizer Motorwala
      role: Early enemy chase, blockout, navmesh
    - name: Athul L
      role: Sliding doors, prison and lab rooms
    - name: Rajat Musale
      role: Ping value tuning
---

The protagonist is blind. The world is pitch black, and the only way to see is to fire electromagnetic pulses that flash geometry into existence for a moment. Every pulse is also a sound the monsters can hear, so every reveal is a decision.
