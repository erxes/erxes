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

export const SegmentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ISegment, unknown>;
}) => {
  const { _id, name } = cell.row.original;
  const [, setSegmentId] = useQueryState<string>('segmentId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeSegments, readUsage } = useRemoveSegments();

  const handleEdit = () => {
    setSegmentId(_id);
  };

  const handleDelete = async () => {
    if (!_id) {
      toast({
        title: 'Error',
        description: 'Segment ID is missing',
        variant: 'destructive',
      });
      return;
    }

    let description = 'This cannot be undone.';

    try {
      const [usage] = await readUsage([_id]);
      const automations = usage?.automations || [];

      if (automations.length) {
        const named = automations
          .map((automation) => automation.name || automation._id)
          .join(', ');

        description =
          `${automations.length} automation(s) use this segment: ${named}. ` +
          'They will stop enrolling anyone. This cannot be undone.';
      }
    } catch (e) {
      description =
        'What uses this segment could not be checked. This cannot be undone.';
    }

    confirm({
      message: `Delete "${name}"?`,
      options: { description, confirmationValue: 'delete', okLabel: 'Delete' },
    }).then(async () => {
      try {
        await removeSegments([_id]);
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Segment deleted successfully',
        });
      } catch (e: any) {
        toast({
          title: 'Error',
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
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
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
  size: 33,
};
