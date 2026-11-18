import { Cell } from '@tanstack/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { PutResponseMoreColumnCell } from '~/modules/ebarimt/put-response/components/PutResponseMoreColumn';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';

const mockToast = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const Popover = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  Popover.Trigger = ({ children }: { children: ReactNode }) => children;
  Popover.Content = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );

  return {
    REACT_APP_API_URL: 'https://erxes.test',
    Button: ({
      children,
      ...props
    }: {
      children: ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    Popover,
    RecordTable: { MoreButton: () => <button type="button">more</button> },
    useToast: () => ({ toast: mockToast }),
  };
});

const putResponse = (overrides: Partial<IPutResponse>) =>
  ({
    _id: 'pr-0357',
    id: '112502020902001012345678901234567',
    number: '20261111/0357',
    date: '2026-11-11 02:14:09',
    createdAt: '2026-11-11T02:14:09.000Z',
    type: 'B2C_RECEIPT',
    state: null,
    status: 'SUCCESS',
    message: '',
    merchantTin: '37900846788',
    customerTin: null,
    customerName: null,
    consumerNo: null,
    lottery: 'QW 87654321',
    qrData: null,
    receipts: [
      {
        items: [
          {
            name: 'Prius 30 тосны шүүр',
            qty: 1,
            unitPrice: 45000,
            totalAmount: 45000,
          },
        ],
      },
    ],
    totalAmount: 45000,
    totalVAT: 4090.91,
    totalCityTax: 0,
    ...overrides,
  }) as IPutResponse;

const renderCell = (row: IPutResponse) =>
  render(
    <PutResponseMoreColumnCell
      cell={{ row: { original: row } } as Cell<IPutResponse, unknown>}
      timeZone="Asia/Ulaanbaatar"
    />,
  );

const printedReceiptHtml = () => {
  const [[blob]] = jest.mocked(URL.createObjectURL).mock.calls;

  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.readAsText(blob as Blob);
  });
};

const openReceiptWindow = (receiptWindow: Window | null) =>
  jest.spyOn(window, 'open').mockReturnValue(receiptWindow);

describe('PutResponseMoreColumnCell', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:receipt');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockToast.mockReset();
  });

  it('prints the filled eBarimt receipt of the clicked row', async () => {
    const receiptWindow = openReceiptWindow({} as Window);

    renderCell(putResponse({}));
    fireEvent.click(screen.getByText('print'));

    expect(receiptWindow).toHaveBeenCalledWith(
      'blob:receipt',
      '_blank',
      'width=800, height=800',
    );
    const html = await printedReceiptHtml();
    expect(html).toContain('ДДТД: 112502020902001012345678901234567');
    expect(html).toContain('Огноо: 2026-11-11 10:14:09');
    expect(html).toContain('Сугалаа: QW 87654321');
    expect(html).toContain('Prius 30 тосны шүүр');
    expect(html).toContain('45,000.00');
    expect(html).not.toContain('undefined');
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('asks to allow pop-ups when the browser blocks the receipt window', () => {
    openReceiptWindow(null);

    renderCell(putResponse({}));
    fireEvent.click(screen.getByText('print'));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'allow-popups-to-print',
        variant: 'destructive',
      }),
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:receipt');
  });

  it('does not print a returned receipt', () => {
    const receiptWindow = openReceiptWindow(null);

    renderCell(putResponse({ state: 'inactive' }));
    const button = screen
      .getByText('print')
      .closest('button') as HTMLButtonElement;
    fireEvent.click(button);

    expect(button.disabled).toBe(true);
    expect(receiptWindow).not.toHaveBeenCalled();
  });

  it('does not print a failed send that never got a bill id', () => {
    const receiptWindow = openReceiptWindow(null);

    renderCell(
      putResponse({
        id: '',
        status: 'ERROR',
        message: 'Татвар төлөгчийн дугаар буруу байна',
      }),
    );

    expect(
      (screen.getByText('print').closest('button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(receiptWindow).not.toHaveBeenCalled();
  });
});
