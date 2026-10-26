import {
  AGENTS_PAGE_SELECTIONS_DATA_TYPE,
  readPageSelectionsPart,
} from '../pageSelections';
import { PageSelectionContext } from './PageSelectionContext';
import { isDataUIPart, isTextUIPart, isToolUIPart } from 'ai';
import type { UIMessage } from 'ai';

import { ApprovalPrompt, ApprovalStatusRow } from './ApprovalPrompt';
import {
  AskUserAnswered,
  AskUserPrompt,
  type IAskUserQuestionGroup,
} from './AskUserPrompt';
import {
  readAskUserAnswers,
  readAskUserQuestionsFromInput,
  type IAskUserAnswerEntry,
} from '../askUserAnswers';
import { MessageContent } from '../artifacts/MessageContent';
import { ArtifactToolResult } from '../artifacts/ArtifactToolResult';
import {
  AGENTS_FILES_DATA_TYPE,
  agentsFilesNotice,
  readAgentsFilesPart,
} from '../agentsFiles';
import { AttachedFiles } from './AttachedFiles';
import type { IAgentToolStep } from '../utils/agentWorkSteps';
import { TextWithAgentReferences } from './TextWithAgentReferences';

type TMessagePart = UIMessage['parts'][number];

export interface IMessagePartRendererProps {
  part: TMessagePart;
  role: UIMessage['role'];
  /** True while the approval decision is being submitted. */
  approvalBusy: boolean;
  onApprovalRespond: (decision: {
    approvalId: string;
    approved: boolean;
    reason?: string;
  }) => void;
  /** True while an ask_user answer is being submitted. */
  answerBusy: boolean;
  onAnswer: (answer: string | string[] | (string | string[])[]) => void;
  /** Tool calls already resolved somewhere in the message. */
  answeredToolCallIds: Set<string>;
  isStreaming?: boolean;
}

/**
 * Extracts the ask_user questions from a `data-tool-call-suspended` data
 * part emitted by the backend when the ask_user tool suspends. The payload
 * carries a `questions` batch (the plugin's multi-question tool); a legacy
 * single-question payload is normalized into a one-entry group. Returns
 * null for every other suspension or a malformed payload.
 */
const readAskUserQuestions = (
  part: TMessagePart,
): IAskUserQuestionGroup | null => {
  if (!isDataUIPart(part)) {
    return null;
  }

  const typed = part as { type: string; data?: unknown };

  if (typed.type !== 'data-tool-call-suspended') {
    return null;
  }

  const data = typed.data as {
    toolName?: string;
    toolCallId?: string;
    suspendPayload?: {
      questions?: unknown;
      question?: unknown;
      options?: unknown;
      selectionMode?: unknown;
    };
  } | null;

  if (data?.toolName !== 'askUser') {
    return null;
  }

  if (!data.suspendPayload) {
    return null;
  }

  const questions = readAskUserQuestionsFromInput(data.suspendPayload);

  return questions.length ? { questions } : null;
};

const toolNameOf = (part: TMessagePart): string =>
  'toolName' in part ? part.toolName : part.type.slice('tool-'.length);

const toolStepOf = (part: TMessagePart): IAgentToolStep | null => {
  if (!isToolUIPart(part)) {
    return null;
  }

  return {
    toolCallId: part.toolCallId,
    toolName: toolNameOf(part),
    state: part.state,
    input: part.input,
    output: 'output' in part ? part.output : undefined,
    errorText: 'errorText' in part ? part.errorText : undefined,
    approval: part.approval,
  };
};

/**
 * Extracts the answered Q&A pairs from an askUser tool part in its
 * `output-available` state — the settled card that replaces the suspension
 * prompt and survives reloads (the questions live in the tool input, the
 * answers in the tool result). Returns null for every other tool or an
 * unparseable result.
 */
const readAskUserAnswerCard = (
  part: TMessagePart,
): IAskUserAnswerEntry[] | null => {
  if (!isToolUIPart(part) || part.state !== 'output-available') {
    return null;
  }

  if (!/^ask_?user$/i.test(toolNameOf(part))) {
    return null;
  }

  const questions = readAskUserQuestionsFromInput(part.input);

  if (!questions.length) {
    return null;
  }

  return readAskUserAnswers(
    questions,
    'output' in part ? part.output : undefined,
  );
};

/**
 * Message-level variant: the answered Q&A pairs of the message's settled
 * askUser tool part, or null when there is none. The transcript uses this
 * to detect the ask_user turn a following answer bubble belongs to.
 */
export const readMessageAskUserAnswerCard = (
  message: UIMessage,
): IAskUserAnswerEntry[] | null => {
  for (const part of message.parts) {
    const card = readAskUserAnswerCard(part);

    if (card) {
      return card;
    }
  }

  return null;
};

