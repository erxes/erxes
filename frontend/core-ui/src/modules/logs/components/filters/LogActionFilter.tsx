import { LOGS_SOURCE_ACTIONS } from '@/logs/constants/logFilter';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, useMultiQueryState } from 'erxes-ui';

export const LogActionsFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{
    status: string;
    source: 'mongo' | 'graphql' | 'webhook' | 'auth';
    action: string;
    userIds: string[];
    createdAt: string;
    actionOperator: string;
  }>(['status', 'source', 'action', 'userIds', 'createdAt', 'actionOperator']);

  const { source, action } = queries;

  const actions = source ? LOGS_SOURCE_ACTIONS[source] : [];

  return (
    <Command shouldFilter={false} onSelect={(e) => e.currentTarget}>
      <Command.List className="p-1 ">
        <Combobox.Empty />
        {actions.map(({ value, label, icon: Icon }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer "
            onSelect={() =>
              setQueries({
                action: value === action ? null : value,
                actionOperator: null,
              })
            }
          >
            <Icon />
            {label}
            {action === value && <IconCheck className="ml-auto" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
