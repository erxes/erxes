import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
  TTemplateFill,
} from 'erxes-api-shared/core-modules';

// Messenger steps belong to frontline; without it the template is hidden
const MESSENGER_TRIGGER = 'frontline:facebook.messages';
const MESSENGER_REPLY = 'frontline:facebook.messages.create';
// Messages the customer outside a Messenger run (HUMAN_AGENT within 7 days)
const MESSAGE_CUSTOMER = 'frontline:facebook.customerMessages.create';
const HANDOFF = 'frontline:inbox.handoffs.create';
const POS_ORDER_CREATE = 'sales:pos.orders.create';
const POS_ORDER = 'sales:pos.orders';
const POS_ORDER_EVENT = 'sales:pos.orders.event';
const FORM_LINK = 'frontline:form.links.create';
const FORM_SUBMITTED = 'frontline:form.submissions';

const customerText = (id: string, text: string) => ({
  botId: '',
  messages: [{ _id: id, type: 'text', text, buttons: [] }],
});

// Orders the chat makes are delivery orders; a till sale is not chased
const orderField = (fieldKey: string, operator: string, value?: string) => ({
  kind: 'field',
  contentType: POS_ORDER,
  fieldKey,
  operator,
  ...(value === undefined ? {} : { value }),
});

const journeyStep = (
  journey: string,
  order: number,
  path: string,
): TTemplateFill => ({ target: 'step', journey, order, path });

const workflowStep = (
  workflow: string,
  order: number,
  path: string,
): TTemplateFill => ({
  target: 'workflow',
  journey: 'chat',
  workflow,
  order,
  path,
});

const step = (order: number, path: string): TTemplateFill => ({
  target: 'step',
  journey: 'chat',
  order,
  path,
});

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

const SYSTEM_PROMPT = `You sell this organization's products in Messenger.

How you work:
- Find out what the customer needs, then suggest products from the knowledge. Look up a product's price and stock by its code before quoting either; never guess them, and never offer what is out of stock.
- When asked what you sell, name the kinds of products and a few of each from the knowledge, then ask what they need.
- A price of 0 is not set: never quote it; say a teammate will confirm the price.
- The customer can ask about their own orders and loyalty points; look them up.
- Before ordering, repeat the products, counts, total, delivery address and phone, and ask the customer to confirm.
- When the customer confirms, call place_order, then give the order number, the total and the payment link it returns.
- Offer only what the offer rules allow. When the customer asks for a bigger discount and it seems fair, call request_discount with what and why; otherwise decline politely.
- Call hand_over when the customer asks for a person, wants a business or unusual order, or is unhappy.
- When a tool fails, do not ask the customer to try again: call hand_over and say a teammate will continue.
- Never say an order exists, a discount is approved or a person is coming before the tool says so.
- Reply in the customer's language, briefly and warmly.

Offer rules:
{{ answers.offer }}`;

/**
 * An AI employee that sells on a Facebook page. It talks to the customer
 * itself, quoting live prices and stock, and uses workflows as tools: place a
 * POS order and return its payment link, or hand the conversation to whoever
 * of the sales team is available. A discount beyond the offer rules waits for
 * an approver, and the agent words the decision.
 */
