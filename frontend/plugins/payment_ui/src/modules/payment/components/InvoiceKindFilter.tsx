import { IconCheck, IconChevronLeft } from '@tabler/icons-react';
import { Command, useFilterContext, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PAYMENT_KINDS } from '~/modules/payment/constants';

export const InvoiceKindFilter = () => {
  const { t } = useTranslation('payment');
  const [queries, setQueries] = useMultiQueryState<{ kind?: string }>(['kind']);
  const { kind } = queries;
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
        {Object.entries(PAYMENT_KINDS).map(([value, config]) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer text-sm"
            onSelect={() => setQueries({ kind: value })}
          >
            {config.name}
            {kind === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
