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
          placeholder={t('stats-filter-placeholder')}
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1">
          <Filter.Item value="searchValue">
            <IconSearch />
            {t('search-filter')}
          </Filter.Item>
          <Filter.Item value="status">
            <IconProgressCheck />
            {t('status-filter')}
          </Filter.Item>
          <Filter.Item value="createdAt">
            <IconCalendar />
            {t('created-at-filter')}
          </Filter.Item>
          <Filter.Item value="createdByIds">
            <IconUser />
            {t('filter-created-by')}
          </Filter.Item>
          <Filter.Item value="updatedAt">
            <IconCalendar />
            {t('updated-at-filter')}
          </Filter.Item>
          <Filter.Item value="updatedByIds">
            <IconUserUp />
            {t('filter-updated-by')}
          </Filter.Item>
          <Filter.Item value="triggerTypes">
            <IconPointerBolt />
            {t('trigger-types-filter')}
          </Filter.Item>
          <Filter.Item value="actionTypes">
            <IconBolt />
            {t('filter-action-types')}
          </Filter.Item>
          <Filter.Item value="tagIds">
            <IconTags />
            {t('tags')}
          </Filter.Item>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
