import { keyToIndex } from '../lib/crate';
import { playBlip } from './sound';

export function initCrate(root: HTMLElement): void {
  const carts = [...root.querySelectorAll<HTMLAnchorElement>('[data-cart]')];
  const cards = [...document.querySelectorAll<HTMLElement>('[data-crate-card]')];
  const live = root.querySelector<HTMLElement>('[data-crate-live]');
  const n = carts.length;
  let active = -1;

  const show = (i: number, silent = false) => {
    if (i === active) return;
    active = i;
    carts.forEach((cart, j) => cart.toggleAttribute('data-active', j === i));
    cards.forEach((card, j) => (card.hidden = j !== i));
    if (live) live.textContent = `${String(i + 1).padStart(2, '0')} of ${String(n).padStart(2, '0')}, ${carts[i].dataset.title}`;
    if (!silent) playBlip('flip');
  };

  carts.forEach((cart, j) => cart.addEventListener('mouseenter', () => show(j)));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') return void (location.href = carts[active].href);
    const next = keyToIndex(e.key, active, n);
    if (next === null) return;
    e.preventDefault();
    show(next);
  });
  show(0, true);
}
