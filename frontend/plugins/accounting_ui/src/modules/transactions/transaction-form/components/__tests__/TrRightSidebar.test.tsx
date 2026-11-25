import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  TRANSACTION_PANEL,
  TrRightSidebar,
} from '@/transactions/transaction-form/components/TrRightSidebar';
import { transactionGroupSchema } from '../../contants/transactionSchema';
import {
  followTrDocsState,
  transactionPanelFormState,
} from '../../states/trStates';
import type { TAddTransactionGroup } from '../../types/JournalForms';
import { cleanTrDocs } from '../utils';

type TTransactionStub = {
  ptrNumber?: string;
  number?: string;
  date?: string;
  status?: string;
  description?: string;
  contentType?: string;
  contentId?: string;
};

let mockTransactions: TTransactionStub[] | undefined;
let mockLoading = false;
let mockParentId: string | null = null;
const mockSetTab = jest.fn();
const mockOpenRecord = jest.fn();
const mockOpenDraft = jest.fn();
let mockOpenPanelRecord: (record: unknown) => void = () => undefined;
let mockOpenedRecord: { contentType: string; contentId: string } | null = null;
const mockInternalNote = jest.fn();

jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (key: string) => key }),
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { cloneElement } = jest.requireActual('react');
  const { Controller, FormProvider } = jest.requireActual('react-hook-form');
  const Passthrough = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    Button: ({
      asChild,
      children,
      ...props
    }: {
      asChild?: boolean;
      children: ReactElement;
    }) =>
      asChild ? cloneElement(children) : <button {...props}>{children}</button>,
    Form: Object.assign(FormProvider, {
      Field: Controller,
      Item: Passthrough,
      Label: 'label',
      Control: Passthrough,
      Message: () => null,
    }),
    Input: 'input',
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    ScrollArea: Passthrough,
    Spinner: () => <span>loading</span>,
    useQueryState: () => [mockParentId],
  };
});
jest.mock('ui-modules', () => {
  const { useState } = jest.requireActual('react');
  return {
    ActivityLogs: (props: { targetId: string }) => (
      <p>activity of {props.targetId}</p>
    ),
    AddInternalNote: (props: {
      contentTypeId: string;
      contentType: string;
    }) => {
      mockInternalNote(props);
      return <textarea aria-label="note" />;
    },
    MembersInline: () => null,
    CustomerType: { CUSTOMER: 'customer' },
    NEW_RECORD_ID: 'new',
    PanelFormLayout: ({ children }: { children: ReactNode }) => children,
    PanelField: ({
      label,
      children,
    }: {
      label: string;
      children: ReactNode;
    }) => (
      <div role="group" aria-label={label}>
        {children}
      </div>
    ),
    useSidePanel: () => {
      const [record, setRecord] = useState(mockOpenedRecord);
      mockOpenPanelRecord = setRecord;
      return { record, setTab: mockSetTab };
    },
  };
});
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: (contentType: string) => ({
    openDraft: mockOpenDraft,
    openDetail: (contentId: string, options: { tab: string }) => {
      mockOpenRecord({ contentType, contentId }, options);
      if (mockOpenedRecord?.contentId !== contentId) {
        mockOpenPanelRecord({ contentType, contentId });
      }
    },
  }),
}));
jest.mock('@apollo/client', () => ({
  useQuery: (
    _document: unknown,
    options: { skip?: boolean; variables: { _id: string } },
  ) => ({
    data: options.skip
      ? undefined
      : {
          dealLink: {
            href: `https://erxes.test/deal/${options.variables._id}`,
          },
        },
  }),
}));
jest.mock(
  '@/transactions/transaction-form/hooks/useTransactionsDetail',
  () => ({
    useTransactionsDetail: () => ({
      activeTrs: mockTransactions,
      loading: mockLoading,
    }),
  }),
);

const { Detail, Activity } = TRANSACTION_PANEL;

const fieldText = (label: string) =>
  screen.getByRole('group', { name: label }).textContent;

beforeEach(() => {
  jest.clearAllMocks();
  mockTransactions = undefined;
  mockLoading = false;
  mockParentId = null;
  mockOpenedRecord = null;
});