/**
 * Whether an assistant message renders anything at all outside the work
 * steps: text, an approval prompt/status, an unanswered ask_user card, or
 * an answered ask_user Q&A card. Reasoning/tool parts count through the
 * work-steps group, so this is only used to drop messages whose EVERY part
 * is hidden.
 */
export const hasVisibleParts = (
  parts: TMessagePart[],
  answeredToolCallIds: Set<string>,
): boolean =>
  parts.some((part) => {
    if (isTextUIPart(part)) {
      return part.text.trim().length > 0;
    }

    if (isToolUIPart(part)) {
      return part.state !== 'output-error' || Boolean(part.errorText);
    }

    if (isDataUIPart(part)) {
      if (part.type === AGENTS_PAGE_SELECTIONS_DATA_TYPE)
        return readPageSelectionsPart(part).length > 0;
      if (part.type === AGENTS_FILES_DATA_TYPE) {
        return readAgentsFilesPart(part).length > 0;
      }

      const group = readAskUserQuestions(part);

      if (!group) {
        return false;
      }

      const typed = part as { data?: { toolCallId?: string } };

      return (
        !typed.data?.toolCallId ||
        !answeredToolCallIds.has(typed.data.toolCallId)
      );
    }

    return false;
  });

/**
 * Renders one non-work part of a message: text (markdown for the
 * assistant), attachments, approval prompts/status rows, and ask_user
 * cards. Reasoning and ordinary tool parts are grouped upstream by
 * `groupAgentWorkSteps` and never reach this renderer.
 */
export const MessagePartRenderer = ({
  part,
  role,
  approvalBusy,
  onApprovalRespond,
  answerBusy,
  onAnswer,
  answeredToolCallIds,
  isStreaming = false,
}: IMessagePartRendererProps) => {
  if (isTextUIPart(part)) {
    if (role === 'user') {
      return (
        <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed md:text-sm md:leading-6">
          <TextWithAgentReferences text={part.text} />
        </p>
      );
    }

    return <MessageContent content={part.text} />;
  }

  if (isToolUIPart(part)) {
    const answerCard = readAskUserAnswerCard(part);

    if (answerCard) {
      return <AskUserAnswered answers={answerCard} />;
    }

    const tool = toolStepOf(part);

    if (!tool) {
      return null;
    }

    if (tool.toolName === 'createArtifact') {
      return <ArtifactToolResult tool={tool} isStreaming={isStreaming} />;
    }

    if (part.state === 'approval-requested' && tool.approval) {
      return (
        <ApprovalPrompt
          tool={tool}
          busy={approvalBusy}
          onRespond={({ approved, reason }) =>
            onApprovalRespond({
              approvalId: tool.approval?.id ?? part.toolCallId,
              approved,
              reason,
            })
          }
        />
      );
    }

    if (part.state === 'approval-responded' || part.state === 'output-denied') {
      return <ApprovalStatusRow tool={tool} />;
    }

    // Failed work tools surface as a red row outside the collapsible group
    // so the error is not hidden.
    if (part.state === 'output-error' && tool.errorText) {
      return (
        <p className="my-1.5 text-xs text-destructive">
          {tool.toolName === 'callTool' || tool.toolName === 'callGraphql'
            ? `Action failed: ${tool.errorText}`
            : tool.errorText}
        </p>
      );
    }

    return null;
  }

  // Data parts: the ask_user suspension carries the questions the assistant
  // asked; approval suspensions' metadata is already surfaced by the tool
  // part above. Everything else stays hidden. An answered suspension's data
  // part stays in the message, so the card is dropped once its tool call is
  // resolved.
  if (isDataUIPart(part)) {
    if (part.type === AGENTS_PAGE_SELECTIONS_DATA_TYPE)
      return (
        <>
          {readPageSelectionsPart(part).map((selection) => (
            <PageSelectionContext key={selection.id} selection={selection} />
          ))}
        </>
      );
    if (part.type === AGENTS_FILES_DATA_TYPE) {
      const files = readAgentsFilesPart(part);

      if (files.length === 0) {
        return null;
      }

      return <AttachedFiles files={files} notice={agentsFilesNotice(part)} />;
    }

    const group = readAskUserQuestions(part);

    if (!group) {
      return null;
    }

    const typed = part as { data?: { toolCallId?: string } };

    if (
      typed.data?.toolCallId &&
      answeredToolCallIds.has(typed.data.toolCallId)
    ) {
      return null;
    }

    return (
      <AskUserPrompt
        key={typed.data?.toolCallId ?? JSON.stringify(group.questions)}
        group={group}
        busy={answerBusy}
        onAnswer={onAnswer}
      />
    );
  }

  return null;
};
