import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { IconEdit } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { Link } from 'react-router';

export type TAiAgentRecord = ReturnType<
  typeof useAiAgents
>['automationsAiAgents'][number];

export const AutomationAiAgentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TAiAgentRecord, unknown>;
}) => {
  const { _id } = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" asChild>
              <Link to={`/settings/automations/agents/${_id}`}>
                <IconEdit /> Edit
              </Link>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const automationAiAgentMoreColumn = {
  id: 'more',
  cell: AutomationAiAgentMoreColumnCell,
  size: 25,
};
