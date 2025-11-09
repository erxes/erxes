import { BoardCardProps, Separator, useQueryState } from 'erxes-ui';
import { atom, useAtomValue } from 'jotai';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
// import { SelectCompany } from 'ui-modules';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { allDealsMapState } from '@/deals/boards/components/DealsBoard';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';

export const dealBoardItemAtom = atom(
  (get) => (id: string) => get(allDealsMapState)[id],
);

export const DealsBoardCard = ({ id }: BoardCardProps) => {
  const {
    startDate,
    name,
    assignedUsers,
    _id,
    priority,
    createdAt,
    closeDate,
    labels,
    status,
  } = useAtomValue(dealBoardItemAtom)(id);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');
  const setActiveDealAtom = useSetAtom(dealDetailSheetState);
  const [searchParams] = useSearchParams();
  const archivedOnly = searchParams.get('archivedOnly') === 'true';

  const onCardClick = () => {
    setSalesItemId(_id);
    setActiveDealAtom(_id);
  };

  return (
    <div onClick={() => onCardClick()} className="relative">
      <div className="flex items-center justify-between h-9 px-1.5">
        <DateSelectDeal
          value={startDate}
          id={_id}
          type="startDate"
          variant="card"
        />
        <DateSelectDeal
          value={closeDate}
          id={_id}
          type="closeDate"
          variant="card"
        />
      </div>
      <Separator />
      <div className="p-3 flex flex-col gap-3">
        {labels && labels.length !== 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Labels labels={labels} type="toggle" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">{name}</h5>
        </div>
        <div className="flex flex-wrap gap-1">
          <SelectDealPriority
            dealId={_id}
            value={priority || ''}
            variant="card"
          />
          <SelectLabels.FilterBar
            filterKey="labelIds"
            mode="multiple"
            label="By Label"
            variant="card"
          />
          {/* <SelectCompany
                  value={field.value}
                  onValueChange={field.onChange}
                /> */}
        </div>
      </div>
      <Separator />
      <ItemFooter
        createdAt={createdAt}
        assignedUsers={assignedUsers || []}
        id={_id}
      />
      {(archivedOnly || status === 'archived') && (
        <div className="pointer-events-none select-none absolute bottom-5 right-2 -rotate-45">
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded border bg-yellow-100 text-yellow-800 border-yellow-200 shadow">
            Archived
          </span>
        </div>
      )}
    </div>
  );
};
