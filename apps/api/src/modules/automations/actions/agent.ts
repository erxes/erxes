import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { agentNamed, withHarness } from '~/modules/agents/host';
import { answerText } from '~/modules/agents/pluginAgents';
import { type CoreAction, idempotencyKey, text } from './context';

/** The agent `core.agent.ask` asks, registered at start (`~/modules/agents/automationAgent`). */
export const AUTOMATION_AGENT = 'automation';

const ANSWER_LOOKBACK = 20;

/** Asks the step's agent and waits for its answer; a retried step lands in the same conversation. */
const askAgent = async (orgId: string, key: string, requestId: string, prompt: string) =>
  withHarness(agentNamed(AUTOMATION_AGENT), { orgId, key }, async (harness) => {
    const root = await harness.root(BACKGROUND_CONTEXT);

    const submission = await root.submit(
      { type: 'input', content: prompt, requestId },
      BACKGROUND_CONTEXT,
    );

    const settled = await submission.wait(BACKGROUND_CONTEXT);
    const { items } = await root.entries({}, ANSWER_LOOKBACK, undefined, BACKGROUND_CONTEXT);
    const answer = answerText(items.find((entry) => entry.kind === 'pi.assistant'));

    if (settled.status !== 'done' || !answer) throw new Error('The agent did not answer');

    return answer;
  });

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

      const answer = await askAgent(
        ctx.orgId,
        `${ctx.run.id}-${ctx.step.id}`,
        idempotencyKey(ctx),
        prompt,
      );

      return { answer };
    },
  },
];
