import {
  AutomationConstants,
  AUTOMATION_CORE_ACTIONS,
  AUTOMATION_CORE_TRIGGER_TYPES,
  AUTOMATION_EMAIL_RECIPIENTS_TYPES,
  TAutomationActionFolks,
} from 'erxes-api-shared/core-modules';
import {
  AI_AGENT_ACTION_OUTPUT,
  FIND_OBJECT_ACTION_OUTPUT,
  OUTGOING_WEBHOOK_ACTION_OUTPUT,
  SEND_EMAIL_ACTION_OUTPUT,
} from './actionOutputs';
import { CORE_FIND_OBJECT_TARGETS_CONST } from './findObjectTargets';
import {
  COMPANY_TRIGGER_OUTPUT,
  CUSTOMER_TRIGGER_OUTPUT,
  LEAD_TRIGGER_OUTPUT,
  TEAM_MEMBER_TRIGGER_OUTPUT,
  WEBHOOK_TRIGGER_OUTPUT,
} from './triggerOutputs';

export const coreAutomationConstants: AutomationConstants = {
  findObjectTargets: CORE_FIND_OBJECT_TARGETS_CONST,
  triggers: [
    {
      type: AUTOMATION_CORE_TRIGGER_TYPES.INCOMING_WEBHOOK,
      moduleName: 'webhooks',
      collectionName: 'incoming',
      icon: 'IconWebhook',
      label: 'Incoming Webhook',
      description:
        'Trigger automation workflows when external systems send HTTP requests to your webhook endpoint',
      isCustom: true,
      output: WEBHOOK_TRIGGER_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_TRIGGER_TYPES.USER,
      moduleName: 'organization',
      collectionName: 'users',
      icon: 'IconUsers',
      label: 'Team member',
      description:
        'Start with a blank workflow that enrolls and is triggered off team members',
      output: TEAM_MEMBER_TRIGGER_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_TRIGGER_TYPES.CUSTOMER,
      moduleName: 'contacts',
      collectionName: 'customers',
      icon: 'IconUsersGroup',
      label: 'Customer',
      description:
        'Start with a blank workflow that enrolls and is triggered off Customers',
      output: CUSTOMER_TRIGGER_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_TRIGGER_TYPES.LEAD,
      moduleName: 'contacts',
      collectionName: 'leads',
      icon: 'IconUsersGroup',
      label: 'Lead',
      description:
        'Start with a blank workflow that enrolls and is triggered off Leads',
      output: LEAD_TRIGGER_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_TRIGGER_TYPES.COMPANY,
      moduleName: 'contacts',
      collectionName: 'companies',
      icon: 'IconBuilding',
      label: 'Company',
      description:
        'Start with a blank workflow that enrolls and is triggered off company',
      output: COMPANY_TRIGGER_OUTPUT,
    },
  ],
  actions: [
    {
      type: AUTOMATION_CORE_ACTIONS.OUTGOING_WEBHOOK,
      moduleName: 'automation',
      collectionName: 'outgoingWebhook',
      icon: 'IconWebhook',
      label: 'Outgoing webhook',
      description: 'Outgoing webhook',
      allowTargetFromActions: true,
      output: OUTGOING_WEBHOOK_ACTION_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.IF,
      moduleName: 'automation',
      collectionName: 'branch',
      icon: 'IconSitemap',
      label: 'Branches',
      description: 'Create simple or if/then branches',
      folks: [
        { key: 'yes', label: 'Yes', type: TAutomationActionFolks.SUCCESS },
        { key: 'no', label: 'No', type: TAutomationActionFolks.ERROR },
      ],
    },
    {
      type: AUTOMATION_CORE_ACTIONS.FIND_OBJECT,
      moduleName: 'automation',
      collectionName: 'findObject',
      icon: 'IconSearch',
      label: 'Find object',
      description: 'Find object',
      folks: [
        {
          key: 'isExists',
          label: 'Found',
          type: TAutomationActionFolks.SUCCESS,
        },
        {
          key: 'notExists',
          label: 'Not Found',
          type: TAutomationActionFolks.ERROR,
        },
      ],
      isTargetSource: true,
      output: FIND_OBJECT_ACTION_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.SET_PROPERTY,
      moduleName: 'automation',
      collectionName: 'setProperty',
      icon: 'IconFlask',
      label: 'Manage properties',
      description: 'Update record properties.',
      allowTargetFromActions: true,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.DELAY,
      moduleName: 'automation',
      collectionName: 'delay',
      icon: 'IconHourglass',
      label: 'Delay',
      description: 'Delay the next action.',
    },
    {
      type: AUTOMATION_CORE_ACTIONS.SEND_EMAIL,
      moduleName: 'automation',
      collectionName: 'sendEmail',
      icon: 'IconMailFast',
      label: 'Send Email',
      description: 'Send Email',
      emailRecipientsConst: AUTOMATION_EMAIL_RECIPIENTS_TYPES,
      allowTargetFromActions: true,
      output: SEND_EMAIL_ACTION_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.WAIT_EVENT,
      moduleName: 'automation',
      collectionName: 'waitEvent',
      icon: 'IconClockPlay',
      label: 'Wait event',
      description: 'Delay until event is triggered',
    },
    {
      type: AUTOMATION_CORE_ACTIONS.AI_AGENT,
      moduleName: 'automation',
      collectionName: 'aiAgent',
      icon: 'IconAi',
      label: 'AI Agent',
      description:
        'Use a configured AI agent to generate text, route topics, or classify structured data.',
      output: AI_AGENT_ACTION_OUTPUT,
    },
  ],
};
