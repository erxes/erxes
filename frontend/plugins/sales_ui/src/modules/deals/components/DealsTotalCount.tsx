import { Skeleton, isUndefinedOrNull } from 'erxes-ui';
import {
  dealTotalCountAtom,
  dealTotalCountBoardAtom,
} from '@/deals/states/dealsTotalCountState';

import { useAtomValue } from 'jotai';

export const DealsTotalCount = () => {
  const totalCount = useAtomValue(dealTotalCountAtom);
  const taskCountByBoard = useAtomValue(dealTotalCountBoardAtom);

  const totalCountToShow = taskCountByBoard || totalCount;

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCountToShow) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCountToShow} records found`
      )}
    </div>
  );
};
