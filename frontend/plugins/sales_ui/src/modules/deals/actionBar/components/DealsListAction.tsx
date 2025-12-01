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

export const DealsListActionBar = ({ deal }: { deal: IDeal }) => {
  const { confirm } = useConfirm();
  const { editDeals, loading: editLoading } = useDealsEdit();
  const { removeDeals, loading: removeLoading } = useDealsRemove();
  const { copyDeals, loading: copyLoading } = useDealsCopy();
  const { watchDeals, loading: watchLoading } = useDealsWatch();
  const isArchived = deal?.status === 'archived';
  const isLoading = editLoading || removeLoading || copyLoading || watchLoading;
  const isWatched = deal?.isWatched === true;

  const handleArchive = async () => {
    try {
      await editDeals({
        variables: {
          _id: deal._id,
          status: isArchived ? 'active' : 'archived',
        },
      });
    } catch (error) {
      console.error('Failed to archive/unarchive deal:', error);
    }
  };

  const handleRemove = async () => {
    confirm({ message: 'Are you sure you want to remove this deal?' }).then(
      async () => {
        try {
          await removeDeals({ variables: { _id: deal._id } });
        } catch (error) {
          console.error('Failed to remove deal:', error);
        }
      },
    );
  };
  const handleCopy = async () => {
    try {
      await copyDeals({ variables: { _id: deal._id } });
    } catch (error) {
      console.error('Failed to copy deal:', error);
    }
  };

  const handleWatch = async () => {
    try {
      await watchDeals({
        variables: {
          _id: deal._id,
          isAdd: !deal.isWatched,
        },
      });
    } catch (error) {
      console.error('Failed to watch/unwatch deal:', error);
    }
  };

  const handlePrint = () => window.print();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <Button variant="outline" className="flex items-center gap-2">
          <IconEdit />
          Edit
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-48 min-w-fit!">
        <DropdownMenu.Item onClick={handleCopy} disabled={isLoading}>
          <IconCopy />
          Copy
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleWatch} disabled={isLoading}>
          <IconEye />
          {isWatched ? 'Unwatch' : 'Watch'}
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handlePrint}>
          <IconPrinter />
          Print document
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleArchive} disabled={isLoading}>
          <IconArchive />
          {isArchived ? 'Unarchive' : 'Archive'}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={handleRemove}
          disabled={isLoading}
          className="text-red-700"
        >
          <IconTrash className="text-red-700" />
          Remove
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
