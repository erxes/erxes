import { gql, useQuery } from '@apollo/client';
import { IconReceipt } from '@tabler/icons-react';
import {
  CurrencyCode,
  CurrencyFormatedDisplay,
  FocusSheet,
  ScrollArea,
  Separator,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const RELATED_TRANSACTIONS_QUERY = gql`
  query RelatedTransactions($contentType: String!, $contentId: String!) {
    accTransactionsByContent(
      contentType: $contentType
      contentId: $contentId
      page: 1
      perPage: 20
    ) {
      totalCount
      list {
        _id
        parentId
        number
        ptrNumber
        journal
        status
        sumDt
        sumCt
        details {
          account {
            code
            name
          }
        }
      }
    }
  }
`;

type TransactionAccount = {
  code?: string;
  name?: string;
};

type RelatedTransaction = {
  _id: string;
  parentId?: string;
  number?: string;
  ptrNumber?: string;
  journal?: string;
  status?: string;
  sumDt?: number;
  sumCt?: number;
  details?: {
    account?: TransactionAccount;
  }[];
};

const transactionLink = (transaction: RelatedTransaction) =>
  `/accounting/transaction/edit?parentId=${encodeURIComponent(
    transaction.parentId || transaction._id,
  )}`;

const getAccounts = (transaction: RelatedTransaction) => {
  const accountKeys = new Set<string>();

  return (transaction.details || [])
    .map((detail) => detail.account)
    .filter((account): account is TransactionAccount => !!account)
    .map((account) => [account.code, account.name].filter(Boolean).join(' - '))
    .filter((account) => {
      if (!account || accountKeys.has(account)) {
        return false;
      }
      accountKeys.add(account);
      return true;
    });
};

export const Transactions = ({
  contentId,
  contentType,
}: {
  contentId: string;
  contentType: string;
}) => {
  const { t } = useTranslation('accounting');
  const { data, loading } = useQuery<{
    accTransactionsByContent: {
      list: RelatedTransaction[];
      totalCount: number;
    };
  }>(RELATED_TRANSACTIONS_QUERY, {
    variables: {
      contentType,
      contentId,
    },
    fetchPolicy: 'network-only',
    skip: !contentId || !contentType,
  });

  const transactionsByContent = data?.accTransactionsByContent;
  const transactions = transactionsByContent?.list || [];
  const totalCount = transactionsByContent?.totalCount || 0;

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconReceipt />
        </div>
        <span className="text-sm">
          {totalCount
            ? t('transaction-linked', { count: totalCount })
            : t('no-transactions')}
        </span>
      </div>
    );
  }

  return (
    <>
      <FocusSheet.SideContentHeader
        Icon={IconReceipt}
        label={t('transactions-count', { count: totalCount })}
      />
      <ScrollArea className="flex-auto">
        <div className="flex flex-col gap-3 p-4">
          {transactions.map((transaction) => (
            <a
              key={transaction._id}
              href={transactionLink(transaction)}
              target="_blank"
              rel="noreferrer"
              className="block rounded border bg-background p-3 hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {transaction.ptrNumber ||
                      transaction.number ||
                      t('transaction')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[transaction.journal, transaction.status]
                      .filter(Boolean)
                      .join(' | ')}
                  </div>
                </div>
                <IconReceipt className="size-4 flex-none text-primary" />
              </div>
              {!!getAccounts(transaction).length && (
                <div className="mt-2 space-y-1">
                  {getAccounts(transaction).map((account) => (
                    <div
                      key={account}
                      className="truncate text-xs text-muted-foreground"
                    >
                      {account}
                    </div>
                  ))}
                </div>
              )}
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">{t('debit')}</span>
                  <div className="font-medium">
                    <CurrencyFormatedDisplay
                      currencyValue={{
                        currencyCode: CurrencyCode.MNT,
                        amountMicros: transaction.sumDt || 0,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('credit')}</span>
                  <div className="font-medium">
                    <CurrencyFormatedDisplay
                      currencyValue={{
                        currencyCode: CurrencyCode.MNT,
                        amountMicros: transaction.sumCt || 0,
                      }}
                    />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
