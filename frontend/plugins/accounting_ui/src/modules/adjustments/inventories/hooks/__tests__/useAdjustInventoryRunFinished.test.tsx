import { renderHook, waitFor } from '@testing-library/react';
import { toast } from 'erxes-ui';
import { useAdjustInventoryRunFinished } from '@/adjustments/inventories/hooks/useAdjustInventoryRunFinished';
import type { IAdjustInventory } from '@/adjustments/inventories/types/AdjustInventory';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn() }), { virtual: true });

type TProps = { id: string; adjust?: IAdjustInventory };

const adjust = (status: string, checkedAt?: string) =>
  ({ _id: 'adj-oct', status, checkedAt }) as IAdjustInventory;

const renderAdjust = (
  initial?: IAdjustInventory,
  initialId = 'adj-oct',
  reload: () => Promise<unknown> = () => Promise.resolve(),
) => {
  const onFinished = jest.fn(reload);
  const hook = renderHook(
    ({ id, adjust: current }: TProps) =>
      useAdjustInventoryRunFinished(id, current, onFinished),
    { initialProps: { id: initialId, adjust: initial } as TProps },
  );

  return { ...hook, onFinished };
};

describe('useAdjustInventoryRunFinished', () => {
  beforeEach(() => jest.mocked(toast).mockClear());

  it('reloads details once the background run completes', () => {
    const { rerender, onFinished } = renderAdjust(adjust('draft'));

    rerender({ id: 'adj-oct', adjust: adjust('running', '2026-11-04T08:00') });
    rerender({ id: 'adj-oct', adjust: adjust('running', '2026-11-04T08:01') });
    rerender({ id: 'adj-oct', adjust: adjust('complete', '2026-11-04T08:02') });

    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it('reloads details when the run stops with an error', () => {
    const { rerender, onFinished } = renderAdjust(adjust('running'));

    rerender({ id: 'adj-oct', adjust: adjust('process', '2026-11-04T08:02') });

    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it('still reloads when the running event was missed and only the result arrives', () => {
    const { rerender, onFinished } = renderAdjust(adjust('draft'));

    rerender({ id: 'adj-oct', adjust: adjust('process', '2026-11-04T08:02') });

    expect(onFinished).toHaveBeenCalledTimes(1);
  });

  it('stays quiet when an adjustment is only published or sent back to draft', () => {
    const checkedAt = '2026-11-04T08:02';
    const { rerender, onFinished } = renderAdjust(
      adjust('complete', checkedAt),
    );

    rerender({ id: 'adj-oct', adjust: adjust('publish', checkedAt) });
    rerender({ id: 'adj-oct', adjust: adjust('draft', checkedAt) });

    expect(onFinished).not.toHaveBeenCalled();
  });

  it('does not reload when the page first loads an adjustment', () => {
    const { rerender, onFinished } = renderAdjust();

    rerender({ id: 'adj-oct', adjust: adjust('complete', '2026-11-04T08:02') });

    expect(onFinished).not.toHaveBeenCalled();
  });

  it('does not reload while daily progress arrives during a run', () => {
    const { rerender, onFinished } = renderAdjust(adjust('running'));

    rerender({ id: 'adj-oct', adjust: adjust('running', '2026-11-04T08:01') });

    expect(onFinished).not.toHaveBeenCalled();
  });

  it('does not reload when the user opens another adjustment while one is running', () => {
    const { rerender, onFinished } = renderAdjust(adjust('running'));

    rerender({ id: 'adj-nov', adjust: adjust('draft', '2026-11-01T08:00') });

    expect(onFinished).not.toHaveBeenCalled();
  });

  it('tells the user when the result table could not be reloaded', async () => {
    const { rerender } = renderAdjust(adjust('running'), 'adj-oct', () =>
      Promise.reject(new Error('Network request failed')),
    );

    rerender({ id: 'adj-oct', adjust: adjust('complete', '2026-11-04T08:02') });

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith({
        title: 'error',
        description: 'Network request failed',
        variant: 'destructive',
      }),
    );
  });

  it('shows no error once the result table reloads', async () => {
    const { rerender, onFinished } = renderAdjust(adjust('running'));

    rerender({ id: 'adj-oct', adjust: adjust('complete', '2026-11-04T08:02') });

    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
    expect(toast).not.toHaveBeenCalled();
  });
});
