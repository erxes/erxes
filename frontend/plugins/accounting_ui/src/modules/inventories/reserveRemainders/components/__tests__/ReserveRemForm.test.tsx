import { ReactNode, Ref } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { RESERVE_REM_PANEL } from '@/inventories/reserveRemainders/components/ReserveRemForm';

const mockAdd = jest.fn();
const mockEdit = jest.fn();
const mockClosePanel = jest.fn();
const mockCancelDraft = jest.fn();
let mockDetail: Record<string, unknown> | undefined;
let mockDetailLoading = false;
let mockDetailError: Error | undefined;

type TSelectProps = {
  scope: string;
  mode: 'single' | 'multiple';
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
};

jest.mock('react-i18next', () => {
  const t = (key: string) => key;

  return { useTranslation: () => ({ t }) };
});
jest.mock('erxes-ui', () => {
  const { Controller } = jest.requireActual('react-hook-form');
  const { forwardRef } = jest.requireActual('react');
  const Form = Object.assign(
    ({ children }: { children: ReactNode }) => children,
    { Field: Controller },
  );

  return {
    Form,
    Input: forwardRef(
      (props: Record<string, unknown>, ref: Ref<HTMLInputElement>) => (
        <input ref={ref} {...props} />
      ),
    ),
    Spinner: () => <span>loading</span>,
    isDeeplyEqual: (first: unknown, second: unknown) =>
      JSON.stringify(first) === JSON.stringify(second),
  };
});
jest.mock('ui-modules', () => {
  const Select = ({ scope, mode, value, onValueChange }: TSelectProps) => (
    <input
      aria-label={scope}
      value={Array.isArray(value) ? value.join(',') : value ?? ''}
      onChange={(e) =>
        onValueChange(
          mode === 'multiple'
            ? e.target.value.split(',').filter(Boolean)
            : e.target.value,
        )
      }
    />
  );
  const inline = { InlineCell: Select };

  return {
    PANEL_INPUT_CLASS_NAME: '',
    PanelFormLayout: ({
      children,
      onCancel,
    }: {
      children: ReactNode;
      onCancel: () => void;
    }) => (
      <>
        {children}
        <button type="button" onClick={onCancel}>
          cancel
        </button>
        <button type="submit">save</button>
      </>
    ),
    PanelFormRow: ({
      label,
      error,
      children,
    }: {
      label: string;
      error?: string;
      children: ReactNode;
    }) => (
      <label>
        {label}
        {children}
        {error && <span role="alert">{error}</span>}
      </label>
    ),
    ActivityLogs: () => null,
    SelectBranches: inline,
    SelectDepartments: inline,
    SelectCategory: inline,
    SelectProduct: inline,
  };
});
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: () => null,
}));
jest.mock('@/settings/hooks/useCurrencyConfigs', () => ({}));
jest.mock(
  '@/transactions/transaction-form/hooks/useGetExchangeRate',
  () => ({}),
);
jest.mock('@/inventories/reserveRemainders/hooks/useReserveRemAdd', () => ({
  useReserveRemAdd: () => ({ addReserveRem: mockAdd, loading: false }),
}));
jest.mock('@/inventories/reserveRemainders/hooks/useReserveRemEdit', () => ({
  useReserveRemEdit: () => ({ editReserveRem: mockEdit, loading: false }),
}));
jest.mock('@/inventories/reserveRemainders/hooks/useReserveRemsRemove', () => ({
  useReserveRemsRemove: () => ({
    removeReserveRems: jest.fn(),
    loading: false,
  }),
}));
jest.mock('@/inventories/reserveRemainders/hooks/useReserveRemDetail', () => ({
  useReserveRemDetail: () => ({
    reserveRemDetail: mockDetail,
    loading: mockDetailLoading,
    error: mockDetailError,
  }),
}));
jest.mock('@/layout/components/AccountingEmptyState', () => ({
  AccountingEmptyState: ({ error }: { error?: Error }) => (
    <div role="status">{error ? error.message : 'no-results-found'}</div>
  ),
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: () => ({
    cancelDraft: mockCancelDraft,
    closePanel: mockClosePanel,
  }),
}));

const SCOPE = 'side-panel-reserve-rem';

const SAVED_RESERVATION = {
  _id: 'cola-reserve',
  productId: 'cola',
  branchId: 'central',
  departmentId: 'sales',
  uom: 'pcs',
  remainder: 24,
};

const type = (field: string, value: string) =>
  fireEvent.change(screen.getByLabelText(field), { target: { value } });

const typeRemainder = (value: string) =>
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value } });

const save = () =>
  act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'save' }));
  });

const openNew = () => {
  const { New } = RESERVE_REM_PANEL;

  if (!New) {
    throw new Error('Reserve remainder panel has no New view');
  }

  render(<New contentType="" contentId="" />);
};

