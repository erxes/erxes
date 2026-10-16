import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { getAppColor } from '@/navigation/utils/getAppColor';
import { IconApps } from '@tabler/icons-react';

export const AppLogo = ({
  activity,
  size = 32,
}: {
  activity: INavigationActivity;
  size?: number;
}) => {
  const color = getAppColor(activity);
  const Icon = activity.icon ?? IconApps;

  // Shared core apps stay quiet so color always means a plugin app.
  if (!color) {
    return (
      <span
        role="img"
        aria-label={activity.label}
        className="grid shrink-0 place-items-center rounded-[23%] border bg-background text-muted-foreground"
        style={{ width: size, height: size }}
      >
        <Icon size={Math.round(size * 0.6)} stroke={1.75} />
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className="shrink-0"
      style={{ color }}
      role="img"
      aria-label={activity.label}
    >
      <rect width="48" height="48" rx="11" fill="currentColor" />
      {activity.logo ?? (
        <Icon x="12" y="12" width="24" height="24" color="#fff" stroke={2} />
      )}
    </svg>
  );
};
