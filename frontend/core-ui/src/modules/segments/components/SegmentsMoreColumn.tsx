import { Cell } from '@tanstack/react-table';
import {
  RecordTable,
  useQueryState,
  Popover,
  Command,
  Combobox,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Can, ISegment } from 'ui-modules';
import { useRemoveSegments } from '../hooks/useRemoveSegments';
import { useTranslation } from 'react-i18next';

export const SegmentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<{ order: string; hasChildren: boolean } & ISegment, unknown>;
}) => {
  const { t } = useTranslation('segment');
  const { _id, name } = cell.row.original;
  const [, setSegmentId] = useQueryState<string>('segmentId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeSegments } = useRemoveSegments();

  const handleEdit = () => {
    setSegmentId(_id);
  };
  const handleDelete = () => {
    if (!_id) {
      toast({
        title: t('error', 'Error'),
        description: t('segment-id-missing', 'Segment ID is missing'),
        variant: 'destructive',
      });
      return;
    }

    confirm({
      message: `Are you sure you want to delete "${name}"?`,
    }).then(async () => {
      try {
        await removeSegments([_id]);
        toast({
          title: t('success', 'Success'),
          variant: 'success',
          description: t('segment-deleted', 'Segment deleted successfully'),
        });
      } catch (e: any) {
        toast({
          title: t('error', 'Error'),
          description: e.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover>
      <Can action="segmentsManage">
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
      </Can>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit /> {t('edit', 'Edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete', 'Delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const segmentMoreColumn = {
  id: 'more',
  cell: SegmentMoreColumnCell,
  size: 5,
};
