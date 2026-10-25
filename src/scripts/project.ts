import { playBlip } from './sound';

export function initTabs(): void {
  const tablist = document.querySelector<HTMLElement>('[data-tabs]');
  if (!tablist) return;
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) panel.hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });
  tablist.hidden = false;
  select(tabs[0]);
}

export function initTeardown(root: HTMLElement): void {
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-chip]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-chip-panel]')];
  let active = 0;
  root.setAttribute('data-js', '');

  const select = (i: number, focus = false, silent = false) => {
    active = i;
    chips.forEach((c, j) => {
      c.setAttribute('aria-pressed', String(j === i));
      c.tabIndex = j === i ? 0 : -1;
    });
    panels.forEach((p, j) => p.toggleAttribute('data-active', j === i));
    if (focus) chips[i].focus();
    if (!silent) playBlip('select');
  };

  chips.forEach((c, i) => {
    c.addEventListener('click', () => select(i));
    c.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select((i + d + chips.length) % chips.length, true);
    });
  });
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') chips[active].focus();
  });
  root.querySelectorAll('[data-teardown-close]').forEach((b) => b.addEventListener('click', () => chips[active].focus()));
  select(0, false, true);
}
