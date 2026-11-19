import { ASSISTANT_QUESTION_MODES } from '@erxes/core-db/assistantEnums';
import { z } from 'zod';
import { agentTool } from '~/modules/agents/tool';

const Question = z.object({
  question: z.string().min(1).max(500).describe('The question, clear and specific'),
  options: z
    .array(
      z.object({
        label: z.string().min(1).max(80).describe('Short display text (1-5 words)'),
        description: z.string().max(300).optional(),
      }),
    )
    .max(8)
    .optional()
    .describe(
      'Concrete choices with short descriptions. Custom text is always possible, so leave out "Other". Omit for an open question.',
    ),
  selectionMode: z
    .enum(ASSISTANT_QUESTION_MODES)
    .optional()
    .describe('multi_select for choices that combine; single_select for exclusive alternatives'),
});

export const askUser = agentTool({
  name: 'ask_user',
  description:
    "Ask the member up to three related questions when a missing detail changes the work and nothing else can answer it. The run ends here; the member's answers arrive as their next message.",
  input: z.object({ questions: z.array(Question).min(1).max(3) }),
  execute: () => ({ asked: true }),
  terminate: true,
});
