import { renderHook } from '@testing-library/react';
import { useMutation } from '@apollo/client';
import { useAdjustInventoryAdd } from '@/adjustments/inventories/hooks/useAdjustInventoryAdd';

const mockNavigate = jest.fn();

jest.mock('@apollo/client', () => ({ useMutation: jest.fn() }));
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({ toast: jest.fn() }), { virtual: true });

type TUpdate = (
  cache: unknown,
  result: { data: { adjustInventoryAdd: { _id: string } | null } },
) => void;

const createAdjustment = (created: { _id: string } | null) => {
  const mutate = jest.fn();
  jest
    .mocked(useMutation)
    .mockReturnValue([mutate, { loading: false }] as unknown as ReturnType<
      typeof useMutation
    >);

  const { result } = renderHook(() => useAdjustInventoryAdd());
  result.current.addAdjustInventory({
    variables: {
      date: new Date('2026-11-05'),
      description: 'November costing',
    },
  });

  const { update } = mutate.mock.calls[0][0] as { update: TUpdate };
  update(undefined, { data: { adjustInventoryAdd: created } });
};

describe('useAdjustInventoryAdd', () => {
  beforeEach(() => mockNavigate.mockClear());

  it('opens the detail page of the adjustment that was just created', () => {
    createAdjustment({ _id: 'adj-nov' });

    expect(mockNavigate).toHaveBeenCalledWith(
      '/accounting/adjustment/inventory/detail?id=adj-nov',
    );
  });

  it('returns to the list when the server does not return the new adjustment', () => {
    createAdjustment(null);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/accounting/adjustment/inventory',
    );
  });
});
