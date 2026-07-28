import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { ITour } from '../types/tour';
import { useRemoveTours } from '../hooks/useRemoveTours';

interface TourMoreCellProps extends CellContext<ITour, unknown> {
  onEdit?: (tourId: string) => void;
  onDuplicate?: (tourId: string, dateType?: 'fixed' | 'flexible') => void;
}

export const TourMoreColumn = ({
  onEdit,
  onDuplicate,
  ...props
}: TourMoreCellProps) => {
  const { t } = useTranslation('tourism');
  const tour = props.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeTours } = useRemoveTours();

  const handleDuplicate = () => {
    onDuplicate?.(tour._id, tour.dateType);
  };

  const handleEdit = () => {
    onEdit?.(tour._id);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-tour'),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeTours({
        variables: { ids: [tour._id] },
        onCompleted: () => {
          toast({
            title: t('success'),
            variant: 'success',
            description: t('tour-deleted-successfully'),
          });
        },
        onError: (e) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit className="w-4 h-4" />
              {t('edit')}
            </Command.Item>
            <Command.Item value="duplicate" onSelect={handleDuplicate}>
              <IconCopy className="w-4 h-4" />
              {t('duplicate')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash className="w-4 h-4" />
              {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const tourMoreColumn = (
  onEdit?: (tourId: string) => void,
  onDuplicate?: (tourId: string, dateType?: 'fixed' | 'flexible') => void,
): ColumnDef<ITour> => ({
  id: 'more',
  cell: (props) => (
    <TourMoreColumn {...props} onEdit={onEdit} onDuplicate={onDuplicate} />
  ),
  size: 33,
});
