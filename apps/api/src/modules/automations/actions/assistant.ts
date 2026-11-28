import { assistantThreads, caller, newId, withOrg } from '@erxes/core-db';
import { z } from 'zod';
import { agentNamed, askAgent } from '~/modules/agents/host';
import { ASSISTANT_AGENT, MEMBER_ENTRY } from '~/modules/assistant/names';
import { modelKey } from '~/modules/assistant/connections.service';
import { type CoreAction, parseInput } from './context';

const AskInput = z.object({ prompt: z.string().trim().min(1).max(4000) });

const unattended = (automation: string, prompt: string) =>
  `The automation "${automation}" sent this on its own: nobody is there to answer a question or fill a form. Do it with what you can look up, and deliver what it asks for.\n\n${prompt}`;

export const ASSISTANT_ACTIONS: CoreAction[] = [
  {
    type: 'core.assistant.ask',
    label: 'Ask the assistant',
    description:
      'The assistant does a task, such as a report, as the member who turned the automation on; the chat is kept in their assistant',
    subject: null,
    fields: [
      {
        key: 'prompt',
        label: 'Task',
        type: 'longtext',
        required: true,
        placeholder: 'A report on Frontline conversations over the last 7 days',
      },
    ],
    outputs: [
      { key: 'answer', label: 'Answer', type: 'text' },
      { key: 'link', label: 'Link to the chat', type: 'text' },
      { key: 'threadId', label: 'Chat', type: 'text' },
    ],
    slow: true,
    call: async (ctx) => {
      const { prompt } = parseInput(ctx, AskInput);

      const { thread, key } = await withOrg(ctx.orgId, async (tx) => {
        const usable = await modelKey(tx);

        const [row] = await tx
          .insert(assistantThreads)
          .values({ id: newId(), userId: caller('user').userId, title: ctx.automation.name })
          .returning({ id: assistantThreads.id });

        if (!row) throw new Error('The new thread was not returned');

        return { thread: row, key: usable };
      });

      const reply = await askAgent(
        agentNamed(ASSISTANT_AGENT),
        { orgId: ctx.orgId, key: thread.id },
        {
          type: 'input',
          content: unattended(ctx.automation.name, prompt),
          entry: {
            kind: MEMBER_ENTRY,
            data: [
              { type: 'data-automation', data: ctx.automation },
              { type: 'text', text: prompt },
            ],
          },
        },
        { model: { provider: key.provider, modelId: key.model }, thinkingLevel: 'off' },
      );

      return {
        answer: reply.answer,
        link: `/assistant?thread=${thread.id}`,
        threadId: thread.id,
      };
    },
  },
];
