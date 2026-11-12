import {
  aiAgentActionConfigSchema,
  approvalActionConfigSchema,
  delayActionConfigSchema,
  findObjectActionConfigSchema,
  ifActionConfigSchema,
  materializeTemplate,
  pickMemberActionConfigSchema,
  sendNotificationActionConfigSchema,
  splitActionConfigSchema,
} from 'erxes-api-shared/core-modules';
import { posOrderCreateActionConfigSchema } from '~/modules/pos/meta/automations/configSchemas';
import { salesEmployeeTemplate } from '../salesEmployee';

// Fails the test, not the type checker, when a part is missing
const must = <T>(value: T | undefined): T => {
  if (value === undefined) {
    throw new Error('Expected a value');
  }

  return value;
};

const answers = {
  page: 'bot-1',
  agent: { _id: 'source', connection: { provider: 'openai' } },
  pos: 'pos-1',
  team: '[[ user.u1 ]],[[ user.u2 ]]',
  fallback: '[[ user.lead ]]',
  approvers: '[[ user.m1 ]]',
  offer: 'No discounts.',
  reminder: 'Order #{{ trigger.number }} is unpaid:',
  thanks: 'Thanks for #{{ trigger.number }}.',
  leads: '[[ user.l1 ]]',
  delivered: 'Delivered #{{ trigger.number }}.',
  returnedText: 'Returned #{{ trigger.number }}.',
  bigOrder: '500000',
};

const schemas: Record<
  string,
  { safeParse: (value: unknown) => { success: boolean } }
> = {
  aiAgent: aiAgentActionConfigSchema,
  approval: approvalActionConfigSchema,
  pickMember: pickMemberActionConfigSchema,
  'sales:pos.orders.create': posOrderCreateActionConfigSchema,
  delay: delayActionConfigSchema,
  if: ifActionConfigSchema,
  findObject: findObjectActionConfigSchema,
  sendNotification: sendNotificationActionConfigSchema,
  split: splitActionConfigSchema,
};

