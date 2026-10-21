import { act, renderHook } from '@testing-library/react';
import { useProductsChangeType } from '../useProductsChangeType';

const mockEdit = jest.fn();
const mockRefetch = jest.fn();
const mockClearSelection = jest.fn();
const mockToast = jest.fn();

jest.mock('@/products/hooks/useProductsEdit', () => ({
  useProductsEdit: () => ({ productsEdit: mockEdit }),
}));
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ refetchQueries: mockRefetch }),
}));
jest.mock('erxes-ui', () => ({
  RecordTable: {
    useRecordTable: () => ({ table: { setRowSelection: mockClearSelection } }),
  },
  useToast: () => ({ toast: mockToast }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

const targets = [
  { _id: 'first', status: 'active' },
  { _id: 'deleted', status: 'deleted' },
  { _id: 'second', status: 'active' },
];

describe('bulk product type changes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEdit.mockResolvedValue({});
    mockRefetch.mockResolvedValue([]);
  });

  it('updates active products, skips deleted products, and refreshes the list', async () => {
    const { result } = renderHook(() => useProductsChangeType(targets));
    await act(async () => {
      await expect(result.current.apply({ type: 'service' })).resolves.toBe(
        true,
      );
    });
    expect(mockEdit.mock.calls).toEqual([
      [{ variables: { _id: 'first', type: 'service' } }],
      [{ variables: { _id: 'second', type: 'service' } }],
    ]);
    expect(mockRefetch).toHaveBeenCalledWith({ include: ['ProductsMain'] });
    expect(mockClearSelection).toHaveBeenCalledWith({});
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'success' }),
    );
    expect(result.current.saving).toBe(false);
  });

  it('sends the required duration only when converting to Unique', async () => {
    const { result } = renderHook(() =>
      useProductsChangeType(targets.slice(0, 1)),
    );
    await act(async () => {
      await result.current.apply({
        type: 'unique',
        duration: 2,
        durationType: 'month',
      });
    });
    expect(mockEdit).toHaveBeenCalledWith({
      variables: {
        _id: 'first',
        type: 'unique',
        duration: 2,
        durationType: 'month',
      },
    });
  });

  it('continues after one failure and keeps selection for retry', async () => {
    mockEdit.mockRejectedValueOnce(new Error('Permission denied'));
    const { result } = renderHook(() => useProductsChangeType(targets));
    await act(async () => {
      await expect(result.current.apply({ type: 'product' })).resolves.toBe(
        false,
      );
    });
    expect(mockEdit).toHaveBeenCalledTimes(2);
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        description: expect.stringContaining('Permission denied'),
      }),
    );
  });

  it('prevents duplicate submissions while a mutation is pending', async () => {
    let finish: (() => void) | undefined;
    mockEdit.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useProductsChangeType(targets.slice(0, 1)),
    );
    await act(async () => {
      const first = result.current.apply({ type: 'service' });
      await expect(result.current.apply({ type: 'product' })).resolves.toBe(
        false,
      );
      finish?.();
      await first;
    });
    expect(mockEdit).toHaveBeenCalledTimes(1);
  });
});
