import { AgentStepModel } from '@erxes/core-contract';
import { z } from 'zod';
import { agentNamed, askAgent } from '~/modules/agents/host';
import { type CoreAction, idempotencyKey, text } from './context';

/** The agent `core.agent.ask` asks, registered at start (`~/modules/agents/automationAgent`). */
export const AUTOMATION_AGENT = 'automation';

/** The action categories and single actions an agent step may run (`tools`): all when none. */
const AgentTools = z.array(z.string().min(1).max(100)).max(500);

/** The API key an agent step calls the erxes API with (`apiKey`): no API without one. */
const AgentApiKey = z.string().min(1).max(64);

/** What an agent step chose (`tools`, `apiKey`, `model`), read from its saved input. */
export const agentStepSettings = (input: Record<string, unknown>) => ({
  tools: AgentTools.safeParse(input.tools).data ?? [],
  apiKeyId: AgentApiKey.safeParse(input.apiKey).data ?? null,
  model: AgentStepModel.safeParse(input.model).data ?? null,
});

const settingsProblems = (input: Record<string, unknown>) => [
  ...(input.tools === undefined || AgentTools.safeParse(input.tools).success
    ? []
    : ['Choose what the agent can use from the list']),
  ...(input.apiKey === undefined || AgentApiKey.safeParse(input.apiKey).success
    ? []
    : ['Choose the API key from the list']),
  ...(input.model === undefined || AgentStepModel.safeParse(input.model).success
    ? []
    : ['Choose the model from the list']),
];

export const AGENT_ACTIONS: CoreAction[] = [
  {
    type: 'core.agent.ask',
    label: 'Ask an agent',
    description:
      'An AI agent does what you describe, as you: it can send messages, change records and use your apps, then answers for later steps',
    subject: null,
    fields: [
      {
        key: 'prompt',
        label: 'What it should do',
        type: 'longtext',
        required: true,
        placeholder:
          'Welcome {{subject.firstName}} on Telegram, tag them VIP if they spent over 1,000,000, and note why',
      },
      {
        key: 'tools',
        label: 'Can use',
        type: 'agent_tools',
        required: false,
      },
      {
        key: 'apiKey',
        label: 'API access',
        type: 'agent_api_key',
        required: false,
        description: 'The agent reads and changes erxes with this key’s rules',
      },
      {
        key: 'model',
        label: 'Model',
        type: 'agent_model',
        required: false,
      },
    ],
    check: settingsProblems,
    outputs: [{ key: 'answer', label: 'Answer', type: 'text' }],
    call: async (ctx) => {
      const prompt = text(ctx.input.prompt)?.trim();

      if (!prompt) throw new Error('Say what the agent should do');

      // A retried step lands in the same conversation and asks once.
      const answer = await askAgent(
        agentNamed(AUTOMATION_AGENT),
        { orgId: ctx.orgId, key: `${ctx.run.id}-${ctx.step.id}` },
        prompt,
        idempotencyKey(ctx),
      );

      return { answer };
    },
  },
];
