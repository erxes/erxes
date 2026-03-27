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
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ApolloError } from '@apollo/client';
import { useLoyaltyScoreEdit } from '../hooks/useLoyaltyScoreEdit';
import { LOYALTY_SCORE_ROW_REMOVE } from '../graphql/mutations/loyaltyScoreRowsRemove';
import { useMutation } from '@apollo/client';
import { IScore } from '../types/loyaltyScoreTypes';

export const ScoreMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IScore, unknown>;
}) => {
  const { _id } = cell.row.original;
  const [, setEditScoreId] = useQueryState('editScoreId');
  const { loading } = useLoyaltyScoreEdit();
  const [deleteScore] = useMutation(LOYALTY_SCORE_ROW_REMOVE, {
    refetchQueries: ['GetScoreCampaigns'],
  });
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const handleEdit = (scoreId: string) => {
    setEditScoreId(scoreId);
  };
  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: 'Are you sure you want to delete this score campaign?',
    }).then(() => {
      deleteScore({
        variables: { _ids: [_id] },
      })
        .then(() => {
          toast({
            title: '1 score campaign deleted successfully',
            variant: 'success',
          });
        })
        .catch((e: ApolloError) => {
          toast({
            title: 'Error',
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
              <IconEdit /> Edit
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
                Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const scoreMoreColumn = {
  id: 'more',
  cell: ScoreMoreColumnCell,
  size: 20,
};
