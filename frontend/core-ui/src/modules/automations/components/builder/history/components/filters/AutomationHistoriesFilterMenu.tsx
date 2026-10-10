import {
  IconAlertTriangle,
  IconCalendar,
  IconClockPause,
  IconProgressCheck,
  IconTargetArrow,
} from '@tabler/icons-react';
import { Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationHistoriesFilterMenu = () => {
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
          <Command.Group heading={t('history-group-run')}>
            <Filter.Item value="status">
              <IconProgressCheck />
              {t('status')}
            </Filter.Item>
            <Filter.Item value="createdAt">
              <IconCalendar />
              {t('stats-filter-by-created')}
            </Filter.Item>
          </Command.Group>
          <Command.Group heading={t('history-group-where-it-stopped')}>
            <Filter.Item value="failedActionId">
              <IconTargetArrow />
              {t('history-failed-at-action')}
            </Filter.Item>
            <Filter.Item value="errorCode">
              <IconAlertTriangle />
              {t('history-error-code')}
            </Filter.Item>
            <Filter.Item value="waitingActionId">
              <IconClockPause />
              {t('history-waiting-at-action')}
            </Filter.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </Filter.View>
  );
};
