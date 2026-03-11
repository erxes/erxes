import { IconLock } from '@tabler/icons-react';
import { usePermissionContext } from 'erxes-ui';
import { useLocation } from 'react-router-dom';

interface PermissionGuardProps {
  pluginName: string;
  children: React.ReactNode;
}

// Map route segments to permission module names
const SEGMENT_TO_MODULE: Record<string, string> = {
  tasks: 'task',
  projects: 'project',
  milestones: 'milestone',
  cycles: 'cycle',
  teams: 'team',
  triage: 'triage',
  deals: 'deals',
  contacts: 'contacts',
};

// Known module segments (keys of SEGMENT_TO_MODULE + values for direct matches)
const KNOWN_MODULES = new Set([
  ...Object.keys(SEGMENT_TO_MODULE),
  ...Object.values(SEGMENT_TO_MODULE),
]);

const extractModulesFromPath = (
  pathname: string,
  pluginName: string,
): string[] => {
  const prefix = `/${pluginName}/`;
  if (!pathname.startsWith(prefix)) return [];

  const rest = pathname.slice(prefix.length);
  const segments = rest.split('/').filter(Boolean);

  // Find all segments that match known module names
  return segments
    .filter((seg) => KNOWN_MODULES.has(seg))
    .map((seg) => SEGMENT_TO_MODULE[seg] || seg);
};

export const PermissionGuard = ({
  pluginName,
  children,
}: PermissionGuardProps) => {
  const { canAccessModule } = usePermissionContext();
  const { pathname } = useLocation();

  const modules = extractModulesFromPath(pathname, pluginName);

  // Check all modules in the path — block if user lacks read for any
  const deniedModule = modules.find((mod) => !canAccessModule(mod));

  if (deniedModule) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <IconLock className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to access the{' '}
          <span className="capitalize font-medium">{deniedModule}</span> module.
          Please contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
