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
import { useTranslation } from 'react-i18next';
import { useRemoveSegments } from '../hooks/useRemoveSegments';

export const SegmentMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ISegment, unknown>;
}) => {
  const { t } = useTranslation('segment');
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
        title: t('error'),
        description: t('segment-id-missing'),
        variant: 'destructive',
      });
      return;
    }

    let description = t('delete-undone');

    try {
      const [usage] = await readUsage([_id]);
      const automations = usage?.automations || [];

      if (automations.length) {
        const named = automations
          .map((automation) => automation.name || automation._id)
          .join(', ');

        description = t('delete-in-use', {
          total: automations.length,
          names: named,
        });
      }
    } catch (e) {
      description = t('delete-usage-unknown');
    }

    confirm({
      message: t('delete-confirm', { name }),
      options: {
        description,
        confirmationValue: 'delete',
        okLabel: t('delete'),
      },
    }).then(async () => {
      try {
        await removeSegments([_id]);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('segment-deleted'),
        });
      } catch (e: any) {
        toast({
          title: t('error'),
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
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
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
