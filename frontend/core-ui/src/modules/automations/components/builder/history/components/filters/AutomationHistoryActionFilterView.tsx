import { useAutomationHistoryFilterOptions } from '@/automations/components/builder/history/hooks/useAutomationHistoryFilterOptions';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationHistoryActionFilterView = ({
  filterKey,
  inDialog,
}: {
  filterKey: 'failedActionId' | 'waitingActionId';
  inDialog?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const { queries, setQueries, actionOptions } =
    useAutomationHistoryFilterOptions();
  const selectedId = queries[filterKey];

  return (
    <Filter.View filterKey={filterKey} inDialog={inDialog}>
      <Command>
        <Filter.CommandInput
          placeholder={t('history-search-action')}
          variant="secondary"
        />
        <Command.List className="p-1">
          <Combobox.Empty />
          {actionOptions.map(({ id, label }) => (
            <Command.Item
              key={id}
              value={`${label} ${id}`}
              className="cursor-pointer"
              onSelect={() =>
                setQueries({
                  [filterKey]: selectedId === id ? undefined : id,
                })
              }
            >
              <span className="truncate">{label}</span>
              {selectedId === id && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};
