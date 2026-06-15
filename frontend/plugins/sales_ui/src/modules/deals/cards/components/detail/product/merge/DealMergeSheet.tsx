import {
  IconArrowMerge,
  IconLayoutSidebarLeftCollapse,
} from '@tabler/icons-react';
import { Button, Sheet, Spinner, useToast } from 'erxes-ui';
import { useEffect, useState } from 'react';

import { IDeal } from '@/deals/types/deals';
import { MergeSelection, buildMergeFields } from './mergeFields';
import { DealMergeSourcePicker } from './DealMergeSourcePicker';
import { DealMergeReview } from './DealMergeReview';
import { ConfirmByTyping } from '../ConfirmByTyping';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { useMergeDeals } from '../hooks/useMergeDeals';

/**
 * The "Merge deal" experience, opened from the deal detail product section.
 *
 * One sheet does everything: pick the deal to merge in (Board → Pipeline →
 * Stage → Deal), resolve any field conflicts, preview the combined products and
 * review payments, then confirm. The picked field winners are sent to
 * dealsMerge as `fields` so they actually take effect.
 */
export const DealMergeSheet = ({ deal }: { deal: IDeal }) => {
  const [open, setOpen] = useState(false);
  const [sourceId, setSourceId] = useState<string>('');
  const [name, setName] = useState(deal.name || '');
  const [selections, setSelections] = useState<Record<string, MergeSelection>>(
    {},
  );
  const { toast } = useToast();
  const { mergeDeals, loading } = useMergeDeals({
    onCompleted: () => handleOpenChange(false),
  });

  const { deal: source, loading: sourceLoading } = useDealDetail({
    variables: { _id: sourceId },
    skip: !sourceId,
  });

  useEffect(() => {
    if (open) {
      setName(deal.name || '');
      setSourceId('');
      setSelections({});
    }
  }, [open, deal.name]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
  };

  const handleSelectSource = (pickedId: string) => {
    setSourceId(pickedId);
    setSelections({});
  };

  const handleConfirm = () => {
    if (!sourceId) {
      toast({
        title: 'Pick a deal',
        description: 'Choose a deal to merge into this one.',
        variant: 'destructive',
      });
      return;
    }
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Enter a name for the merged deal.',
        variant: 'destructive',
      });
      return;
    }

    mergeDeals({
      variables: {
        sourceDealIds: [sourceId],
        targetDealId: deal._id,
        name: name.trim(),
        fields: buildMergeFields(deal, source, selections),
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.Trigger asChild>
        <Button variant="outline" size="sm">
          <IconArrowMerge className="size-4" />
          Merge deal
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl flex gap-0 flex-col m-0 p-0">
        <Sheet.Header className="border-b p-3 m-0 flex-row items-center space-y-0 gap-3">
          <Button variant="ghost" size="icon">
            <IconLayoutSidebarLeftCollapse />
          </Button>
          <Sheet.Title className="flex items-center gap-2">
            <IconArrowMerge className="size-4" />
            Merge into “{deal.name}”
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-0 min-h-0 overflow-hidden">
          <div className="grid h-full grid-cols-[20rem_1fr] overflow-hidden">
            <DealMergeSourcePicker
              targetDealId={deal._id}
              selectedSourceId={sourceId}
              onSelect={handleSelectSource}
            />
            <div className="min-h-0 overflow-y-auto">
              {!sourceId ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
                  Pick a deal on the left to preview the merge.
                </div>
              ) : sourceLoading || !source ? (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <DealMergeReview
                  target={deal}
                  source={source}
                  name={name}
                  onNameChange={setName}
                  selections={selections}
                  onSelectionChange={(key, selection) =>
                    setSelections((prev) => ({ ...prev, [key]: selection }))
                  }
                />
              )}
            </div>
          </div>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end p-5">
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <ConfirmByTyping
            keyword="merge"
            title="Confirm merge"
            description={`This merges the selected deal into “${deal.name}”. It can’t be undone.`}
            confirmLabel="Merge deals"
            loading={loading}
            onConfirm={handleConfirm}
          >
            <Button disabled={loading || !sourceId || !name.trim()}>
              <IconArrowMerge />
              {loading ? 'Merging…' : 'Confirm merge'}
            </Button>
          </ConfirmByTyping>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
