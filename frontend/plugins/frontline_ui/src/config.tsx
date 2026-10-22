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
  navigationGroup: {
    name: 'frontline',
    defaultPath: 'frontline/inbox',
    icon: IconStackFront,
  },
  widgets: {
    // A customer's / company's tickets and conversations on their overview
    // (`./contactWidget`).
    contactWidgets: [
      { name: 'ticket', label: 'Tickets', icon: IconTicket },
      { name: 'conversation', label: 'Conversations', icon: IconMail },
    ],
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
      name: 'personal-channel',
      icon: IconMail,
      path: 'frontline/settings/personal-channel',
    },
    {
      name: 'channels',
      icon: IconMail,
      path: 'frontline/settings/channels',
    },
    {
      name: 'integrations-config',
      icon: IconSettings,
      path: 'frontline/settings/config',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
