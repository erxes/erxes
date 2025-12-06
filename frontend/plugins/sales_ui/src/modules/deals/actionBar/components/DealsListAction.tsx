import { Button, DropdownMenu, useConfirm } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconEye,
  IconPrinter,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react';
import { IDeal } from '@/deals/types/deals';
import {
  useDealsCopy,
  useDealsEdit,
  useDealsRemove,
  useDealsWatch,
} from '@/deals/cards/hooks/useDeals';

interface DealsListActionBarProps {
  deals: IDeal[];
  selectedCount: number;
}

export const DealsListActionBar = ({
  deals,
  selectedCount,
}: DealsListActionBarProps) => {
  const { confirm } = useConfirm();
  const { editDeals, loading: editLoading } = useDealsEdit();
  const { removeDeals, loading: removeLoading } = useDealsRemove();
  const { copyDeals, loading: copyLoading } = useDealsCopy();
  const { watchDeals, loading: watchLoading } = useDealsWatch();

  const isLoading = editLoading || removeLoading || copyLoading || watchLoading;

  const dealIds = deals.map((d) => d._id);

  const allArchived = deals.every((d) => d.status === 'archived');
  const allActive = deals.every((d) => d.status === 'active');
  const allWatched = deals.every((d) => d.isWatched === true);
  const allUnwatched = deals.every((d) => d.isWatched === false);

  const handleArchive = async () => {
    const newStatus = allArchived ? 'active' : 'archived';
    const action = allArchived ? 'unarchive' : 'archive';

    await confirm({
      message: `Are you sure you want to ${action} ${selectedCount} deal${
        selectedCount > 1 ? 's' : ''
      }?`,
    });

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
      message: `Are you sure you want to remove ${selectedCount} deal${
        selectedCount > 1 ? 's' : ''
      }? `,
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
    if (allArchived) return 'Unarchive';
    if (allActive) return 'Archive';
    return 'Archive (Mixed)';
  };

  const getWatchLabel = () => {
    if (allWatched) return 'Unwatch';
    if (allUnwatched) return 'Watch';
    return 'Watch (Mixed)';
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <IconEdit />
          Edit
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-48 min-w-fit!">
        <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
          <IconCopy />
          Copy {`(${selectedCount})`}
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
          <IconEye />
          {getWatchLabel()} {`(${selectedCount})`}
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handlePrint} disabled={isLoading}>
          <IconPrinter />
          Print document
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handleArchive} disabled={isLoading}>
          <IconArchive />
          {getArchiveLabel()} {`(${selectedCount})`}
        </DropdownMenu.Item>

        <DropdownMenu.Item
          onClick={handleRemove}
          disabled={isLoading}
          className="text-red-700 focus:text-red-700"
        >
          <IconTrash className="text-red-700" />
          Remove {`(${selectedCount})`}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
