
import { IconSandbox } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import { IUIConfig } from 'erxes-ui';

const AgentAssistantSettingsNavigation = lazy(() =>
  import('@/AgentAssistantSettingsNavigation').then((module) => ({
    default: module.AgentAssistantSettingsNavigation,
  })),
);

const AgentAssistantNavigation = lazy(() =>
  import('@/AgentAssistantNavigation').then((module) => ({
    default: module.AgentAssistantNavigation,
  })),
);


export const CONFIG: IUIConfig = {
  name: 'agent-assistant',
  path: 'agent-assistant',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <AgentAssistantSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'agent-assistant',
    icon: IconSandbox,
    content: () => (
      <Suspense fallback={<div />}>
        <AgentAssistantNavigation />
      </Suspense>
    ),
  },

  modules: [
    {
      name: 'agent-assistant',
      icon: IconSandbox,
      path: 'agent-assistant',
    },
  ],
};
