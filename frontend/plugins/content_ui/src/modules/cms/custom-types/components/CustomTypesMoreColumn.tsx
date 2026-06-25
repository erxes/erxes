import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  Button,
  Popover,
  Combobox,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useRemoveCustomType } from '../hooks/useRemoveCustomType';
import { ICustomPostType } from '../types/customTypeTypes';

interface CustomTypeMoreColumnCellProps {
  cell: CellContext<ICustomPostType, unknown>;
  onEdit?: (customType: ICustomPostType) => void;
  onRefetch?: () => void;
}

export const CustomTypeMoreColumnCell = ({
  cell,
  onEdit,
  onRefetch,
}: CustomTypeMoreColumnCellProps) => {
  const { t } = useTranslation('content');
  const { _id } = cell.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeType, loading } = useRemoveCustomType(onRefetch);

  const handleEdit = () => {
    const customType = cell.row.original;
    if (onEdit) {
      onEdit(customType);
    }
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-this-custom-type'),
    }).then(() => {
      removeType(_id)
        .then(() => {
          toast({
            title: t('success'),
            variant: 'success',
            description: t('custom-type-deleted-successfully'),
          });
        })
        .catch((error: unknown) => {
          toast({
            title: t('error'),
            description:
              error instanceof Error
                ? error.message
                : t('failed-to-delete-custom-types'),
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
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={handleEdit}
              >
                <IconEdit className="size-4" />
                {t('edit')}
              </Button>
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive h-8"
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

export const customTypeMoreColumn = (
  onEdit?: (customType: ICustomPostType) => void,
  onRefetch?: () => void,
): ColumnDef<ICustomPostType> => ({
  id: 'more',
  cell: (cell: CellContext<ICustomPostType, unknown>) => (
    <CustomTypeMoreColumnCell
      cell={cell}
      onEdit={onEdit}
      onRefetch={onRefetch}
    />
  ),
  size: 33,
});
