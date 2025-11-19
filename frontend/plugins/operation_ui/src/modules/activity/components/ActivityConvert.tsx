import { ACTIVITY_ACTIONS } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import { ProjectInline } from '@/project/components/ProjectInline';

export const ActivityConvertToProject = ({
  metadata,
  action,
}: {
  metadata: IActivity['metadata'];
  action: IActivity['action'];
}) => {
  if (action !== ACTIVITY_ACTIONS.CONVERTED) return null;

  return (
    <div className="inline-flex items-center gap-1">
      converted task to project
      <span className="font-bold">
        <ProjectInline projectId={metadata.newValue} />
      </span>
    </div>
  );
};
