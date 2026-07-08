import { Button, DropdownMenu, useConfirm } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconEye,
  IconPrinter,
  IconTrash,
  IconEdit,
  IconDotsVertical,
} from '@tabler/icons-react';
import { IDeal } from '@/deals/types/deals';
import {
  useDealsCopy,
  useDealsEdit,
  useDealsRemove,
  useDealsWatch,
} from '@/deals/cards/hooks/useDeals';
import { useTranslation } from 'react-i18next';


export const DealsActions = ({
  deals,
  selectedCount,
}: {
  deals: IDeal[];
  selectedCount?: number;
}) => {
  const { confirm } = useConfirm();
  const { editDeals, loading: editLoading } = useDealsEdit();
  const { removeDeals, loading: removeLoading } = useDealsRemove();
  const { copyDeals, loading: copyLoading } = useDealsCopy();
  const { watchDeals, loading: watchLoading } = useDealsWatch();
  const { t } = useTranslation('sales');

  const count = selectedCount || deals.length;
  const isSingle = count === 1;

  const isLoading = editLoading || removeLoading || copyLoading || watchLoading;

  const dealIds = deals.map((d) => d._id);

  const allArchived = deals.every((d) => d.status === 'archived');
  const allActive = deals.every((d) => d.status === 'active');
  const allWatched = deals.every((d) => d.isWatched === true);
  const allUnwatched = deals.every((d) => d.isWatched === false);
  const showRemove = deals.every((d) => d.status === 'archived');

  const handleArchive = async () => {
    const newStatus = allArchived ? 'active' : 'archived';
    const actionLabel = allArchived ? t('unarchive') : t('archive');

    if (!isSingle) {
      await confirm({
        message: t('archive-deals-confirm', { count, action: actionLabel }),
      });
    }

    await Promise.all(
      dealIds.map((id) =>
        editDeals({
          variables: { _id: id, status: newStatus },
        }),
      ),
    );
  };

  const handleRemove = async () => {
    await confirm({
      message: t('remove-deals-confirm', { count }),
    });

    await Promise.all(
      dealIds.map((id) => removeDeals({ variables: { _id: id } })),
    );
  };

  const handleCopy = async () => {
    await Promise.all(
      dealIds.map((id) => copyDeals({ variables: { _id: id } })),
    );
  };

  const handleWatch = async () => {
    const shouldWatch = !allWatched;

    await Promise.all(
      dealIds.map((id) =>
        watchDeals({
          variables: { _id: id, isAdd: shouldWatch },
        }),
      ),
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const getArchiveLabel = () => {
    if (allArchived) return t('unarchive');
    if (allActive) return t('archive');
    return isSingle ? t('archive') : t('archive-mixed');
  };

  const getWatchLabel = () => {
    if (allWatched) return t('unwatch');
    if (allUnwatched) return t('watch');
    return t('watch-mixed');
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          {isSingle ? <IconDotsVertical /> : <IconEdit />}
          {t('edit')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-48 min-w-fit!">
        <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
          <IconCopy />
          {t('copy')} {isSingle ? '' : `(${count})`}
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
          <IconEye />
          {getWatchLabel()} {isSingle ? '' : `(${count})`}
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handlePrint} disabled={isLoading}>
          <IconPrinter />
          {t('print-document')}
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handleArchive} disabled={isLoading}>
          <IconArchive />
          {getArchiveLabel()} {isSingle ? '' : `(${count})`}
        </DropdownMenu.Item>

        {showRemove && (
          <DropdownMenu.Item
            onClick={handleRemove}
            disabled={isLoading}
            className="text-red-700 focus:text-red-700"
          >
            <IconTrash className="text-red-700" />
            {t('remove')} {isSingle ? '' : `(${count})`}
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
