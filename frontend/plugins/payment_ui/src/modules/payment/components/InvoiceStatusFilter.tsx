import { IconCheck, IconChevronLeft } from '@tabler/icons-react';
import { Command, useFilterContext, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const STATUS_OPTIONS = [
  { value: 'paid', label: 'paid' },
  { value: 'pending', label: 'pending' },
  { value: 'refunded', label: 'refunded' },
  { value: 'failed', label: 'failed' },
  { value: 'cancelled', label: 'cancelled' },
  { value: 'rejected', label: 'rejected' },
];

export const InvoiceStatusFilter = () => {
  const { t } = useTranslation('payment');
  const [queries, setQueries] = useMultiQueryState<{ status?: string }>([
    'status',
  ]);
  const { status } = queries;
  const { setView } = useFilterContext();

  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item
          value="back"
          className="cursor-pointer text-sm text-muted-foreground"
          onSelect={() => setView('root')}
        >
          <IconChevronLeft className="w-3 h-3" />
          {t('back')}
        </Command.Item>
        <Command.Separator />
        {STATUS_OPTIONS.map((opt) => (
          <Command.Item
            key={opt.value}
            value={opt.value}
            className="cursor-pointer text-sm"
            onSelect={() => setQueries({ status: opt.value })}
          >
            {t(opt.label)}
            {status === opt.value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
