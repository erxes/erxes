import { Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { TicketReportFilterState } from '@/report/hooks/useTicketReportFilters';
import {
  IconCalendar,
  IconUser,
  IconUsers,
  IconTag,
  IconFileText,
  IconArrowsExchange,
  IconProgressCheck,
  IconArchive,
  IconFlag,
  IconBuilding,
  IconChartBar,
  IconColumns,
  IconHierarchy,
} from '@tabler/icons-react';

export const TicketReportFilterMenu = ({
  dateFilters,
  hasFilters,
  onClear,
}: {
  dateFilters: TicketReportFilterState['dateFilters'];
  hasFilters: boolean;
  onClear: () => void;
}) => {
  const { t } = useTranslation('frontline');
  return (
    <Command>
      <Filter.CommandInput
        placeholder={t('filter', 'Filter')}
        variant="secondary"
        className="bg-background"
      />
      <Command.List className="p-1">
        <Filter.Item value="channel" keywords={[t('channel-label', 'Channel')]}>
          <IconUsers />
          {t('channel-label', 'Channel')}
        </Filter.Item>
        <Filter.Item
          value="member"
          keywords={[t('assigned-user', 'Assigned User')]}
        >
          <IconUser />
          {t('assigned-user', 'Assigned User')}
        </Filter.Item>
        <Filter.Item value="pipeline" keywords={[t('pipelines', 'Pipelines')]}>
          <IconHierarchy />
          {t('pipelines', 'Pipelines')}
        </Filter.Item>
        <Filter.Item value="ticketStatus" keywords={[t('status', 'Status')]}>
          <IconProgressCheck />
          {t('status', 'Status')}
        </Filter.Item>
        <Filter.Item value="state" keywords={[t('state-label', 'State')]}>
          <IconArchive />
          {t('state-label', 'State')}
        </Filter.Item>
        <Filter.Item
          value="priority"
          keywords={[t('priority-label', 'Priority')]}
        >
          <IconFlag />
          {t('priority-label', 'Priority')}
        </Filter.Item>
        <Filter.Item value="tag" keywords={[t('tags-label', 'Tags')]}>
          <IconTag />
          {t('tags-label', 'Tags')}
        </Filter.Item>
        <Filter.Item
          value="customer"
          keywords={[t('customer-label', 'Customer')]}
        >
          <IconUser />
          {t('customer-label', 'Customer')}
        </Filter.Item>
        <Filter.Item value="company" keywords={[t('company-label', 'Company')]}>
          <IconBuilding />
          {t('company-label', 'Company')}
        </Filter.Item>
        <Filter.Item
          value="properties"
          keywords={[t('properties-label', 'Properties')]}
        >
          <IconColumns />
          {t('properties-label', 'Properties')}
        </Filter.Item>
        <Filter.Item value="group" keywords={[t('group-by-label', 'Group by')]}>
          <IconColumns />
          {t('group-by-label', 'Group by')}
        </Filter.Item>
        <Filter.Item
          value="frequency"
          keywords={[t('frequency-label', 'Frequency')]}
        >
          <IconChartBar />
          {t('frequency-label', 'Frequency')}
        </Filter.Item>
        {dateFilters.map(({ key, label }) => (
          <Filter.Item key={key} value={key} keywords={[label]}>
            <IconCalendar />
            {label}
          </Filter.Item>
        ))}
        <Filter.Item
          value="description"
          keywords={[t('description', 'Description')]}
          inDialog
        >
          <IconFileText />
          {t('description', 'Description')}
        </Filter.Item>
        <Filter.Item
          value="statusChangedByIds"
          keywords={[t('stage-moved-user', 'Stage moved user')]}
        >
          <IconArrowsExchange />
          {t('stage-moved-user', 'Stage moved user')}
        </Filter.Item>
        <Filter.Item
          value="updatedByIds"
          keywords={[t('modified-by', 'Modified by')]}
        >
          <IconUser />
          {t('modified-by', 'Modified by')}
        </Filter.Item>
        {hasFilters && (
          <>
            <Command.Separator />
            <Command.Item
              value="clear"
              onSelect={onClear}
              className="text-destructive"
            >
              {t('clear-all', 'Clear all')}
            </Command.Item>
          </>
        )}
      </Command.List>
    </Command>
  );
};
