import {
  parsePropertyColumnKey,
  parsePropertyDataKey,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
  toPropertyRowKey,
} from './keys';

// nanoid may contain `_` and `-`, so ids are exercised with both
const GROUP = 'V1StGXR8_Z';
const FIELD = 'Gm3K8ni3-r2i';

describe('property data keys', () => {
  it('round trips a row key', () => {
    expect(parsePropertyDataKey(toPropertyRowKey(GROUP, FIELD))).toEqual({
      kind: 'row',
      groupId: GROUP,
      fieldId: FIELD,
      anyRow: false,
    });
  });

  it('round trips an any-row key', () => {
    expect(parsePropertyDataKey(toPropertyRowKey(GROUP, FIELD, true))).toEqual({
      kind: 'row',
      groupId: GROUP,
      fieldId: FIELD,
      anyRow: true,
    });
  });

  it('treats a bare group key as a plain field', () => {
    expect(parsePropertyDataKey(toPropertyGroupKey(GROUP))).toEqual({
      kind: 'field',
      fieldId: toPropertyGroupKey(GROUP),
    });
  });

  it('round trips a numbered column key', () => {
    expect(
      parsePropertyColumnKey(toPropertyRowColumnKey(GROUP, FIELD, 3)),
    ).toEqual({
      kind: 'row',
      groupId: GROUP,
      fieldId: FIELD,
      index: 3,
    });
  });

  it('defaults an unnumbered row column to the first entry', () => {
    expect(
      parsePropertyColumnKey(`propertiesData.g:${GROUP}/${FIELD}`),
    ).toEqual({
      kind: 'row',
      groupId: GROUP,
      fieldId: FIELD,
      index: 1,
    });
  });

  it('reads a plain column', () => {
    expect(parsePropertyColumnKey(`propertiesData.${FIELD}`)).toEqual({
      kind: 'field',
      fieldId: FIELD,
    });
  });

  it('ignores a column that is not property data', () => {
    expect(parsePropertyColumnKey('tagIds')).toBeNull();
  });
});
