import { useTranslation } from 'react-i18next';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import {
  RecordTable,
  Combobox,
  Popover,
  Command,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { IElement } from '../types/element';
import { useRemoveElements } from '../hooks/useRemoveElements';
import { useTourismPanel } from '@/tms/side-panel/useTourismPanel';
import { TMS_ELEMENT_CONTENT_TYPE } from '@/tms/side-panel/tourismPanelTypes';
import { ElementDuplicate } from './ElementDuplicate';

interface ElementMoreCellProps extends CellContext<IElement, unknown> {
  branchId?: string;
}

export const ElementMoreColumn = ({
  branchId,
  ...props
}: ElementMoreCellProps) => {
  const { t } = useTranslation('tourism');
  const element = props.row.original;
  const { openDetail } = useTourismPanel(TMS_ELEMENT_CONTENT_TYPE);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeElements } = useRemoveElements();

  const handleEdit = () => {
    openDetail(element._id);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-element'),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeElements([element._id])
        .then(() => {
          toast({
            title: t('success'),
            variant: 'success',
            description: t('element-deleted-successfully'),
          });
        })
        .catch((e: unknown) => {
          toast({
            title: t('error'),
            description: e instanceof Error ? e.message : '',
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
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
              <IconEdit className="w-4 h-4" />
              {t('edit')}
            </Command.Item>
            <ElementDuplicate element={element} branchId={branchId}>
              {({ onClick, disabled }) => (
                <Command.Item
                  value="duplicate"
                  onSelect={onClick}
                  disabled={disabled}
                >
                  <IconCopy className="w-4 h-4" />
                  {t('duplicate')}
                </Command.Item>
              )}
            </ElementDuplicate>
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

export const elementMoreColumn = (branchId?: string): ColumnDef<IElement> => ({
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: (props) => <ElementMoreColumn {...props} branchId={branchId} />,
  size: 33,
});
