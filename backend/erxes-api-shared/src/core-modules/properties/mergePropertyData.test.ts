import { mergePropertyData } from './importExport';
import { toPropertyGroupKey } from './keys';

const GROUP = toPropertyGroupKey('grp1');

describe('mergePropertyData', () => {
  it('keeps properties the import did not mention', () => {
    const merged = mergePropertyData(
      { loyalty: 'Gold', size: '42' },
      { size: '44' },
    );

    expect(merged).toEqual({ loyalty: 'Gold', size: '44' });
  });

  it('starts from nothing when the record has no properties yet', () => {
    expect(mergePropertyData(undefined, { loyalty: 'Gold' })).toEqual({
      loyalty: 'Gold',
    });
  });

  it('merges a repeating row field by field', () => {
    const merged = mergePropertyData(
      { [GROUP]: [{ _id: 'row1', street: 'Old', city: 'UB' }] },
      { [GROUP]: [{ street: 'New' }] },
    );

    expect(merged[GROUP]).toEqual([{ _id: 'row1', street: 'New', city: 'UB' }]);
  });

  it('keeps rows the import did not reach', () => {
    const merged = mergePropertyData(
      {
        [GROUP]: [
          { _id: 'row1', street: 'First' },
          { _id: 'row2', street: 'Second' },
        ],
      },
      { [GROUP]: [{ street: 'Updated' }] },
    );

    expect(merged[GROUP]).toEqual([
      { _id: 'row1', street: 'Updated' },
      { _id: 'row2', street: 'Second' },
    ]);
  });

  it('appends rows beyond what the record had', () => {
    const merged = mergePropertyData(
      { [GROUP]: [{ _id: 'row1', street: 'First' }] },
      { [GROUP]: [{ street: 'First' }, { _id: 'fresh', street: 'Second' }] },
    );

    expect(merged[GROUP]).toEqual([
      { _id: 'row1', street: 'First' },
      { _id: 'fresh', street: 'Second' },
    ]);
  });

  it('replaces a plain value rather than merging into it', () => {
    const merged = mergePropertyData({ tags: ['a', 'b'] }, { tags: ['c'] });

    expect(merged.tags).toEqual(['c']);
  });
});
