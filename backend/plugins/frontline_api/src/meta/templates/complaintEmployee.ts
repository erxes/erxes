import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';

const MESSENGER_TRIGGER = 'frontline:facebook.messages';
const MESSENGER_REPLY = 'frontline:facebook.messages.create';
const TICKET_CREATE = 'frontline:tickets.tickets.create';
const TICKET = 'frontline:tickets.tickets';
const HANDOFF = 'frontline:inbox.handoffs.create';
const TICKET_SLA = 'frontline:tickets.tickets.sla';
const TICKET_STATUS_CHANGED = 'frontline:tickets.tickets.statusChanged';
// Messages a record's customer outside a Messenger run (HUMAN_AGENT within 7 days)
const MESSAGE_CUSTOMER = 'frontline:facebook.customerMessages.create';
const FORM_LINK = 'frontline:form.links.create';
const FORM_SUBMITTED = 'frontline:form.submissions';

const pickFrom = (
  workflow: string | null,
  journey: string,
  order: number,
  path: string,
) =>
  workflow
    ? { target: 'workflow' as const, journey, workflow, order, path }
    : { target: 'step' as const, journey, order, path };

const SYSTEM_PROMPT = `You handle customer complaints in Messenger for this organization.

How you work:
- Acknowledge the problem and apologise once, without blaming the customer.
- One problem is one ticket. When the customer's open tickets include this problem, add to it with add_to_complaint; never file it twice.
- Before filing, know what happened, which order or product, and when. Ask one thing at a time. Ask for a photo when it would show the problem.
- When you know enough, call file_complaint, then tell the customer the ticket number it returns and what happens next.
- Call escalate when the customer asks for a person, is very upset, the problem is about safety or the law, or it falls outside the policy below. Then tell the customer a teammate will continue.
- When a tool fails, do not ask the customer to try again: call escalate and say a teammate will continue.
- Never say a ticket exists, was updated or that a person is coming before the tool says so.
- Offer compensation only as the policy allows. When the customer asks for more than it allows and the case seems fair, call request_compensation with what and why; otherwise say a teammate will review it.
- Set the priority from what is at stake: 4 for safety, the law, money lost or many customers; 3 when the customer cannot use what they bought; 2 for most problems; 1 for minor ones.
- Reply in the customer's language, briefly and warmly.

Compensation policy:
{{ answers.policy }}`;

const textReply = (id: string, agentOrder: number) => ({
  messages: [
    {
      _id: id,
      type: 'text',
      text: `{{ actions.${agentOrder}.text }}`,
      buttons: [],
    },
  ],
});

/**
 * An AI employee that takes complaints on a Facebook page. It talks to the
 * customer itself and uses three workflows as tools: file a ticket, add to
 * the customer's open ticket, and hand the conversation to whoever of the
 * team is available. What each one did comes back to it, so it tells the
 * customer in their own language.
 */
