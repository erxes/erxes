import { ICovers } from '@/pos/pos-covers/types/posCover';
import { POS_COVER_CONTENT_TYPE } from '@/pos/constants/posPanel';
import { ApolloError } from '@apollo/client';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';
import { useRemovePosCover } from '../hooks/usePosCoverRemove';

export const useCoverMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICovers, unknown>;
}) => {
  const { openRecord, record, close } = useSidePanel();
  const { _id } = cell.row.original;
  const { t } = useTranslation('sales');
  const { removePosCover } = useRemovePosCover();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const setOpen = (coverId: string) => {
    if (!coverId) {
      return;
    }
    openRecord({ contentType: POS_COVER_CONTENT_TYPE, contentId: coverId });
  };

  const handleDelete = () => {
    if (!_id) return;

    confirm({
      message: t('delete-pos-cover-single-confirm'),
    }).then(() => {
      removePosCover([_id], {
        onCompleted: () => {
          toast({
            title: t('success'),
            description: t('pos-cover-deleted', { count: 1 }),
          });
          if (record?.contentId === _id) {
            close();
          }
        },
        onError: (e: ApolloError) => {
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
            <Command.Item
              value="edit"
              onSelect={() => setOpen(_id)}
              disabled={!_id}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              value="delete"
              onSelect={handleDelete}
              disabled={!_id}
            >
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const coverMoreColumn = {
  id: 'more',
  cell: useCoverMoreColumnCell,
  size: 33,
};
