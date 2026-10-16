import { INavigationActivity } from '@/navigation/types/NavigationActivity';

const hashHue = (id: string) =>
  [...id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 360, 7);

/**
 * The app's own color. A plugin that sets none gets a stable color from its
 * id. Shared core apps return nothing and keep the workspace primary color.
 */
export const getAppColor = (activity: INavigationActivity) => {
  if (activity.kind === 'core') return undefined;

  return activity.color ?? `oklch(0.55 0.15 ${hashHue(activity.id)})`;
};
