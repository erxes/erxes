import { IconCalendar, IconProgressCheck } from '@tabler/icons-react';
import { Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationHistoriesFilterMenu = () => {
  const { t } = useTranslation('automations');
  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder="Filter"
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1">
          <Filter.Item value="status">
            <IconProgressCheck />
            {t('status')}
          </Filter.Item>
          <Filter.Item value="createdAt">
            <IconCalendar />
            {t('filter-by-created', 'Filter by created')}
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
