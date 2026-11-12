import { describe, expect, it } from 'vite-plus/test';
import { groupOptions, hasOptionValue, withoutPicked } from './multiselect-options';

const red = { value: 'red', label: 'Red', kind: 'warm' };
const blue = { value: 'blue', label: 'Blue', kind: 'cold' };
const grey = { value: 'grey', label: 'Grey' };

describe('MultipleSelector options', () => {
  it('groups by the given key, ungrouped options under an empty heading', () => {
    expect(groupOptions([red, blue, grey], 'kind')).toEqual({
      warm: [red],
      cold: [blue],
      '': [grey],
    });

    expect(groupOptions([red, grey])).toEqual({ '': [red, grey] });
    expect(groupOptions([])).toEqual({});
  });

  it('drops picked options and finds values', () => {
    const groups = groupOptions([red, blue], 'kind');

    expect(withoutPicked(groups, [red])).toEqual({ warm: [], cold: [blue] });
    expect(hasOptionValue(groups, 'blue')).toBe(true);
    expect(hasOptionValue(groups, 'green')).toBe(false);
  });
});
