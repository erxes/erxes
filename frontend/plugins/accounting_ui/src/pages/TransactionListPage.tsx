import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionTable } from '@/transactions/components/TransactionTable';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { useTransactionsFilterVariables } from '@/transactions/hooks/useTransactionVars';
import { IconHelpCircle, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Kbd,
  PageSubHeader,
  Separator,
  ScrollArea,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, Export, Import } from 'ui-modules';
import { TrsTotalCount } from '~/modules/transactions/components/TrsTotalCount';
import { ORIGIN_TR_JOURNALS } from '~/modules/transactions/types/constants';
import { TR_JOURNAL_LABELS } from '../modules/transactions/types/constants';

export const TransactionListPage = () => {
  const { t } = useTranslation('accounting');
  const filterVariables = useTransactionsFilterVariables();

  const renderAdditionHelper = () => {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <h4 className="text-sm font-semibold">{t('symbol-legend')}</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-mono font-semibold text-primary">**</p>
              <p className="text-sm mt-1">
                {t('complete-once-for-each-business-transaction')}
              </p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs font-mono font-semibold text-primary">*</p>
              <p className="text-sm mt-1">
                {t(
                  'complete-only-one-row-for-a-voucher-with-multiple-entries-a-blank-value-indicates-a-continuation-of-the-preceding-voucher-row',
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            {t('available-journal-values')}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ORIGIN_TR_JOURNALS.map((j) => (
              <div
                key={j}
                className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
              >
                <span className="text-sm">{t(TR_JOURNAL_LABELS[j] || '')}</span>
                <span className="text-xs font-mono rounded bg-muted px-2 py-0.5 text-muted-foreground">
                  {j}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            {t('additional-information-fields-by-journal')}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">
                {t('foreign-currency-transaction')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('exchange-rate-difference-account')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">{t('internal-transfer')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('transfer-account')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF2
                  </span>
                  <span>{t('transfer-branch')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF3
                  </span>
                  <span>{t('transfer-department')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">{t('sales')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('finished-goods-account')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF2
                  </span>
                  <span>{t('cost-of-goods-sold-account')}</span>
                </li>
              </ul>
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-medium">{t('sales-return-label-2')}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF1
                  </span>
                  <span>{t('return-voucher-number')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF2
                  </span>
                  <span>{t('finished-goods-account')}</span>
                </li>
                <li>
                  <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
                    CF3
                  </span>
                  <span>{t('cost-of-goods-sold-account')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AccountingLayout>
      <AccountingHeader>
        <div className="px-3">
          <AddTransaction>
            <Button>
              <IconPlus />
              {t('add-transaction-label')}
              <Kbd>C</Kbd>
            </Button>
          </AddTransaction>
        </div>
      </AccountingHeader>
      <PageSubHeader>
        <TransactionsFilter afterBar={<TrsTotalCount />} />
        <Can action="transactionsExportManage">
          <Export
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            getFilters={() => filterVariables}
          />
        </Can>
        <Can action="transactionsImportManage">
          <Import
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            title={t('import-transactions')}
          >
            <Dialog>
              <Dialog.Trigger asChild>
                <Button
                  variant="secondary"
                  className="mt-1 w-full justify-start gap-2 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                >
                  <IconHelpCircle className="size-4" />
                  {t('view-import-guide')}
                </Button>
              </Dialog.Trigger>
              <Dialog.ContentCombined
                title={t('import-transactions')}
                description={t('import-guide-and-field-descriptions')}
                className="w-[min(1100px,90vw)] max-w-[min(1100px,90vw)] sm:max-w-[min(1100px,90vw)] h-[85vh] overflow-hidden grid-rows-[auto_1fr]"
              >
                <ScrollArea className="h-full mx-6 px-6 pb-2">
                  <div className="pt-2 text-sm leading-relaxed">
                    {renderAdditionHelper()}
                  </div>
                </ScrollArea>
              </Dialog.ContentCombined>
            </Dialog>
          </Import>
        </Can>
      </PageSubHeader>
      <TransactionTable />
    </AccountingLayout>
  );
};
