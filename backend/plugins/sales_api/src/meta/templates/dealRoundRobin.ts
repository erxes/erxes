import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import {
  DEALS,
  dealField,
  SEGMENT_PART,
  stepFill,
} from './templateHelpers';

const step = stepFill('assign');

/**
 * Hands each new deal nobody owns to the next available member of the team,
 * in turns, and tells them. A deal someone already took is left alone.
 */
export const dealRoundRobinTemplate: TTemplate = {
  id: 'sales.deal-round-robin',
  version: 1,
  name: 'Assign new deals in turns',
  icon: 'IconUsersGroup',
  description:
    'Gives every new unassigned deal to the next available member of your team and tells them.',
  requirements: [
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who takes new deals',
      description: 'They take turns; anyone unavailable is skipped.',
      fills: [step(3, 'candidateIds')],
    },
    {
      key: 'fallback',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBER,
      label: 'When nobody is available',
      description: 'Who takes the deal then, so none is left unowned.',
      fills: [step(3, 'fallbackUserId')],
    },
  ],
  parts: [
    {
      key: 'active',
      type: SEGMENT_PART,
      label: 'Segment',
      icon: 'IconFilter',
      defaults: {
        name: 'Active deals added today',
        contentType: DEALS,
        root: {
          kind: 'group',
          conjunction: 'and',
          // The day they were added, so existing deals are left alone
          children: [
            dealField('status', 'e', 'active'),
            dealField('createdAt', 'woad', 0),
          ],
        },
      },
    },
  ],
  journeys: [
    {
      key: 'assign',
      name: 'Assign new deals in turns',
      description:
        'Assigns a new deal without an owner to the next available team member.',
      // A segment trigger runs once per deal
      trigger: { type: DEALS, config: { contentId: '{{ parts.active }}' } },
      flow: [
        {
          order: 1,
          type: 'transform',
          label: 'Read who is on it',
          // A split compares a step's output, not the record itself
          config: {
            mappings: [
              { key: 'owners', value: '{{ trigger.assignedUserIds }}' },
            ],
          },
          next: 2,
        },
        {
          order: 2,
          type: 'split',
          label: 'Nobody on it yet?',
          target: 1,
          config: {
            options: [
              {
                id: 'unassigned',
                label: 'No assigned member',
                config: {
                  conditions: [
                    { propertyName: 'owners', propertyOperator: 'ins' },
                  ],
                },
              },
            ],
          },
          connects: { unassigned: 3 },
        },
        {
          order: 3,
          type: 'pickMember',
          label: 'Pick who is next',
          config: { candidateIds: '', method: 'roundRobin', fallbackUserId: '' },
          next: 4,
        },
        {
          order: 4,
          type: 'setProperty',
          label: 'Assign the deal',
          config: {
            module: DEALS,
            setPropertyTarget: {
              label: 'Deal',
              type: DEALS,
              source: 'target',
              cardinality: 'one',
              sourceType: DEALS,
              pluginName: 'sales',
              value: DEALS,
              description: 'Deal',
            },
            rules: [
              {
                field: 'assignedUserIds',
                fieldLabel: 'Assigned users',
                operator: 'set',
                value: '{{ actions.3.userId }}',
              },
            ],
          },
          next: 5,
        },
        {
          order: 5,
          type: 'sendNotification',
          label: 'Tell them',
          config: {
            userIds: '{{ actions.3.userId }}',
            title: 'New deal for you: #{{ trigger.number }} "{{ trigger.name }}"',
            message: 'You were assigned this deal in turn.',
            priority: 'medium',
          },
        },
      ],
    },
  ],
};
