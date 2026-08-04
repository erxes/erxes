import {
  IconCheck,
  IconProgressCheck,
  IconProgressX,
} from '@tabler/icons-react';
import { Command, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationStatusFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{
    status?: string;
  }>(['status']);

  const { status } = queries;
  const { t } = useTranslation('automations');

  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item
          value="draft"
          className="cursor-pointer text-sm"
          onSelect={() => setQueries({ status: 'draft' })}
        >
          <IconProgressX className="text-muted-foreground" />
          {t('draft')}
          {status === 'draft' && <IconCheck className="ml-auto" />}
        </Command.Item>
        <Command.Item
          value="active"
          className="cursor-pointer text-sm"
          onSelect={() => setQueries({ status: 'active' })}
        >
          <IconProgressCheck className="text-success" />
          {t('active')}
          {status === 'active' && <IconCheck className="ml-auto" />}
        </Command.Item>
      </Command.List>
    </Command>
  );
};
