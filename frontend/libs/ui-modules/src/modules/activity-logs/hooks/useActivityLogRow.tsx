import { DefaultActivityRow } from '../components/DefaultActivityRow';
import { useActivityLog } from '../context/ActivityLogProvider';
import { TActivityLog } from '../types';

export const useActivityLogRow = (activity: TActivityLog) => {
  const { customActivities } = useActivityLog();
  const customRenderer = customActivities?.find(
    ({ type }) => type === activity.activityType,
  );

  if (!customRenderer) {
    return <DefaultActivityRow activity={activity} />;
  }
  return customRenderer.render(activity);
};
