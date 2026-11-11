import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';

const MESSENGER_TRIGGER = 'frontline:facebook.messages';
const MESSENGER_REPLY = 'frontline:facebook.messages.create';
const TICKET_CREATE = 'frontline:tickets.tickets.create';
const HANDOFF = 'frontline:inbox.handoffs.create';

const reply = (id: string, text: string) => ({
  messages: [{ _id: id, type: 'text', text, buttons: [] }],
});

const SYSTEM_PROMPT = `You handle customer complaints in Messenger for this organization.
- Acknowledge the problem and apologise once, without blaming the customer.
- Before filing, collect what is needed to act on it: what happened, which order or product, and when. Ask for a photo when it would help. Ask one thing at a time.
- When you have enough, call file_ticket. Never say a ticket exists before it is filed.
- Call escalate when the customer asks for a person, is very upset, or the case falls outside the policy below.
- Offer compensation only as the policy allows; otherwise say a teammate will review it.
- Reply in the customer's language, briefly.

Compensation policy:
{{ answers.policy }}`;

/**
 * An AI employee that takes complaints on a Facebook page: it gathers the
 * facts, files one ticket, and hands the conversation to people when asked.
 */
export const complaintEmployeeTemplate: TTemplate = {
  id: 'frontline.complaint-employee',
  version: 1,
  name: 'Complaint employee',
  icon: 'IconHeadset',
  description:
    'Answers complaints in Messenger, collects the facts, files a ticket and hands over to your team when needed.',
  requirements: [
    {
      key: 'page',
      kind: 'frontline:facebook.bot',
      label: 'Facebook page',
      description:
        'The page whose Messenger conversations this employee answers.',
      fills: [{ target: 'trigger', journey: 'chat', path: 'botId' }],
    },
    {
      key: 'agent',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.AI_AGENT,
      label: 'AI connection',
      description:
        "An existing AI agent; the employee's own agent is created on its connection.",
      fills: [
        {
          target: 'part',
          part: 'agent',
          path: 'connection',
          from: 'connection',
        },
      ],
    },
    {
      key: 'destination',
      kind: 'frontline:tickets.status',
      label: 'Where tickets open',
      description:
        'The channel, pipeline and starting status of filed tickets.',
      fills: [
        {
          target: 'step',
          journey: 'chat',
          order: 3,
          path: 'channelId',
          from: 'channelId',
        },
        {
          target: 'step',
          journey: 'chat',
          order: 3,
          path: 'pipelineId',
          from: 'pipelineId',
        },
        {
          target: 'step',
          journey: 'chat',
          order: 3,
          path: 'statusId',
          from: 'status',
        },
      ],
    },
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who takes over',
      description:
        'Who can take over. Whoever of them is available now is assigned, in turns; when nobody is, the conversation waits in the inbox unassigned.',
      fills: [
        {
          target: 'step',
          journey: 'chat',
          order: 5,
          path: 'candidateIds',
        },
      ],
    },
    {
      key: 'policy',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Compensation policy',
      description:
        'What the employee may offer and when, in your words. It becomes part of its instructions.',
      input: {
        multiline: true,
        placeholder:
          'e.g. A damaged item is replaced or refunded within 7 days of delivery. Anything else goes to a teammate.',
      },
    },
  ],
  parts: [
    {
      key: 'agent',
      type: 'automations:aiAgent',
      defaults: {
        name: 'Complaint employee',
        description: 'Created by the Complaint employee template.',
        context: {
          systemPrompt: SYSTEM_PROMPT,
          lookups: ['core:contacts.customers'],
        },
      },
    },
  ],
  journeys: [
    {
      key: 'chat',
      name: 'Complaint employee · Messenger',
      description: 'Answers, files a ticket or hands over to a person.',
      highlights: [
        { order: 2, label: 'Reply', icon: 'IconMessageCircle' },
        { order: 3, label: 'Ticket', icon: 'IconTicket' },
        { order: 5, label: 'Hand over', icon: 'IconUserShare' },
      ],
      trigger: {
        type: MESSENGER_TRIGGER,
        config: {
          botId: '',
          // A direct condition without keyword rules answers any text
          conditions: [
            { _id: 'direct', type: 'direct', isSelected: true, conditions: [] },
          ],
        },
      },
      flow: [
        {
          order: 1,
          type: 'aiAgent',
          label: 'Complaint employee',
          config: {
            aiAgentId: '{{ parts.agent }}',
            goalType: 'generateText',
            input: '{{ trigger.content }}',
            captureFields: [
              {
                id: 'title',
                fieldName: 'title',
                prompt:
                  "A short title for the complaint, in the customer's words.",
                dataType: 'string',
                validation: '',
                options: [],
              },
            ],
            tools: [
              {
                id: 'file_ticket',
                name: 'file_ticket',
                kind: 'handoff',
                description:
                  'File the complaint once what happened, which order or product, and when are known. Not before.',
                memorizeFields: [],
              },
              {
                id: 'escalate',
                name: 'escalate',
                kind: 'handoff',
                description:
                  'Hand the conversation to a teammate: the customer asks for a person, is very upset, or the case is outside the policy.',
                memorizeFields: [],
              },
            ],
          },
          next: 2,
          connects: { file_ticket: 3, escalate: 5 },
        },
        {
          order: 2,
          type: MESSENGER_REPLY,
          label: 'Reply',
          config: reply('reply', '{{ actions.1.text }}'),
        },
        {
          order: 3,
          type: TICKET_CREATE,
          label: 'File the complaint',
          config: {
            name: '{{ actions.1.attributes.title }}',
            description: '{{ trigger.content }}',
            channelId: '',
            pipelineId: '',
            statusId: '',
          },
          next: 4,
        },
        {
          order: 4,
          type: MESSENGER_REPLY,
          label: 'Tell the ticket number',
          config: reply(
            'filed',
            'Thank you, this is filed as ticket #{{ actions.3.number }}. We will keep you posted here.',
          ),
        },
        {
          order: 5,
          type: 'pickMember',
          label: 'Pick who is available',
          // Takes turns among the chosen people who are available now;
          // nobody available skips, so the handoff waits unassigned
          config: { candidateIds: '', method: 'roundRobin' },
          next: 6,
        },
        {
          order: 6,
          type: HANDOFF,
          label: 'Hand over to the team',
          config: { assignTo: '{{ actions.5.userId }}' },
          next: 7,
        },
        {
          order: 7,
          type: MESSENGER_REPLY,
          label: 'Say a person is coming',
          config: reply(
            'handover',
            'A teammate will continue this conversation shortly.',
          ),
        },
      ],
    },
  ],
};
