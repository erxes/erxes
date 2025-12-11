'use client';
import { Button, DropdownMenu, Input, Sheet, useConfirm } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconLayoutSidebarLeftCollapse,
  IconPrinter,
  IconArrowBackUp,
  IconTrash,
  IconLoader2,
} from '@tabler/icons-react';
import {
  useDealsCopy,
  useDealsEdit,
  useDealsRemove,
  useDealsWatch,
} from '@/deals/cards/hooks/useDeals';

import { IDeal } from '@/deals/types/deals';
import { useDealsContext } from '@/deals/context/DealContext';
import { useState } from 'react';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || 'Untitled deal');

  const isArchived = deal?.status === 'archived';

  const { confirm } = useConfirm();
  const { editDeals: editDealsDirect, loading: editLoading } = useDealsEdit();
  const { removeDeals, loading: removeLoading } = useDealsRemove();
  const { copyDeals, loading: copyLoading } = useDealsCopy();
  const { watchDeals, loading: watchLoading } = useDealsWatch();

  const handleName = () => {
    if (!deal || !name.trim()) return;

    if (name === deal.name) return;

    editDeals({
      variables: {
        _id: deal._id,
        name,
      },
    });
  };
  const handleArchive = async () => {
    if (!deal?._id) return;
    const paramStatus = isArchived ? 'active' : 'archived';

    try {
      await editDealsDirect({
        variables: {
          _id: deal._id,
          status: paramStatus,
        },
      });
    } catch (error) {
      console.error('Failed to archive/unarchive deal:', error);
    }
  };

  const handleRemove = async () => {
    if (!deal?._id) return;

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
    if (!deal?._id) return;

    try {
      await copyDeals({ variables: { _id: deal._id } });
    } catch (error) {
      console.error('Failed to copy deal:', error);
    }
  };

  const handleWatch = async () => {
    if (!deal?._id) return;

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

  const handlePrint = () => {
    window.print();
  };

  const isLoading = editLoading || removeLoading || copyLoading || watchLoading;

  return (
    <Sheet.Header className="border-b p-3 flex flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon">
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Sheet.Title className="flex-1 min-w-0">
        <Input
          className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
          placeholder="Deal Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={handleName}
          disabled={isLoading}
        />
      </Sheet.Title>
      <div className="flex items-center gap-2 shrink-0">
        {deal?.status === 'archived' && (
          <span className="text-sm py-1 px-2 bg-yellow-100 text-yellow-800 border-t border-b border-yellow-200 rounded-sm whitespace-nowrap">
            Archived
          </span>
        )}
        <DropdownMenu>
          <DropdownMenu.Trigger disabled={isLoading}>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                <IconDotsVertical />
              )}
              Edit
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="w-48 min-w-fit">
            <DropdownMenu.Item onClick={handleCopy} disabled={copyLoading}>
              {copyLoading ? (
                <IconLoader2 className="animate-spin" />
              ) : (
                <IconCopy />
              )}
              Copy
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={handlePrint}>
              <IconPrinter />
              Print document
            </DropdownMenu.Item>

            {/* Show Watch option only for active deals */}
            {isArchived ? (
              <DropdownMenu.Item onClick={handleArchive} disabled={editLoading}>
                {editLoading ? (
                  <IconLoader2 className="animate-spin" />
                ) : (
                  <IconArrowBackUp />
                )}
                Send to board
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item onClick={handleWatch} disabled={watchLoading}>
                {watchLoading ? (
                  <IconLoader2 className="animate-spin" />
                ) : (
                  <IconEye />
                )}
                {deal.isWatched ? 'Unwatch' : 'Watch'}
              </DropdownMenu.Item>
            )}

            {/* Show Send to board (unarchive) for archived deals */}
            {isArchived ? (
              <DropdownMenu.Item
                onClick={handleRemove}
                className="text-destructive"
                disabled={removeLoading}
              >
                {removeLoading ? (
                  <IconLoader2 className="animate-spin" />
                ) : (
                  <IconTrash />
                )}
                Remove
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item onClick={handleArchive} disabled={editLoading}>
                {editLoading ? (
                  <IconLoader2 className="animate-spin" />
                ) : (
                  <IconArchive />
                )}
                Archive
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
