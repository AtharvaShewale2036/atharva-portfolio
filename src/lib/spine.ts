export type Spine = 'blue' | 'red' | 'green' | 'purple' | 'teal' | 'orange';
export const spineVar = (s: Spine): string => (s === 'red' ? 'var(--color-primary)' : `var(--color-spine-${s})`);
