import { useState } from 'react';
import {
  Button,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  Spinner,
  cn,
} from 'erxes-ui';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { useGetSalesDeals } from '../hooks/useGetSalesDeals';

interface IDeal {
  _id: string;
  name: string;
  number: string;
  stageId: string;
}

interface ChooseDealSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (deal: IDeal) => void;
  selectedDealId?: string;
}

const DealsList = ({
  selectedDealId,
  onSelect,
  onConfirm,
}: {
  selectedDealId: string;
  onSelect: (deal: IDeal) => void;
  onConfirm: (deal: IDeal) => void;
}) => {
  const [search, setSearch] = useState('');
  const [boardId, setBoardId] = useState('');
  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');

  const { deals, loading: dealsLoading } = useGetSalesDeals({
    pipelineId: pipelineId || undefined,
    stageId: stageId || undefined,
    search: search || undefined,
  });

  const handleBoardChange = (val: string | string[]) => {
    setBoardId(Array.isArray(val) ? val[0] : val);
    setPipelineId('');
    setStageId('');
  };

  const handlePipelineChange = (val: string | string[]) => {
    setPipelineId(Array.isArray(val) ? val[0] : val);
    setStageId('');
  };

  const handleStageChange = (val: string | string[]) => {
    setStageId(Array.isArray(val) ? val[0] : val);
  };

  return (
    <div className="flex flex-col overflow-hidden border-r">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="deal-search"
            className="text-xs font-medium text-accent-foreground"
          >
            Search
          </label>
          <Input
            id="deal-search"
            placeholder="Search deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-accent-foreground">Board</p>
          <SelectBoard value={boardId} onValueChange={handleBoardChange} />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-accent-foreground">Pipeline</p>
          <SelectPipeline
            value={pipelineId}
            boardId={boardId}
            onValueChange={handlePipelineChange}
            disabled={!boardId}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-accent-foreground">Stage</p>
          <SelectStage
            value={stageId}
            pipelineId={pipelineId}
            onValueChange={handleStageChange}
            disabled={!pipelineId}
          />
        </div>
        <div className="text-xs text-accent-foreground">
          {pipelineId
            ? `${deals.length} results`
            : 'Select a pipeline to see deals'}
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-4">
          {dealsLoading && (
            <div className="flex gap-2 items-center px-2 h-8">
              <Spinner containerClassName="flex-none" />
              <span className="animate-pulse text-accent-foreground text-sm">
                Loading deals...
              </span>
            </div>
          )}
          {!dealsLoading &&
            deals.map((deal) => {
              const isSelected = selectedDealId === deal._id;
              return (
                <Button
                  key={deal._id}
                  variant="ghost"
                  className={cn(
                    'min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left',
                    isSelected && 'bg-primary/10 hover:bg-primary/10',
                  )}
                  onClick={() => {
                    onSelect(deal);
                    onConfirm(deal);
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span>{deal.name}</span>
                    {deal.number && (
                      <span className="text-xs text-muted-foreground">
                        {deal.number}
                      </span>
                    )}
                  </div>
                  {isSelected ? (
                    <IconCheck className="ml-auto shrink-0" size={16} />
                  ) : (
                    <IconPlus className="ml-auto shrink-0" size={16} />
                  )}
                </Button>
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
};

const SelectedDeal = ({
  deal,
  onRemove,
}: {
  deal: IDeal | null;
  onRemove: () => void;
}) => (
  <ScrollArea className="h-full">
    <div className="flex flex-col gap-1 p-4">
      <div className="px-3 mb-1 text-xs text-accent-foreground">Added</div>
      {deal && (
        <Button
          variant="ghost"
          className="justify-start max-w-full h-auto font-normal text-left whitespace-normal min-h-9"
          onClick={onRemove}
        >
          <div className="flex flex-col items-start">
            <span>{deal.name}</span>
            {deal.number && (
              <span className="text-xs text-muted-foreground">
                {deal.number}
              </span>
            )}
          </div>
          <IconX className="ml-auto shrink-0" size={16} />
        </Button>
      )}
    </div>
  </ScrollArea>
);

export const ChooseDealSheet = ({
  open,
  onOpenChange,
  onSelect,
  selectedDealId,
}: ChooseDealSheetProps) => {
  const [selectedDeal, setSelectedDeal] = useState<IDeal | null>(null);

  const handleOpenChange = (val: boolean) => {
    if (!val) setSelectedDeal(null);
    onOpenChange(val);
  };

  const handleConfirm = (deal: IDeal) => {
    onSelect(deal);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal>
      <Sheet.View className="sm:max-w-3xl p-0">
        <Sheet.Header className="px-6 py-4">
          <Sheet.Title>Choose deal</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grid overflow-hidden grid-cols-2 p-0">
          <DealsList
            selectedDealId={selectedDeal?._id || selectedDealId || ''}
            onSelect={setSelectedDeal}
            onConfirm={handleConfirm}
          />
          <SelectedDeal
            deal={selectedDeal}
            onRemove={() => setSelectedDeal(null)}
          />
        </Sheet.Content>
        <Sheet.Footer className="sm:justify-end gap-2 px-6 py-4 border-t">
          <Button
            variant="secondary"
            className="bg-border"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