export const salesEmployeeTemplate: TTemplate = {
  id: 'sales.sales-employee',
  version: 8,
  name: 'Sales employee',
  icon: 'IconShoppingCart',
  description:
    'Sells in Messenger with live prices and stock, places POS orders with a payment link, follows each order to delivery, asks for a rating and tells your team when a customer is unhappy.',
  requirements: [
    {
      key: 'page',
      kind: 'frontline:facebook.bot',
      label: 'Facebook page',
      description:
        'The page whose Messenger conversations this employee answers.',
      fills: [
        { target: 'trigger', journey: 'chat', path: 'botId' },
        // Messages about an order go back to the same page's conversation
        step(5, 'botId'),
        step(7, 'botId'),
        journeyStep('payment-reminder', 3, 'botId'),
        journeyStep('paid', 2, 'botId'),
        journeyStep('delivered', 3, 'botId'),
        journeyStep('returned', 3, 'botId'),
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
      key: 'pos',
      kind: 'sales:pos.pos',
      label: 'POS',
      description: 'The POS orders are made in; its products and prices apply.',
      fills: [
        workflowStep('order', 1, 'posId'),
        // Only this POS's orders are reminded and thanked
        { target: 'trigger', journey: 'payment-reminder', path: 'posId' },
        { target: 'trigger', journey: 'paid', path: 'posId' },
        { target: 'trigger', journey: 'delivered', path: 'posId' },
        { target: 'trigger', journey: 'returned', path: 'posId' },
      ],
    },
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who takes over',
      description:
        'The sales people a conversation is handed to. Whoever of them is available now is assigned, in turns.',
      fills: [
        workflowStep('handOver', 1, 'candidateIds'),
        workflowStep('order', 3, 'candidateIds'),
      ],
    },
    {
      key: 'fallback',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBER,
      label: 'When nobody is available',
      description:
        'Who takes the conversation when none of them is available, so no customer waits unowned.',
      fills: [
        workflowStep('handOver', 1, 'fallbackUserId'),
        workflowStep('order', 3, 'fallbackUserId'),
      ],
    },
    {
      key: 'approvers',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who approves discounts',
      description:
        'A discount beyond the offer rules is given only after one of them approves it.',
      fills: [step(3, 'approverIds')],
    },
    {
      key: 'reminder',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Reminder when unpaid',
      description:
        'Sent once, two hours after an order made in the chat, when it is still unpaid. The payment link follows it.',
      input: { multiline: true },
      defaultAnswer:
        'Your order #{{ trigger.number }} is waiting for payment. You can pay here:',
    },
    {
      key: 'thanks',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Thanks when paid',
      description: 'Sent when an order made in the chat is paid.',
      input: { multiline: true },
      defaultAnswer:
        'Thank you! Order #{{ trigger.number }} is paid. We will let you know when it is on its way.',
    },
    {
      key: 'leads',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who hears about unhappy customers',
      description:
        'Told at once when a customer rates an order low or returns it.',
      fills: [
        journeyStep('low-rating', 2, 'userIds'),
        journeyStep('returned', 2, 'userIds'),
      ],
    },
    {
      key: 'delivered',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Message when delivered',
      description:
        'Sent when an order from the chat is delivered, followed by a link to rate it.',
      input: { multiline: true },
      defaultAnswer:
        'Order #{{ trigger.number }} is delivered. We hope you like it! How did we do?',
    },
    {
      key: 'returnedText',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Message when returned',
      description: 'Sent when an order from the chat is returned.',
      input: { multiline: true },
      defaultAnswer:
        'We received your return of order #{{ trigger.number }}. A teammate will contact you about the refund.',
    },
    {
      key: 'bigOrder',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Orders a teammate confirms',
      description:
        'An order with a total of at least this much, in your currency, is placed and handed to the sales team to confirm.',
      input: { placeholder: '1000000' },
      defaultAnswer: '1000000',
    },
    {
      key: 'offer',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEXT,
      label: 'Offer rules',
      description:
        'What the employee may offer on its own, in your words. It becomes part of its instructions.',
      input: { multiline: true },
      defaultAnswer:
        'No discounts by default. Free delivery for orders above 100,000₮.',
    },
  ],
  parts: [
    {
      key: 'settled',
      type: 'core:segments.segment',
      label: 'Segment',
      icon: 'IconFilter',
      defaults: {
        name: 'Paid or not from the chat',
        contentType: POS_ORDER,
        root: {
          kind: 'group',
          conjunction: 'or',
          children: [
            orderField('paidDate', 'dateis'),
            orderField('type', 'dne', 'delivery'),
          ],
        },
      },
    },
    {
      key: 'chatOrders',
      type: 'core:segments.segment',
      label: 'Segment',
      icon: 'IconFilter',
      defaults: {
        name: 'Orders from the chat',
        contentType: POS_ORDER,
        root: {
          kind: 'group',
          conjunction: 'and',
          children: [orderField('type', 'e', 'delivery')],
        },
      },
    },
    {
      key: 'rating',
      type: 'frontline:forms.rating',
      label: 'Rating form',
      icon: 'IconMoodSmile',
      defaults: {
        name: 'Order rating',
        question: 'How happy are you with your order?',
        commentQuestion: 'Anything we should do better?',
        thanks: 'Thank you for telling us.',
      },
    },
    {
      key: 'agent',
      type: 'automations:aiAgent',
      defaults: {
        name: 'Sales employee',
        description: 'Created by the Sales employee template.',
        context: {
          systemPrompt: SYSTEM_PROMPT,
          // "Suggest products from the knowledge" needs the catalog in it
          knowledgeSources: [
            {
              pluginName: 'core',
              moduleName: 'products',
              key: 'product.knowledge',
              scope: 'all',
              sourceIds: [],
            },
          ],
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
        'Answers with live prices and stock, places orders, hands over to the sales team and asks before discounting.',
      highlights: [
        { order: 1, label: 'Advise', icon: 'IconMessage' },
        { order: 1, label: 'Order', icon: 'IconShoppingCart' },
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
          label: 'Sales employee',
          config: {
            aiAgentId: '{{ parts.agent }}',
            goalType: 'generateText',
            input: '{{ trigger.content }}',
            captureFields: [
              {
                id: 'discount',
                fieldName: 'discount',
                prompt:
                  'The discount asked to be approved, e.g. 15% off order of 3 chairs.',
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
                id: 'place_order',
                name: 'place_order',
                kind: 'helper',
                description:
                  'Place the order once the customer confirmed the products, counts, delivery address and phone. Not before.',
                memorizeFields: [],
              },
              {
                id: 'request_discount',
                name: 'request_discount',
                kind: 'handoff',
                description:
                  'Ask an approver for a discount beyond the offer rules, with what and why. The customer hears the decision.',
                memorizeFields: [],
              },
              {
                id: 'hand_over',
                name: 'hand_over',
                kind: 'helper',
                description:
                  'Hand the conversation to the sales team: the customer asks for a person, wants a business or unusual order, or is unhappy.',
                memorizeFields: [],
              },
            ],
          },
          next: 2,
          connects: {
            place_order: 'order',
            hand_over: 'handOver',
            request_discount: 8,
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
          label: 'Approve the discount',
          config: {
            approverIds: '',
            summary:
              'Discount: {{ actions.1.attributes.discount }}. Why: {{ actions.1.attributes.reason }}',
            timeoutHours: 24,
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
              'An approver allowed this discount: {{ actions.1.attributes.discount }}. Tell the customer and offer to place the order with it.',
          },
          next: 5,
        },
        {
          order: 5,
          type: MESSAGE_CUSTOMER,
          label: 'Send the approval',
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
              'The discount was not approved. Apologise, offer what the offer rules allow instead, and promise nothing else.',
          },
          next: 7,
        },
        {
          order: 7,
          type: MESSAGE_CUSTOMER,
          label: 'Send the decision',
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
              'You asked a manager to approve this discount: {{ actions.1.attributes.discount }}. Tell the customer it is being reviewed and you will write back with the decision. Promise nothing.',
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
          key: 'order',
          name: 'Place an order',
          description:
            'Creates the POS order and returns its number, total and payment link.',
          inputs: { items: '', address: '', phone: '', note: '' },
          inputHints: {
            items: {
              description:
                'The confirmed lines as JSON: [{"code": product code, "count": number}]. Codes come from the knowledge or the product lookup.',
            },
            address: {
              description: 'Where to deliver, as the customer said it.',
            },
            phone: { description: "The customer's phone number." },
            note: {
              description: 'Anything else the customer asked for, or empty.',
            },
          },
          output:
            // Empty values say what did not happen, so the agent never claims it
            'Order #{{ actions.1.number }}, total {{ actions.1.totalAmount }}. Payment link: {{ actions.1.onlinePaymentUrl }}. Handed to a teammate to confirm: {{ actions.4.result.status }}. If the hand-over is not empty, the order is not confirmed yet: say a teammate will confirm it and send how to pay. If the payment link is empty, say a teammate will send how to pay; never say a link was sent.',
          flow: [
            {
              order: 1,
              type: POS_ORDER_CREATE,
              label: 'Create the order',
              config: {
                posId: '',
                type: 'delivery',
                items: '{{ input.items }}',
                customerId: '{{ trigger.customerId }}',
                // Plain text: an address with quotes cannot break it
                description:
                  'Ordered in Messenger. Deliver to: {{ input.address }}. Phone: {{ input.phone }}. {{ input.note }}',
              },
              next: 2,
            },
            {
              order: 2,
              type: 'split',
              label: 'Big order?',
              // Read from the order just made, whatever the agent concluded
              target: 1,
              config: {
                options: [
                  {
                    id: 'big',
                    label: 'At or above the limit',
                    config: {
                      conditions: [
                        {
                          propertyType: POS_ORDER,
                          propertyName: 'totalAmount',
                          propertyOperator: 'numberigt',
                          propertyValue: '{{ answers.bigOrder }}',
                        },
                      ],
                    },
                  },
                ],
              },
              connects: { big: 3 },
            },
            {
              order: 3,
              type: 'pickMember',
              label: 'Pick who confirms',
              config: {
                candidateIds: '',
                method: 'roundRobin',
                fallbackUserId: '',
              },
              next: 4,
            },
            {
              order: 4,
              type: HANDOFF,
              label: 'Hand over to confirm',
              config: { assignTo: '{{ actions.3.userId }}' },
            },
          ],
        },
        {
          key: 'handOver',
          name: 'Hand over to the sales team',
          description:
            'Assigns whoever of the sales team is available and pauses the bot.',
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
      key: 'payment-reminder',
      name: 'Sales employee · Payment reminder',
      description:
        'Two hours after an order from the chat, reminds the customer once if it is still unpaid.',
      trigger: {
        type: POS_ORDER_EVENT,
        config: { eventType: 'created', posId: '' },
      },
      flow: [
        {
          order: 1,
          type: 'delay',
          label: 'Wait 2 hours',
          config: { value: '2', type: 'hour' },
          next: 2,
        },
        {
          order: 2,
          type: 'if',
          label: 'Paid, or not from the chat?',
          config: { contentId: '{{ parts.settled }}' },
          // Settled ends the run; otherwise one reminder
          next: { no: 3 },
        },
        {
          order: 3,
          type: MESSAGE_CUSTOMER,
          label: 'Remind to pay',
          config: {
            botId: '',
            messages: [
              {
                _id: 'reminder',
                type: 'text',
                // The link stays on its own line, whatever the text says
                text: '{{ answers.reminder }}\n{{ trigger.onlinePaymentUrl }}',
                buttons: [],
              },
            ],
          },
        },
      ],
    },
    {
      key: 'paid',
      name: 'Sales employee · Paid',
      description: 'Thanks the customer when an order from the chat is paid.',
      trigger: {
        type: POS_ORDER_EVENT,
        config: { eventType: 'paid', posId: '' },
      },
      flow: [
        {
          order: 1,
          type: 'if',
          label: 'From the chat?',
          config: { contentId: '{{ parts.chatOrders }}' },
          next: { yes: 2 },
        },
        {
          order: 2,
          type: MESSAGE_CUSTOMER,
          label: 'Thank the customer',
          config: {
            botId: '',
            messages: [
              {
                _id: 'thanks',
                type: 'text',
                text: '{{ answers.thanks }}',
                buttons: [],
              },
            ],
          },
        },
      ],
    },
    {
      key: 'delivered',
      name: 'Sales employee · Delivered',
      description:
        'Tells the customer an order from the chat is delivered and asks them to rate it.',
      trigger: {
        type: POS_ORDER_EVENT,
        config: { eventType: 'deliveryCompleted', posId: '' },
      },
      flow: [
        {
          order: 1,
          type: 'if',
          label: 'From the chat?',
          config: { contentId: '{{ parts.chatOrders }}' },
          next: { yes: 2 },
        },
        {
          order: 2,
          type: FORM_LINK,
          label: 'Make a rating link',
          // The answer is saved as about this order
          config: { formId: '{{ parts.rating.formId }}', expiresInDays: 14 },
          next: 3,
        },
        {
          order: 3,
          type: MESSAGE_CUSTOMER,
          label: 'Tell the customer',
          config: customerText(
            'delivered',
            // The link stays on its own line, whatever the text says
            '{{ answers.delivered }}\n{{ actions.2.url }}',
          ),
        },
      ],
    },
    {
      key: 'low-rating',
      name: 'Sales employee · Low rating',
      description: 'Tells the team when a customer rates an order 1 or 2.',
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
          label: 'Find the rated order',
          config: {
            objectType: POS_ORDER,
            lookupField: '_id',
            value: '{{ trigger.aboutRecordId }}',
          },
          next: { isExists: 2 },
        },
        {
          order: 2,
          type: 'sendNotification',
          label: 'Tell the team',
          config: {
            userIds: '',
            title: 'A customer rated order #{{ actions.1.object.number }} low',
            message: 'Reach out before they buy elsewhere.',
            priority: 'urgent',
          },
        },
      ],
    },
    {
      key: 'returned',
      name: 'Sales employee · Returned',
      description:
        'Tells the team and the customer when an order from the chat is returned.',
      trigger: {
        type: POS_ORDER_EVENT,
        config: { eventType: 'returned', posId: '' },
      },
      flow: [
        {
          order: 1,
          type: 'if',
          label: 'From the chat?',
          config: { contentId: '{{ parts.chatOrders }}' },
          next: { yes: 2 },
        },
        {
          order: 2,
          type: 'sendNotification',
          label: 'Tell the team',
          config: {
            userIds: '',
            title: 'Order #{{ trigger.number }} was returned',
            message: 'Contact the customer about the refund.',
            priority: 'high',
          },
          next: 3,
        },
        {
          order: 3,
          type: MESSAGE_CUSTOMER,
          label: 'Tell the customer',
          config: customerText('returned', '{{ answers.returnedText }}'),
        },
      ],
    },
  ],
};
