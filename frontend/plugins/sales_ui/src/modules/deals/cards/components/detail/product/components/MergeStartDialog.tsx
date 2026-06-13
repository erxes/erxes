'use client';

import { Button, Dialog, Input, Label, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';

import { IDeal } from '@/deals/types/deals';
import { IconArrowMerge } from '@tabler/icons-react';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useMergeMode } from '../hooks/useMergeMode';
import { useSetAtom } from 'jotai';

/**
 * Starts a merge. Asks for the required merged-deal name, then closes the deal
 * detail and switches the board into "merge mode" so the user can click any
 * deal on the board to merge it into this one.
 */
export const MergeStartDialog = ({ deal }: { deal: IDeal }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(deal.name || '');
  const { toast } = useToast();
  const { startMerge } = useMergeMode();
  const setActiveDeal = useSetAtom(dealDetailSheetState);

  useEffect(() => {
    if (open) setName(deal.name || '');
  }, [open, deal.name]);

  /** Validate the name, then enter merge mode and close this dialog. */
  const handleStart = () => {
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Enter a name for the merged deal.',
        variant: 'destructive',
      });
      return;
    }

    // startMerge writes the merge params AND removes salesItemId in one URL
    // update; we only need to clear the jotai detail atom here so the sheet
    // actually closes and the board becomes clickable.
    startMerge(deal._id, name.trim());
    setActiveDeal(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm">
          <IconArrowMerge className="size-4" />
          Merge deal
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>Merge deal</Dialog.Title>
          <Dialog.Description>
            Name the merged deal, then pick a deal on the board to merge into “
            {deal.name}”.
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-1">
          <Label htmlFor="merge-name">
            Merged deal name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="merge-name"
            placeholder="Enter a name for the merged deal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
        </div>

        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="outline">Cancel</Button>
          </Dialog.Close>
          <Button onClick={handleStart}>Continue to board</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
