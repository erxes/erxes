import {
  IconCheck,
  IconProgressCheck,
  IconProgressX,
} from '@tabler/icons-react';
import { Command, useMultiQueryState } from 'erxes-ui';

export const AutomationStatusFilter = () => {
  const [queries, setQueries] = useMultiQueryState<{
    status?: string;
  }>(['status']);

  const { status } = queries;

  return (
    <Command shouldFilter={false}>
      <Command.List>
        <Command.Item
          value="draft"
          className="cursor-pointer text-sm"
          onSelect={() => setQueries({ status: 'draft' })}
        >
          <IconProgressX className="text-muted-foreground" />
          Draft
          {status === 'draft' && <IconCheck className="ml-auto" />}
        </Command.Item>
        <Command.Item
          value="active"
          className="cursor-pointer text-sm"
          onSelect={() => setQueries({ status: 'active' })}
        >
          <IconProgressCheck className="text-success" />
          Active
          {status === 'active' && <IconCheck className="ml-auto" />}
        </Command.Item>
      </Command.List>
    </Command>
  );
};
