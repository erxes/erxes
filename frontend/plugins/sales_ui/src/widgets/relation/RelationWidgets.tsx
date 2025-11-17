import { Suspense, lazy } from 'react';

import type { IRelationWidgetProps } from 'ui-modules';

const Deal = lazy(() =>
  import('./modules/Deal').then((module) => ({
    default: module.Deal,
  })),
);

export const RelationWidgets = ({
  module,
  contentId,
  contentType,
  customerId,
  companyId,
}: IRelationWidgetProps) => {
  return (
    <Suspense>
      <Deal
        contentId={contentId}
        contentType={contentType}
        customerId={customerId}
        companyId={companyId}
      />
    </Suspense>
  );
};

export default RelationWidgets;
