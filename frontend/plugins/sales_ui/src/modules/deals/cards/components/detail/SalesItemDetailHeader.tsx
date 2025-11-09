import { Button, DropdownMenu, Input, Sheet } from 'erxes-ui';
import {
  IconArchive,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconLayoutSidebarLeftCollapse,
  IconPrinter,
} from '@tabler/icons-react';

import { IDeal } from '@/deals/types/deals';
import { useDealsContext } from '@/deals/context/DealContext';
import { useEffect, useState } from 'react';
import {
  useDealsCopy,
  useDealsWatch,
  useDealsEdit,
  useDealsRemove,
} from '@/deals/cards/hooks/useDeals';
import { useSetAtom } from 'jotai';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useQueryState } from 'erxes-ui';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || 'Untitled deal');
  const setActiveDealId = useSetAtom(dealDetailSheetState);

  const [, setSalesItemId] = useQueryState<string>('salesItemId');

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
  const { removeDeals, loading: removeLoading } = useDealsRemove();
  const handleArchive = async () => {
    if (!deal?._id) return;
    const nextStatus = deal.status === 'archived' ? 'active' : 'archived';
    editDealsDirect({ variables: { _id: deal._id, status: nextStatus } }).catch(
      () => undefined,
    );
  };

  const { watchDeal, loading: watchLoading } = useDealsWatch();

  useEffect(() => {
    setName(deal?.name || 'Untitled deal');
  }, [deal?._id, deal?.name]);

  const handleName = () => {
    if (!deal?._id || !name.trim()) return;
    if (name === deal.name) return;

    editDeals({
      variables: {
        _id: deal._id,
        name,
      },
    });
  };

  const handleCopy = async () => {
    if (!deal?._id) return;
    copyDeal(deal._id, deal.pipeline?._id).catch(() => undefined);
  };

  const handleWatch = async () => {
    if (!deal?._id) return;
    watchDeal(deal._id, !deal.isWatched).catch(() => undefined);
  };

  const handleRemove = async () => {
    if (!deal?._id) return;
    removeDeals({ variables: { _id: deal._id } }).catch(() => undefined);
  };

  const handlePrint = () => {
    window.print();
  };

  const isLoading = copyLoading || watchLoading;

  return (
    <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon">
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Sheet.Title className="shrink-0 w-4/5">
        <div className="flex items-center gap-2">
          <Input
            className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
            placeholder="Deal Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onBlur={handleName}
          />
          {deal?.status === 'archived' && (
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
          <DropdownMenu.Content className="w-48 !min-w-fit">
            <DropdownMenu.Item onClick={handleCopy} disabled={copyLoading}>
              <IconCopy />
              {copyLoading ? 'Copying...' : 'Copy'}
            </DropdownMenu.Item>
            {deal?.status === 'archived' ? (
              <DropdownMenu.Item
                onClick={handleRemove}
                disabled={removeLoading}
                className="text-red-600 focus:text-red-600"
              >
                <IconEye />
                {removeLoading ? 'Removing...' : 'Remove'}
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
            <DropdownMenu.Item
              onClick={handleArchive}
              disabled={editLoading}
              className={
                deal?.status === 'archived'
                  ? undefined
                  : 'text-red-600 focus:text-red-600'
              }
            >
              <IconArchive />
              {deal?.status === 'archived'
                ? editLoading
                  ? 'Sending...'
                  : 'Send to board'
                : editLoading
                ? 'Archiving...'
                : 'Archive'}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
