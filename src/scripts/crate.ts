import { wrapIndex, keyToIndex, createWheelStepper } from '../lib/crate';
import { playBlip } from './sound';

export function initCrate(root: HTMLElement): void {
  const carts = [...root.querySelectorAll<HTMLButtonElement>('[data-cart]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-crate-card]')];
  const live = root.querySelector<HTMLElement>('[data-crate-live]');
  const n = carts.length;
  const wheel = createWheelStepper();
  let active = 0;

  const show = (i: number, silent = false) => {
    active = i;
    carts.forEach((cart, j) => {
      const pos = wrapIndex(j - active, n); // flipped-past cartridges go to the back of the crate
      cart.style.setProperty('--pos', String(pos));
      cart.toggleAttribute('data-front', pos === 0);
    });
    cards.forEach((card, j) => (card.hidden = j !== active));
    if (live) live.textContent = `${String(active + 1).padStart(2, '0')} of ${String(n).padStart(2, '0')}, ${carts[active].dataset.title}`;
    if (!silent) playBlip('flip');
  };

  carts.forEach((cart, j) => cart.addEventListener('click', () => show(j)));
  root.addEventListener('keydown', (e) => {
    const next = keyToIndex(e.key, active, n);
    if (next === null) return;
    e.preventDefault();
    if (next !== active) show(next);
  });
  root.addEventListener(
    'wheel',
    (e) => {
      const atEdge = (active === n - 1 && e.deltaY > 0) || (active === 0 && e.deltaY < 0);
      if (atEdge) return; // let the page scroll past the crate
      e.preventDefault();
      const step = wheel(e.deltaY, e.timeStamp);
      if (step) show(active + step);
    },
    { passive: false },
  );
  show(0, true);
}
