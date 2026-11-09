import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DealEbarimt } from '~/modules/ebarimt/deal-ebarimt/components/DealEbarimt';
import { MONGOLIAN_DEAL_PUT_RESPONSES } from '~/modules/ebarimt/deal-ebarimt/graphql/dealPutResponsesQuery';
import { MONGOLIAN_PUT_RESPONSE_TIMEZONE } from '~/modules/ebarimt/put-response/graphql/queries/PutResponseQueries';

const mockToast = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key}:${options.count}`,
  }),
}));
jest.mock('erxes-ui', () => ({
  REACT_APP_API_URL: 'https://erxes.test',
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
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
  Separator: () => <hr />,
  Spinner: () => <span>loading</span>,
  useToast: () => ({ toast: mockToast }),
}));
jest.mock('ui-modules', () => ({
  RelationWidgetEmptyState: ({ message }: { message: ReactNode }) => (
    <p>{message}</p>
  ),
  RelationWidgetList: ({
    label,
    actions,
    children,
  }: {
    label: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
  }) => (
    <section>
      <h2>{label}</h2>
      {actions}
      {children}
    </section>
  ),
}));

const DEAL_ID = 'deal-ulaanbaatar-42';

const timezoneMock: MockedResponse = {
  request: { query: MONGOLIAN_PUT_RESPONSE_TIMEZONE },
  result: { data: { timeZone: { value: 'Asia/Ulaanbaatar' } } },
};

const putResponse = (overrides: Record<string, unknown>) => ({
  _id: 'pr-1',
  id: '000000038230012345678901234567890',
  number: 'D-0042',
  date: '2026-11-03 10:32:06',
  createdAt: '2026-11-03T10:32:06.000Z',
  type: 'B2C_RECEIPT',
  state: null,
  status: 'SUCCESS',
  message: null,
  merchantTin: '37900846788',
  customerTin: null,
  customerName: null,
  consumerNo: null,
  lottery: 'AB 12345678',
  qrData: null,
  receipts: [
    {
      items: [
        {
          name: 'Ноолууран цамц',
          qty: 2,
          unitPrice: 55000,
          totalAmount: 110000,
        },
      ],
    },
  ],
  totalAmount: 110000,
  totalVAT: 10000,
  totalCityTax: 0,
  __typename: 'PutResponse',
  ...overrides,
});

const putResponsesMock = (
  list: ReturnType<typeof putResponse>[],
): MockedResponse => ({
  request: {
    query: MONGOLIAN_DEAL_PUT_RESPONSES,
    variables: { contentId: DEAL_ID, limit: 20 },
  },
  result: {
    data: {
      putResponses: {
        list,
        totalCount: list.length,
        __typename: 'PutResponseListResponse',
      },
    },
  },
});

const renderWidget = (mocks: MockedResponse[]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <DealEbarimt contentId={DEAL_ID} />
    </MockedProvider>,
  );

describe('DealEbarimt', () => {
  const originalOpen = window.open;

  afterEach(() => {
    window.open = originalOpen;
    mockToast.mockReset();
  });

  it('lists the deal receipts and prints only the active ones in Ulaanbaatar time', async () => {
    const write = jest.fn();
    window.open = jest.fn(() => ({ document: { write } } as unknown as Window));

    renderWidget([
      timezoneMock,
      putResponsesMock([
        putResponse({}),
        putResponse({
          _id: 'pr-0',
          id: '000000038230099999999999999999999',
          state: 'inactive',
        }),
      ]),
    ]);

    expect(
      await screen.findByText('000000038230012345678901234567890'),
    ).toBeTruthy();
    expect(screen.getByText('ebarimt-responses-count:2')).toBeTruthy();
    expect(screen.getByText('inactive')).toBeTruthy();
    expect(screen.getAllByText('110,000.00')).toHaveLength(2);

    fireEvent.click(screen.getByText('print-receipt'));

    expect(write).toHaveBeenCalledTimes(1);
    const html: string = write.mock.calls[0][0];
    expect(html).toContain('ДДТД: 000000038230012345678901234567890');
    expect(html).toContain('Огноо: 2026-11-03 18:32:06');
    expect(html).toContain('Сугалаа: AB 12345678');
    expect(html).toContain('Ноолууран цамц');
    expect(html).not.toContain('000000038230099999999999999999999');
    expect(html).not.toContain('undefined');
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('asks to allow pop-ups when the browser blocks the receipt window', async () => {
    window.open = jest.fn(() => null);

    renderWidget([timezoneMock, putResponsesMock([putResponse({})])]);

    fireEvent.click(await screen.findByLabelText('print-receipt'));

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'allow-popups-to-print',
        variant: 'destructive',
      }),
    );
  });

  it('shows the failed receipt message and keeps it out of the print', async () => {
    window.open = jest.fn();

    renderWidget([
      timezoneMock,
      putResponsesMock([
        putResponse({
          id: null,
          status: 'ERROR',
          message: 'Татвар төлөгчийн дугаар буруу байна',
        }),
      ]),
    ]);

    expect(
      await screen.findByText('Татвар төлөгчийн дугаар буруу байна'),
    ).toBeTruthy();
    expect(
      (screen.getByText('print-receipt').closest('button') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('tells the user the deal has no eBarimt yet', async () => {
    renderWidget([timezoneMock, putResponsesMock([])]);

    expect(await screen.findByText('no-deal-ebarimt')).toBeTruthy();
  });

  it('shows the server error when the user may not read put responses', async () => {
    renderWidget([
      timezoneMock,
      {
        request: {
          query: MONGOLIAN_DEAL_PUT_RESPONSES,
          variables: { contentId: DEAL_ID, limit: 20 },
        },
        result: { errors: [{ message: 'Permission required' }] },
      } as MockedResponse,
    ]);

    expect(await screen.findByText('Permission required')).toBeTruthy();
  });
});
