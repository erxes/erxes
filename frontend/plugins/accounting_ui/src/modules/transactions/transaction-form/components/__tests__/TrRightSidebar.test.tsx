import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import {
  TRANSACTION_PANEL,
  TrRightSidebar,
} from '@/transactions/transaction-form/components/TrRightSidebar';

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
let mockOpenPanelRecord: (record: unknown) => void = () => undefined;
let mockOpenedRecord: { contentType: string; contentId: string } | null = null;
const mockInternalNote = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { cloneElement } = jest.requireActual('react');
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
    Form: Passthrough,
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
    openDetail: (contentId: string) => {
      mockOpenRecord({ contentType, contentId });
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
    expect(fieldText('status')).toBe('complete');
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

    expect(fieldText('status')).toBe('draft');
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

describe('transaction activity button', () => {
  it('opens the voucher in the side panel on its activity tab', () => {
    mockParentId = 'parent-7';
    render(<TrRightSidebar />);

    fireEvent.click(screen.getByRole('button', { name: 'activities' }));

    expect(mockOpenRecord).toHaveBeenCalledWith({
      contentType: 'accounting:transaction',
      contentId: 'parent-7',
    });
    expect(mockSetTab).toHaveBeenCalledTimes(1);
    expect(mockSetTab).toHaveBeenCalledWith('activity');
  });

  it('switches to the activity tab when the voucher is already open on its detail', () => {
    mockParentId = 'parent-7';
    mockOpenedRecord = {
      contentType: 'accounting:transaction',
      contentId: 'parent-7',
    };
    render(<TrRightSidebar />);
    expect(mockSetTab).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'activities' }));

    expect(mockSetTab).toHaveBeenCalledTimes(1);
    expect(mockSetTab).toHaveBeenCalledWith('activity');
  });

  it('is not offered while a new voucher has not been saved yet', () => {
    render(<TrRightSidebar />);

    expect(screen.queryByRole('button', { name: 'activities' })).toBeNull();
    expect(mockOpenRecord).not.toHaveBeenCalled();
  });
});
