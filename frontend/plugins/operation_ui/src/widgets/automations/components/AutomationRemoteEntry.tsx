import { Spinner } from 'erxes-ui';
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AutomationRemoteEntryProps } from 'ui-modules';

const TaskRemoteEntry = lazy(() =>
  import('../modules/task/components/TaskRemoteEntry').then((module) => ({
    default: module.TaskRemoteEntry,
  })),
);

const ProjectRemoteEntry = lazy(() =>
  import('../modules/project/components/ProjectRemoteEntry').then((module) => ({
    default: module.ProjectRemoteEntry,
  })),
);

const TeamRemoteEntry = lazy(() =>
  import('../modules/team/components/TeamRemoteEntry').then((module) => ({
    default: module.TeamRemoteEntry,
  })),
);

const Remotes: Record<
  string,
  LazyExoticComponent<ComponentType<AutomationRemoteEntryProps>>
> = {
  task: TaskRemoteEntry,
  project: ProjectRemoteEntry,
  team: TeamRemoteEntry,
};

export const AutomationRemoteEntries = ({
  moduleName,
  ...props
}: AutomationRemoteEntryProps & { moduleName: string }) => {
  const RemoteComponent = Remotes[moduleName];

  if (!RemoteComponent) {
    return null;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={() => <div>Error </div>}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};
