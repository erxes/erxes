import type { DynamicToolUIPart, UIMessage } from 'ai';
import { agentsFilesDisplayText } from './agentsFiles';

import type {
  IStoredMessage,
  IStoredMessagePart,
  IStoredToolInvocation,
} from './types';

/**
 * Maps one stored Mastra tool invocation to the AI SDK's `dynamic-tool` UI
 * part. The agents' tools are resolved server-side, so the client does not
 * declare them in its `useChat` generics; `dynamic-tool` is the SDK's native
 * shape for such tools.
 */
const mapToolInvocation = (
  invocation: IStoredToolInvocation,
): DynamicToolUIPart | null => {
  const base = {
    type: 'dynamic-tool' as const,
    toolName: invocation.toolName,
    toolCallId: invocation.toolCallId,
  };

  switch (invocation.state) {
    case 'partial-call':
      return { ...base, state: 'input-streaming', input: invocation.args };
    case 'call':
      return { ...base, state: 'input-available', input: invocation.args };
    case 'result':
      return {
        ...base,
        state: 'output-available',
        input: invocation.args,
        output: invocation.result,
      };
    case 'approval-requested':
      if (!invocation.approval?.id) {
        return null;
      }
      return {
        ...base,
        state: 'approval-requested',
        input: invocation.args,
        approval: { id: invocation.approval.id },
      };
    case 'approval-responded':
      if (!invocation.approval?.id) {
        return null;
      }
      return {
        ...base,
        state: 'approval-responded',
        input: invocation.args,
        approval: {
          id: invocation.approval.id,
          approved: invocation.approval.approved === true,
          reason: invocation.approval.reason,
        },
      };
    case 'output-error':
      return {
        ...base,
        state: 'output-error',
        input: invocation.args,
        errorText: invocation.errorText ?? 'Tool execution failed.',
      };
    case 'output-denied':
      return {
        ...base,
        state: 'output-denied',
        input: invocation.args,
        approval: {
          id: invocation.approval?.id ?? invocation.toolCallId,
          approved: false,
          reason: invocation.approval?.reason,
        },
      };
    default:
      return null;
  }
};

/** Maps one stored Mastra format-2 content part to a UIMessage part. */
const mapPart = (part: IStoredMessagePart): UIMessage['parts'][number] | null => {
  if (part.type === 'text' && typeof part.text === 'string') {
    return { type: 'text', text: part.text };
  }

  if (part.type === 'reasoning' && typeof part.text === 'string') {
    return { type: 'reasoning', text: part.text };
  }

  if (part.type === 'step-start') {
    return { type: 'step-start' };
  }

  if (part.type === 'tool-invocation' && part.toolInvocation) {
    return mapToolInvocation(part.toolInvocation);
  }

  // Native data parts (e.g. `data-tool-call-approval`) pass through so the
  // UI can render approval metadata stored alongside the message.
  if (part.type.startsWith('data-')) {
    return part as unknown as UIMessage['parts'][number];
  }

  return null;
};

/**
 * Converts stored Mastra thread messages (as returned by the
 * `agentsThreadDetail` GraphQL query) into AI SDK `UIMessage`s that
 * `useChat` can render. Messages with no renderable parts are dropped.
 */
export const mapStoredMessagesToUIMessages = (
  messages: IStoredMessage[],
): UIMessage[] => {
  const uiMessages: UIMessage[] = [];

  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') {
      continue;
    }

    const parts = (message.content?.parts ?? [])
      .map(mapPart)
      .filter((part): part is UIMessage['parts'][number] => part !== null);

    if (parts.length === 0 && typeof message.content?.content === 'string') {
      parts.push({ type: 'text', text: message.content.content });
    }

    if (parts.length === 0) {
      continue;
    }

    const displayText = message.role === 'user'
      ? agentsFilesDisplayText(parts)
      : undefined;
    uiMessages.push({
      id: message.id,
      role: message.role,
      parts: displayText !== undefined
        ? [
            { type: 'text', text: displayText },
            ...parts.filter((part) => part.type !== 'text'),
          ]
        : parts,
      metadata: {
        createdAt: message.createdAt,
      },
    });
  }

  return uiMessages;
};
