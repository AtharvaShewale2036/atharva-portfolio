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
