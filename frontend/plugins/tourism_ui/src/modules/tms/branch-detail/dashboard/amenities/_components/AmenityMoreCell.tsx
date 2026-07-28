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
import { IAmenity } from '../types/amenity';
import { useRemoveAmenities } from '../hooks/useRemoveAmenities';
import { AmenityEditSheet } from './AmenityEditSheet';
import { AmenityDuplicate } from './AmenityDuplicate';

interface AmenityMoreCellProps extends CellContext<IAmenity, unknown> {
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
}

export const AmenityMoreColumn = ({
  branchId,
  branchLanguages,
  mainLanguage,
  ...props
}: AmenityMoreCellProps) => {
  const { t } = useTranslation('tourism');
  const amenity = props.row.original;
  const [editOpen, setEditOpen] = useState(false);
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const removeAmenities = useRemoveAmenities();

  const handleEdit = () => {
    setEditOpen(true);
  };

  const handleDelete = () => {
    confirm({
      message: t('confirm-delete-amenity'),
      options: { confirmationValue: 'delete' },
    })
      .then(() => {
        removeAmenities({ variables: { ids: [amenity._id] } })
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('amenity-deleted-successfully'),
            });
          })
          .catch((e: any) => {
            toast({
              title: t('error'),
              description: e.message,
              variant: 'destructive',
            });
          });
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        }
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
                {t('edit')}
              </Command.Item>
              <AmenityDuplicate amenity={amenity} branchId={branchId}>
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
              </AmenityDuplicate>
              <Command.Item value="delete" onSelect={handleDelete}>
                <IconTrash className="w-4 h-4" />
                {t('delete')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      <AmenityEditSheet
        amenity={amenity}
        open={editOpen}
        onOpenChange={setEditOpen}
        showTrigger={false}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
      />
    </>
  );
};

export const amenityMoreColumn = (
  branchId?: string,
  branchLanguages?: string[],
  mainLanguage?: string,
): ColumnDef<IAmenity> => ({
  id: 'more',
  cell: (props) => (
    <AmenityMoreColumn
      {...props}
      branchId={branchId}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
    />
  ),
  size: 33,
});
