import {
  aiAgentActionConfigSchema,
  approvalActionConfigSchema,
  findObjectActionConfigSchema,
  materializeTemplate,
  pickMemberActionConfigSchema,
  sendNotificationActionConfigSchema,
  setPropertyActionConfigSchema,
} from 'erxes-api-shared/core-modules';
import {
  createFormLinkActionConfigSchema,
  socialMessageActionConfigSchema,
} from '~/meta/automationConfigSchemas';
import { complaintEmployeeTemplate } from '../complaintEmployee';

const answers = {
  page: 'bot-1',
  agent: { _id: 'source', connection: { provider: 'openai' } },
  team: '[[ user.u1 ]],[[ user.u2 ]]',
  fallback: '[[ user.lead ]]',
  supervisors: '[[ user.s1 ]]',
  approvers: '[[ user.m1 ]]',
  policy: 'Replace within 7 days.',
  started: 'Working on #{{ trigger.number }}.',
  resolved: 'Resolved #{{ trigger.number }}.',
};

const schemas: Record<
  string,
  { safeParse: (value: unknown) => { success: boolean } }
> = {
  aiAgent: aiAgentActionConfigSchema,
  pickMember: pickMemberActionConfigSchema,
  findObject: findObjectActionConfigSchema,
  setProperty: setPropertyActionConfigSchema,
  approval: approvalActionConfigSchema,
  sendNotification: sendNotificationActionConfigSchema,
  'frontline:facebook.customerMessages.create': socialMessageActionConfigSchema,
  'frontline:form.links.create': createFormLinkActionConfigSchema,
};

// Fails the test, not the type checker, when a part is missing
const must = <T>(value: T | undefined): T => {
  if (value === undefined) {
    throw new Error('Expected a value');
  }

  return value;
};

