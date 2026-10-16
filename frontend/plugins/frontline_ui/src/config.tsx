import {
  IconBook,
  IconChartBar,
  IconChartHistogram,
  IconForms,
  IconLifebuoy,
  IconMail,
  IconPhone,
  IconSettings,
  IconStackFront,
  IconTicket,
} from '@tabler/icons-react';
import { IUIConfig, TActivityRowProps, TPropertyInputProps } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const FrontlineNavigation = lazy(() =>
  import('@/FrontlineNavigation').then((module) => ({
    default: module.FrontlineNavigation,
  })),
);

const FrontlineSubGroups = lazy(() =>
  import('@/FrontlineSubGroups').then((module) => ({
    default: module.FrontlineSubGroups,
  })),
);

const FrontlineSettingsNavigation = lazy(() =>
  import('@/FrontlineSettingsNavigation').then((module) => ({
    default: module.FrontlineSettingsNavigation,
  })),
);

const TicketStatusPropertyInput = lazy(() =>
  import('@/ticket/components/ticket-selects/TicketStatusPropertyInput').then(
    (module) => ({
      default: module.TicketStatusPropertyInput,
    }),
  ),
);

const FormSubmissionActivityRow = lazy(() =>
  import('~/widgets/activity/FormSubmissionActivityRow').then((module) => ({
    default: module.FormSubmissionActivityRow,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'frontline',
  path: 'frontline',
  icon: IconStackFront,
  hasFloatingWidget: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <FrontlineSettingsNavigation />
    </Suspense>
  ),
  plugin: {
    name: 'frontline',
    color: 'oklch(0.55 0.18 252)',
    description: 'Inbox, tickets, calls and forms',
    logo: (
      <>
        <path
          d="M22 11h13a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-1v4l-4.5-4H22z"
          fill="#fff"
          opacity=".55"
        />
        <path
          d="M12 18h16a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9l-5.5 4.5V33H12a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z"
          fill="#fff"
        />
        <circle cx="15" cy="25.5" r="1.7" fill="currentColor" />
        <circle cx="20" cy="25.5" r="1.7" fill="currentColor" />
        <circle cx="25" cy="25.5" r="1.7" fill="currentColor" />
      </>
    ),
    defaultPath: 'frontline/inbox',
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
        label: 'Conversations',
      },
      {
        name: 'ticket',
        icon: IconTicket,
        label: 'Tickets',
      },
    ],
    propertyInputs: {
      ticketStatus: (props: TPropertyInputProps) => (
        <Suspense fallback={<div />}>
          <TicketStatusPropertyInput {...props} />
        </Suspense>
      ),
    },
    activityRows: {
      formSubmission: (props: TActivityRowProps) => (
        <Suspense fallback={<div />}>
          <FormSubmissionActivityRow {...props} />
        </Suspense>
      ),
    },
  },
  modules: [
    {
      name: 'inbox',
      icon: IconMail,
      path: 'frontline/inbox',
      hasAutomation: true,
    },
    {
      name: 'tickets',
      icon: IconTicket,
      path: 'frontline/tickets',
      hasAutomation: true,
    },
    {
      name: 'reports',
      icon: IconChartHistogram,
      path: 'frontline/reports',
    },
    {
      name: 'call-center-dashboard',
      icon: IconPhone,
      path: 'frontline/calls/dashboard',
    },
    {
      name: 'call-center-statistics',
      icon: IconPhone,
      path: 'frontline/calls/statistics',
    },
    {
      name: 'forms',
      icon: IconForms,
      path: 'frontline/forms',
    },
    {
      name: 'surveys',
      icon: IconChartBar,
      path: 'frontline/surveys',
    },
    {
      name: 'knowledge-base',
      icon: IconBook,
      path: 'frontline/knowledgebase',
    },
    {
      name: 'help-center',
      icon: IconLifebuoy,
      path: 'frontline/helpcenter',
    },
    {
      name: 'channels',
      icon: IconMail,
      path: 'settings/frontline/channels',
    },
    {
      name: 'personal-channel',
      icon: IconMail,
      path: 'settings/frontline/personal-channel',
    },
    {
      name: 'integrations-config',
      icon: IconSettings,
      path: 'settings/frontline/config',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
