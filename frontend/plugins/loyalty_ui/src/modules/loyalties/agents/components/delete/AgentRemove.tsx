import { Row } from '@tanstack/table-core';
import { Button, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useDeleteAgent } from '../../hooks/useDeleteAgent';
import { IAgent } from '../../types/agent';
import { IconTrash } from '@tabler/icons-react';

interface AgentRemoveProps {
  agentIds: string[];
  rows: Row<IAgent>[];
}

export const AgentRemove = ({ agentIds, rows }: AgentRemoveProps) => {
  const { deleteAgent, loading } = useDeleteAgent();
  const { confirm } = useConfirm();
  const { t } = useTranslation('loyalty');

  const handleDelete = () => {
    confirm({
      message: t('delete-agent-confirm', { count: rows.length }),
      options: {
        confirmationValue: 'delete',
      },
    }).then(async () => {
      for (const id of agentIds) {
        await deleteAgent(id);
      }
    });
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <IconTrash className="h-4 w-4" />
      {t('delete')}
    </Button>
  );
};
