import type { IRelationWidgetProps } from 'ui-modules';
import { Suspense, lazy } from 'react';

const Task = lazy(() =>
  import('./modules/Task').then((module) => ({
    default: module.Task,
  })),
);

const ProjectWidget = lazy(() =>
  import('./modules/ProjectWidget').then((module) => ({
    default: module.ProjectWidget,
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
      ) : (
        <ProjectWidget contentId={contentId} contentType={contentType} />
      )}
    </Suspense>
  );
};

export default RelationWidgets;
