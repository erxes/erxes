import { Suspense, lazy } from 'react';

import type { IRelationWidgetProps } from 'ui-modules';

const Deal = lazy(() =>
  import('./modules/Deal').then((module) => ({
    default: module.Deal,
  })),
);

const PosOrders = lazy(() =>
  import('./modules/PosOrders').then((module) => ({
    default: module.PosOrders,
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
      {module === 'posOrders' ? (
        <PosOrders contentId={contentId} />
      ) : null}
    </Suspense>
  );
};

export default RelationWidgets;