describe('transaction side panel', () => {
  it('summarises a completed bank voucher created from a deal', () => {
    mockTransactions = [
      {
        ptrNumber: '2026110514_001',
        number: '2026110514_001-1',
        date: '2026-10-09T08:30:00.000Z',
        status: 'complete',
        description: 'Land purchase',
        contentType: 'sales:deal',
        contentId: 'deal-42',
      },
    ];

    render(
      <Detail contentType="accounting:transaction" contentId="parent-7" />,
    );

    expect(fieldText('number')).toBe('2026110514_001');
    expect(fieldText('date')).toBe('2026-10-09');
    expect(fieldText('status')).toBe('tr-status-complete');
    expect(fieldText('description')).toBe('Land purchase');
    expect(
      screen.getByRole('link', { name: 'open-deal' }).getAttribute('href'),
    ).toBe('https://erxes.test/deal/deal-42');
  });

  it('offers no related-record link for a manual journal entry', () => {
    mockTransactions = [{ ptrNumber: '2026110416_003', status: 'draft' }];

    render(
      <Detail contentType="accounting:transaction" contentId="parent-8" />,
    );

    expect(fieldText('status')).toBe('tr-status-draft');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows a spinner while the voucher loads and nothing once it was deleted', () => {
    mockLoading = true;
    const { rerender, container } = render(
      <Detail contentType="accounting:transaction" contentId="parent-9" />,
    );
    expect(screen.getByText('loading')).toBeTruthy();

    mockLoading = false;
    mockTransactions = [];
    rerender(
      <Detail contentType="accounting:transaction" contentId="parent-9" />,
    );
    expect(container.textContent).toBe('');
  });

  it('applies one replacement to the live voucher and preloads it on reopening', async () => {
    mockTransactions = [{ number: 'voucher' }];
    const store = createStore();
    const data = transactionGroupSchema.parse({
      date: new Date(),
      status: 'complete',
      trDocs: ['a', 'b', 'c'].map((code) => ({
        _id: code,
        journal: 'main',
        customerType: 'customer',
        ptrId: 'pointer',
        side: code === 'a' ? 'dt' : 'ct',
        relAccounts:
          code === 'b' ? { dt: ['a'], customDt: ['saved-a'] } : undefined,
        details: [
          {
            _id: `detail-${code}`,
            accountId: code,
            account: { _id: code, code },
            amount: 1,
          },
        ],
      })),
    });
    const VoucherDetail = () => {
      const form = useForm<TAddTransactionGroup>({ defaultValues: data });
      useEffect(() => {
        store.set(transactionPanelFormState, {
          contentId: 'parent-7',
          form,
          canEdit: true,
        });
      }, [form]);
      return (
        <Detail contentType="accounting:transaction" contentId="parent-7" />
      );
    };
    render(
      <Provider store={store}>
        <VoucherDetail />
      </Provider>,
    );

    const openEditor = () =>
      fireEvent.click(
        screen.getByRole('button', { name: 'edit-corresponding-accounts' }),
      );
    openEditor();
    const creditC = screen.getByDisplayValue('c');
    fireEvent.change(creditC, { target: { value: 'd' } });
    fireEvent.click(screen.getByRole('button', { name: 'save-and-close' }));

    const calculated = within(
      screen.getByRole('region', { name: 'corresponding-account' }),
    );
    const custom = within(screen.getByRole('region', { name: 'difference' }));
    const calculatedDebit = within(
      calculated.getByRole('group', { name: 'debit' }),
    );
    const calculatedCredit = within(
      calculated.getByRole('group', { name: 'credit' }),
    );
    expect(
      calculated.getAllByRole('group').map((group) => group.textContent),
    ).toEqual(['debita', 'creditbc']);
    const edited = await custom.findByText('d');
    expect(edited.parentElement?.classList.contains('text-primary')).toBe(true);
    expect(calculatedDebit.getByText('a')).toBeTruthy();
    expect(calculatedCredit.getByText('c')).toBeTruthy();
    expect(calculatedCredit.queryByText('d')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();
    openEditor();

    const creditFields = within(custom.getByRole('group', { name: 'credit' }));
    expect(creditFields.getByDisplayValue('d')).toBeTruthy();
    fireEvent.click(creditFields.getByRole('button', { name: 'delete b' }));
    expect(creditFields.queryByDisplayValue('b')).toBeNull();
    fireEvent.change(creditFields.getByPlaceholderText('enter-account-code'), {
      target: { value: 'e' },
    });
    const additionInputs =
      creditFields.getAllByPlaceholderText<HTMLInputElement>(
        'enter-account-code',
      );
    expect(additionInputs.map((input) => input.value)).toEqual(['e', '']);
    const debitFields = within(custom.getByRole('group', { name: 'debit' }));
    fireEvent.change(debitFields.getByPlaceholderText('enter-account-code'), {
      target: { value: 'f' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'save-and-close' }));
    expect(await custom.findByText('e')).toBeTruthy();
    const customCredit = within(custom.getByRole('group', { name: 'credit' }));
    expect(
      customCredit.getAllByRole('listitem').map((code) => code.textContent),
    ).toEqual(['d', 'e']);
    expect(
      within(custom.getByRole('group', { name: 'debit' })).getByText('f'),
    ).toBeTruthy();
    expect(calculatedCredit.getByText('b')).toBeTruthy();

    openEditor();
    expect(screen.getByDisplayValue('e')).toBeTruthy();
    const reset = custom.getByRole('button', {
      name: 'safe-import-reset-mapping',
    });
    fireEvent.click(reset);
    expect(custom.queryByText('e')).toBeNull();
    const resetVoucher = transactionGroupSchema.parse(
      store.get(transactionPanelFormState)?.form.getValues(),
    );
    expect(resetVoucher.relatedAccountReplacements).toEqual([]);
    expect(cleanTrDocs(resetVoucher).map((tr) => tr.relAccounts)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
    openEditor();
    expect(screen.getByDisplayValue('c')).toBeTruthy();
    expect(screen.queryByDisplayValue('saved-a')).toBeNull();

    act(() => {
      store.set(followTrDocsState, [
        {
          _id: 'follow',
          ptrId: 'pointer',
          originId: 'a',
          side: 'ct',
          details: [
            {
              accountId: 'tax',
              account: { _id: 'tax', code: 'tax', name: 'Tax' },
            },
          ],
        },
        {
          _id: 'hidden-follow',
          ptrId: 'pointer',
          originId: 'a',
          permission: 'hidden',
          details: [{ _id: 'masked-detail' }],
        },
        {
          _id: 'other-follow',
          ptrId: 'other-pointer',
          originId: 'a',
          details: [],
        },
      ]);
    });
    expect(
      calculatedCredit.getAllByRole('listitem').map((code) => code.textContent),
    ).toEqual(['b', 'c', 'tax']);
    expect(calculated.getByText('restricted-transaction')).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'save-and-close' })
        .disabled,
    ).toBe(true);
    expect(
      within(custom.getByRole('group', { name: 'credit' })).getByText('tax'),
    ).toBeTruthy();
    expect(custom.getByText('restricted-transaction')).toBeTruthy();

    fireEvent.click(custom.getByRole('button', { name: 'cancel-label' }));
    openEditor();
    expect(custom.getByText('restricted-transaction')).toBeTruthy();
    expect(
      custom.getByRole<HTMLButtonElement>('button', { name: 'save-and-close' })
        .disabled,
    ).toBe(true);
    expect(
      custom.getByRole<HTMLButtonElement>('button', {
        name: 'safe-import-reset-mapping',
      }).disabled,
    ).toBe(true);
  });

  it('lists the voucher activity and lets the user leave a note on it', () => {
    if (!Activity) {
      throw new Error('transaction panel has no activity view');
    }
    render(
      <Activity contentType="accounting:transaction" contentId="parent-7" />,
    );

    expect(screen.getByText('activity of parent-7')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'note' })).toBeTruthy();
    expect(mockInternalNote).toHaveBeenCalledWith({
      contentTypeId: 'parent-7',
      contentType: 'accounting:transaction',
    });
  });
});

describe('transaction details button', () => {
  it('opens the saved voucher on the details tab', () => {
    mockParentId = 'parent-7';
    render(<TrRightSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'details' }));

    expect(mockOpenRecord).toHaveBeenCalledWith(
      { contentType: 'accounting:transaction', contentId: 'parent-7' },
      { tab: 'detail' },
    );
  });

  it('switches to details when the voucher panel is already open', () => {
    mockParentId = 'parent-7';
    mockOpenedRecord = {
      contentType: 'accounting:transaction',
      contentId: 'parent-7',
    };
    render(<TrRightSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'details' }));

    expect(mockSetTab).toHaveBeenCalledWith('detail');
  });

  it('opens a draft panel for an unsaved voucher', () => {
    render(<TrRightSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'details' }));

    expect(mockOpenDraft).toHaveBeenCalledTimes(1);
  });
});
