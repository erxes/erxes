import {
  IconMail,
  IconStackFront,
  IconTicket,
  IconBook,
  IconChartHistogram,
  IconForms,
} from '@tabler/icons-react';
import { IUIConfig, TPropertyInputProps } from 'erxes-ui';
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

const TicketStatusPropertyInput = lazy(() =>
  import(
    './modules/ticket/components/ticket-selects/TicketStatusPropertyInput'
  ).then((module) => ({
    default: module.TicketStatusPropertyInput,
  })),
);

const getFrontlineFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');

  if (pathWithoutQuery === 'frontline/inbox') return 'Frontline / Inbox';
  if (pathWithoutQuery === 'frontline/tickets') return 'Tickets';
  if (pathWithoutQuery === 'frontline/reports') return 'Reports';
  if (pathWithoutQuery === 'frontline/forms') return 'Forms';
  if (pathWithoutQuery === 'frontline/knowledgebase') return 'Knowledge Base';
  if (pathWithoutQuery.startsWith('frontline/calls/dashboard')) {
    return 'Call Center';
  }

  if (pathWithoutQuery.startsWith('frontline/calls/statistics')) {
    return 'Call Statistics';
  }

  if (pathWithoutQuery.startsWith('frontline/reports/call')) {
    return 'Call Reports';
  }

  if (pathWithoutQuery.startsWith('frontline/reports/ticket')) {
    return 'Reports / Tickets';
  }

  if (pathWithoutQuery.startsWith('frontline/forms/submissions')) {
    return 'Form Submissions';
  }

  if (pathWithoutQuery === 'frontline/forms/preview') {
    return 'Form Preview';
  }

  if (pathWithoutQuery.startsWith('frontline/forms/')) {
    return 'Form Detail';
  }

  return 'Frontline';
};

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
    propertyInputs: {
      ticketStatus: (props: TPropertyInputProps) => (
        <Suspense fallback={<div />}>
          <TicketStatusPropertyInput {...props} />
        </Suspense>
      ),
    },
  },
  modules: [
    {
      name: 'channels',
      path: 'frontline/channels',
      favoriteName: 'Channels',
    },
    {
      name: 'configs',
      path: 'frontline/config',
      favoriteName: 'Config',
    },
    {
      name: 'frontline',
      icon: IconMail,
      path: 'frontline',
      favoriteName: getFrontlineFavoriteName,
      hasAutomation: true,
    },
    {
      name: 'tickets',
      path: 'frontline/tickets',
      icon: IconTicket,
      favoriteName: getFrontlineFavoriteName,
    },
    {
      name: 'inbox',
      path: 'frontline/inbox',
      icon: IconMail,
      favoriteName: getFrontlineFavoriteName,
    },
    {
      name: 'reports',
      path: 'frontline/reports',
      icon: IconChartHistogram,
      favoriteName: getFrontlineFavoriteName,
    },
    {
      name: 'forms',
      path: 'frontline/forms',
      icon: IconForms,
      favoriteName: getFrontlineFavoriteName,
    },
    {
      name: 'knowledgeBase',
      icon: IconBook,
      path: 'frontline/knowledgebase',
      favoriteName: getFrontlineFavoriteName,
    },
  ],
};
