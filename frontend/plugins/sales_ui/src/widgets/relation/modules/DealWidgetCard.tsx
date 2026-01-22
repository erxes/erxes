import { Card, Separator, useQueryState } from 'erxes-ui';
import { Suspense, lazy } from 'react';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';

const DealDetailSheet = lazy(() =>
  import('@/deals/cards/components/detail/SalesItemDetail').then((module) => ({
    default: module.SalesItemDetail,
  })),
);

export const DealWidgetCard = ({ deal }: { deal: IDeal }) => {
  const {
    startDate,
    closeDate,
    name,
    priority,
    _id,
    createdAt,
    assignedUsers,
  } = deal || {};
  const [activeDeal, setActiveDeal] = useAtom(dealDetailSheetState);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');

  const onCardClick = () => {
    setSalesItemId(_id);
    setActiveDeal(_id);
  };

  return (
    <>
      <Card className="bg-background" onClick={() => onCardClick()}>
        <div className="px-2 h-9 flex flex-row items-center justify-between space-y-0">
          <DateSelectDeal
            value={startDate}
            id={_id}
            type="startDate"
            variant="card"
            placeholder="Start Date"
          />
          <DateSelectDeal
            value={closeDate}
            id={_id}
            type="closeDate"
            variant="card"
            placeholder="Close Date"
          />
        </div>
        <Separator />
        <div className="p-3">
          <div className="flex flex-col gap-1">
            <h5 className="font-semibold">{name}</h5>
          </div>
          <div className="flex flex-wrap gap-1 pt-2 pb-1">
            <SelectDealPriority
              dealId={_id}
              value={priority || ''}
              variant="card"
            />
            <SelectLabels.FilterBar
              filterKey=""
              mode="multiple"
              label="By Label"
              variant="card"
            />
          </div>
        </div>
        <Separator />
        <ItemFooter
          createdAt={createdAt}
          assignedUsers={assignedUsers || []}
          id={_id}
        />
      </Card>
      <Suspense>{activeDeal && <DealDetailSheet />}</Suspense>
    </>
  );
};
