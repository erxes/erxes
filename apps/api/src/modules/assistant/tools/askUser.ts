import { ASSISTANT_QUESTION_MODES } from '@erxes/core-db/enums';
import { tool } from 'ai';
import { z } from 'zod';

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

export const AskUserOutput = z.object({
  answers: z.array(z.union([z.string().max(2000), z.array(z.string().max(500)).max(20)])).max(3),
});

export const askUser = tool({
  description:
    'Ask the member up to three related questions when a missing detail changes the work and nothing else can answer it. The run waits for their answers.',
  inputSchema: z.object({ questions: z.array(Question).min(1).max(3) }),
  outputSchema: AskUserOutput,
});
