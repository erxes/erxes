import { act, renderHook } from '@testing-library/react';
import { useQuery } from '@apollo/client';
import { useAdjustInventoryDetail } from '@/adjustments/inventories/hooks/useAdjustInventoryDetail';

jest.mock('@apollo/client', () => ({ useQuery: jest.fn() }));

type TUpdateQuery = (
  prev: unknown,
  event: { subscriptionData: { data: unknown } },
) => unknown;

const mockQuery = () => {
  const unsubscribe = jest.fn();
  const subscribeToMore = jest.fn(
    (_options: {
      variables: { adjustId: string };
      updateQuery: TUpdateQuery;
    }) => unsubscribe,
  );

  jest.mocked(useQuery).mockReturnValue({
    data: {
      adjustInventoryDetail: { _id: 'adj-oct', status: 'running' },
    },
    loading: false,
    subscribeToMore,
  } as unknown as ReturnType<typeof useQuery>);

  return { subscribeToMore, unsubscribe };
};

const renderDetail = (initialId: string) =>
  renderHook(
    ({ id }) => useAdjustInventoryDetail({ variables: { _id: id }, skip: !id }),
    { initialProps: { id: initialId } },
  );

describe('useAdjustInventoryDetail', () => {
  it('replaces the detail with the finished run pushed by the server', () => {
    const { subscribeToMore } = mockQuery();
    renderDetail('adj-oct');

    const { variables, updateQuery } = subscribeToMore.mock.calls[0][0];
    const finished = { _id: 'adj-oct', status: 'complete', error: '' };

    expect(variables).toEqual({ adjustId: 'adj-oct' });
    expect(
      updateQuery(
        { adjustInventoryDetail: { _id: 'adj-oct', status: 'running' } },
        {
          subscriptionData: {
            data: { accountingAdjustInventoryChanged: finished },
          },
        },
      ),
    ).toEqual({ adjustInventoryDetail: finished });
  });

  it.each([
    ['no payload', null],
    [
      'a payload without the adjustment',
      { accountingAdjustInventoryChanged: null },
    ],
  ])('keeps the loaded detail when the server pushes %s', (_case, data) => {
    const { subscribeToMore } = mockQuery();
    renderDetail('adj-oct');

    const prev = {
      adjustInventoryDetail: { _id: 'adj-oct', status: 'running' },
    };
    const { updateQuery } = subscribeToMore.mock.calls[0][0];

    expect(updateQuery(prev, { subscriptionData: { data } })).toBe(prev);
  });

  it('does not open a subscription before an adjustment is selected', () => {
    const { subscribeToMore } = mockQuery();
    renderDetail('');

    expect(subscribeToMore).not.toHaveBeenCalled();
  });

  it('moves the subscription to the newly opened adjustment', () => {
    const { subscribeToMore, unsubscribe } = mockQuery();
    const { rerender, unmount } = renderDetail('adj-oct');

    act(() => rerender({ id: 'adj-nov' }));

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(subscribeToMore).toHaveBeenCalledTimes(2);
    expect(subscribeToMore.mock.calls[1][0].variables).toEqual({
      adjustId: 'adj-nov',
    });

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });
});
