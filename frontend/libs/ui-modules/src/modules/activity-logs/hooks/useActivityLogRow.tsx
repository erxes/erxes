import { useAtomValue } from 'jotai';
import { DefaultActivityRow } from '../components/DefaultActivityRow';
import { useActivityLog } from '../context/ActivityLogProvider';
import { pluginsConfigState } from 'ui-modules/states';
import { TActivityLog } from '../types';

export const useActivityLogRow = (activity: TActivityLog) => {
  const { customActivities } = useActivityLog();
  const pluginsConfig = useAtomValue(pluginsConfigState);

  if (activity.sourcePlugin) {
    const PluginRow = Object.values(pluginsConfig || {}).find(
      (pluginConfig) => pluginConfig.name === activity.sourcePlugin,
    )?.widgets?.activityRows?.[activity.activityType];

    if (PluginRow) {
      return <PluginRow activity={activity} />;
    }

    return <DefaultActivityRow activity={activity} />;
  }

  const customRenderer = customActivities?.find(
    ({ type }) => type === activity.activityType,
  );

  if (!customRenderer) {
    return <DefaultActivityRow activity={activity} />;
  }
  return customRenderer.render(activity);
};
