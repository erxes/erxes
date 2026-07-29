import { act, renderHook } from '@testing-library/react';

import { useDealActions } from './useDealActions';

const mockConfirm = jest.fn();
const mockRemoveDeals = jest.fn();
const mockSetActiveDealId = jest.fn();
const mockSetSalesItemId = jest.fn();
let mockActiveDealId: string | null = 'deal-1';
let mockSalesItemId: string | null = 'deal-1';

jest.mock('erxes-ui', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
  useQueryState: () => [mockSalesItemId, mockSetSalesItemId],
}));

jest.mock('jotai', () => ({
  useAtom: () => [mockActiveDealId, mockSetActiveDealId],
}));

jest.mock('@/deals/states/dealDetailSheetState', () => ({
  dealDetailSheetState: {},
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/deals/cards/hooks/useDeals', () => ({
  useDealsCopy: () => ({ copyDeals: jest.fn(), loading: false }),
  useDealsEdit: () => ({ editDeals: jest.fn(), loading: false }),
  useDealsRemove: () => ({
    removeDeals: mockRemoveDeals,
    loading: false,
  }),
  useDealsWatch: () => ({ watchDeals: jest.fn(), loading: false }),
}));

jest.mock('@/deals/graphql/queries/DealsQueries', () => ({
  GET_DEAL_DETAIL: {},
}));

describe('useDealActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveDealId = 'deal-1';
    mockSalesItemId = 'deal-1';
    mockConfirm.mockResolvedValue(undefined);
    mockRemoveDeals.mockResolvedValue({
      data: { dealsRemove: { _id: 'deal-1' } },
    });
  });

  it('closes the detail after deleting the open deal', async () => {
    const { result } = renderHook(() =>
      useDealActions({
        deals: [
          {
            _id: 'deal-1',
            isWatched: false,
            status: 'archived',
          },
        ],
      }),
    );

    await act(async () => {
      await result.current.handleRemove();
    });

    expect(mockRemoveDeals).toHaveBeenCalledWith({
      variables: { _id: 'deal-1' },
    });
    expect(mockSetActiveDealId).toHaveBeenCalledWith(null);
    expect(mockSetSalesItemId).toHaveBeenCalledWith(null);
  });

  it('keeps the detail open when deletion fails', async () => {
    mockRemoveDeals.mockRejectedValue(new Error('delete failed'));
    const { result } = renderHook(() =>
      useDealActions({
        deals: [
          {
            _id: 'deal-1',
            isWatched: false,
            status: 'archived',
          },
        ],
      }),
    );

    await expect(result.current.handleRemove()).rejects.toThrow(
      'delete failed',
    );

    expect(mockSetActiveDealId).not.toHaveBeenCalled();
    expect(mockSetSalesItemId).not.toHaveBeenCalled();
  });

  it('does not close an unrelated open detail', async () => {
    mockActiveDealId = 'deal-2';
    mockSalesItemId = 'deal-2';
    const { result } = renderHook(() =>
      useDealActions({
        deals: [
          {
            _id: 'deal-1',
            isWatched: false,
            status: 'archived',
          },
        ],
      }),
    );

    await act(async () => {
      await result.current.handleRemove();
    });

    expect(mockSetActiveDealId).not.toHaveBeenCalled();
    expect(mockSetSalesItemId).not.toHaveBeenCalled();
  });
});
