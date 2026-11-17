import { describe, expect, it } from 'vite-plus/test';
import { moveInSaved, sortBySaved } from '../savedOrder';

const id = (value: string) => value;

describe('sortBySaved', () => {
  it('keeps the given order when nothing is saved', () => {
    expect(sortBySaved([], ['hr', 'sales', 'tms'], id)).toEqual(['hr', 'sales', 'tms']);
  });

  it('puts saved ids first, in the saved order, and new ones after in their own order', () => {
    expect(sortBySaved(['tms', 'hr'], ['hr', 'pms', 'sales', 'tms'], id)).toEqual([
      'tms',
      'hr',
      'pms',
      'sales',
    ]);
  });
});

describe('moveInSaved', () => {
  it('moves the dragged id onto the drop target', () => {
    expect(moveInSaved([], ['hr', 'sales', 'tms'], 'tms', 'hr')).toEqual(['tms', 'hr', 'sales']);
  });

  it('keeps saved ids this record does not show after the shown ones', () => {
    expect(moveInSaved(['pms', 'hr', 'sales'], ['hr', 'sales'], 'sales', 'hr')).toEqual([
      'sales',
      'hr',
      'pms',
    ]);
  });

  it('sorts back to what was dropped', () => {
    const shown = ['hr', 'sales', 'tms'];
    const order = moveInSaved([], shown, 'hr', 'tms');

    expect(sortBySaved(order, shown, id)).toEqual(['sales', 'tms', 'hr']);
  });
});
