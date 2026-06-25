import { Cell } from '@tanstack/react-table';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
  useQueryState,
} from 'erxes-ui';
import { IconEdit, IconTrash, IconTicket } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useDeleteAssignment } from '../hooks/useDeleteAssignment';
import { IAssignment } from '../types/assignmentTypes';

export const AssignmentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IAssignment, unknown>;
}) => {
  const { t } = useTranslation('loyalty');
  const { _id } = cell.row.original;
  const [, setEditAssignmentId] = useQueryState('editAssignmentId');
  const { removeAssignment, loading } = useDeleteAssignment();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEdit = (assignmentId: string) => {
    setEditAssignmentId(assignmentId);
  };

  const handleSeeAssignments = () => {
    navigate(`/loyalty/assignments?assignmentCampaignId=${_id}`);
  };
  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: t('delete-assignment-confirm', { count: 1 }),
    }).then(() => {
      removeAssignment({
        variables: { _ids: [_id] },
      })
        .then(() => {
          toast({
            title: t('assignments-deleted', { count: 1 }),
            variant: 'success',
          });
        })
        .catch((e: ApolloError) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        align="start"
        className="w-[280px] min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item value="edit" onSelect={() => handleEdit(_id)}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="see-assignments" onSelect={handleSeeAssignments}>
              <IconTicket /> {t('see-assignments')}
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={handleDelete}
                disabled={loading}
              >
                <IconTrash className="size-4" />
                {t('delete')}
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const assignmentMoreColumn = {
  id: 'more',
  cell: AssignmentMoreColumnCell,
  size: 25,
};
