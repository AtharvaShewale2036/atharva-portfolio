import { describe, it, expect } from 'vitest';
import { clampIndex, keyToIndex } from '../../src/lib/crate';

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
