export const profile = {
  name: 'Atharva Shewale',
  role: 'UE5 Developer · Games, Simulation, Real-time Viz',
  intro:
    'I build Unreal Engine 5 systems people actually use: gameplay and AI for games, multiplayer simulation in C++, and interactive ArchViz for touchscreens and VR.',
  availability: 'Open to full-time roles and freelance projects · Remote / relocate · Goa, India',
  bio: [
    'Unreal Engine 5 developer working across games, simulation and real-time visualisation, on PC, touchscreen kiosks, Meta Quest and cloud streaming.',
    'At eDot Solutions I build core systems for eVaColregs, a C++ multiplayer collision-regulations trainer used for maritime training. On Frequency Zero I lead gameplay programming for an eight-person horror shooter.',
    'Before that I delivered ArchViz walkthroughs end to end as a freelancer and an intern, and spent four years as a 3D artist and motion designer, so I own both the systems and the look.',
  ],
  contact: {
    email: 'shatharva@gmail.com',
    phone: '+91 70411 42749',
    tel: '+917041142749',
    whatsapp: 'https://wa.me/917041142749',
    linkedin: 'https://www.linkedin.com/in/atharva-shewale-3835b0250',
    youtube: 'https://www.youtube.com/playlist?list=PLP6aXjlbiNLc',
    itch: 'https://gamersaurusrex.itch.io/frequency-zero',
  },
  skills: [
    { group: 'Visualisation', items: ['Unreal Engine 5', 'ArchViz', 'Real-time lighting', 'Texturing', 'Level design', 'Cinematics', 'MetaHumans', 'VR / AR / XR walkthroughs', 'Performance optimisation'] },
    { group: 'Interactivity', items: ['Blueprints', 'UMG / UI-UX', 'Modular interaction systems', 'Multiplayer walkthroughs', 'Touchscreen and kiosk builds'] },
    { group: 'Programming', items: ['C++ (gameplay and simulation)', 'Blueprint visual scripting', 'Android Studio'] },
    { group: 'Platforms & tools', items: ['Windows', 'Android', 'Meta Quest 2', 'AR', 'Pixel Streaming', 'Git', 'Perforce', 'Adobe Creative Suite'] },
  ],
  experience: [
    { role: 'Game Developer', org: 'eDot Solutions', place: 'Goa, India · Full-time', dates: 'Aug 2025 – Present', points: ['Real-time naval simulator (eVaColregs) in UE5 C++ and Blueprints, deployed to cloud and local machines with hardware input rigs.', 'Multiplayer layer, Bridge Alert Management, collision handling and the Pixel Streaming front end for eVaColregs.'] },
    { role: 'Lead Gameplay Programmer', org: 'Frequency Zero', place: 'Collaborative indie project', dates: 'Oct 2025 – Present', points: ['Player abilities, combat, enemy AI, tutorial and adaptive music for a first-person horror shooter.', 'Playable Windows prototype on itch.io; planned showcase at IGDC 2026, Chennai.'] },
    { role: 'Freelance UE5 Developer', org: 'Gaming & ArchViz', place: 'Self-employed', dates: 'Apr 2025 – Present', points: ['Delivered an INR 1.8 lakh Unreal ArchViz project end to end as sole developer.', 'Interactive environments for PC, touchscreen kiosks, VR and AR with modular Blueprint systems.'] },
    { role: 'UE5 Artist & Developer (Intern)', org: 'Saridena Constructions', place: 'Hyderabad, India', dates: 'Oct 2024 – Apr 2025', points: ['VR/AR/XR walkthroughs, interactives, renders and cinematics for real-estate projects, including multiplayer sessions.', 'Level design, lighting and texturing for Meta Quest 2 and Android AR builds.'] },
    { role: 'Freelance 3D Artist & Motion Designer', org: 'Self-employed', place: 'Remote', dates: 'May 2021 – Mar 2025', points: ['3D models and animation for an animated film, TV commercial artwork, and game-ready visuals for a mobile title.'] },
  ],
  education: [
    'BA (Hons) VFX & Animation · Annapurna College of Film and Media, Hyderabad · 2022 – 2025',
    'Diploma, Arena Certified Professional in VFX Compositing & Editing · Arena Animation, Vadodara · 2021 – 2023',
    'Epic Games Game Design Professional Certificate · Coursera · Feb 2025',
  ],
} as const;
