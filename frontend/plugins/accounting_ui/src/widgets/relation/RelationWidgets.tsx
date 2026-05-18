import type { IRelationWidgetProps } from 'ui-modules';
import { Suspense, lazy } from 'react';

const Transactions = lazy(() =>
  import('./modules/Transactions').then((module) => ({
    default: module.Transactions,
  })),
);

export const RelationWidgets = ({
  module,
  contentId,
  contentType,
}: IRelationWidgetProps) => {
  return (
    <Suspense>
      {module === 'transactions' ? (
        <Transactions contentId={contentId} contentType={contentType} />
      ) : null}
    </Suspense>
  );
};

export default RelationWidgets;
