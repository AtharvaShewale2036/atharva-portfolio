---
order: 1
title: eVaColregs
spine: blue
tier: full
genre: COLREGs training simulator
engine: UE5.5 source build · C++
platform: Windows · Browser (Pixel Streaming)
role: Game Developer · eDot Solutions
status: Shipped, in active use
dates: Nov 2025 – Present
client: eDot Solutions
oneLine: Multiplayer bridge simulator where AI ships follow the collision rules and trainees are scored on what they do.
tagline: Stand the watch. Apply the rules.
links:
  - label: Live demo
    href: https://colregs.ai
facts:
  - ~240,000 lines of C++ in one game module
  - Dedicated-server classroom with VHF voice
  - Nine IMO-based equipment failures, scored out of 100
chips:
  - id: multiplayer
    title: Multiplayer layer
    summary: Many trainees, one shared sea, on a dedicated server.
    problem: A single-player trainer had to host a whole classroom of bridges without forking its gameplay.
    approach: Lobby flow, rejoin, access checks, environment applied on lobby and exercise maps, VHF voice session management and a backend session heartbeat.
    result: The same exercise runs on one or many bridges; a trainee who drops still produces an IncompleteSimulation report, retried until it lands.
  - id: bam
    title: Failures & alerts (BAM)
    summary: Engine, steering, blackout, radar and lamp failures with IMO-style alerts.
    problem: Trainees must notice and diagnose equipment failures the way a real bridge presents them.
    approach: Situation types and variants, blackout power-state timeline, radar fault handling, and a Bridge Alert Management panel modelled on IMO MSC.302(87), plus 3D BAMS and navigation-light consoles with spare lamps.
    result: Every failure raises one alert with ACK and SILENCE, and the trainee's response is scored in the debrief.
  - id: collision
    title: Collision & hazard handling
    summary: One end-of-exercise flow for ships, groundings and charted hazards.
    problem: A collision or hazard strike has to end the exercise the same way in single player and multiplayer.
    approach: Helm and telegraph lock, alarm, open question closed as unanswered, report sent immediately; strikes detected against charted wrecks, obstructions, rocks and platforms.
    result: Identical behaviour on one or many bridges, with the debrief sent before the Session Over screen.
  - id: first-person
    title: Deck walking & binoculars
    summary: First-person walking on a moving ship.
    problem: Trainees need to walk the wheelhouse without breaking every system that asks where the player's ship is.
    approach: An invisible walking character that is never possessed, its target stored in ship-local space so it rides the moving hull; binocular pan and zoom with field-of-view-scaled sensitivity.
    result: Free movement around the bridge while radar, AI, questions and reporting keep tracking the ship.
  - id: time
    title: Time control & question UI
    summary: Pause, fast-forward and AI questions that don't fight.
    problem: The menu pause, the training pause, fast-forward and timed questions all want to control time.
    approach: Pause and 1×/2×/4× fast-forward, a separate question pause, fast-forward warnings, the question widget and indicator, and a stacking notification system.
    result: Questions keep their own wall-clock timer while the simulation is paused, and a trainee's own pause is never overridden.
  - id: frontend
    title: Front end & Pixel Streaming
    summary: Login to exercise, on a PC or in a browser.
    problem: The simulator had to run from a browser on shared streaming machines as well as on desktops.
    approach: Login and mode selection flow, exercise tile grid with search and sort, Pixel Streaming setup with an inactivity monitor, and a crash logging system.
    result: Trainees open the full simulator in a browser, and idle sessions free their streaming slot automatically.
troubleshooting:
  - challenge: Hazard strikes were lost in multiplayer.
    tried: The RPC passed a pointer to a mesh component created at runtime, which arrives as null on the other machine.
    fix: The RPC now sends a small enum for the hazard type and the server runs the same collision flow.
  - challenge: The camera froze in "blending" at full binocular zoom.
    tried: Light scaling divided 0 by 0 when the minimum and default field of view were equal, and the NaN spread into the camera.
    fix: Fixed the order of operations and made the camera blend bail out on non-finite values.
  - challenge: Pausing during a view transition froze it half-done.
    tried: The training pause runs time dilation near zero, which stretched a short Blueprint delay to about 2,000 seconds.
    fix: A lock blocks pausing while a view transition is running.
credits:
  mine:
    - Multiplayer layer from prototype to completion, VHF voice sessions, session heartbeat
    - Abnormal situations, Bridge Alert Management, BAMS and navigation-light consoles
    - Collision handling and reporting, hazard strikes
    - First-person deck walking, orbit and top view fixes, binoculars, 3D tooltips
    - Pause, fast-forward, question pause and question UI, notification system
    - Login flow, exercise browser, Pixel Streaming setup, crash logging, volume control
    - Navigation lights and day signals for AI vessels, tutorial step controls
  team:
    - name: eDot Solutions
      role: Product owner and wider engineering team
---

eVaColregs teaches seafarers the International Regulations for Preventing Collisions at Sea by making them use the rules. The trainee stands watch on a real merchant ship in real charted waters, meets AI traffic that gives way and stands on by the rules, answers questions generated from the live situation, and gets a 100-point debrief.
