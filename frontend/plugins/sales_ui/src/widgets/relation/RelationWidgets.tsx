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
      {module === 'deals' ? (
        <Deal
          contentId={contentId}
          contentType={contentType}
          customerId={customerId}
          companyId={companyId}
        />
      ) : null}
    </Suspense>
  );
};

export default RelationWidgets;
