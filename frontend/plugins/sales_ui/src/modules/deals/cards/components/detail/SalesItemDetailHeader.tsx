'use client';

import { useEffect, useState } from 'react';
import { useSetAtom } from 'jotai';
import {
  Button,
  DropdownMenu,
  Input,
  Sheet,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconLayoutSidebarLeftCollapse,
  IconPrinter,
  IconTrash,
} from '@tabler/icons-react';

import { useDealsContext } from '@/deals/context/DealContext';
import {
  useDealsCopy,
  useDealsEdit,
  useDealsRemove,
  useDealsWatch,
} from '@/deals/cards/hooks/useDeals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import type { IDeal } from '@/deals/types/deals';

interface SalesItemDetailHeaderProps {
  deal: IDeal;
}

export const SalesItemDetailHeader = ({ deal }: SalesItemDetailHeaderProps) => {
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || 'Untitled deal');
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');

  const isArchived = deal?.status === 'archived';

  // Hooks
  const { copyDeal, loading: copyLoading } = useDealsCopy({
    onCompleted: (data) => {
      const copiedDeal = data?.dealsCopy;
      if (copiedDeal) {
        setActiveDealId(copiedDeal._id);
        setSalesItemId(copiedDeal._id);
        setName(copiedDeal.name || 'Untitled deal');
      }
    },
  });

  const { editDeals: editDealsDirect, loading: editLoading } = useDealsEdit();

  const { removeDeals, loading: removeLoading } = useDealsRemove({
    onCompleted: () => {
      closeDetail();
    },
  });

  const { watchDeal, loading: watchLoading } = useDealsWatch();

  const isLoading = copyLoading || watchLoading || editLoading || removeLoading;

  const { confirm } = useConfirm();

  // Sync name with deal prop changes
  useEffect(() => {
    setName(deal?.name || 'Untitled deal');
  }, [deal?._id, deal?.name]);

  // Handlers
  const closeDetail = () => {
    setActiveDealId(null);
    setSalesItemId(null);
  };

  const handleNameUpdate = () => {
    if (!deal?._id || !name.trim() || name === deal.name) return;

    editDeals({
      variables: {
        _id: deal._id,
        name: name.trim(),
      },
    });
  };

  const handleCopy = () => {
    if (!deal?._id) return;
    copyDeal(deal._id, deal.pipeline?._id);
  };

  const handleWatch = () => {
    if (!deal?._id) return;
    watchDeal({ dealId: deal._id });
  };

  const handleArchive = () => {
    if (!deal?._id) return;
    const nextStatus = isArchived ? 'active' : 'archived';
    editDealsDirect({
      variables: {
        _id: deal._id,
        status: nextStatus,
      },
    });
  };

  const handleRemove = () => {
    if (!deal?._id) return;
    confirm({ message: 'Are you sure you want to remove this deal?' }).then(
      () => {
        removeDeals({ variables: { _id: deal._id } });
      },
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon" onClick={closeDetail}>
        <IconLayoutSidebarLeftCollapse />
      </Button>

      <Sheet.Title className="shrink-0 w-4/5">
        <div className="flex items-center gap-2">
          <Input
            className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
            placeholder="Deal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameUpdate}
          />
          {isArchived && (
            <span className="px-2 py-0.5 text-xs rounded border bg-yellow-100 text-yellow-800 border-yellow-200">
              Archived
            </span>
          )}
        </div>
      </Sheet.Title>

      <div className="flex items-center w-full justify-end">
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <IconDotsVertical />
              Edit
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content className="w-48 min-w-48">
            <DropdownMenu.Item onClick={handleCopy} disabled={copyLoading}>
              <IconCopy />
              {copyLoading ? 'Copying...' : 'Copy'}
            </DropdownMenu.Item>

            {isArchived ? (
              <DropdownMenu.Item onClick={handleArchive} disabled={editLoading}>
                <IconArchive />
                {editLoading ? 'Sending...' : 'Send to board'}
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item onClick={handleWatch} disabled={watchLoading}>
                <IconEye />
                {watchLoading
                  ? 'Updating...'
                  : deal?.isWatched
                  ? 'Unwatch'
                  : 'Watch'}
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Item onClick={handlePrint}>
              <IconPrinter />
              Print document
            </DropdownMenu.Item>

            {isArchived ? (
              <DropdownMenu.Item
                onClick={handleRemove}
                disabled={removeLoading}
                className="text-red-600 focus:text-red-600"
              >
                <IconTrash />
                {removeLoading ? 'Removing...' : 'Remove'}
              </DropdownMenu.Item>
            ) : (
              <DropdownMenu.Item
                onClick={handleArchive}
                disabled={editLoading}
                className="text-red-600 focus:text-red-600"
              >
                <IconArchive />
                {editLoading ? 'Archiving...' : 'Archive'}
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>

      <Sheet.Close />
    </Sheet.Header>
  );
};
