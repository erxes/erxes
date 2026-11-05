import { getValidCustomFieldOptions } from '../getValidCustomFieldOptions';

describe('getValidCustomFieldOptions', () => {
  it('removes empty and whitespace-only choices that cannot be selected', () => {
    expect(
      getValidCustomFieldOptions(['', 'First', ' ', '\t\n', 'Second', '']),
    ).toEqual(['First', 'Second']);
  });

  it('preserves valid option values and their order without changing stored selections', () => {
    const options = Object.freeze([' Second ', 'First', '0', 'Монгол']);

    expect(getValidCustomFieldOptions(options)).toEqual(options);
  });

  it('ignores non-string entries in JSON field definitions', () => {
    expect(
      getValidCustomFieldOptions([null, undefined, 0, false, {}, [], 'First']),
    ).toEqual(['First']);
  });

  it.each([undefined, null, '', 'First', 42, {}])(
    'returns no choices for a non-array options value (%p)',
    (options) => {
      expect(getValidCustomFieldOptions(options)).toEqual([]);
    },
  );
});
