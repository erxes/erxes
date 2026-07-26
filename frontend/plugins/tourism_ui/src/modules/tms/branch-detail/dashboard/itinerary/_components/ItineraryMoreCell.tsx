import { useState } from 'react';
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
import { IItinerary } from '../types/itinerary';
import { useRemoveItineraries } from '../hooks/useRemoveItineraries';
import { ItineraryDuplicateSheet } from './ItineraryDuplicateSheet';

interface ItineraryMoreCellProps extends CellContext<IItinerary, unknown> {
  onEditClick?: (itineraryId: string, branchId?: string) => void;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const ItineraryMoreColumn = ({
  onEditClick,
  branchId,
  branchLanguages,
  mainLanguage,
  ...props
}: ItineraryMoreCellProps) => {
  const { t } = useTranslation('tourism');
  const itinerary = props.row.original;
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeItineraries } = useRemoveItineraries();
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const handleDuplicate = () => {
    setDuplicateOpen(true);
  };

  const handleEdit = () => {
    onEditClick?.(itinerary._id, itinerary.branchId);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-itinerary', 'Are you sure you want to delete this itinerary?'),
      options: { confirmationValue: 'delete' },
    }).then(() => {
      removeItineraries([itinerary._id])
        .then(() => {
          toast({
            title: t('success', 'Success'),
            variant: 'success',
            description: t('itinerary-deleted-successfully', 'Itinerary deleted successfully'),
          });
        })
        .catch((e: any) => {
          toast({
            title: t('error', 'Error'),
            description: e.message,
            variant: 'destructive',
          });
        });
    });
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content>
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item value="edit" onSelect={handleEdit}>
                <IconEdit className="w-4 h-4" />
                {t('edit', 'Edit')}
              </Command.Item>
              <Command.Item value="duplicate" onSelect={handleDuplicate}>
                <IconCopy className="w-4 h-4" />
                {t('duplicate', 'Duplicate')}
              </Command.Item>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash className="w-4 h-4" />
                {t('delete', 'Delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <ItineraryDuplicateSheet
        itinerary={itinerary}
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
    </>
  );
};

export const itineraryMoreColumn = (
  onEditClick?: (itineraryId: string, branchId?: string) => void,
  branchId?: string,
  branchLanguages?: string[],
  mainLanguage?: string,
): ColumnDef<IItinerary> => ({
  id: 'more',
  cell: (props) => (
    <ItineraryMoreColumn
      {...props}
      onEditClick={onEditClick}
      branchId={branchId}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
    />
  ),
  size: 33,
});
