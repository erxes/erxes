import { RelationSettingsWidget } from 'ui-modules';
import { usePosPurchaseContext } from '@/pos/hooks/usePosPurchaseContext';

// Another plugin's own tab on this POS, e.g. loyalty's points.
export const PosRelationSettings = ({
  moduleKey,
  posId,
  posName,
}: {
  moduleKey: string;
  posId: string;
  posName?: string;
}) => (
  <RelationSettingsWidget
    moduleKey={moduleKey}
    contentType="sales:pos"
    contentId={posId}
    context={usePosPurchaseContext(posId, posName)}
  />
);
