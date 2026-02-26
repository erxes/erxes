import {
  IconMail,
  IconStackFront,
  IconTicket,
  IconBook,
  IconChartHistogram,
  IconForms,
} from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const FrontlineNavigation = lazy(() =>
  import('./modules/FrontlineNavigation').then((module) => ({
    default: module.FrontlineNavigation,
  })),
);

const FrontlineSubGroups = lazy(() =>
  import('./modules/FrontlineSubGroups').then((module) => ({
    default: module.FrontlineSubGroups,
  })),
);

const FrontlineSettingsNavigation = lazy(() =>
  import('./modules/FrontlineSettingsNavigation').then((module) => ({
    default: module.FrontlineSettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'frontline',
  path: 'frontline',
  hasFloatingWidget: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <FrontlineSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'frontline',
    icon: IconStackFront,
    content: () => (
      <Suspense fallback={<div />}>
        <FrontlineNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <FrontlineSubGroups />
      </Suspense>
    ),
  },
  widgets: {
    relationWidgets: [
      {
        name: 'conversation',
        icon: IconMail,
      },
      {
        name: 'ticket',
        icon: IconTicket,
      },
    ],
  },
  modules: [
    {
      name: 'channels',
      path: 'frontline/channels',
    },
    {
      name: 'configs',
      path: 'frontline/config',
    },
    {
      name: 'frontline',
      icon: IconMail,
      path: 'frontline',
      hasAutomation: true,
    },
    {
      name: 'tickets',
      path: 'frontline/tickets',
      icon: IconTicket,
    },
    {
      name: 'inbox',
      path: 'frontline/inbox',
      icon: IconMail,
    },
    {
      name: 'reports',
      path: 'frontline/reports',
      icon: IconChartHistogram,
    },
    {
      name: 'Forms',
      path: 'frontline/forms',
      icon: IconForms,
    },
    {
      name: 'knowledge base',
      icon: IconBook,
      path: 'frontline/knowledgebase',
    },
  ],
};
