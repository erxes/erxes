import type { IRelationWidgetProps } from 'ui-modules';
import { Suspense, lazy } from 'react';

const Task = lazy(() =>
  import('./modules/Task').then((module) => ({
    default: module.Task,
  })),
);

const Project = lazy(() =>
  import('./modules/Project').then((module) => ({
    default: module.Project,
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
      {module === 'tasks' ? (
        <Task
          contentId={contentId}
          contentType={contentType}
          customerId={customerId}
          companyId={companyId}
        />
      ) : module === 'projects' ? (
        <Project
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
