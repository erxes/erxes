import {
  IconBolt,
  IconCalendar,
  IconPointerBolt,
  IconProgressCheck,
  IconSearch,
  IconTags,
  IconUser,
  IconUserUp,
} from '@tabler/icons-react';
import { Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationRecordTableFilterMenu = () => {
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
          <Filter.Item value="searchValue">
            <IconSearch />
            {t('search', 'Search')}
          </Filter.Item>
          <Filter.Item value="status">
            <IconProgressCheck />
            {t('status', 'Status')}
          </Filter.Item>
          <Filter.Item value="createdAt">
            <IconCalendar />
            {t('created-at', 'Created At')}
          </Filter.Item>
          <Filter.Item value="createdByIds">
            <IconUser />
            {t('created-by', 'Created By')}
          </Filter.Item>
          <Filter.Item value="updatedAt">
            <IconCalendar />
            {t('updated-at', 'Updated At')}
          </Filter.Item>
          <Filter.Item value="updatedByIds">
            <IconUserUp />
            {t('updated-by', 'Updated By')}
          </Filter.Item>
          <Filter.Item value="triggerTypes">
            <IconPointerBolt />
            {t('trigger-types', 'Trigger Types')}
          </Filter.Item>
          <Filter.Item value="actionTypes">
            <IconBolt />
            {t('action-types', 'Action Types')}
          </Filter.Item>
          <Filter.Item value="tagIds">
            <IconTags />
            {t('tags', 'Tags')}
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
