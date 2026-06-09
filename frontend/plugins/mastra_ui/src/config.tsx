import { IconRobot } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import { IUIConfig } from 'erxes-ui';

const MastraSettingsNavigation = lazy(() =>
  import('@/MastraSettingsNavigation').then((module) => ({
    default: module.MastraSettingsNavigation,
  })),
);

const MastraNavigation = lazy(() =>
  import('@/MastraNavigation').then((module) => ({
    default: module.MastraNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'mastra',
  path: 'mastra',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <MastraSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'mastra',
    icon: IconRobot,
    content: () => (
      <Suspense fallback={<div />}>
        <MastraNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'agents',
      icon: IconRobot,
      path: 'mastra/agents',
    },
    {
      name: 'tools',
      icon: IconRobot,
      path: 'mastra/tools',
    },
  ],
};
