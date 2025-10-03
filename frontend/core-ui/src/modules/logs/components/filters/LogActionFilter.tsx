import { LOGS_SOURCE_ACTIONS } from '@/logs/constants/logFilter';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, useMultiQueryState, useQueryState } from 'erxes-ui';

export const LogActionsFilter = () => {
  const [action, setStatus] = useQueryState<string>('action');
  const [queries] = useMultiQueryState<{
    status: string[];
    source: 'mongo' | 'graphql' | 'webhook' | 'auth';
    action: string;
    userIds: string[];
    createdAt: string;
  }>(['status', 'source', 'action', 'userIds', 'createdAt']);

  const { source } = queries;

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
            onSelect={() => setStatus(value === action ? '' : value)}
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