describe('complaint employee as installed', () => {
  const { parts, automations } = materializeTemplate(
    complaintEmployeeTemplate,
    {
      answers,
      partIds: { agent: 'agent-1', desk: 'p-1', rating: 'f-1' },
      partRefs: {
        desk: {
          channelId: 'c-1',
          pipelineId: 'p-1',
          statusId: 's-1',
          openStatusId: 's-open',
          inProgressStatusId: 's-progress',
          resolvedStatusId: 's-resolved',
        },
        rating: { formId: 'f-1', ratingFieldId: 'field-rating' },
      },
    },
  );
  const byJourney = new Map(automations.map((item) => [item.journey, item]));
  const chat = must(byJourney.get('chat'));
  const [agent] = chat.actions;
  const workflows = new Map(chat.workflows.map((item) => [item.name, item]));
  const allActions = automations.flatMap((item) => [
    ...item.actions,
    ...item.workflows.flatMap(({ actions }) => actions),
  ]);

  it('creates the desk of the team and puts the policy into the instructions', () => {
    const agentPart = must(parts.find(({ key }) => key === 'agent'));
    const desk = must(parts.find(({ key }) => key === 'desk'));

    expect(chat.triggers[0].config.botId).toBe('bot-1');
    expect(agentPart.doc.connection).toEqual({ provider: 'openai' });
    expect(agentPart.doc.context.systemPrompt).toContain(
      'Replace within 7 days.',
    );
    expect(desk.doc.memberIds).toBe('[[ user.u1 ]],[[ user.u2 ]]');
  });

  it('runs helper tools as workflows and the compensation tool on a branch', () => {
    const workflowIds = chat.workflows.map(({ id }) => id);
    const connects = new Map<string, string>(
      agent.config.optionalConnects.map(
        (item: { optionalConnectId: string; actionId: string }) => [
          item.optionalConnectId,
          item.actionId,
        ],
      ),
    );

    for (const tool of ['file_complaint', 'add_to_complaint', 'escalate']) {
      expect(workflowIds).toContain(connects.get(tool));
    }
    // It says it was asked first; the approval follows that reply
    expect(connects.get('request_compensation')).toBe(chat.actions.at(-2)?.id);
  });

  it('files an owned complaint with a priority into the desk', () => {
    const workflow = must(workflows.get('File a complaint'));
    const [pick, create] = workflow.actions;

    expect(must(workflow.config.inputHints).priority.enum).toEqual([
      '1',
      '2',
      '3',
      '4',
    ]);
    expect(pick.config).toMatchObject({
      candidateIds: '[[ user.u1 ]],[[ user.u2 ]]',
      fallbackUserId: '[[ user.lead ]]',
    });
    expect(workflow.config.output).toBe(
      `Filed as ticket #{{ actions.${create.id}.number }}`,
    );
    expect(create.config).toMatchObject({
      channelId: 'c-1',
      pipelineId: 'p-1',
      statusId: 's-1',
      priority: '{{ input.priority }}',
      assigneeId: `{{ actions.${pick.id}.userId }}`,
    });
  });

  it('hands over to who is available and adds to the found ticket', () => {
    const [pick, handoff] = must(
      workflows.get('Hand over to the team'),
    ).actions;
    const [find, set] = must(workflows.get('Add to the open ticket')).actions;

    expect(handoff.config.assignTo).toBe(`{{ actions.${pick.id}.userId }}`);
    expect(find.config.isExists).toBe(set.id);
    // Engines read the record step on the action, never in its config
    expect(set.targetActionId).toBe(find.id);
  });

  it('asks the approvers before compensating and tells the customer either way', () => {
    const [, , approval, approvedAgent, approvedReply, rejectedAgent] =
      chat.actions;

    expect(approval.config).toMatchObject({
      approverIds: '[[ user.m1 ]]',
      approved: approvedAgent.id,
      rejected: rejectedAgent.id,
    });
    expect(approvedAgent.nextActionId).toBe(approvedReply.id);
    // The customer hears it was asked before the approver decides
    const [ask, askReply] = chat.actions.slice(-2);
    expect(
      chat.actions[0].config.optionalConnects.find(
        ({ optionalConnectId }: { optionalConnectId: string }) =>
          optionalConnectId === 'request_compensation',
      )?.actionId,
    ).toBe(ask.id);
    expect(ask.nextActionId).toBe(askReply.id);
    expect(askReply.nextActionId).toBe(approval.id);
    expect(approvedReply.config.messages[0].text).toBe(
      `{{ actions.${approvedAgent.id}.text }}`,
    );
  });

  it('watches the desk SLA: warns the owner, moves a missed one to a supervisor', () => {
    const warning = must(byJourney.get('sla-warning'));
    const breach = must(byJourney.get('sla-breach'));
    const [pick, reassign, notify] = breach.actions;

    for (const journey of [warning, breach]) {
      expect(journey.triggers[0].config.pipelineId).toBe('p-1');
    }
    expect(pick.config).toMatchObject({
      candidateIds: '[[ user.s1 ]]',
      fallbackUserId: '[[ user.lead ]]',
    });
    expect(reassign.config.rules[0]).toMatchObject({
      field: 'assigneeId',
      value: `{{ actions.${pick.id}.userId }}`,
    });
    expect(notify.config.userIds).toContain(`{{ actions.${pick.id}.userId }}`);
  });

  it('keeps the customer posted on the page they wrote from', () => {
    const started = must(byJourney.get('status-started'));
    const resolved = must(byJourney.get('status-resolved'));
    const [link, message] = resolved.actions;

    expect(started.triggers[0].config).toEqual({
      pipelineId: 'p-1',
      toStatusIds: ['s-progress'],
    });
    expect(started.actions[0].config).toMatchObject({ botId: 'bot-1' });
    expect(started.actions[0].config.messages[0].text).toBe(
      'Working on #{{ trigger.number }}.',
    );
    expect(resolved.triggers[0].config.toStatusIds).toEqual(['s-resolved']);
    expect(link.config.formId).toBe('f-1');
    expect(message.config.messages[0].text).toBe(
      `Resolved #{{ trigger.number }}.\n{{ actions.${link.id}.url }}`,
    );
    expect(chat.actions[4].type).toBe(
      'frontline:facebook.customerMessages.create',
    );
  });

  it('reopens a complaint rated 1 or 2 and tells the supervisors', () => {
    const low = must(byJourney.get('low-rating'));
    const [find, reopen, notify] = low.actions;

    expect(low.triggers[0].config).toEqual({
      formId: 'f-1',
      conditions: [
        { fieldId: 'field-rating', operator: 'numberilt', value: '3' },
      ],
    });
    expect(find.config.value).toBe('{{ trigger.aboutRecordId }}');
    expect(reopen.targetActionId).toBe(find.id);
    expect(reopen.config.rules[0]).toMatchObject({
      field: 'statusId',
      value: 's-open',
    });
    expect(notify.config.userIds).toBe('[[ user.s1 ]]');
  });

  it.each(Object.keys(schemas))('%s steps pass the engine contract', (type) => {
    for (const action of allActions.filter((item) => item.type === type)) {
      expect(schemas[type].safeParse(action.config).success).toBe(true);
    }
  });
});
