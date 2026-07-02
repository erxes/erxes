import {
  IconMail,
  IconStackFront,
  IconTicket,
  IconBook,
} from '@tabler/icons-react';
import { IUIConfig, TActivityRowProps, TPropertyInputProps } from 'erxes-ui';
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
  import('./modules/ticket/components/ticket-selects/TicketStatusPropertyInput').then(
    (module) => ({
      default: module.TicketStatusPropertyInput,
    }),
  ),
);

const FormSubmissionActivityRow = lazy(() =>
  import('./widgets/activity/FormSubmissionActivityRow').then((module) => ({
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
      name: 'ticket',
      path: 'frontline/ticket',
    },
    {
      name: 'knowledgeBase',
      icon: IconBook,
      path: 'frontline/knowledgebase',
    },
  ],
};
