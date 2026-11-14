import { AssistantQuestionMode } from '@erxes/core-contract';
import {
  type DynamicToolUIPart,
  getToolName,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  type ToolUIPart,
  type UIMessage,
} from 'ai';
import { z } from 'zod';

type Part = UIMessage['parts'][number];

type ToolPart = ToolUIPart | DynamicToolUIPart;

const CallApiInput = z.object({
  procedure: z.string(),
  input: z.record(z.string(), z.unknown()).optional(),
});

const SearchApiInput = z.object({ query: z.string() });

const Refusal = z.object({ ok: z.literal(false), message: z.string() });

const Question = z.object({
  question: z.string(),
  options: z
    .array(z.object({ label: z.string(), description: z.string().optional() }))
    .optional()
    .transform((options) => options ?? []),
  selectionMode: AssistantQuestionMode.optional(),
});

const AskUserInput = z.object({ questions: z.array(Question).min(1) });

const AskUserOutput = z.object({
  answers: z.array(z.union([z.string(), z.array(z.string())])),
});

export type Question = z.infer<typeof Question>;

export type StepStatus = 'running' | 'waiting' | 'done' | 'failed' | 'declined';

export interface Step {
  key: string;
  tool: string;
  name: string;
  query: string | null;
  status: StepStatus;
  input: unknown;
  output: unknown;
  error: string | null;
}

export type TranscriptRow =
  | { kind: 'text'; key: string; text: string; streaming: boolean }
  | { kind: 'thinking'; key: string; text: string; streaming: boolean }
  | { kind: 'steps'; key: string; steps: Step[] }
  | {
      kind: 'approval';
      key: string;
      approvalId: string;
      procedure: string;
      input: Record<string, unknown>;
    }
  | { kind: 'question'; key: string; toolCallId: string; questions: Question[] }
  | { kind: 'answered'; key: string; answers: { question: string; answer: string }[] };

const statusOf = (part: ToolPart): StepStatus => {
  switch (part.state) {
    case 'input-streaming':
    case 'input-available':
      return 'running';
    case 'approval-requested':
    case 'approval-responded':
      return 'waiting';
    case 'output-error':
      return 'failed';
    case 'output-denied':
      return 'declined';
    case 'output-available':
      return Refusal.safeParse(part.output).success ? 'failed' : 'done';
  }
};

const errorOf = (part: ToolPart) => {
  if (part.state === 'output-error') return part.errorText;

  if (part.state === 'output-available')
    return Refusal.safeParse(part.output).data?.message ?? null;

  return null;
};

const stepOf = (part: ToolPart): Step => {
  const tool = getToolName(part);
  const call = tool === 'callApi' ? CallApiInput.safeParse(part.input).data : undefined;

  return {
    key: part.toolCallId,
    tool,
    name: call?.procedure ?? tool,
    query: tool === 'searchApi' ? (SearchApiInput.safeParse(part.input).data?.query ?? null) : null,
    status: statusOf(part),
    input: call?.input ?? part.input,
    output: part.state === 'output-available' ? part.output : null,
    error: errorOf(part),
  };
};

const answerText = (answer: string | string[] | undefined) =>
  Array.isArray(answer) ? answer.join(', ') : (answer ?? '');

const questionRow = (part: ToolPart): TranscriptRow | null => {
  const asked = AskUserInput.safeParse(part.input).data;

  if (!asked) return null;

  if (part.state === 'output-available') {
    const answers = AskUserOutput.safeParse(part.output).data?.answers ?? [];

    return {
      kind: 'answered',
      key: part.toolCallId,
      answers: asked.questions.map((question, index) => ({
        question: question.question,
        answer: answerText(answers[index]),
      })),
    };
  }

  if (part.state !== 'input-available') return null;

  return { kind: 'question', key: part.toolCallId, toolCallId: part.toolCallId, ...asked };
};

const approvalRow = (part: ToolPart): TranscriptRow | null => {
  if (part.state !== 'approval-requested') return null;

  const call = CallApiInput.safeParse(part.input).data;

  return {
    kind: 'approval',
    key: part.toolCallId,
    approvalId: part.approval.id,
    procedure: call?.procedure ?? getToolName(part),
    input: call?.input ?? {},
  };
};

const rowOfTool = (part: ToolPart): TranscriptRow | Step | null => {
  if (getToolName(part) === 'ask_user') return questionRow(part);

  return approvalRow(part) ?? stepOf(part);
};

const rowOf = (part: Part, index: number): TranscriptRow | Step | null => {
  if (isTextUIPart(part)) {
    return part.text.trim()
      ? {
          kind: 'text',
          key: `text-${index}`,
          text: part.text,
          streaming: part.state === 'streaming',
        }
      : null;
  }

  if (isReasoningUIPart(part)) {
    return part.text.trim()
      ? {
          kind: 'thinking',
          key: `thinking-${index}`,
          text: part.text,
          streaming: part.state === 'streaming',
        }
      : null;
  }

  return isToolUIPart(part) ? rowOfTool(part) : null;
};

const isStep = (row: TranscriptRow | Step): row is Step => !('kind' in row);

export const transcriptRows = (parts: UIMessage['parts']) => {
  const rows: TranscriptRow[] = [];

  parts.forEach((part, index) => {
    const row = rowOf(part, index);

    if (!row) return;

    const last = rows.at(-1);

    if (!isStep(row)) rows.push(row);
    else if (last?.kind === 'steps') last.steps.push(row);
    else rows.push({ kind: 'steps', key: `steps-${row.key}`, steps: [row] });
  });

  return rows;
};

export const pendingAction = (message: UIMessage | undefined): 'approval' | 'question' | null => {
  if (message?.role !== 'assistant') return null;

  const tools = message.parts.filter(isToolUIPart);

  if (tools.some((part) => part.state === 'approval-requested')) return 'approval';

  if (tools.some((part) => getToolName(part) === 'ask_user' && part.state === 'input-available')) {
    return 'question';
  }

  return null;
};

export const answeredQuestions = (part: Part) => {
  if (!isToolUIPart(part) || getToolName(part) !== 'ask_user') return null;

  const row = questionRow(part);

  return row?.kind === 'answered' ? row.answers : null;
};
