import { RecordTableInlineCell, useQueryState } from 'erxes-ui';
import { BoardCell, PipelineCell, StageCell } from 'ui-modules';
import { IDeal } from '@/deals/types/deals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useSetAtom } from 'jotai';
export const NameCell = ({ deal }: { deal: IDeal }) => {
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');

  const handleClick = () => {
    setSalesItemId(deal._id);
    setActiveDealId(deal._id);
  };

  return (
    <RecordTableInlineCell onClick={handleClick}>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.name}</span>
        {deal.status === 'archived' && (
          <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100/80 text-amber-900 border border-amber-200/50 rounded-sm">
            Archived
          </span>
        )}
      </div>
    </RecordTableInlineCell>
  );
};
export const ProductsCell = ({ deal }: { deal: IDeal }) => {
  return (
    <RecordTableInlineCell>
      <div className="flex items-center justify-between w-full gap-2">
        <span>{deal.products?.length}</span>
      </div>
    </RecordTableInlineCell>
  );
};
