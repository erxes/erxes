import {
  Button,
  EnumCursorDirection,
  Input,
  ScrollArea,
  Separator,
  Sheet,
  Spinner,
  Tooltip,
  cn,
} from 'erxes-ui';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { IDeal } from '../types/deals';
import { useDeals } from '../hooks/useDeals';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';

interface SelectDealsProps {
  onSelect: (dealIds: string[], deals?: IDeal[]) => void;
  children: React.ReactNode;
  dealIds?: string[];
}

interface DealsListProps {
  selectedDeals: IDeal[];
  setSelectedDeals: React.Dispatch<React.SetStateAction<IDeal[]>>;
  selectedDealIds: string[];
  setSelectedDealIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SelectDealsBulk = ({
  onSelect,
  children,
  dealIds,
}: SelectDealsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>{children}</Sheet.Trigger>
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>Select Deals</Sheet.Title>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <SelectDealsBulkContent
          setOpen={setOpen}
          onSelect={onSelect}
          dealIds={dealIds}
        />
      </Sheet.View>
    </Sheet>
  );
};

const SelectDealsBulkContent = ({
  setOpen,
  onSelect,
  dealIds,
}: {
  setOpen: (open: boolean) => void;
  onSelect: (dealIds: string[], deals?: IDeal[]) => void;
  dealIds?: string[];
}) => {
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [selectedDeals, setSelectedDeals] = useState<IDeal[]>([]);

  useEffect(() => {
    if (dealIds?.length) {
      setSelectedDealIds(dealIds);
    }
  }, [dealIds]);

  const handleAddDeal = (data: { dealsAdd: { _id: string } }) => {
    setSelectedDealIds((prev) => [...prev, data.dealsAdd._id]);
  };

  const handleSelect = () => {
    onSelect(
      selectedDeals.map((d) => d._id),
      selectedDeals,
    );
    setOpen(false);
  };

  return (
    <>
      <Sheet.Content className="grid grid-cols-2 overflow-hidden">
        <DealsList
          selectedDeals={selectedDeals}
          selectedDealIds={selectedDealIds}
          setSelectedDealIds={setSelectedDealIds}
          setSelectedDeals={setSelectedDeals}
        />
        <SelectedDealsList
          selectedDeals={selectedDeals}
          selectedDealIds={selectedDealIds}
          setSelectedDealIds={setSelectedDealIds}
          setSelectedDeals={setSelectedDeals}
        />
      </Sheet.Content>
      <Sheet.Footer className="sm:justify-between">
        {/* <AddProduct
          options={{
            onCompleted: handleAddProduct,
            refetchQueries: [GET_PRODUCTS],
          }}
        /> */}
        <div className="flex items-center gap-2">
          <Sheet.Close asChild>
            <Button variant="secondary" className="bg-border">
              Cancel
            </Button>
          </Sheet.Close>
          <Button onClick={handleSelect}>Add Many Deals</Button>
        </div>
      </Sheet.Footer>
    </>
  );
};

const DealsList = ({
  setSelectedDeals,
  selectedDealIds,
  setSelectedDealIds,
}: DealsListProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { deals, handleFetchMore, totalCount } = useDeals({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  const { ref: bottomRef } = useInView({
    onChange: (inView) =>
      inView && handleFetchMore({ direction: EnumCursorDirection.FORWARD }),
  });

  const handleDealSelect = (deal: IDeal) => {
    setSelectedDeals((prev) => [...prev, deal]);
    setSelectedDealIds((prev) => [...prev, deal._id]);
  };

  return (
    <div className="border-r overflow-hidden flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search deals"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-accent-foreground text-xs mt-4">
          {totalCount} results
        </div>
      </div>
      <Separator />
      <ScrollArea>
        <div className="p-4 flex flex-col gap-1">
          <Tooltip.Provider>
            {(deals || []).map((deal) => {
              const isSelected = selectedDealIds.includes(deal._id);
              return (
                <Tooltip key={deal._id}>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        'min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left',
                        isSelected && 'bg-primary/10 hover:bg-primary/10',
                      )}
                      onClick={() => handleDealSelect(deal)}
                    >
                      <div>{deal.name}</div>
                      {isSelected ? (
                        <IconCheck className="ml-auto" />
                      ) : (
                        <IconPlus className="ml-auto" />
                      )}
                    </Button>
                  </Tooltip.Trigger>
                  {/* <Tooltip.Content>
                    <span className="opacity-50">#</span> {deal.code}
                  </Tooltip.Content> */}
                </Tooltip>
              );
            })}

            {(deals || []).length < (totalCount || 0) && (
              <div className="flex items-center gap-2 px-2 h-8" ref={bottomRef}>
                <Spinner containerClassName="flex-none" />
                <span className="text-accent-foreground animate-pulse">
                  Loading more deals...
                </span>
              </div>
            )}
          </Tooltip.Provider>
        </div>
      </ScrollArea>
    </div>
  );
};

const SelectedDealsList = ({
  selectedDeals,
  selectedDealIds,
  setSelectedDeals,
  setSelectedDealIds,
}: DealsListProps) => {
  const handleRemoveDeal = (dealId: string) => {
    setSelectedDeals((prev) => prev.filter((p) => p._id !== dealId));
    setSelectedDealIds((prev) => prev.filter((id) => id !== dealId));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 flex flex-col gap-1">
        <div className="text-accent-foreground text-xs px-3 mb-1">Added</div>
        {selectedDealIds.map((dealId) => {
          const deal = selectedDeals.find((p) => p._id === dealId);
          return (
            <Button
              key={dealId}
              variant="ghost"
              className="min-h-9 h-auto justify-start font-normal whitespace-normal max-w-full text-left"
              onClick={() => handleRemoveDeal(dealId)}
            >
              {/* <ProductsInline
                productIds={[dealId]}
                products={deal ? [deal] : []}
                updateProducts={(products) =>
                  setSelectedDeals((prev) => [...prev, ...products])
                }
              /> */}
              <IconX className="ml-auto" />
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
