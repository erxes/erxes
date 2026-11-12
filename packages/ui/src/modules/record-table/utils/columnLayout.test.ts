import { describe, expect, it } from 'vite-plus/test';
import { fitLayout, mergeColumnOrder, pinColumns, withStructuralFirst } from './columnLayout';

const layout = {
  fittedTo: '',
  columnOrder: ['name', 'email'],
  columnPinning: { left: ['name'] },
  seen: ['name', 'email'],
  sticky: ['name'],
  pinningTouched: false,
};

describe('mergeColumnOrder', () => {
  it('drops removed columns and puts a new one after the column defined before it', () => {
    expect(mergeColumnOrder(['email', 'name', 'old'], ['name', 'phone', 'email'])).toEqual([
      'email',
      'name',
      'phone',
    ]);
  });

  it('keeps the saved order when the columns are the same', () => {
    const saved = ['b', 'a'];

    expect(mergeColumnOrder(saved, ['a', 'b'])).toBe(saved);
  });
});

describe('pinColumns', () => {
  it('pins a column after the sticky column before it', () => {
    expect(pinColumns(['more', 'name'], ['avatar'], ['more', 'avatar', 'name'])).toEqual([
      'more',
      'avatar',
      'name',
    ]);
  });
});

describe('withStructuralFirst', () => {
  it('puts checkbox and more first only when something is pinned', () => {
    expect(withStructuralFirst(['name'], ['checkbox'])).toEqual(['checkbox', 'name']);
    expect(withStructuralFirst([], ['checkbox'])).toEqual([]);
  });
});

describe('fitLayout', () => {
  it('pins a column that newly became sticky, once', () => {
    const fitted = fitLayout(layout, {
      ids: ['name', 'email'],
      sticky: ['name', 'email'],
      followSticky: false,
    });

    expect(fitted.columnPinning.left).toEqual(['name', 'email']);

    const unpinned = { ...fitted, columnPinning: { left: ['name'] }, pinningTouched: true };

    expect(
      fitLayout(unpinned, {
        ids: ['name', 'email'],
        sticky: ['name', 'email'],
        followSticky: false,
      }).columnPinning.left,
    ).toEqual(['name']);
  });

  it('follows the sticky columns until the member changes the pinning', () => {
    const fitted = fitLayout(layout, { ids: ['name', 'email'], sticky: [], followSticky: true });

    expect(fitted.columnPinning.left).toEqual([]);
  });
});
