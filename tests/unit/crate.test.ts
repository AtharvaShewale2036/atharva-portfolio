import { describe, it, expect } from 'vitest';
import { wrapIndex, clampIndex, keyToIndex, createWheelStepper } from '../../src/lib/crate';

describe('wrapIndex', () => {
  it('wraps negatives and overflow', () => {
    expect(wrapIndex(-1, 6)).toBe(5);
    expect(wrapIndex(6, 6)).toBe(0);
    expect(wrapIndex(2, 6)).toBe(2);
  });
});

describe('clampIndex', () => {
  it('stays inside 0..n-1', () => {
    expect(clampIndex(-3, 6)).toBe(0);
    expect(clampIndex(9, 6)).toBe(5);
  });
});

describe('keyToIndex', () => {
  it('moves with arrows and clamps at the ends', () => {
    expect(keyToIndex('ArrowRight', 0, 6)).toBe(1);
    expect(keyToIndex('ArrowDown', 5, 6)).toBe(5);
    expect(keyToIndex('ArrowLeft', 0, 6)).toBe(0);
    expect(keyToIndex('ArrowUp', 3, 6)).toBe(2);
  });
  it('jumps with Home/End', () => {
    expect(keyToIndex('Home', 4, 6)).toBe(0);
    expect(keyToIndex('End', 1, 6)).toBe(5);
  });
  it('ignores other keys', () => {
    expect(keyToIndex('a', 1, 6)).toBeNull();
  });
});

describe('createWheelStepper', () => {
  it('accumulates small deltas into one step', () => {
    const step = createWheelStepper({ threshold: 60, cooldownMs: 250 });
    expect(step(30, 0)).toBe(0);
    expect(step(40, 10)).toBe(1);
  });
  it('ignores momentum within the cooldown', () => {
    const step = createWheelStepper({ threshold: 60, cooldownMs: 250 });
    expect(step(100, 0)).toBe(1);
    expect(step(100, 50)).toBe(0);
    expect(step(100, 120)).toBe(0);
    expect(step(100, 300)).toBe(1);
  });
  it('steps backwards on negative delta', () => {
    const step = createWheelStepper();
    expect(step(-200, 0)).toBe(-1);
  });
});
