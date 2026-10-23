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

export const RelationWidgets = ({ module, ...props }: IRelationWidgetProps) => {
  return (
    <Suspense>
      {module === 'deals' ? <Deal {...props} /> : null}
      {module === 'posOrders' ? (
        <PosOrders contentId={props.contentId} />
      ) : null}
    </Suspense>
  );
};

export default RelationWidgets;
