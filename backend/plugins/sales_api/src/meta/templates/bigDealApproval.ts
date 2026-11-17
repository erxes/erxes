import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import {
  DEALS,
  dealField,
  OPEN_DEAL_CONDITIONS,
  SEGMENT_MEMBERSHIP,
  SEGMENT_PART,
  stepFill,
} from './templateHelpers';

const step = stepFill('approve');

/**
 * Asks a manager to approve a deal once its total reaches a limit, and tells
 * the people on the deal what was decided. The limit sits in the segment, so
 * a deal is asked about when it crosses it, whenever that happens.
 */
export const bigDealApprovalTemplate: TTemplate = {
  id: 'sales.big-deal-approval',
  version: 1,
  name: 'Approve big deals',
  icon: 'IconShieldCheck',
  description:
    'Asks a manager to approve a deal when its total reaches your limit, then tells the deal owners the decision.',
  requirements: [
    {
      key: 'limit',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'From what total a deal needs approval',
      description: 'A number in your currency, e.g. 10000000.',
      input: { placeholder: '10000000' },
      fills: [
        // The total condition, after the open-deal conditions
        {
          target: 'part',
          part: 'big',
          path: 'root.children.3.value',
        },
      ],
    },
    {
      key: 'approvers',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who approves',
      description: 'The first decision among them counts.',
      fills: [step(1, 'approverIds')],
    },
  ],
  parts: [
    {
      key: 'big',
      type: SEGMENT_PART,
      label: 'Segment',
      icon: 'IconFilter',
      defaults: {
        name: 'Open deals at or above the approval limit',
        contentType: DEALS,
        root: {
          kind: 'group',
          conjunction: 'and',
          children: [
            ...OPEN_DEAL_CONDITIONS,
            dealField('totalAmount', 'numberigt', ''),
          ],
        },
      },
    },
  ],
  journeys: [
    {
      key: 'approve',
      name: 'Approve big deals',
      description:
        'Asks for approval when a deal reaches the limit and tells its owners the decision.',
      // Asked once per deal, the first time it crosses the limit
      trigger: {
        type: DEALS,
        config: {
          event: SEGMENT_MEMBERSHIP,
          segmentId: '{{ parts.big }}',
          once: true,
        },
      },
      flow: [
        {
          order: 1,
          type: 'approval',
          label: 'Ask for approval',
          config: {
            approverIds: '',
            summary:
              'Deal #{{ trigger.number }} "{{ trigger.name }}" reached {{ trigger.totalAmount }}',
            timeoutHours: 72,
          },
          next: { approved: 2, rejected: 3 },
        },
        {
          order: 2,
          type: 'sendNotification',
          label: 'Tell the owners: approved',
          config: {
            userIds: '{{ trigger.assignedUserIds }}',
            title: 'Deal #{{ trigger.number }} "{{ trigger.name }}" is approved',
            message: 'You can go ahead.',
            priority: 'medium',
          },
        },
        {
          order: 3,
          type: 'sendNotification',
          label: 'Tell the owners: not approved',
          config: {
            userIds: '{{ trigger.assignedUserIds }}',
            title:
              'Deal #{{ trigger.number }} "{{ trigger.name }}" was not approved',
            message: 'It was rejected or nobody decided in time.',
            priority: 'high',
          },
        },
      ],
    },
  ],
};
