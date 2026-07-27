import { act, renderHook } from '@testing-library/react';

import {
  areFieldValuesEqual,
  areIdListsEqual,
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';

interface Deferred {
  promise: Promise<void>;
  reject: (reason?: unknown) => void;
  resolve: () => void;
}

const createDeferred = (): Deferred => {
  let reject!: Deferred['reject'];
  let resolve!: Deferred['resolve'];
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
};

describe('useOptimisticField', () => {
  it('shows the selected value immediately and ignores stale source renders', async () => {
    const deferred = createDeferred();
    const onCommit = jest.fn(() => deferred.promise);
    const { result, rerender } = renderHook(
      ({ value }) =>
        useOptimisticField({
          value,
          onCommit,
          resetKey: 'deal-1',
        }),
      { initialProps: { value: 'initial' } },
    );

    act(() => {
      result.current.setValue('selected');
    });

    expect(result.current.value).toBe('selected');
    expect(onCommit).toHaveBeenCalledWith('selected', 'initial');

    rerender({ value: 'initial' });
    expect(result.current.value).toBe('selected');

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    rerender({ value: 'initial' });
    expect(result.current.value).toBe('selected');

    rerender({ value: 'selected' });
    expect(result.current.value).toBe('selected');

    rerender({ value: 'external-update' });
    expect(result.current.value).toBe('external-update');
  });

  it('serializes rapid edits and only commits the latest queued value', async () => {
    const commits: Array<{
      deferred: Deferred;
      previousValue: string;
      value: string;
    }> = [];
    const onCommit = (value: string, previousValue: string) => {
      const deferred = createDeferred();
      commits.push({ deferred, previousValue, value });
      return deferred.promise;
    };
    const { result } = renderHook(() =>
      useOptimisticField({
        value: 'initial',
        onCommit,
        resetKey: 'deal-1',
      }),
    );

    act(() => {
      result.current.setValue('first');
      result.current.setValue('second');
      result.current.setValue('latest');
    });

    expect(result.current.value).toBe('latest');
    expect(commits).toHaveLength(1);
    expect(commits[0]).toMatchObject({
      value: 'first',
      previousValue: 'initial',
    });

    await act(async () => {
      commits[0].deferred.resolve();
      await commits[0].deferred.promise;
    });

    expect(commits).toHaveLength(2);
    expect(commits[1]).toMatchObject({
      value: 'latest',
      previousValue: 'first',
    });

    await act(async () => {
      commits[1].deferred.resolve();
      await commits[1].deferred.promise;
    });

    expect(result.current.value).toBe('latest');
    expect(result.current.saving).toBe(false);
  });

  it('rolls back to the last confirmed value when the latest commit fails', async () => {
    const deferred = createDeferred();
    const { result } = renderHook(() =>
      useOptimisticField({
        value: ['saved'],
        onCommit: () => deferred.promise,
        resetKey: 'deal-1',
      }),
    );

    act(() => {
      result.current.setValue(['unsaved']);
    });
    expect(result.current.value).toEqual(['unsaved']);

    await act(async () => {
      deferred.reject(new Error('Update failed'));
      await deferred.promise.catch(() => undefined);
    });

    expect(result.current.value).toEqual(['saved']);
    expect(result.current.saving).toBe(false);
  });

  it('compares generic array values by ordered contents', () => {
    expect(areFieldValuesEqual(['one', 'two'], ['one', 'two'])).toBe(true);
    expect(areFieldValuesEqual(['one', 'two'], ['two', 'one'])).toBe(false);
  });

  it('treats selected id lists with a different order as the same value', () => {
    expect(areIdListsEqual(['one', 'two'], ['two', 'one'])).toBe(true);
    expect(areIdListsEqual(['one'], ['one', 'two'])).toBe(false);
  });

  it('rejects Apollo mutation results that contain handled errors', async () => {
    await expect(
      rejectOnMutationError(
        Promise.resolve({ errors: [new Error('Update failed')] }),
      ),
    ).rejects.toEqual([new Error('Update failed')]);

    await expect(
      rejectOnMutationError(Promise.resolve({ data: 'saved' })),
    ).resolves.toEqual({ data: 'saved' });
  });
});
