import { mergeNavigationChildOrder } from './navigationChildOrder';

describe('mergeNavigationChildOrder', () => {
  it('puts a new item after its default predecessor, not at the end', () => {
    expect(
      mergeNavigationChildOrder(
        ['/files', '/files/trash'],
        ['/files', '/files/org', '/files/shared', '/files/trash'],
      ),
    ).toEqual(['/files', '/files/org', '/files/shared', '/files/trash']);
  });

  it('keeps the order the user chose for items they already saw', () => {
    expect(
      mergeNavigationChildOrder(['/b', '/a'], ['/a', '/b', '/c']),
    ).toEqual(['/b', '/c', '/a']);
  });

  it('puts a new first item at the top', () => {
    expect(mergeNavigationChildOrder(['/b'], ['/a', '/b'])).toEqual(['/a', '/b']);
  });
});
