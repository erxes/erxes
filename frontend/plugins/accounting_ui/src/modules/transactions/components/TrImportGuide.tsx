import { IconHelpCircle } from '@tabler/icons-react';
import { Button, Dialog, ScrollArea, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ORIGIN_TR_JOURNALS,
  TR_JOURNAL_LABELS,
} from '@/transactions/types/constants';

const SYMBOL_LEGEND = [
  { symbol: '**', description: 'complete-once-for-each-business-transaction' },
  {
    symbol: '*',
    description:
      'complete-only-one-row-for-a-voucher-with-multiple-entries-a-blank-value-indicates-a-continuation-of-the-preceding-voucher-row',
  },
];

const JOURNAL_FIELDS = [
  {
    title: 'foreign-currency-transaction',
    fields: ['exchange-rate-difference-account'],
  },
  {
    title: 'internal-transfer',
    fields: ['transfer-account', 'transfer-branch', 'transfer-department'],
  },
  {
    title: 'sales',
    fields: ['finished-goods-account', 'cost-of-goods-sold-account'],
  },
  {
    title: 'sales-return-label-2',
    fields: [
      'return-voucher-number',
      'finished-goods-account',
      'cost-of-goods-sold-account',
    ],
  },
];

const TrImportGuideSymbols = () => {
  const { t } = useTranslation('accounting');

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {SYMBOL_LEGEND.map(({ symbol, description }) => (
        <div key={symbol} className="rounded-md border bg-background p-3">
          <p className="text-xs font-mono font-semibold text-primary">
            {symbol}
          </p>
          <p className="text-sm mt-1">{t(description)}</p>
        </div>
      ))}
    </div>
  );
};

const TrImportGuideJournals = () => {
  const { t } = useTranslation('accounting');

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {ORIGIN_TR_JOURNALS.map((journal) => (
        <div
          key={journal}
          className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
        >
          <span className="text-sm">{t(TR_JOURNAL_LABELS[journal] || '')}</span>
          <span className="text-xs font-mono rounded bg-muted px-2 py-0.5 text-muted-foreground">
            {journal}
          </span>
        </div>
      ))}
    </div>
  );
};

const TrImportGuideFields = ({
  title,
  fields,
}: {
  title: string;
  fields: string[];
}) => {
  const { t } = useTranslation('accounting');

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <p className="text-sm font-medium">{t(title)}</p>
      <ul className="text-sm text-muted-foreground space-y-1">
        {fields.map((field, index) => (
          <li key={field}>
            <span className="font-mono text-xs rounded bg-muted px-1.5 py-0.5 mr-2">
              {`CF${index + 1}`}
            </span>
            <span>{t(field)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TrImportGuideContent = () => {
  const { t } = useTranslation('accounting');

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <h4 className="text-sm font-semibold">{t('symbol-legend')}</h4>
        <TrImportGuideSymbols />
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">
          {t('available-journal-values')}
        </h4>
        <TrImportGuideJournals />
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">
          {t('additional-information-fields-by-journal')}
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {JOURNAL_FIELDS.map(({ title, fields }) => (
            <TrImportGuideFields key={title} title={title} fields={fields} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const TrImportGuideDialog = () => {
  const { t } = useTranslation('accounting');

  return (
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
            <TrImportGuideContent />
          </div>
        </ScrollArea>
      </Dialog.ContentCombined>
    </Dialog>
  );
};
