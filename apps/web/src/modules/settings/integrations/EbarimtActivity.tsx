import { EbarimtReceiptStatus } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconReceiptTax } from '@tabler/icons-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Button, Empty, Spinner, ToggleGroup } from 'erxes-ui';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { forwardPaging } from '~/lib/cursorList';
import { ReceiptRow } from '../payments/EbarimtReceipts';

const NoReceipts = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.ebarimt' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconReceiptTax />
        </Empty.Media>
        <Empty.Title>{t('no-receipts', 'No receipts here')}</Empty.Title>
        <Empty.Description>
          {t('no-receipts-description', 'Receipts appear as the plugins’ invoices are paid.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

/** Every receipt eBarimt sent, newest first, by state; a failed one can go again. */
export const EbarimtActivity = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments.ebarimt' });

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(EbarimtReceiptStatus.options),
  );

  const receipts = useInfiniteQuery(
    orpc.ebarimt.receipts.infiniteOptions({
      input: (page) => ({ ...page, ...(status && { status }) }),
      ...forwardPaging(30),
    }),
  );

  return (
    <div className="space-y-3">
      <div className="flex">
        <ToggleGroup
          variant="outline"
          size="sm"
          aria-label={t('filter', 'Receipts by state')}
          value={[status ?? 'all']}
          onValueChange={([next]) =>
            void setStatus(EbarimtReceiptStatus.options.find((item) => item === next) ?? null)
          }
        >
          <ToggleGroup.Item value="all">{t('all', 'All')}</ToggleGroup.Item>
          {EbarimtReceiptStatus.options.map((item) => (
            <ToggleGroup.Item key={item} value={item}>
              {t(`status.${item}`, item)}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      </div>
      <QueryState
        query={receipts}
        isEmpty={({ pages }) => !pages[0]?.data.length}
        empty={<NoReceipts />}
      >
        {({ pages }) => (
          <ul className="divide-y rounded-lg border text-sm">
            {pages
              .flatMap((page) => page.data)
              .map((receipt) => (
                <ReceiptRow key={receipt.id} receipt={receipt} withInvoice />
              ))}
          </ul>
        )}
      </QueryState>
      {receipts.hasNextPage && (
        <Button
          variant="secondary"
          className="w-full"
          disabled={receipts.isFetchingNextPage}
          onClick={() => void receipts.fetchNextPage()}
        >
          {receipts.isFetchingNextPage ? <Spinner size="sm" /> : t('more', 'Show more')}
        </Button>
      )}
    </div>
  );
};
