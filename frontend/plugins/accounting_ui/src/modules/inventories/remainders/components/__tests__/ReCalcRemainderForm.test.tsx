import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import {
  RECALC_REMAINDER_PANEL,
  ReCalcRemainderForm,
} from '@/inventories/remainders/components/ReCalcRemainderForm';
import { useReCalcRemainders } from '@/inventories/remainders/hooks/useReCalcRemainders';

const mockOpenNewRecord = jest.fn();
const mockClosePanel = jest.fn();
const mockCancelDraft = jest.fn();
let mockDraft: Record<string, unknown> = {};
let mockSelectedProductIds: string[] = [];
let mockQueries: Record<string, string> = {};

jest.mock('@/inventories/remainders/hooks/useReCalcRemainders');
jest.mock('@/inventories/remainders/states/productCounts', () => ({
  selectedProductIdsAtom: {},
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('jotai', () => ({
  atom: () => ({}),
  useAtomValue: () => mockSelectedProductIds,
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: () => ({
    cancelDraft: mockCancelDraft,
    closePanel: mockClosePanel,
  }),
}));
jest.mock('ui-modules', () => {
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const Select = Object.assign(Container, {
    Value: () => <span>Selected location</span>,
    Command: () => null,
  });
  return {
    ActivityLogs: () => null,
    PanelFormLayout: ({
      children,
      onCancel,
      saveLabel,
    }: {
      children: ReactNode;
      onCancel: () => void;
      saveLabel?: string;
    }) => (
      <>
        {children}
        <button type="button" onClick={onCancel}>
          cancel
        </button>
        <button type="submit">{saveLabel}</button>
      </>
    ),
    PanelFormRow: ({
      label,
      children,
    }: {
      label: string;
      children: ReactNode;
    }) => (
      <div>
        <span>{label}</span>
        {children}
      </div>
    ),
    SelectBranches: Select,
    SelectDepartments: Select,
    SelectCategory: { InlineCell: () => null },
    useSidePanel: () => ({ openNewRecord: mockOpenNewRecord }),
    useSidePanelDraft: () => mockDraft,
  };
});
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Container = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const Button = ({
    variant: _variant,
    ...props
  }: ComponentProps<'button'> & { variant?: string }) => (
    <button type="button" {...props} />
  );
  const Form = Object.assign(
    ({ children, ...props }: ComponentProps<typeof FormProvider>) => (
      <FormProvider {...props}>{children}</FormProvider>
    ),
    { Field: Controller },
  );
  return {
    Button,
    Form,
    ScrollArea: Container,
    Spinner: () => null,
    useMultiQueryState: () => [mockQueries],
    Popover: Container,
    Combobox: {
      Trigger: ({ children }: { children?: ReactNode }) => (
        <span>{children}</span>
      ),
      Content: Container,
    },
  };
});

const recalculate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  recalculate.mockReset();
  mockDraft = {};
  mockSelectedProductIds = [];
  mockQueries = {};
  jest
    .mocked(useReCalcRemainders)
    .mockReturnValue({ addSafeRemainder: recalculate, loading: false });
});

const openPanel = () => {
  const { New } = RECALC_REMAINDER_PANEL;

  if (!New) {
    throw new Error('Recalculate panel has no New view');
  }

  render(<New contentType="" contentId="" />);
};

const run = async (variables: Record<string, unknown>) => {
  fireEvent.click(screen.getByRole('button', { name: 'run' }));
  await waitFor(() =>
    expect(recalculate).toHaveBeenCalledWith(
      expect.objectContaining({ variables }),
    ),
  );
};

describe('opening recalculation', () => {
  it('opens the side panel with the current filters and the selected products', () => {
    mockQueries = { branchId: 'central', departmentId: 'sales' };
    mockSelectedProductIds = ['bread', 'milk'];
    render(<ReCalcRemainderForm />);

    expect(screen.getByRole('button').textContent).toContain('2');

    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenNewRecord).toHaveBeenCalledWith(
      'accounting:reCalcRemainder',
      {
        branchId: 'central',
        departmentId: 'sales',
        productIds: ['bread', 'milk'],
      },
    );
  });

  it('recalculates only the products that were selected when the panel opened', async () => {
    mockDraft = {
      branchId: 'central',
      departmentId: '',
      productIds: ['bread'],
    };
    mockClosePanel.mockClear();
    recalculate.mockImplementation(({ onCompleted }) => onCompleted());
    openPanel();

    await run({ branchId: 'central', departmentId: '', productIds: ['bread'] });
    expect(mockClosePanel).toHaveBeenCalledTimes(1);
  });

  it('a panel reopened after reload without a selection shows and runs for all products', async () => {
    openPanel();

    expect(screen.getByText('all')).toBeTruthy();
    expect(screen.queryByText(/selected/)).toBeNull();

    await run({ branchId: '', departmentId: '' });
    expect(recalculate.mock.calls[0][0].variables).not.toHaveProperty(
      'productIds',
    );
  });

  it('a failed recalculation keeps the panel open', async () => {
    mockDraft = { productIds: ['bread'] };
    recalculate.mockImplementation(({ onError }) =>
      onError?.(new Error('Inventory is locked')),
    );
    openPanel();

    await run({ branchId: '', departmentId: '', productIds: ['bread'] });

    expect(mockClosePanel).not.toHaveBeenCalled();
  });

  it('cancel closes the draft without recalculating', () => {
    openPanel();

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(mockCancelDraft).toHaveBeenCalledTimes(1);
    expect(recalculate).not.toHaveBeenCalled();
  });
});

describe('recalculation location selection', () => {
  it('starts with blank filters instead of selecting unassigned locations', async () => {
    openPanel();
    expect(
      screen.getByRole('button', {
        name: 'branch-not-assigned',
        pressed: false,
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', {
        name: 'department-not-assigned',
        pressed: false,
      }),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Бүх салбар' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Бүх нэгж' })).toBeNull();
    await run({ branchId: '', departmentId: '' });
  });

  it('only submits underscores after explicitly selecting unassigned options', async () => {
    openPanel();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'branch-not-assigned',
        pressed: false,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'department-not-assigned',
        pressed: false,
      }),
    );
    await run({ branchId: '_', departmentId: '_' });
  });

  it('clears the branch independently while preserving the unassigned department filter', async () => {
    openPanel();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'branch-not-assigned',
        pressed: false,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'department-not-assigned',
        pressed: false,
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'branch-not-assigned',
        pressed: true,
      }),
    );
    await run({ branchId: '', departmentId: '_' });
  });
});