describe('sales employee as installed', () => {
  const { parts, automations } = materializeTemplate(salesEmployeeTemplate, {
    answers,
    partIds: {
      agent: 'agent-1',
      settled: 'seg-settled',
      chatOrders: 'seg-chat',
      rating: 'f-1',
    },
    partRefs: { rating: { formId: 'f-1', ratingFieldId: 'field-rating' } },
  });
  const chat = must(automations.find(({ journey }) => journey === 'chat'));
  const [agent] = chat.actions;
  const workflows = new Map(chat.workflows.map((item) => [item.name, item]));
  const byJourney = (key: string) =>
    must(automations.find(({ journey }) => journey === key));
  const allActions = automations.flatMap((item) => [
    ...item.actions,
    ...item.workflows.flatMap(({ actions }) => actions),
  ]);

  it('listens to the page and carries the offer rules', () => {
    expect(chat.triggers[0].config.botId).toBe('bot-1');
    const agentPart = must(parts.find(({ key }) => key === 'agent'));

    expect(agentPart.doc.context.systemPrompt).toContain('No discounts.');
    // It sells from the catalog, so a new agent indexes every product
    expect(agentPart.doc.context.knowledgeSources).toEqual([
      expect.objectContaining({ key: 'product.knowledge', scope: 'all' }),
    ]);
  });

  it('places the order in the chosen POS for the conversation customer', () => {
    const workflow = must(workflows.get('Place an order'));
    const [create] = workflow.actions;

    expect(create.config).toMatchObject({
      posId: 'pos-1',
      type: 'delivery',
      items: '{{ input.items }}',
      customerId: '{{ trigger.customerId }}',
    });
    expect(workflow.config.output).toContain(
      `{{ actions.${create.id}.onlinePaymentUrl }}`,
    );
    expect(must(workflow.config.inputHints).items.description).toContain(
      'code',
    );
  });

  it('runs helper tools as workflows and the discount tool on a branch', () => {
    const connects = new Map<string, string>(
      agent.config.optionalConnects.map(
        (item: { optionalConnectId: string; actionId: string }) => [
          item.optionalConnectId,
          item.actionId,
        ],
      ),
    );
    const workflowIds = chat.workflows.map(({ id }) => id);

    expect(workflowIds).toContain(connects.get('place_order'));
    expect(workflowIds).toContain(connects.get('hand_over'));
    // The customer hears it was asked before the approver decides
    const [ask, askReply] = chat.actions.slice(-2);
    expect(connects.get('request_discount')).toBe(ask.id);
    expect(ask.nextActionId).toBe(askReply.id);
    expect(askReply.config.messages[0].text).toBe(`{{ actions.${ask.id}.text }}`);
    expect(askReply.nextActionId).toBe(chat.actions[2].id);
  });

  it('hands an order at or above the limit to the team, whatever the agent said', () => {
    const [create, split, pick, handoff] = must(
      workflows.get('Place an order'),
    ).actions;

    // Read from the order just made, not from the message
    expect(split.targetActionId).toBe(create.id);
    expect(split.config.options[0].config.conditions[0]).toMatchObject({
      propertyName: 'totalAmount',
      propertyOperator: 'numberigt',
      propertyValue: '500000',
    });
    expect(split.config.optionalConnects).toEqual([
      { sourceId: split.id, optionalConnectId: 'big', actionId: pick.id },
    ]);
    expect(pick.config).toMatchObject({
      candidateIds: '[[ user.u1 ]],[[ user.u2 ]]',
      fallbackUserId: '[[ user.lead ]]',
    });
    expect(handoff.config.assignTo).toBe(`{{ actions.${pick.id}.userId }}`);
    // The agent reads from the result whether it was handed over
    expect(must(workflows.get('Place an order')).config.output).toContain(
      `{{ actions.${handoff.id}.result.status }}`,
    );
  });

  it('hands over to who is available and asks the approvers before discounting', () => {
    const [pick, handoff] = must(
      workflows.get('Hand over to the sales team'),
    ).actions;
    const [, , approval, approvedAgent, approvedSend, rejectedAgent] =
      chat.actions;

    expect(pick.config).toMatchObject({
      candidateIds: '[[ user.u1 ]],[[ user.u2 ]]',
      fallbackUserId: '[[ user.lead ]]',
    });
    expect(handoff.config.assignTo).toBe(`{{ actions.${pick.id}.userId }}`);
    expect(approval.config).toMatchObject({
      approverIds: '[[ user.m1 ]]',
      approved: approvedAgent.id,
      rejected: rejectedAgent.id,
    });
    expect(approvedSend.config.botId).toBe('bot-1');
  });

  it('reminds once, two hours after a chat order, only while unpaid', () => {
    const reminder = byJourney('payment-reminder');
    const [delay, check, message] = reminder.actions;
    const settled = must(parts.find(({ key }) => key === 'settled'));

    expect(reminder.triggers[0].config).toEqual({
      eventType: 'created',
      posId: 'pos-1',
    });
    expect(delay.config).toEqual({ value: '2', type: 'hour' });
    expect(check.config).toEqual({ contentId: 'seg-settled', no: message.id });
    expect(message.config.botId).toBe('bot-1');
    expect(message.config.messages[0].text).toBe(
      'Order #{{ trigger.number }} is unpaid:\n{{ trigger.onlinePaymentUrl }}',
    );
    expect(settled.doc.root.conjunction).toBe('or');
  });

  it('thanks the customer only for a paid order from the chat', () => {
    const paid = byJourney('paid');
    const [check, message] = paid.actions;

    expect(paid.triggers[0].config).toEqual({
      eventType: 'paid',
      posId: 'pos-1',
    });
    expect(check.config).toEqual({ contentId: 'seg-chat', yes: message.id });
    expect(message.config.messages[0].text).toBe(
      'Thanks for #{{ trigger.number }}.',
    );
  });

  it('asks a delivered chat order for a rating on the same page', () => {
    const delivered = byJourney('delivered');
    const [check, link, message] = delivered.actions;

    expect(delivered.triggers[0].config).toEqual({
      eventType: 'deliveryCompleted',
      posId: 'pos-1',
    });
    expect(check.config).toEqual({ contentId: 'seg-chat', yes: link.id });
    expect(link.config.formId).toBe('f-1');
    expect(message.config).toMatchObject({ botId: 'bot-1' });
    expect(message.config.messages[0].text).toBe(
      `Delivered #{{ trigger.number }}.\n{{ actions.${link.id}.url }}`,
    );
  });

  it('tells the leads about a low rating and a return', () => {
    const low = byJourney('low-rating');
    const returned = byJourney('returned');
    const [find, notify] = low.actions;
    const [, returnNotify, returnMessage] = returned.actions;

    expect(low.triggers[0].config).toEqual({
      formId: 'f-1',
      conditions: [
        { fieldId: 'field-rating', operator: 'numberilt', value: '3' },
      ],
    });
    expect(find.config).toMatchObject({
      objectType: 'sales:pos.orders',
      value: '{{ trigger.aboutRecordId }}',
      isExists: notify.id,
    });
    expect(notify.config.userIds).toBe('[[ user.l1 ]]');
    expect(returnNotify.config.userIds).toBe('[[ user.l1 ]]');
    expect(returnMessage.config.messages[0].text).toBe(
      'Returned #{{ trigger.number }}.',
    );
  });

  it.each(Object.keys(schemas))('%s steps pass the engine contract', (type) => {
    for (const action of allActions.filter((item) => item.type === type)) {
      expect(schemas[type].safeParse(action.config).success).toBe(true);
    }
  });
});
