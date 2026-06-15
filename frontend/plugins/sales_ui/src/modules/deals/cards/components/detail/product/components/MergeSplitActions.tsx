'use client';

import { IDeal } from '@/deals/types/deals';
import { DealMergeSheet } from '../merge/DealMergeSheet';

/**
 * Actions shown above the deal detail product section.
 *
 * - Merge: open the merge sheet, pick a deal (Board → Pipeline → Stage → Deal),
 *   resolve field conflicts, review products/payments and confirm.
 * - Split: done by selecting product rows in the table below — the product
 *   command bar then offers a "Split" action (see split/DealSplitSheet.tsx).
 */
export const MergeSplitActions = ({ deal }: { deal: IDeal }) => {
  return (
    <div className="flex items-center gap-2">
      <DealMergeSheet deal={deal} />
    </div>
  );
};
