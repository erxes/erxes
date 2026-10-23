import { z } from 'zod';

/**
 * Plugin-owned replacement for Mastra's built-in `ask_user` tool: the same
 * human-in-the-loop suspension, but the model can batch several related
 * questions into ONE suspension instead of pausing the run once per
 * question. The host renders every question, collects all answers, and
 * resumes the run once with the positional answer list.
 *
 * The run resumes with `{ answers }`: one answer per question, in order.
 */

/** A structured choice rendered by the host for one ask_user question. */
export interface IAskUserOption {
  label: string;
  description?: string;
}

/**
 * How many provided options a question accepts. `single_select` is the
 * default when options exist; `multi_select` resumes that question with an
 * array of selected labels.
 */
export type IAskUserSelectionMode = 'single_select' | 'multi_select';

/** One question's answer, as submitted by the host. */
export type IAskUserAnswer = string | string[];

export interface IAskUserQuestion {
  question: string;
  options?: IAskUserOption[];
  selectionMode?: IAskUserSelectionMode;
}

const optionSchema = z.object({
  label: z.string().describe('Short display text for this option (1-5 words)'),
  description: z
    .string()
    .optional()
    .describe('Explanation of what this option means'),
});

const questionSchema = z.object({
  question: z
    .string()
    .min(1)
    .describe('The question to ask the user. Should be clear and specific.'),
  options: z
    .array(optionSchema)
    .optional()
    .describe(
      'Concrete suggested choices with useful descriptions. Custom text is always available, so do not include Other or Custom. Omit options for a fully open-ended question.',
    ),
  selectionMode: z
    .enum(['single_select', 'multi_select'])
    .optional()
    .describe(
      'Set explicitly with options: multi_select for compatible choices such as subjects, teams, or metrics; single_select for mutually exclusive alternatives. The user can always add a custom answer or details.',
    ),
});

/** One answer per question, in order: text, or the picked labels. */
export const askUserAnswersSchema = z
  .array(
    z.union([
      z.string().trim().min(1),
      z.array(z.string().trim().min(1)).min(1),
    ]),
  )
  .min(1);

const askUserResumeSchema = z.object({ answers: askUserAnswersSchema });

/** Formats one answer the way the model reads it back. */
const formatAnswer = (answer: IAskUserAnswer): string =>
  Array.isArray(answer) ? answer.join(', ') : answer;

/**
 * Builds the plugin's `askUser` tool. Async because `@mastra/core/tools` is
 * ESM-only and this plugin compiles as CommonJS.
 */
export const buildAskUserTool = async () => {
  const { createTool } = await import('@mastra/core/tools');

  return createTool({
    id: 'ask_user',
    description:
      'Ask only essential questions that cannot be answered from the conversation or available workspace tools. Prefer one focused question; batch up to three related essentials when necessary. Use sensible defaults for reversible presentation choices. Every question supports custom text alongside options. Set multi_select for compatible choices and single_select for mutually exclusive alternatives. Do not ask for a format when a useful inline result will do, or repeat questions already answered.',
    inputSchema: z.object({
      questions: z
        .array(questionSchema)
        .min(1)
        .max(5)
        .describe(
          'The questions to ask, in order. Batch related questions here instead of calling the tool once per question.',
        ),
    }),
    suspendSchema: z.object({
      questions: z.array(questionSchema),
    }),
    resumeSchema: askUserResumeSchema,
    execute: async ({ questions }, context) => {
      try {
        for (const question of questions) {
          if (question.selectionMode && !question.options?.length) {
            return {
              content: 'Failed to ask user: selectionMode requires options.',
              isError: true,
            };
          }
        }

        const resumeData: unknown = context?.agent?.resumeData;

        if (resumeData !== undefined) {
          const parsed = askUserResumeSchema.safeParse(resumeData);
          const perQuestion = parsed.success ? parsed.data.answers : undefined;

          if (perQuestion?.length !== questions.length) {
            return {
              content:
                'Failed to read the answers. Provide one non-empty answer per question.',
              isError: true,
            };
          }

          const lines = questions.map((question, index) => {
            const answer = perQuestion[index];

            return `${question.question}: ${
              answer === undefined ? '(no answer)' : formatAnswer(answer)
            }`;
          });

          return {
            content: `User answered:\n${lines.join('\n')}`,
            answers: perQuestion,
            isError: false,
          };
        }

        const suspend = context?.agent?.suspend;

        if (suspend) {
          await suspend({ questions });
          return;
        }

        // No agent context available: surface the questions as readable text
        // so non-agent execution paths still expose them to the model.
        const fallback = questions
          .map((question) => {
            const options = question.options?.length
              ? ` Options: ${question.options.map((o) => o.label).join(', ')}.`
              : '';

            return `[Question for user]: ${question.question}${options}`;
          })
          .join('\n');

        return { content: fallback, isError: false };
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';

        return { content: `Failed to ask user: ${msg}`, isError: true };
      }
    },
  });
};
