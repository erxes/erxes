import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { useAutomationAiAgentMoreColumn } from '@/automations/components/settings/components/agents/hooks/useAutomationAiAgentMoreColumn';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

export type TAiAgentRecord = ReturnType<
  typeof useAiAgents
>['automationsAiAgents'][number];

export const AutomationAiAgentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<TAiAgentRecord, unknown>;
}) => {
  const { _id, name } = cell.row.original;
  const { t } = useTranslation('automations');
  const { editHref, removing, requestDelete } = useAutomationAiAgentMoreColumn(
    _id,
    name,
  );

  return (
    <Popover>
      <Can actions={['automationsAiAgentEdit', 'automationsAiAgentRemove']}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="h-full w-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Can action="automationsAiAgentEdit">
              <Command.Item value="edit" asChild>
                <Link to={editHref}>
                  <IconEdit /> {t('edit')}
                </Link>
              </Command.Item>
            </Can>
            <Can action="automationsAiAgentRemove">
              <Command.Item
                value="delete"
                onSelect={requestDelete}
                disabled={removing}
                className="text-destructive"
              >
                <IconTrash /> {t('delete')}
              </Command.Item>
            </Can>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const automationAiAgentMoreColumn = {
  id: 'more',
  cell: AutomationAiAgentMoreColumnCell,
  size: 33,
};
