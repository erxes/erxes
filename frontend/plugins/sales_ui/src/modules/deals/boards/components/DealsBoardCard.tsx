import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { BoardCardProps, Separator, useQueryState } from 'erxes-ui';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { ItemFooter } from '@/deals/cards/components/item/Footer';
import Labels from '@/deals/cards/components/detail/overview/label/Labels';
import { allDealsMapState } from '@/deals/boards/components/DealsBoard';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';

// Selector atom to get deal by ID
export const dealBoardItemAtom = atom(
  (get) => (id: string) => get(allDealsMapState)[id],
);

export const DealsBoardCard = ({ id }: BoardCardProps) => {
  const deal = useAtomValue(dealBoardItemAtom)(id);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [searchParams] = useSearchParams();

  const {
    _id,
    name,
    startDate,
    closeDate,
    priority,
    labels,
    assignedUsers,
    createdAt,
    status,
  } = deal;

  const archivedOnly = searchParams.get('archivedOnly') === 'true';
  const isArchived = status === 'archived';
  const showArchivedBadge = archivedOnly || isArchived;

  const handleCardClick = () => {
    setSalesItemId(_id);
    setActiveDealId(_id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={showArchivedBadge ? 'relative overflow-hidden' : ''}
    >
      <div className="overflow-hidden">
        {/* Date Section */}
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

        {/* Content Section */}
        <div className="p-3 flex flex-col gap-3">
          {/* Labels */}
          {labels && labels.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Labels labels={labels} type="toggle" />
            </div>
          )}

          {/* Deal Name */}
          <div className="flex flex-col gap-1">
            <h5 className="font-semibold">{name}</h5>
          </div>

          {/* Priority and Label Filter */}
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
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <ItemFooter
          createdAt={createdAt}
          assignedUsers={assignedUsers || []}
          id={_id}
        />
      </div>

      {/* Archived Ribbon Badge */}
      {showArchivedBadge && (
        <div className="pointer-events-none select-none absolute bottom-6 -right-10 -rotate-45 w-40">
          <span className="block w-full text-center px-8 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 border-t border-b border-yellow-200 shadow-md">
            Archived
          </span>
        </div>
      )}
    </div>
  );
};
