import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';

// Messenger steps belong to frontline; without it the template is hidden
const MESSENGER_TRIGGER = 'frontline:facebook.messages';
const MESSENGER_REPLY = 'frontline:facebook.messages.create';
const HANDOFF = 'frontline:inbox.handoffs.create';
const POS_ORDER_CREATE = 'sales:pos.orders.create';
const POS_ORDER = 'sales:pos.orders';

const reply = (id: string, text: string) => ({
  messages: [{ _id: id, type: 'text', text, buttons: [] }],
});

const SYSTEM_PROMPT = `You sell this organization's products in Messenger.
- Find out what the customer needs, then suggest products from the knowledge. Look up a product's price and stock by its code before quoting either; never guess them.
- Before ordering, repeat the products, counts and total and ask the customer to confirm.
- When the customer confirms, call order. Never say an order exists before it is made.
- Call escalate when the customer asks for a person, wants a large or unusual order, or asks for more than the offer rules allow.
- The customer can ask about their own orders and loyalty points; look them up.
- Reply in the customer's language, briefly.

Offer rules:
{{ answers.offer }}`;

/**
 * An AI employee that sells on a Facebook page: it answers from the product
 * knowledge, makes a POS order with a payment link, reminds once when it is
 * not paid, and hands the conversation to people when asked.
 */
export const salesEmployeeTemplate: TTemplate = {
  id: 'sales.sales-employee',
  version: 1,
  name: 'Sales employee',
  icon: 'IconShoppingBag',
  description:
    'Sells in Messenger: answers with live prices and stock, makes a POS order with a payment link, reminds when unpaid and hands over to your team.',
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
      key: 'pos',
      kind: 'sales:pos.pos',
      label: 'POS',
      description: 'The POS orders are made in; its products and prices apply.',
      fills: [{ target: 'step', journey: 'chat', order: 3, path: 'posId' }],
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
          order: 9,
          path: 'candidateIds',
        },
      ],
    },
    {
      key: 'offer',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Offer rules',
      description:
        'What the employee may offer, such as the largest discount, in your words. It becomes part of its instructions.',
      input: {
        multiline: true,
        placeholder:
          'e.g. No discounts. Free delivery above 100,000₮. Orders above 1,000,000₮ go to a teammate.',
      },
    },
  ],
  parts: [
    {
      key: 'agent',
      type: 'automations:aiAgent',
      defaults: {
        name: 'Sales employee',
        description: 'Created by the Sales employee template.',
        context: {
          systemPrompt: SYSTEM_PROMPT,
          lookups: [
            'core:products.products',
            'core:contacts.customers',
            POS_ORDER,
            'loyalty:score.accounts',
          ],
        },
      },
    },
  ],
  journeys: [
    {
      key: 'chat',
      name: 'Sales employee · Messenger',
      description:
        'Answers, makes an order with a payment link and reminds when unpaid, or hands over to a person.',
      highlights: [
        { order: 2, label: 'Reply', icon: 'IconMessageCircle' },
        { order: 3, label: 'Order', icon: 'IconShoppingCart' },
        { order: 9, label: 'Hand over', icon: 'IconUserShare' },
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
          label: 'Sales employee',
          config: {
            aiAgentId: '{{ parts.agent }}',
            goalType: 'generateText',
            input: '{{ trigger.content }}',
            captureFields: [
              {
                id: 'items',
                fieldName: 'items',
                prompt:
                  'The confirmed order lines as JSON: [{"code": product code, "count": number}]. Codes come from the knowledge or the product lookup.',
                dataType: 'string',
                validation: '',
                options: [],
              },
            ],
            tools: [
              {
                id: 'order',
                name: 'order',
                kind: 'handoff',
                description:
                  'Make the order once the customer has confirmed the products and counts. Not before.',
                memorizeFields: [],
              },
              {
                id: 'escalate',
                name: 'escalate',
                kind: 'handoff',
                description:
                  'Hand the conversation to a teammate: the customer asks for a person, wants a large or unusual order, or asks for more than the offer rules allow.',
                memorizeFields: [],
              },
            ],
          },
          next: 2,
          connects: { order: 3, escalate: 9 },
        },
        {
          order: 2,
          type: MESSENGER_REPLY,
          label: 'Reply',
          config: reply('reply', '{{ actions.1.text }}'),
        },
        {
          order: 3,
          type: POS_ORDER_CREATE,
          label: 'Make the order',
          config: {
            posId: '',
            items: '{{ actions.1.attributes.items }}',
            customerId: '{{ trigger.customerId }}',
            description: 'Ordered in Messenger',
          },
          next: 4,
        },
        {
          order: 4,
          type: MESSENGER_REPLY,
          label: 'Send the payment link',
          config: reply(
            'payment',
            'Your order #{{ actions.3.number }} is ready. Pay here: {{ actions.3.onlinePaymentUrl }}',
          ),
          next: 5,
        },
        {
          order: 5,
          type: 'delay',
          label: 'Wait 2 hours',
          config: { value: 2, type: 'hour' },
          next: 6,
        },
        {
          order: 6,
          type: 'findObject',
          label: 'Read the order again',
          config: {
            objectType: POS_ORDER,
            lookupField: '_id',
            value: '{{ actions.3.orderId }}',
          },
          next: { isExists: 7 },
        },
        {
          order: 7,
          type: 'split',
          label: 'Paid?',
          target: 6,
          config: {
            options: [
              {
                id: 'paid',
                label: 'Paid',
                config: {
                  conditionsConjunction: 'and',
                  conditions: [
                    { propertyName: 'object.paidDate', propertyOperator: 'is' },
                  ],
                },
              },
            ],
          },
          // Paid ends the run; otherwise one reminder
          connects: { fallback: 8 },
        },
        {
          order: 8,
          type: MESSENGER_REPLY,
          label: 'Remind to pay',
          config: reply(
            'reminder',
            'A reminder: order #{{ actions.3.number }} is still waiting for payment: {{ actions.3.onlinePaymentUrl }}',
          ),
        },
        {
          order: 9,
          type: 'pickMember',
          label: 'Pick who is available',
          // Takes turns among the chosen people who are available now;
          // nobody available skips, so the handoff waits unassigned
          config: { candidateIds: '', method: 'roundRobin' },
          next: 10,
        },
        {
          order: 10,
          type: HANDOFF,
          label: 'Hand over to the team',
          config: { assignTo: '{{ actions.9.userId }}' },
          next: 11,
        },
        {
          order: 11,
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
