import { Cell } from '@tanstack/react-table';
import { RecordTable, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoyaltyMoreActions } from '~/modules/loyalties/components/LoyaltyMoreActions';
import { useDeleteAgent } from '../hooks/useDeleteAgent';
import { IAgent } from '../types/agent';
import { AgentEditSheet } from './AgentEditSheet';

export const AgentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAgent, unknown>;
}) => {
  const agent = cell.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { deleteAgent, loading } = useDeleteAgent();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');
  const confirmationValue = 'delete';
  const handleDelete = () => {
    if (!agent._id) return;

    confirm({
      options: { confirmationValue },
      message: t('delete-agent-confirm', { count: 1 }),
    }).then(() => {
      deleteAgent(agent._id).catch(() => {
        toast({
          title: t('error'),
          description: t('failed-to-delete-agent'),
          variant: 'destructive',
        });
      });
    });
  };

  return (
    <LoyaltyMoreActions
      editLabel={t('edit')}
      deleteLabel={t('delete')}
      deleteLoading={loading}
      onEdit={() => setEditOpen(true)}
      onDelete={handleDelete}
    >
      {editOpen && (
        <AgentEditSheet
          agent={agent}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </LoyaltyMoreActions>
  );
};

export const agentMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: AgentMoreColumnCell,
  size: 33,
};
