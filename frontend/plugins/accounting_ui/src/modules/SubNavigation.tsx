import { AdjustmentNavigation } from '~/modules/AdjustmentNavigation';
import { InventoriesNavigation } from '~/modules/InventoriesNavigation';

/** Aggregates accounting sub-navigation items loaded via Module Federation. */
export default function SubNavigation() {
  return (
    <>
      <AdjustmentNavigation />
      <InventoriesNavigation />
    </>
  );
}
