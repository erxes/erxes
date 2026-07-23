import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  Skeleton,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import {
  IconActivity,
  IconCalendarEvent,
  IconCheck,
  IconNote,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const DEAL_ACTIVITY_FILTER_ID = 'deal-activity-filter';
export const DEAL_ACTIVITY_NOTE_TYPE = 'internalNote';
export const DEAL_ACTIVITY_ACTIVITY_TYPE = 'activity';

type DealActivityQueries = {
  activityType: string;
  activityDate: string;
};

export const DEAL_ACTIVITY_FILTER_KEYS: (keyof DealActivityQueries)[] = [
  'activityType',
  'activityDate',
];

const DealActivityFilterPopover = () => {
  const { t } = useTranslation('sales');
  const [queries] = useMultiQueryState<DealActivityQueries>(
    DEAL_ACTIVITY_FILTER_KEYS,
  );
  const [activityType, setActivityType] = useQueryState<string>('activityType');

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );
  const notesActive = activityType === DEAL_ACTIVITY_NOTE_TYPE;
  const activityActive = activityType === DEAL_ACTIVITY_ACTIVITY_TYPE;

  return (
    <Filter.Popover scope={DEAL_ACTIVITY_FILTER_ID}>
      <Filter.Trigger isFiltered={hasFilters} />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder={t('filter', { defaultValue: 'Filter' })}
              variant="secondary"
              className="bg-background"
            />
            <Command.List className="p-1">
              <Filter.CommandItem
                value="activity"
                onSelect={() =>
                  setActivityType(
                    activityActive ? null : DEAL_ACTIVITY_ACTIVITY_TYPE,
                  )
                }
              >
                <IconActivity />
                {t('activity', { defaultValue: 'Activity' })}
                {activityActive && (
                  <IconCheck className="ml-auto size-4 text-primary" />
                )}
              </Filter.CommandItem>
              <Filter.CommandItem
                value="notes"
                onSelect={() =>
                  setActivityType(notesActive ? null : DEAL_ACTIVITY_NOTE_TYPE)
                }
              >
                <IconNote />
                {t('notes', { defaultValue: 'Notes' })}
                {notesActive && (
                  <IconCheck className="ml-auto size-4 text-primary" />
                )}
              </Filter.CommandItem>
              <Filter.Item value="activityDate">
                <IconCalendarEvent />
                {t('date', { defaultValue: 'Date' })}
              </Filter.Item>
            </Command.List>
          </Command>
        </Filter.View>
        <Filter.View filterKey="activityDate">
          <Filter.DateView
            filterKey="activityDate"
            label={t('date', { defaultValue: 'Date' })}
          />
        </Filter.View>
      </Combobox.Content>
    </Filter.Popover>
  );
};

const DealActivityFilterDialog = () => {
  const { t } = useTranslation('sales');

  return (
    <Filter.Dialog>
      <Filter.View filterKey="activityDate" inDialog>
        <Filter.DialogDateView
          filterKey="activityDate"
          label={t('date', { defaultValue: 'Date' })}
        />
      </Filter.View>
    </Filter.Dialog>
  );
};

const DealActivityRecordCount = ({
  recordCount,
}: {
  recordCount?: number | null;
}) => {
  const { t } = useTranslation('sales');

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(recordCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', {
          count: recordCount,
          defaultValue: '{{count}} records found',
        })
      )}
    </div>
  );
};

export const DealActivityFilter = ({
  recordCount,
}: {
  recordCount?: number | null;
}) => {
  const { t } = useTranslation('sales');
  const [queries] = useMultiQueryState<DealActivityQueries>(
    DEAL_ACTIVITY_FILTER_KEYS,
  );
  const { activityType, activityDate } = queries || {};

  return (
    <Filter id={DEAL_ACTIVITY_FILTER_ID}>
      <Filter.Bar>
        {activityType === DEAL_ACTIVITY_ACTIVITY_TYPE && (
          <Filter.BarItem queryKey="activityType">
            <Filter.BarName>
              <IconActivity />
              {t('activity', { defaultValue: 'Activity' })}
            </Filter.BarName>
          </Filter.BarItem>
        )}
        {activityType === DEAL_ACTIVITY_NOTE_TYPE && (
          <Filter.BarItem queryKey="activityType">
            <Filter.BarName>
              <IconNote />
              {t('notes', { defaultValue: 'Notes' })}
            </Filter.BarName>
          </Filter.BarItem>
        )}
        {activityDate && (
          <Filter.BarItem queryKey="activityDate">
            <Filter.BarName>
              <IconCalendarEvent />
              {t('date', { defaultValue: 'Date' })}
            </Filter.BarName>
            <Filter.Date
              filterKey="activityDate"
              label={t('date', { defaultValue: 'Date' })}
            />
          </Filter.BarItem>
        )}
        <DealActivityFilterPopover />
        <DealActivityRecordCount recordCount={recordCount} />
      </Filter.Bar>
      <DealActivityFilterDialog />
    </Filter>
  );
};
