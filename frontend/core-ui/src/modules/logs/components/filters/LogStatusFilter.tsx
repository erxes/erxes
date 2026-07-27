import {
  IconCheck,
  IconProgressCheck,
  IconProgressX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Command, Combobox, useMultiQueryState } from 'erxes-ui';

export const LogStatusFilter = () => {
  const { t } = useTranslation('common');
  const [queries, setQueries] = useMultiQueryState<{
    status: string;
    statusOperator: string;
  }>(['status', 'statusOperator']);
  const { status } = queries;

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1">
        <Combobox.Empty />
        {[
          {
            value: 'success',
            className:
              'bg-success/10 data-[selected=true]:bg-success/20 text-success border-success/10',
            icon: IconProgressCheck,
            label: t('logs.status-success', 'Success'),
          },
          {
            value: 'failed',
            className:
              'mt-2 bg-destructive/10 data-[selected=true]:bg-destructive/20 text-destructive border-destructive/10',
            icon: IconProgressX,
            label: t('logs.status-failed', 'Failed'),
          },
        ].map(({ value, className, icon: Icon, label }) => (
          <Command.Item
            key={value}
            value={value}
            className={className}
            onSelect={() =>
              setQueries({
                status: value === status ? null : value,
                statusOperator: null,
              })
            }
          >
            <Icon />
            {label}
            {status === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
