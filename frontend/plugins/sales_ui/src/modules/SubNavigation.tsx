import { SalesSubNavigation } from '~/modules/SalesSubNavigation';
import { PosOrderNavigation } from '~/modules/pos/PosOrderNavigation';

/** Aggregates sales sub-navigation items loaded via Module Federation. */
export default function SubNavigation() {
  return (
    <>
      <SalesSubNavigation />
      <PosOrderNavigation />
    </>
  );
}