const openSaved = async () => {
  const { Detail } = RESERVE_REM_PANEL;

  await act(async () => {
    render(<Detail contentType="" contentId="cola-reserve" />);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockDetail = SAVED_RESERVATION;
  mockDetailLoading = false;
  mockDetailError = undefined;
});

describe('new reservation', () => {
  test('saving without a product or category asks for one and sends nothing', async () => {
    openNew();
    typeRemainder('10');

    await save();

    expect(screen.getByRole('alert').textContent).toBe(
      'Must fill product category or product',
    );
    expect(mockAdd).not.toHaveBeenCalled();
  });

  test('clearing the reserved quantity blocks saving', async () => {
    openNew();
    type(`${SCOPE}.product`, 'cola');
    typeRemainder('');

    await save();

    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('alert').textContent).toBe('Remainder is required');
    expect(mockAdd).not.toHaveBeenCalled();
  });

  test('reserving a whole category for two branches sends every choice and closes', async () => {
    mockAdd.mockImplementation(({ onCompleted }) => onCompleted());
    openNew();
    type(`${SCOPE}.branches`, 'central,airport');
    type(`${SCOPE}.productCategory`, 'drinks');
    typeRemainder('12');

    await save();

    expect(mockAdd.mock.calls[0][0].variables).toEqual({
      branchIds: ['central', 'airport'],
      departmentIds: [],
      productCategoryId: 'drinks',
      remainder: 12,
    });
    expect(mockClosePanel).toHaveBeenCalledTimes(1);
  });

  test('cancel leaves the draft without saving', () => {
    openNew();

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(mockCancelDraft).toHaveBeenCalledTimes(1);
    expect(mockAdd).not.toHaveBeenCalled();
  });
});

describe('saved reservation', () => {
  test('changing the reserved quantity saves it and closes the panel', async () => {
    mockEdit.mockImplementation(({ onCompleted }) => onCompleted());
    await openSaved();

    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe(
      '24',
    );

    typeRemainder('5');
    await save();

    expect(mockEdit.mock.calls[0][0].variables).toEqual({
      _id: 'cola-reserve',
      productId: 'cola',
      branchId: 'central',
      departmentId: 'sales',
      uom: 'pcs',
      remainder: 5,
    });
    expect(mockClosePanel).toHaveBeenCalledTimes(1);
  });

  test('a reservation for every branch shows empty locations and keeps them unassigned on save', async () => {
    mockDetail = {
      ...SAVED_RESERVATION,
      branchId: '_',
      departmentId: '_',
    };
    await openSaved();

    expect(
      (screen.getByLabelText(`${SCOPE}.branch`) as HTMLInputElement).value,
    ).toBe('');
    expect(
      (screen.getByLabelText(`${SCOPE}.department`) as HTMLInputElement).value,
    ).toBe('');

    typeRemainder('30');
    await save();

    expect(mockEdit.mock.calls[0][0].variables).toMatchObject({
      branchId: '_',
      departmentId: '_',
      remainder: 30,
    });
  });

  test('clearing the branch of a saved reservation stores it as unassigned', async () => {
    await openSaved();
    type(`${SCOPE}.branch`, '');

    await save();

    expect(mockEdit.mock.calls[0][0].variables).toMatchObject({
      branchId: '_',
      departmentId: 'sales',
    });
  });

  test('emptying the saved quantity stays empty and is refused', async () => {
    await openSaved();
    typeRemainder('');

    await save();

    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('alert').textContent).toBe('Remainder is required');
    expect(mockEdit).not.toHaveBeenCalled();
  });

  test('removing the product is refused before reaching the server', async () => {
    await openSaved();
    type(`${SCOPE}.product`, '');

    await save();

    expect(screen.getByRole('alert').textContent).toBe('Must fill product');
    expect(mockEdit).not.toHaveBeenCalled();
    expect(mockClosePanel).not.toHaveBeenCalled();
  });

  test('saving without changes closes the panel and sends nothing', async () => {
    await openSaved();

    await save();

    expect(mockEdit).not.toHaveBeenCalled();
    expect(mockClosePanel).toHaveBeenCalledTimes(1);
  });

  test('a reservation with missing legacy values still opens with empty fields', async () => {
    mockDetail = {
      _id: 'old-reserve',
      productId: 'cola',
      branchId: null,
      departmentId: null,
      uom: null,
      remainder: null,
    };
    await openSaved();

    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe(
      '0',
    );
    expect(
      (screen.getByLabelText(`${SCOPE}.branch`) as HTMLInputElement).value,
    ).toBe('');
  });

  test('shows a spinner while loading and a not-found state for a deleted reservation', async () => {
    mockDetail = undefined;
    mockDetailLoading = true;
    await openSaved();

    expect(screen.getByText('loading')).toBeTruthy();

    mockDetailLoading = false;
    const { Detail } = RESERVE_REM_PANEL;
    render(<Detail contentType="" contentId="deleted-reserve" />);

    expect(screen.getByRole('status').textContent).toBe('no-results-found');
    expect(screen.queryByRole('button', { name: 'save' })).toBeNull();
  });

  test('shows the server error when the reservation cannot be loaded', async () => {
    mockDetail = undefined;
    mockDetailError = new Error('Network request failed');
    await openSaved();

    expect(screen.getByRole('status').textContent).toBe(
      'Network request failed',
    );
    expect(screen.queryByRole('button', { name: 'save' })).toBeNull();
  });
});
