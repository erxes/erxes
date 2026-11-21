import { agentNamed, askAgent } from '~/modules/agents/host';
import { type CoreAction, idempotencyKey, text } from './context';

/** The agent `core.agent.ask` asks, registered at start (`~/modules/agents/automationAgent`). */
export const AUTOMATION_AGENT = 'automation';

export const AGENT_ACTIONS: CoreAction[] = [
  {
    type: 'core.agent.ask',
    label: 'Ask an agent',
    description:
      'An AI agent does what you describe through the API, as you, and answers; later steps read its answer',
    subject: null,
    fields: [
      {
        key: 'prompt',
        label: 'What it should do',
        type: 'longtext',
        required: true,
        placeholder: 'Tag {{subject.firstName}} VIP if they spent more than 1,000,000 this year',
      },
    ],
    outputs: [{ key: 'answer', label: 'Answer', type: 'text' }],
    call: async (ctx) => {
      const prompt = text(ctx.input.prompt)?.trim();

      if (!prompt) throw new Error('Say what the agent should do');

      // A retried step lands in the same conversation and asks once.
      const { answer } = await askAgent(
        agentNamed(AUTOMATION_AGENT),
        { orgId: ctx.orgId, key: `${ctx.run.id}-${ctx.step.id}` },
        prompt,
        idempotencyKey(ctx),
      );

      return { answer };
    },
  },
];
