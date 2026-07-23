import { act, renderHook } from '@testing-library/react';
import { useSyncedState } from './useSyncedState';

interface TestField {
  _id: string;
  label: string;
}

describe('useSyncedState', () => {
  it('updates local state when refreshed source data changes', () => {
    const initialFields: TestField[] = [{ _id: 'field-1', label: 'First' }];
    const { result, rerender } = renderHook(
      ({ fields }: { fields: TestField[] }) => useSyncedState(fields),
      { initialProps: { fields: initialFields } },
    );

    act(() => {
      result.current[1]([{ _id: 'field-1', label: 'Locally reordered' }]);
    });

    expect(result.current[0][0].label).toBe('Locally reordered');

    const refreshedFields = [
      { _id: 'field-1', label: 'Updated' },
      { _id: 'field-2', label: 'Created' },
    ];

    rerender({ fields: refreshedFields });

    expect(result.current[0]).toEqual(refreshedFields);
  });
});
