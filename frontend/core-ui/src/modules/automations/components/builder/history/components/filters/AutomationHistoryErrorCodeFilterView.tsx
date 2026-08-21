import {
  AUTOMATION_ERROR_CODES,
  useAutomationHistoryFilterOptions,
} from '@/automations/components/builder/history/hooks/useAutomationHistoryFilterOptions';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';

export const AutomationHistoryErrorCodeFilterView = ({
  inDialog,
}: {
  inDialog?: boolean;
}) => {
  const { queries, setQueries } = useAutomationHistoryFilterOptions();

  return (
    <Filter.View filterKey="errorCode" inDialog={inDialog}>
      <Command>
        <Filter.CommandInput placeholder="Search error" variant="secondary" />
        <Command.List className="p-1">
          <Combobox.Empty />
          {AUTOMATION_ERROR_CODES.map((code) => (
            <Command.Item
              key={code}
              value={code}
              className="cursor-pointer font-mono text-xs"
              onSelect={() =>
                setQueries({
                  errorCode: queries.errorCode === code ? undefined : code,
                })
              }
            >
              {code}
              {queries.errorCode === code && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};
