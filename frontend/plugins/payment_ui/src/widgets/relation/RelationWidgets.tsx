import { Suspense, lazy } from 'react';

import type { IRelationWidgetProps } from 'ui-modules';

const Invoice = lazy(() =>
  import('./modules/Invoice').then((module) => ({
    default: module.Invoice,
  })),
);

export const RelationWidgets = ({
  module,
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  return (
    <Suspense>
      {module === 'invoices' ? (
        <Invoice contentId={contentId} contentType={contentType} />
      ) : null}
    </Suspense>
  );
};

export default RelationWidgets;
