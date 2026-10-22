import { isToolUIPart } from 'ai';
import type { AgentsUIMessage } from './types';

export interface IAgentsApprovalDecision {
  toolCallId: string;
  approved: boolean;
  reason?: string;
}

/**
 * Mastra suspends at one tool call, even when the model emitted several.
 * Later input-available calls cannot finish until that suspension resumes.
 * Only approval requests actually presented to the user must be answered.
 */
export const getAgentsApprovalDecision = (
  messages: AgentsUIMessage[],
): IAgentsApprovalDecision | undefined => {
  const message = messages[messages.length - 1];
  if (message?.role !== 'assistant') return undefined;
  const lastStep = message.parts.reduce(
    (last, part, index) => (part.type === 'step-start' ? index : last),
    -1,
  );
  const tools = message.parts.slice(lastStep + 1).filter(isToolUIPart);
  if (tools.some((part) => part.state === 'approval-requested'))
    return undefined;
  for (let index = tools.length - 1; index >= 0; index -= 1) {
    const part = tools[index];
    if (part.state === 'approval-responded') {
      return {
        toolCallId: part.toolCallId,
        approved: part.approval.approved,
        ...(part.approval.reason ? { reason: part.approval.reason } : {}),
      };
    }
  }
  return undefined;
};

export const hasAgentsApprovalDecision = ({
  messages,
}: {
  messages: AgentsUIMessage[];
}): boolean => getAgentsApprovalDecision(messages) !== undefined;
