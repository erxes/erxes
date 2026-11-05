import { renderHook } from '@testing-library/react';
import { useMultiQueryState } from 'erxes-ui';
import { parseJobBooleanFilter, useJobFilters } from '../useJobFilters';

jest.mock('erxes-ui', () => ({ useMultiQueryState: jest.fn() }));

test.each([
  ['true', true],
  ['false', false],
  [true, true],
  [false, false],
  ['', undefined],
  ['invalid', undefined],
  [null, undefined],
  [undefined, undefined],
])('parses cost-presence query %s as %s', (value, expected) => {
  expect(parseJobBooleanFilter(value)).toBe(expected);
});

test('preserves booleans already parsed by the shared query-state hook', () => {
  jest.mocked(useMultiQueryState).mockReturnValue([
    {
      hasLabor: false,
      hasOverhead: true,
      status: 'inactive',
      durationType: null,
    },
    jest.fn(),
  ]);
  const { result } = renderHook(() => useJobFilters());
  expect(result.current).toEqual({
    hasLabor: false,
    hasOverhead: true,
    status: 'inactive',
    durationType: undefined,
  });
});

test('duplicate-output filtering is enabled only for the unwound list', () => {
  jest
    .mocked(useMultiQueryState)
    .mockReturnValue([{ duplicatedOutput: false }, jest.fn()]);
  const { result } = renderHook(() => useJobFilters(true));
  expect(result.current.duplicatedOutput).toBe(false);
  const main = renderHook(() => useJobFilters());
  expect(main.result.current.duplicatedOutput).toBeUndefined();
});
