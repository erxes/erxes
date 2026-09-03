import {
  MAX_SEGMENT_PAGE_SIZE,
  segmentPage,
  segmentPageFilter,
  segmentPageSize,
} from './memberQuery';

describe('segmentPageFilter', () => {
  it('leaves the first page untouched', () => {
    expect(segmentPageFilter({ status: 'won' })).toEqual({ status: 'won' });
  });

  it('pages on _id rather than skipping', () => {
    expect(segmentPageFilter({ status: 'won' }, { cursor: 'd-9' })).toEqual({
      $and: [{ status: 'won' }, { _id: { $gt: 'd-9' } }],
    });
  });

  it('does not wrap an empty filter in $and', () => {
    expect(segmentPageFilter({}, { cursor: 'd-9' })).toEqual({
      _id: { $gt: 'd-9' },
    });
  });

  it('narrows to a known set, which is how one record is checked', () => {
    expect(segmentPageFilter({ status: 'won' }, { ids: ['d-1'] })).toEqual({
      $and: [{ status: 'won' }, { _id: { $in: ['d-1'] } }],
    });
  });

  it('combines a known set with a cursor', () => {
    expect(
      segmentPageFilter({}, { ids: ['d-1', 'd-2'], cursor: 'd-1' }),
    ).toEqual({
      $and: [{ _id: { $in: ['d-1', 'd-2'] } }, { _id: { $gt: 'd-1' } }],
    });
  });
});

describe('segmentPageSize', () => {
  it('defaults and caps', () => {
    expect(segmentPageSize()).toBe(1000);
    expect(segmentPageSize(50)).toBe(50);
    expect(segmentPageSize(999999)).toBe(MAX_SEGMENT_PAGE_SIZE);
  });
});

describe('segmentPage', () => {
  it('reports no next page when the over-fetch came back short', () => {
    expect(segmentPage(['a', 'b'], 3)).toEqual({ ids: ['a', 'b'] });
    expect(segmentPage(['a', 'b', 'c'], 3)).toEqual({ ids: ['a', 'b', 'c'] });
  });

  it('trims the extra row and points the cursor at the last kept id', () => {
    expect(segmentPage(['a', 'b', 'c', 'd'], 3)).toEqual({
      ids: ['a', 'b', 'c'],
      nextCursor: 'c',
    });
  });
});
