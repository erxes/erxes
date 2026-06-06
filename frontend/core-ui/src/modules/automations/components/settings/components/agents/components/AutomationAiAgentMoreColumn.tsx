import {
  AUTOMATIONS_AI_AGENT_REMOVE,
  AUTOMATIONS_AI_AGENT_TOTAL_COUNTS,
  AUTOMATIONS_AI_AGENTS,
} from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { ApolloError, useMutation } from '@apollo/client';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
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
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('automations');
  const [removeAiAgent, { loading }] = useMutation(AUTOMATIONS_AI_AGENT_REMOVE);
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = () => {
    confirm({
      message: t('ai-agent-delete-confirm-message', { name }),
      options: confirmOptions,
    }).then(() => {
      removeAiAgent({
        variables: { id: _id },
        refetchQueries: [
          AUTOMATIONS_AI_AGENTS,
          AUTOMATIONS_AI_AGENT_TOTAL_COUNTS,
        ],
        onError: (e: ApolloError) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('ai-agent-delete-success'),
            variant: 'success',
          });
        },
      });
    });
  };

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
                <Link to={`/settings/automations/agents/${_id}`}>
                  <IconEdit /> {t('edit')}
                </Link>
              </Command.Item>
            </Can>
            <Can action="automationsAiAgentRemove">
              <Command.Item
                value="delete"
                onSelect={handleDelete}
                disabled={loading}
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
  size: 25,
};
