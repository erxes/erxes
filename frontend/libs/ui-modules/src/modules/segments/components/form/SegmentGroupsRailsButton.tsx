import { cn } from 'erxes-ui';
import { useSegmentGroupsRailsButton } from '../../hooks/useSegmentGroupsRailsButton';
import { TConditionsConjunction } from '../../types';

export const SegmentGroupsRailsButton = ({
  total,
  index,
}: {
  total: number;
  index: number;
}) => {
  const { isAbleToShow, conditionsConjunction, handleClick, isOdd } =
    useSegmentGroupsRailsButton({ total, index });

  if (!isAbleToShow) {
    return null;
  }
  return (
    <div
      className={cn(
        'absolute z-10 -left-1 cursor-pointer hover:bg-amber-200 text-amber-600/50 w-12 h-6 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-medium transition',
        {
          '-top-5': isOdd,
          'bg-green-100 text-green-600 hover:bg-green-100 hover:text-green-600/50':
            conditionsConjunction === TConditionsConjunction.AND,
        },
      )}
      onClick={handleClick}
    >
      {conditionsConjunction?.toUpperCase()}
    </div>
  );
};
