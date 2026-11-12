import type { AutomationDefinition } from '@erxes/core-contract';

/** Ready-made automations to start from (Automations › New › From a template). */
export const AUTOMATION_TEMPLATES: { id: string; name: string; description: string; definition: AutomationDefinition }[] = [
  {
    id: 'welcome',
    name: 'Welcome new customers',
    description: 'Email every new customer that has an email address, then tell their owner.',
    definition: {
      trigger: { kind: 'event', event: 'core.customer.created', conditions: { match: 'all', rules: [{ path: 'subject.primaryEmail', op: 'exists' }] } },
      steps: [
        {
          id: 'email',
          type: 'action',
          action: 'core.email.send',
          input: { to: 'subject', subject: 'Welcome, {{subject.firstName | default: "friend"}}!', body: 'Thanks for joining us.' },
        },
        { id: 'tell', type: 'action', action: 'core.notification.send', input: { owner: true, title: 'New customer: {{subject.firstName}} {{subject.lastName}}' } },
      ],
      reentry: 'once',
    },
  },
  {
    id: 'lead-follow-up',
    name: 'Follow up on leads',
    description: 'Assign new leads round-robin; if nothing changes in 3 days, remind the owner.',
    definition: {
      trigger: { kind: 'event', event: 'core.customer.created', conditions: { match: 'all', rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }] } },
      steps: [
        { id: 'assign', type: 'action', action: 'core.customer.assign', input: { userIds: [] } },
        { id: 'wait', type: 'wait_for', event: 'core.customer.updated', amount: 3, unit: 'days' },
        {
          id: 'check',
          type: 'branch',
          conditions: { match: 'all', rules: [{ path: 'steps.wait.output.matched', op: 'eq', value: false }] },
          then: [{ id: 'remind', type: 'action', action: 'core.notification.send', input: { owner: true, title: 'Lead {{subject.firstName}} is waiting for you' } }],
          else: [],
        },
      ],
      reentry: 'once',
      goal: { match: 'all', rules: [{ path: 'subject.state', op: 'eq', value: 'customer' }] },
    },
  },
  {
    id: 'birthday',
    name: 'Birthday greetings',
    description: 'Every year on the customer’s birthday at 10:00, send them an email.',
    definition: {
      trigger: { kind: 'date', subject: 'customer', field: 'birthDate', offsetDays: 0, yearly: true, at: '10:00', timezone: 'Asia/Ulaanbaatar' },
      steps: [{ id: 'email', type: 'action', action: 'core.email.send', input: { to: 'subject', subject: 'Happy birthday, {{subject.firstName}}!', body: 'All the best from all of us.' } }],
      reentry: 'daily',
    },
  },
  {
    id: 'weekly-digest',
    name: 'Weekly lead review',
    description: 'Every Monday at 9:00, tag leads older than a week for review.',
    definition: {
      trigger: {
        kind: 'schedule',
        every: 'week',
        weekdays: [1],
        at: '09:00',
        timezone: 'Asia/Ulaanbaatar',
        audience: { type: 'customer', conditions: { match: 'all', rules: [{ path: 'subject.state', op: 'eq', value: 'lead' }] } },
      },
      steps: [{ id: 'note', type: 'action', action: 'core.note.add', input: { body: 'Still a lead on {{now | date: "YYYY-MM-DD"}}: worth a call?' } }],
      reentry: 'always',
    },
  },
  {
    id: 'vip-split',
    name: 'Test two welcome messages',
    description: 'Half the new customers get one email, half the other (A/B).',
    definition: {
      trigger: { kind: 'event', event: 'core.customer.created', conditions: { match: 'all', rules: [{ path: 'subject.primaryEmail', op: 'exists' }] } },
      steps: [
        {
          id: 'ab',
          type: 'split',
          paths: [
            { label: 'A', weight: 50, steps: [{ id: 'a', type: 'action', action: 'core.email.send', input: { to: 'subject', subject: 'Welcome!', body: 'Version A' } }] },
            { label: 'B', weight: 50, steps: [{ id: 'b', type: 'action', action: 'core.email.send', input: { to: 'subject', subject: 'Glad you are here', body: 'Version B' } }] },
          ],
        },
      ],
      reentry: 'once',
    },
  },
  {
    id: 'paid',
    name: 'Thank customers for payments',
    description: 'When an invoice is paid, tell the team and send the data to your accounting system.',
    definition: {
      trigger: { kind: 'event', event: 'core.payment.paid' },
      steps: [
        { id: 'tell', type: 'action', action: 'core.notification.send', input: { userIds: [], title: 'Paid: {{event.payload.amount | number}} for {{event.payload.reference.id}}' } },
        { id: 'post', type: 'action', action: 'core.webhook.post', input: { url: 'https://example.com/accounting' } },
      ],
      reentry: 'always',
    },
  },
];
