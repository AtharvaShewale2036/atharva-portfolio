export const wrapIndex = (i: number, n: number): number => ((i % n) + n) % n;

export const clampIndex = (i: number, n: number): number => Math.min(Math.max(i, 0), n - 1);

export function keyToIndex(key: string, active: number, n: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return clampIndex(active + 1, n);
    case 'ArrowLeft':
    case 'ArrowUp':
      return clampIndex(active - 1, n);
    case 'Home':
      return 0;
    case 'End':
      return n - 1;
    default:
      return null;
  }
}

// One flip per gesture: deltas accumulate to a threshold, then a cooldown swallows trackpad momentum.
export function createWheelStepper({ threshold = 60, cooldownMs = 250 } = {}) {
  let acc = 0;
  let lockedUntil = -Infinity;
  return (deltaY: number, now: number): -1 | 0 | 1 => {
    if (now < lockedUntil) return 0;
    acc += deltaY;
    if (Math.abs(acc) < threshold) return 0;
    const step = acc > 0 ? 1 : -1;
    acc = 0;
    lockedUntil = now + cooldownMs;
    return step;
  };
}
