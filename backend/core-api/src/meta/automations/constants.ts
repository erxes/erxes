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
  MESSAGE_PRO_ACTION_OUTPUT,
  OUTGOING_WEBHOOK_ACTION_OUTPUT,
  SEND_EMAIL_ACTION_OUTPUT,
  TRANSFORM_ACTION_OUTPUT,
} from './actionOutputs';
import { CORE_FIND_OBJECT_TARGETS_CONST } from './findObjectTargets';
import {
  COMPANY_TRIGGER_OUTPUT,
  CUSTOMER_TRIGGER_OUTPUT,
  LEAD_TRIGGER_OUTPUT,
  TEAM_MEMBER_TRIGGER_OUTPUT,
  WEBHOOK_TRIGGER_OUTPUT,
} from './triggerOutputs';

const CORE_ACTION_GROUPS = {
  LOGIC_AND_DECISIONS: 'Logic & Decisions',
  DATA_OPERATIONS: 'Data Operations',
  COMMUNICATION_AND_INTEGRATIONS: 'Communication & Integrations',
  TIMING_AND_DELAYS: 'Timing & Delays',
};

export const CORE_AUTOMATION_CONSTANTS: AutomationConstants = {
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
      setPropertyTargets: [
        {
          label: 'Team member',
          type: AUTOMATION_CORE_TRIGGER_TYPES.USER,
          source: 'target',
          cardinality: 'one',
        },
      ],
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
      setPropertyTargets: [
        {
          label: 'Customer',
          type: AUTOMATION_CORE_TRIGGER_TYPES.CUSTOMER,
          source: 'target',
          cardinality: 'one',
        },
      ],
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
      setPropertyTargets: [
        {
          label: 'Lead',
          type: AUTOMATION_CORE_TRIGGER_TYPES.LEAD,
          source: 'target',
          cardinality: 'one',
        },
      ],
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
      setPropertyTargets: [
        {
          label: 'Company',
          type: AUTOMATION_CORE_TRIGGER_TYPES.COMPANY,
          source: 'target',
          cardinality: 'one',
        },
      ],
    },
  ],
  actions: [
    // Logic & Decisions
    {
      type: AUTOMATION_CORE_ACTIONS.IF,
      icon: 'IconSitemap',
      label: 'Branches',
      description: 'Create simple or if/then branches',
      group: CORE_ACTION_GROUPS.LOGIC_AND_DECISIONS,
      folks: [
        { key: 'yes', label: 'Yes', type: TAutomationActionFolks.SUCCESS },
        { key: 'no', label: 'No', type: TAutomationActionFolks.ERROR },
      ],
    },
    {
      type: AUTOMATION_CORE_ACTIONS.SPLIT,
      icon: 'IconArrowsSplit',
      label: 'Split',
      description:
        'Create conditional branches to route workflows based on criteria',
      group: CORE_ACTION_GROUPS.LOGIC_AND_DECISIONS,
      allowTargetFromActions: true,
    },
    // Data Operations
    {
      type: AUTOMATION_CORE_ACTIONS.FIND_OBJECT,
      icon: 'IconSearch',
      label: 'Find object',
      description: 'Find object',
      group: CORE_ACTION_GROUPS.DATA_OPERATIONS,
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
      type: AUTOMATION_CORE_ACTIONS.TRANSFORM,
      icon: 'IconArrowMerge',
      label: 'Transform',
      description:
        'Create structured data from trigger or previous action output.',
      group: CORE_ACTION_GROUPS.DATA_OPERATIONS,
      allowTargetFromActions: true,
      output: TRANSFORM_ACTION_OUTPUT,
      isTargetSource: true,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.SET_PROPERTY,
      icon: 'IconFlask',
      label: 'Manage properties',
      description: 'Update record properties.',
      group: CORE_ACTION_GROUPS.DATA_OPERATIONS,
      allowTargetFromActions: true,
    },
    // Communication & Integrations
    {
      type: AUTOMATION_CORE_ACTIONS.SEND_EMAIL,
      icon: 'IconMailFast',
      label: 'Send Email',
      description: 'Send Email',
      group: CORE_ACTION_GROUPS.COMMUNICATION_AND_INTEGRATIONS,
      emailRecipientsConst: AUTOMATION_EMAIL_RECIPIENTS_TYPES,
      allowTargetFromActions: true,
      output: SEND_EMAIL_ACTION_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.OUTGOING_WEBHOOK,
      icon: 'IconWebhook',
      label: 'Outgoing webhook',
      description: 'Outgoing webhook',
      group: CORE_ACTION_GROUPS.COMMUNICATION_AND_INTEGRATIONS,
      allowTargetFromActions: true,
      output: OUTGOING_WEBHOOK_ACTION_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.MESSAGE_PRO,
      icon: 'IconFileText',
      label: 'Message Pro',
      description: 'Render a selected document with the target record.',
      group: CORE_ACTION_GROUPS.COMMUNICATION_AND_INTEGRATIONS,
      allowTargetFromActions: true,
      output: MESSAGE_PRO_ACTION_OUTPUT,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.AI_AGENT,
      icon: 'IconBrain',
      label: 'AI Agent',
      description:
        'Use a configured AI agent to generate text, route topics, or classify structured data.',
      group: CORE_ACTION_GROUPS.COMMUNICATION_AND_INTEGRATIONS,
      output: AI_AGENT_ACTION_OUTPUT,
    },
    // Timing & Delays
    {
      type: AUTOMATION_CORE_ACTIONS.DELAY,
      moduleName: 'automation',
      collectionName: 'delay',
      icon: 'IconHourglass',
      label: 'Delay',
      description: 'Delay the next action.',
      group: CORE_ACTION_GROUPS.TIMING_AND_DELAYS,
    },
    {
      type: AUTOMATION_CORE_ACTIONS.WAIT_EVENT,
      moduleName: 'automation',
      collectionName: 'waitEvent',
      icon: 'IconClockPlay',
      label: 'Wait event',
      description: 'Delay until event is triggered',
      group: CORE_ACTION_GROUPS.TIMING_AND_DELAYS,
    },
  ],
};