export const complaintEmployeeTemplate: TTemplate = {
  id: 'frontline.complaint-employee',
  version: 8,
  name: 'Complaint employee',
  icon: 'IconHeadphones',
  description:
    'Takes complaints in Messenger: files one owned ticket per problem, keeps the customer posted, escalates missed SLAs, approves compensation and asks for a rating.',
  requirements: [
    {
      key: 'page',
      kind: 'frontline:facebook.bot',
      label: 'Facebook page',
      description:
        'The page whose Messenger conversations this employee answers.',
      fills: [
        { target: 'trigger', journey: 'chat', path: 'botId' },
        // Messages about a complaint go to the same page's conversation
        pickFrom(null, 'chat', 5, 'botId'),
        pickFrom(null, 'chat', 7, 'botId'),
        pickFrom(null, 'status-started', 1, 'botId'),
        pickFrom(null, 'status-resolved', 2, 'botId'),
      ],
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
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who takes over',
      description:
        'The people a conversation is handed to. Whoever of them is available now is assigned, in turns.',
      fills: [
        // Owns new complaints and takes conversations handed over
        pickFrom('file', 'chat', 1, 'candidateIds'),
        pickFrom('escalate', 'chat', 1, 'candidateIds'),
        // The same people are the complaints desk's members
        { target: 'part', part: 'desk', path: 'memberIds' },
      ],
    },
    {
      key: 'fallback',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBER,
      label: 'When nobody is available',
      description:
        'Who takes the conversation when none of them is available, so no complaint waits unowned.',
      fills: [
        pickFrom('file', 'chat', 1, 'fallbackUserId'),
        pickFrom('escalate', 'chat', 1, 'fallbackUserId'),
        pickFrom(null, 'sla-breach', 1, 'fallbackUserId'),
      ],
    },
    {
      key: 'supervisors',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who takes a missed SLA',
      description:
        'When a complaint misses its response or resolution time, whoever of them is available takes it over.',
      fills: [
        pickFrom(null, 'sla-breach', 1, 'candidateIds'),
        pickFrom(null, 'low-rating', 3, 'userIds'),
      ],
    },
    {
      key: 'approvers',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who approves compensation',
      description:
        'Compensation beyond the policy is offered only after one of them approves it.',
      fills: [pickFrom(null, 'chat', 3, 'approverIds')],
    },
    {
      key: 'started',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Message when work starts',
      description:
        'Sent to the customer when their complaint moves to in progress, in your language. {{ trigger.number }} is the ticket number.',
      input: { multiline: true },
      defaultAnswer:
        'We have started working on your complaint #{{ trigger.number }}. We will let you know as soon as it is resolved.',
    },
    {
      key: 'resolved',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Message when resolved',
      description:
        'Sent when the complaint is resolved, followed by a link to rate how it was handled.',
      input: { multiline: true },
      defaultAnswer:
        'Your complaint #{{ trigger.number }} is resolved. Thank you for your patience. How did we do?',
    },
    {
      key: 'policy',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Compensation policy',
      description:
        'What the employee may offer and when, in your words. It becomes part of its instructions.',
      input: { multiline: true },
      defaultAnswer:
        'A damaged or wrong item is replaced or refunded within 7 days of delivery. A late delivery gets an apology and the new date. Anything else goes to a teammate.',
    },
  ],
  parts: [
    {
      key: 'desk',
      type: 'frontline:tickets.pipeline',
      label: 'Ticket desk',
      icon: 'IconTicket',
      defaults: {
        name: 'Complaints',
        description: 'Complaints filed by the Complaint employee.',
        // What the customer is told: C2026-0001, not a timestamp
        numberConfig: 'C{year}-',
        numberSize: '4',
        // Working minutes to first response and to resolution, by priority
        slaPolicy: {
          enabled: true,
          warnBeforeMinutes: 30,
          rules: [
            { priority: 4, firstResponseMinutes: 30, resolutionMinutes: 240 },
            { priority: 3, firstResponseMinutes: 60, resolutionMinutes: 480 },
            { priority: 2, firstResponseMinutes: 240, resolutionMinutes: 1440 },
            { priority: 1, firstResponseMinutes: 480, resolutionMinutes: 2880 },
          ],
        },
      },
    },
    {
      key: 'rating',
      type: 'frontline:forms.rating',
      label: 'Rating form',
      icon: 'IconMoodSmile',
      defaults: {
        name: 'Complaint rating',
        question: 'How well was your complaint handled?',
        commentQuestion: 'Anything we should do better?',
        thanks: 'Thank you for telling us.',
      },
    },
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
      description:
        'Talks to the customer, files or adds to a ticket, or hands over to the team.',
      highlights: [
        { order: 1, label: 'Talk', icon: 'IconMessage' },
        { order: 1, label: 'Ticket', icon: 'IconTicket' },
        { order: 1, label: 'Hand over', icon: 'IconUsersGroup' },
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
                id: 'compensation',
                fieldName: 'compensation',
                prompt:
                  'The compensation asked to be approved, e.g. a refund of 50,000₮ for order 1234.',
                dataType: 'string',
                validation: '',
                options: [],
              },
              {
                id: 'reason',
                fieldName: 'reason',
                prompt: 'Why it is fair, in one sentence.',
                dataType: 'string',
                validation: '',
                options: [],
              },
            ],
            tools: [
              {
                id: 'file_complaint',
                name: 'file_complaint',
                kind: 'helper',
                description:
                  'File a new complaint as a ticket once what happened, which order or product, and when are known. Not for a problem already in an open ticket.',
                memorizeFields: [],
              },
              {
                id: 'add_to_complaint',
                name: 'add_to_complaint',
                kind: 'helper',
                description:
                  "Add new details or photos to the customer's open ticket about the same problem.",
                memorizeFields: [],
              },
              {
                id: 'request_compensation',
                name: 'request_compensation',
                kind: 'handoff',
                description:
                  'Ask a manager to approve compensation beyond the policy, with what is offered and why. The customer hears the decision.',
                memorizeFields: [],
              },
              {
                id: 'escalate',
                name: 'escalate',
                kind: 'helper',
                description:
                  'Hand the conversation to a teammate: the customer asks for a person, is very upset, the problem is about safety or the law, or it is outside the policy.',
                memorizeFields: [],
              },
            ],
          },
          next: 2,
          connects: {
            file_complaint: 'file',
            add_to_complaint: 'add',
            escalate: 'escalate',
            request_compensation: 8,
          },
        },
        {
          order: 2,
          type: MESSENGER_REPLY,
          label: 'Reply',
          config: textReply('reply', 1),
        },
        {
          order: 3,
          type: 'approval',
          label: 'Approve compensation',
          config: {
            approverIds: '',
            summary:
              'Compensation: {{ actions.1.attributes.compensation }}. Why: {{ actions.1.attributes.reason }}',
            timeoutHours: 72,
          },
          next: { approved: 4, rejected: 6 },
        },
        {
          order: 4,
          type: 'aiAgent',
          label: 'Tell it was approved',
          config: {
            aiAgentId: '{{ parts.agent }}',
            goalType: 'generateText',
            input:
              'A manager approved this compensation: {{ actions.1.attributes.compensation }}. Tell the customer what they get and what happens next.',
          },
          next: 5,
        },
        {
          order: 5,
          label: 'Send the approval',
          // A decision may come after Messenger's day: HUMAN_AGENT within a week
          type: MESSAGE_CUSTOMER,
          config: textReply('approved', 4),
        },
        {
          order: 6,
          type: 'aiAgent',
          label: 'Tell it was not approved',
          config: {
            aiAgentId: '{{ parts.agent }}',
            goalType: 'generateText',
            input:
              'The compensation was not approved. Apologise, say a teammate will follow up on the complaint, and promise nothing else.',
          },
          next: 7,
        },
        {
          order: 7,
          label: 'Send the decision',
          type: MESSAGE_CUSTOMER,
          config: textReply('rejected', 6),
        },
        // A decision can take hours: say it was asked before waiting for it
        {
          order: 8,
          type: 'aiAgent',
          label: 'Say it was asked',
          config: {
            aiAgentId: '{{ parts.agent }}',
            goalType: 'generateText',
            input:
              'You asked a manager to approve this compensation: {{ actions.1.attributes.compensation }}. Tell the customer it is being reviewed and you will write back with the decision. Promise nothing.',
          },
          next: 9,
        },
        {
          order: 9,
          type: MESSENGER_REPLY,
          label: 'Send that it was asked',
          config: textReply('asked', 8),
          next: 3,
        },
      ],
      workflows: [
        {
          key: 'file',
          name: 'File a complaint',
          description: 'Creates the ticket and returns its number.',
          inputs: {
            title: '',
            details: '',
            category: '',
            orderReference: '',
            priority: '',
            attachmentIds: '',
          },
          inputHints: {
            // The team reads the ticket in the language the customer wrote in
            title: {
              description:
                "The problem in a few words, in the customer's own language.",
            },
            details: {
              description:
                "What happened, which order or product and when, in the customer's own language.",
            },
            priority: {
              description:
                '4 critical: safety, the law, money lost or many customers. 3 high: the customer cannot use what they bought. 2 medium: most problems. 1 minor.',
              enum: ['1', '2', '3', '4'],
            },
          },
          output: 'Filed as ticket #{{ actions.2.number }}',
          flow: [
            {
              order: 1,
              type: 'pickMember',
              label: 'Pick the owner',
              config: {
                candidateIds: '',
                method: 'roundRobin',
                fallbackUserId: '',
              },
              next: 2,
            },
            {
              order: 2,
              type: TICKET_CREATE,
              label: 'Create the ticket',
              config: {
                name: '{{ input.title }}',
                description:
                  'Category: {{ input.category }}\nOrder: {{ input.orderReference }}\n\n{{ input.details }}',
                attachmentIds: '{{ input.attachmentIds }}',
                priority: '{{ input.priority }}',
                // Every complaint has an owner from the start
                assigneeId: '{{ actions.1.userId }}',
                channelId: '{{ parts.desk.channelId }}',
                pipelineId: '{{ parts.desk.pipelineId }}',
                statusId: '{{ parts.desk.statusId }}',
              },
            },
          ],
        },
        {
          key: 'add',
          name: 'Add to the open ticket',
          description: "Adds details and photos to the customer's open ticket.",
          inputs: { ticketId: '', details: '', attachmentIds: '' },
          // No fixed output: a ticket not found comes back as found: false,
          // so the agent never says it added something it did not
          flow: [
            {
              order: 1,
              type: 'findObject',
              label: 'Find the ticket',
              config: {
                objectType: TICKET,
                lookupField: '_id',
                value: '{{ input.ticketId }}',
              },
              next: { isExists: 2 },
            },
            {
              order: 2,
              type: 'setProperty',
              label: 'Add the details',
              // The ticket found above, not the message that started the run
              target: 1,
              config: {
                module: TICKET,
                setPropertyTarget: {
                  label: 'Ticket',
                  type: TICKET,
                  source: 'target',
                  cardinality: 'one',
                  sourceType: TICKET,
                  pluginName: 'frontline',
                },
                rules: [
                  {
                    field: 'description',
                    fieldLabel: 'Description',
                    operator: 'concat',
                    value: '{{ input.details }}',
                  },
                  {
                    field: 'attachments',
                    fieldLabel: 'Attachments (conversation media)',
                    operator: 'addToSet',
                    value: '{{ input.attachmentIds }}',
                  },
                ],
              },
            },
          ],
        },
        {
          key: 'escalate',
          name: 'Hand over to the team',
          description:
            'Assigns whoever of the team is available and pauses the bot.',
          inputs: { reason: '' },
          output: 'Handed over to a teammate',
          flow: [
            {
              order: 1,
              type: 'pickMember',
              label: 'Pick who is available',
              // Takes turns among the available; the fallback takes it otherwise
              config: {
                candidateIds: '',
                method: 'roundRobin',
                fallbackUserId: '',
              },
              next: 2,
            },
            {
              order: 2,
              type: HANDOFF,
              label: 'Hand over',
              config: { assignTo: '{{ actions.1.userId }}' },
            },
          ],
        },
      ],
    },
    {
      key: 'sla-warning',
      name: 'Complaint employee · SLA warning',
      description:
        "Tells a complaint's owner its response or resolution time is close.",
      trigger: {
        type: TICKET_SLA,
        config: {
          pipelineId: '{{ parts.desk.pipelineId }}',
          events: ['firstResponse.warning', 'resolution.warning'],
        },
      },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Warn the owner',
          config: {
            userIds: '{{ trigger.assigneeId }}',
            title: 'Complaint #{{ trigger.number }} is close to its SLA',
            message: '{{ trigger.name }}',
            priority: 'high',
          },
        },
      ],
    },
    {
      key: 'sla-breach',
      name: 'Complaint employee · SLA missed',
      description:
        'Moves a complaint that missed its time to whoever of the supervisors is available, and tells them and the previous owner.',
      trigger: {
        type: TICKET_SLA,
        config: {
          pipelineId: '{{ parts.desk.pipelineId }}',
          events: ['firstResponse.breached', 'resolution.breached'],
        },
      },
      flow: [
        {
          order: 1,
          type: 'pickMember',
          label: 'Pick a supervisor',
          config: {
            candidateIds: '',
            method: 'roundRobin',
            fallbackUserId: '',
          },
          next: 2,
        },
        {
          order: 2,
          type: 'setProperty',
          label: 'Reassign the complaint',
          config: {
            module: TICKET,
            setPropertyTarget: {
              label: 'Ticket',
              type: TICKET,
              source: 'target',
              cardinality: 'one',
              sourceType: TICKET,
              pluginName: 'frontline',
            },
            rules: [
              {
                field: 'assigneeId',
                fieldLabel: 'Assignee',
                operator: 'set',
                value: '{{ actions.1.userId }}',
              },
            ],
          },
          next: 3,
        },
        {
          order: 3,
          type: 'sendNotification',
          label: 'Tell who now owns it',
          config: {
            // The trigger still names the owner it had before
            userIds: '{{ actions.1.userId }},{{ trigger.assigneeId }}',
            title: 'Complaint #{{ trigger.number }} missed its SLA',
            message: '{{ trigger.name }}',
            priority: 'urgent',
          },
        },
      ],
    },
    {
      key: 'status-started',
      name: 'Complaint employee · Work started',
      description: 'Tells the customer their complaint is being worked on.',
      trigger: {
        type: TICKET_STATUS_CHANGED,
        config: {
          pipelineId: '{{ parts.desk.pipelineId }}',
          toStatusIds: ['{{ parts.desk.inProgressStatusId }}'],
        },
      },
      flow: [
        {
          order: 1,
          type: MESSAGE_CUSTOMER,
          label: 'Tell the customer',
          config: {
            botId: '',
            messages: [
              {
                _id: 'started',
                type: 'text',
                text: '{{ answers.started }}',
                buttons: [],
              },
            ],
          },
        },
      ],
    },
    {
      key: 'status-resolved',
      name: 'Complaint employee · Resolved',
      description:
        'Tells the customer their complaint is resolved and asks them to rate it.',
      trigger: {
        type: TICKET_STATUS_CHANGED,
        config: {
          pipelineId: '{{ parts.desk.pipelineId }}',
          toStatusIds: ['{{ parts.desk.resolvedStatusId }}'],
        },
      },
      flow: [
        {
          order: 1,
          type: FORM_LINK,
          label: 'Make a rating link',
          // The answer is saved as about this ticket
          config: { formId: '{{ parts.rating.formId }}', expiresInDays: 14 },
          next: 2,
        },
        {
          order: 2,
          type: MESSAGE_CUSTOMER,
          label: 'Tell the customer',
          config: {
            botId: '',
            messages: [
              {
                _id: 'resolved',
                type: 'text',
                // The link stays on its own line, whatever the text says
                text: '{{ answers.resolved }}\n{{ actions.1.url }}',
                buttons: [],
              },
            ],
          },
        },
      ],
    },
    {
      key: 'low-rating',
      name: 'Complaint employee · Low rating',
      description:
        'Reopens a complaint rated 1 or 2 and tells the supervisors.',
      trigger: {
        type: FORM_SUBMITTED,
        config: {
          formId: '{{ parts.rating.formId }}',
          conditions: [
            {
              fieldId: '{{ parts.rating.ratingFieldId }}',
              operator: 'numberilt',
              value: '3',
            },
          ],
        },
      },
      flow: [
        {
          order: 1,
          type: 'findObject',
          label: 'Find the rated complaint',
          config: {
            objectType: TICKET,
            lookupField: '_id',
            value: '{{ trigger.aboutRecordId }}',
          },
          next: { isExists: 2 },
        },
        {
          order: 2,
          type: 'setProperty',
          label: 'Reopen it',
          // The ticket found above, not the submission that started the run
          target: 1,
          config: {
            module: TICKET,
            setPropertyTarget: {
              label: 'Ticket',
              type: TICKET,
              source: 'target',
              cardinality: 'one',
              sourceType: TICKET,
              pluginName: 'frontline',
            },
            rules: [
              {
                field: 'statusId',
                fieldLabel: 'Status',
                operator: 'set',
                value: '{{ parts.desk.openStatusId }}',
              },
            ],
          },
          next: 3,
        },
        {
          order: 3,
          type: 'sendNotification',
          label: 'Tell the supervisors',
          config: {
            userIds: '',
            title:
              'Complaint #{{ actions.1.object.number }} was rated low and reopened',
            message: '{{ actions.1.object.name }}',
            priority: 'urgent',
          },
        },
      ],
    },
  ],
};
