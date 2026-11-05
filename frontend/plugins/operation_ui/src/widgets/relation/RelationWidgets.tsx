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

export const RelationWidgets = ({ module, ...props }: IRelationWidgetProps) => {
  return (
    <Suspense>
      {module === 'tasks' ? (
        <Task {...props} />
      ) : module === 'projects' ? (
        <Project {...props} />
      ) : null}
    </Suspense>
  );
};

export default RelationWidgets;
