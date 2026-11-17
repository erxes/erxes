import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';

const TICKETS = 'frontline:tickets.tickets';
// Priorities: 1 minor, 2 medium, 3 high, 4 critical
const HIGH = 3;

/**
 * Tells the team about a high or critical ticket the moment it is, whether
 * it came in that way or was raised later; once per ticket.
 */
export const urgentTicketTemplate: TTemplate = {
  id: 'frontline.urgent-ticket',
  version: 1,
  name: 'Alert on urgent tickets',
  icon: 'IconUrgent',
  description:
    'Tells your team at once when a ticket is high or critical priority.',
  requirements: [
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who to alert',
      description: 'Told once per ticket, when it first becomes urgent.',
      fills: [
        { target: 'step', journey: 'urgent', order: 1, path: 'userIds' },
      ],
    },
  ],
  parts: [
    {
      key: 'urgent',
      type: 'core:segments.segment',
      label: 'Segment',
      icon: 'IconFilter',
      defaults: {
        name: 'High or critical tickets',
        contentType: TICKETS,
        root: {
          kind: 'group',
          conjunction: 'and',
          children: [
            {
              kind: 'field',
              contentType: TICKETS,
              fieldKey: 'priority',
              operator: 'numberigt',
              value: HIGH,
            },
          ],
        },
      },
    },
  ],
  journeys: [
    {
      key: 'urgent',
      name: 'Alert on urgent tickets',
      description: 'Notifies the team when a ticket becomes high or critical.',
      // A segment trigger runs once per ticket: the first time it matches
      trigger: { type: TICKETS, config: { contentId: '{{ parts.urgent }}' } },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Alert the team',
          config: {
            userIds: '',
            title: 'Urgent ticket #{{ trigger.number }} "{{ trigger.name }}"',
            message: 'Priority {{ trigger.priority }} of 4.',
            priority: 'urgent',
          },
        },
      ],
    },
  ],
};
