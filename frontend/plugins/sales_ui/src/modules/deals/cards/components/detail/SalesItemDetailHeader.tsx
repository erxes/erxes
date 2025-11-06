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
  useDealsArchive,
} from '@/deals/stage/hooks/useDeals';
import { useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useQueryState } from 'erxes-ui';

export const SalesItemDetailHeader = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const [name, setName] = useState(deal?.name || 'Untitled deal');
  const { toast } = useToast();
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');

  // Use custom hooks with proper cache updates
  const { copyDeal, loading: copyLoading } = useDealsCopy({
    onCompleted: (data) => {
      const copiedDeal = data?.dealsCopy;
      if (copiedDeal) {
        // Switch UI to the newly copied deal in real time
        setActiveDealId(copiedDeal._id);
        setSalesItemId(copiedDeal._id);
        // Optimistically reflect the new deal name in the header input
        setName(copiedDeal.name || 'Untitled deal');
        toast({
          title: 'Deal copied successfully',
          description: `"${copiedDeal.name}" has been duplicated`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to copy deal',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
    refetchQueries: ['deals', 'dealDetail'],
  });

  const { watchDeal, loading: watchLoading } = useDealsWatch({
    onCompleted: (data) => {
      const isWatched = data?.dealsWatch?.isWatched;
      toast({
        title: isWatched ? 'Now watching deal' : 'Stopped watching deal',
        description: isWatched
          ? 'You will receive updates for this deal'
          : "You won't receive updates anymore",
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update watch status',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const { archiveDeal, loading: archiveLoading } = useDealsArchive({
    onCompleted: (data) => {
      toast({
        title: 'Deal archived successfully',
        description: 'The deal has been moved to archive',
      });
      // Add onClose() or navigation logic here if needed
    },
    onError: (error) => {
      toast({
        title: 'Failed to archive deal',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
    refetchQueries: ['deals', 'stages'],
  });

  useEffect(() => {
    setName(deal?.name || 'Untitled deal');
  }, [deal?._id, deal?.name]);

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

  const handleCopy = async () => {
    if (!deal) return;

    try {
      await copyDeal(deal._id, deal.pipeline?._id);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleWatch = async () => {
    if (!deal) return;

    try {
      await watchDeal(deal._id, !deal.isWatched);
    } catch (error) {
      console.error('Watch toggle failed:', error);
    }
  };

  const handleArchive = async () => {
    if (!deal) return;

    try {
      await archiveDeal(deal.stageId, deal.pipeline?._id);
    } catch (error) {
      console.error('Archive failed:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isLoading = copyLoading || watchLoading || archiveLoading;

  return (
    <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
      <Button variant="ghost" size="icon">
        <IconLayoutSidebarLeftCollapse />
      </Button>
      <Sheet.Title className="shrink-0 w-4/5">
        <Input
          className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
          placeholder="Deal Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={handleName}
        />
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
            <DropdownMenu.Item onClick={handleWatch} disabled={watchLoading}>
              <IconEye />
              {watchLoading
                ? 'Updating...'
                : deal?.isWatched
                ? 'Unwatch'
                : 'Watch'}
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={handlePrint}>
              <IconPrinter />
              Print document
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={handleArchive}
              disabled={archiveLoading}
              className="text-red-600 focus:text-red-600"
            >
              <IconArchive />
              {archiveLoading ? 'Archiving...' : 'Archive'}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </div>
      <Sheet.Close />
    </Sheet.Header>
  );
};
