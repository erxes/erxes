import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
  TTemplateFill,
} from 'erxes-api-shared/core-modules';

const TICKET_SLA = 'frontline:tickets.tickets.sla';

const step = (order: number, path: string): TTemplateFill => ({
  target: 'step',
  journey: 'breached',
  order,
  path,
});

/**
 * Escalates a ticket that missed its pipeline's SLA: the first response or
 * the resolution time. The times come from each pipeline's SLA policy.
 */
export const slaBreachTemplate: TTemplate = {
  id: 'frontline.sla-breach',
  version: 1,
  name: 'Escalate SLA breaches',
  icon: 'IconAlarm',
  description:
    'Tells a lead and the assignee when a ticket misses its first response or resolution time.',
  requirements: [
    {
      key: 'leads',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who hears about a breach',
      description: 'Told at once, besides whoever the ticket is assigned to.',
      fills: [step(1, 'userIds')],
    },
  ],
  parts: [],
  journeys: [
    {
      key: 'breached',
      name: 'Escalate SLA breaches',
      description:
        'Notifies the leads and the assignee when a ticket breaches its SLA, in any pipeline.',
      trigger: {
        type: TICKET_SLA,
        config: { events: ['firstResponse.breached', 'resolution.breached'] },
      },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Tell the leads',
          config: {
            userIds: '',
            title: 'Ticket #{{ trigger.number }} "{{ trigger.name }}" missed its SLA',
            message: 'It needs attention now.',
            priority: 'urgent',
          },
          next: 2,
        },
        {
          order: 2,
          type: 'sendNotification',
          label: 'Tell the assignee',
          config: {
            userIds: '{{ trigger.assigneeId }}',
            title: 'Ticket #{{ trigger.number }} "{{ trigger.name }}" missed its SLA',
            message: 'Your lead has been told.',
            priority: 'urgent',
          },
        },
      ],
    },
  ],
};
