import { lazy, Suspense } from 'react';
import type { IRelationWidgetProps } from 'ui-modules';

const DealEbarimt = lazy(() =>
  import('~/modules/ebarimt/deal-ebarimt/components/DealEbarimt').then(
    (module) => ({ default: module.DealEbarimt }),
  ),
);

export const RelationWidget = ({
  module,
  contentId,
  contentType,
}: IRelationWidgetProps) => (
  <Suspense>
    {module === 'ebarimt' && contentType === 'sales:deal' ? (
      <DealEbarimt contentId={contentId} />
    ) : null}
  </Suspense>
);
