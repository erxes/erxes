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

  it('retries only failed products after a partial update', async () => {
    mockEdit.mockRejectedValueOnce(new Error('Permission denied'));
    const { result, rerender } = renderHook(
      ({ products }) => useProductsChangeType(products),
      { initialProps: { products: targets } },
    );
    await act(async () => {
      await expect(result.current.apply({ type: 'product' })).resolves.toBe(
        false,
      );
    });
    expect(mockEdit).toHaveBeenCalledTimes(2);
    expect(mockRefetch).toHaveBeenCalled();
    expect(mockClearSelection).toHaveBeenCalledWith({ first: true });
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        description: expect.stringContaining('Permission denied'),
      }),
    );

    rerender({ products: [targets[0]] });
    await act(async () => {
      await expect(result.current.apply({ type: 'product' })).resolves.toBe(
        true,
      );
    });
    expect(mockEdit.mock.calls).toEqual([
      [{ variables: { _id: 'first', type: 'product' } }],
      [{ variables: { _id: 'second', type: 'product' } }],
      [{ variables: { _id: 'first', type: 'product' } }],
    ]);
    expect(mockClearSelection).toHaveBeenLastCalledWith({});
  });

  it('does not refresh or clear selection when every update fails', async () => {
    mockEdit.mockRejectedValue(new Error('Permission denied'));
    const { result } = renderHook(() => useProductsChangeType(targets));
    await act(async () => {
      await expect(result.current.apply({ type: 'service' })).resolves.toBe(
        false,
      );
    });
    expect(mockEdit).toHaveBeenCalledTimes(2);
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    );
    expect(result.current.saving).toBe(false);
  });

  it('reports a failed refresh and releases the submission lock', async () => {
    mockRefetch.mockRejectedValueOnce(new Error('Network unavailable'));
    const { result } = renderHook(() =>
      useProductsChangeType(targets.slice(0, 1)),
    );
    await act(async () => {
      await expect(result.current.apply({ type: 'service' })).resolves.toBe(
        false,
      );
    });
    expect(mockClearSelection).not.toHaveBeenCalled();
    expect(mockToast).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: 'Updates saved; unable to refresh products',
        description: 'Network unavailable',
        variant: 'destructive',
      }),
    );
    expect(result.current.saving).toBe(false);

    await act(async () => {
      await expect(result.current.apply({ type: 'service' })).resolves.toBe(
        true,
      );
    });
    expect(mockClearSelection).toHaveBeenCalledWith({});
  });

  it('does not submit when only deleted products are selected', async () => {
    const { result } = renderHook(() => useProductsChangeType([targets[1]]));
    await act(async () => {
      await expect(result.current.apply({ type: 'service' })).resolves.toBe(
        false,
      );
    });
    expect(mockEdit).not.toHaveBeenCalled();
    expect(mockRefetch).not.toHaveBeenCalled();
    expect(mockClearSelection).not.toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('waits for each update to finish before starting the next', async () => {
    let finish: (() => void) | undefined;
    mockEdit.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result } = renderHook(() => useProductsChangeType(targets));
    await act(async () => {
      const applying = result.current.apply({ type: 'service' });
      await Promise.resolve();
      expect(mockEdit).toHaveBeenCalledTimes(1);
      expect(mockRefetch).not.toHaveBeenCalled();
      finish?.();
      await expect(applying).resolves.toBe(true);
    });
    expect(mockEdit).toHaveBeenCalledTimes(2);
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
