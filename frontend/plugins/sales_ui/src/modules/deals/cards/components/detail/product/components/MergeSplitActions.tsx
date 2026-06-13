'use client';

import { IDeal } from '@/deals/types/deals';
import { MergeStartDialog } from './MergeStartDialog';

/**
 * Actions shown above the deal detail product section.
 *
 * - Merge: start a merge, then pick a deal on the board to merge into this one.
 * - Split: done by selecting product rows in the table below — the product
 *   command bar then offers a "Split" action (see ProductSplit.tsx).
 */
export const MergeSplitActions = ({ deal }: { deal: IDeal }) => {
  return (
    <div className="flex items-center gap-2">
      <MergeStartDialog deal={deal} />
    </div>
  );
};
