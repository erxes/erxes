import type { AssistantChatRequest, AssistantMessagePart } from '@erxes/core-contract';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { AskUserOutput } from './tools/askUser';

type Part = z.infer<typeof AssistantMessagePart>;

const PendingApproval = z.looseObject({
  type: z.string().startsWith('tool-'),
  toolCallId: z.string(),
  state: z.literal('approval-requested'),
  approval: z.looseObject({ id: z.string() }),
});

const ApprovalAnswer = z.looseObject({
  toolCallId: z.string(),
  state: z.literal('approval-responded'),
  approval: z.object({
    id: z.string(),
    approved: z.boolean(),
    reason: z.string().max(500).optional(),
  }),
});

const PendingQuestion = z.looseObject({
  type: z.literal('tool-ask_user'),
  toolCallId: z.string(),
  state: z.literal('input-available'),
});

const QuestionAnswer = z.looseObject({
  toolCallId: z.string(),
  state: z.literal('output-available'),
  output: AskUserOutput,
});

const answerTo = (part: Part, sent: Part[]): Part | null => {
  const approval = PendingApproval.safeParse(part);

  if (approval.success) {
    const answer = sent
      .map((candidate) => ApprovalAnswer.safeParse(candidate).data)
      .find(
        (candidate) =>
          candidate?.toolCallId === approval.data.toolCallId &&
          candidate.approval.id === approval.data.approval.id,
      );

    return answer ? { ...part, state: 'approval-responded', approval: answer.approval } : null;
  }

  const question = PendingQuestion.safeParse(part);

  if (!question.success) return null;

  const answer = sent
    .map((candidate) => QuestionAnswer.safeParse(candidate).data)
    .find((candidate) => candidate?.toolCallId === question.data.toolCallId);

  return answer ? { ...part, state: 'output-available', output: answer.output } : null;
};

export const continueReply = (
  stored: { id: string; role: string; parts: Part[] } | undefined,
  sent: AssistantChatRequest['message'],
) => {
  if (stored?.role !== 'assistant' || stored.id !== sent.id) {
    throw fail(
      'ASSISTANT_STALE',
      'This reply is no longer the latest in the thread; reload it and try again',
    );
  }

  let answered = 0;

  const parts = stored.parts.map((part) => {
    const next = answerTo(part, sent.parts);

    if (!next) return part;

    answered += 1;

    return next;
  });

  if (answered === 0) {
    throw fail('ASSISTANT_NOTHING_TO_CONTINUE', 'The reply has no new approval or answer');
  }

  return { ...stored, parts };
};
