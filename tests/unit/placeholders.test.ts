import { describe, it, expect } from 'vitest';
import { findPlaceholders } from '../../scripts/placeholders.mjs';

describe('findPlaceholders', () => {
  it('flags mockup brackets and TODO markers', () => {
    expect(findPlaceholders('> [one-line: what I built]')).toContain('[one-line');
    expect(findPlaceholders('[role] · RELEASED')).toContain('[role]');
    expect(findPlaceholders('Showreel: [ADD YOUTUBE URL]')).toContain('[ADD');
    expect(findPlaceholders('[SYSTEM 02]')).toContain('[SYSTEM 02]');
    expect(findPlaceholders('[Project 03]')).toContain('[Project 03]');
    expect(findPlaceholders('TODO write this')).toContain('TODO');
  });
  it('passes real copy, including legitimate brackets', () => {
    expect(findPlaceholders('Purge reveal 1.3 s → 15 s. Array [0] is fine.')).toEqual([]);
  });
});
