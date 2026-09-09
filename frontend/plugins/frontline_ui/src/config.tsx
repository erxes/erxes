import {
  IconBook,
  IconChartBar,
  IconChartHistogram,
  IconForms,
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
  hasFloatingWidget: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <FrontlineSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'frontline',
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
      name: 'polls',
      icon: IconChartBar,
      path: 'frontline/polls',
    },
    {
      name: 'knowledge-base',
      icon: IconBook,
      path: 'frontline/knowledgebase',
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
