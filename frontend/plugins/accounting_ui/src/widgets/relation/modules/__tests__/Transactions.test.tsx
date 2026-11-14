import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  RELATED_TRANSACTIONS_QUERY,
  Transactions,
} from '~/widgets/relation/modules/Transactions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) =>
      options?.count === undefined ? key : `${key}:${options.count}`,
  }),
}));
jest.mock('erxes-ui', () => {
  const Passthrough = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    CurrencyCode: { MNT: 'MNT' },
    CurrencyFormatedDisplay: ({
      currencyValue,
    }: {
      currencyValue: { amountMicros: number };
    }) => <span>{currencyValue.amountMicros}</span>,
    FocusSheet: {
      SideContentHeader: ({ label }: { label: string }) => <h2>{label}</h2>,
    },
    ScrollArea: Passthrough,
    Separator: () => <hr />,
    Spinner: () => <span>loading</span>,
  };
});

const DEAL_ID = 'deal-ub-42';

const transactionsMock = (list: Record<string, unknown>[]): MockedResponse => ({
  request: {
    query: RELATED_TRANSACTIONS_QUERY,
    variables: { contentType: 'sales:deal', contentId: DEAL_ID },
  },
  result: {
    data: { accTransactionsByContent: { totalCount: list.length, list } },
  },
});

const renderWidget = (mocks: MockedResponse[]) =>
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Transactions contentType="sales:deal" contentId={DEAL_ID} />
    </MockedProvider>,
  );

describe('Transactions relation widget on a deal', () => {
  it('lists the vouchers the deal synced to accounting and links each to its parent', async () => {
    renderWidget([
      transactionsMock([
        {
          _id: 'tr-sale',
          parentId: 'parent-deal-42',
          number: 'DEAL-42',
          ptrNumber: 'PTR-0007',
          journal: 'sale',
          status: 'real',
          sumDt: 0,
          sumCt: 330000,
          details: [
            { account: { code: '510101', name: 'Борлуулалтын орлого' } },
          ],
        },
        {
          _id: 'tr-cash',
          parentId: 'parent-deal-42',
          number: 'DEAL-42',
          ptrNumber: 'PTR-0007',
          journal: 'cash',
          status: 'real',
          sumDt: 330000,
          sumCt: 0,
          details: [{ account: { code: '110101', name: 'Касс' } }],
        },
      ]),
    ]);

    expect(await screen.findByText('transactions-count:2')).toBeTruthy();
    expect(screen.getByText('510101 - Борлуулалтын орлого')).toBeTruthy();
    expect(screen.getByText('110101 - Касс')).toBeTruthy();
    expect(
      screen.getAllByRole('link').map((link) => link.getAttribute('href')),
    ).toEqual([
      '/accounting/transaction/edit?parentId=parent-deal-42',
      '/accounting/transaction/edit?parentId=parent-deal-42',
    ]);
  });

  it('says there are no transactions when the deal was never synced', async () => {
    renderWidget([transactionsMock([])]);

    expect(await screen.findByText('no-transactions')).toBeTruthy();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
