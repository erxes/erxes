import type { DynamicToolUIPart, ToolUIPart, UIMessage } from 'ai';
import { parse } from 'graphql';

import type { ICallToolInput } from '../types';

type TUIPart = UIMessage['parts'][number];

// Local predicates instead of the `ai` package's is*UIPart helpers: `ai`
// is ESM-only and the module would pull it into every consumer (including
// jest, which runs CJS) for three one-line checks.
const isReasoningPart = (part: TUIPart): part is TUIPart & { text: string } =>
  part.type === 'reasoning';

const isToolPart = (part: TUIPart): part is DynamicToolUIPart | ToolUIPart =>
  part.type === 'dynamic-tool' || part.type.startsWith('tool-');

/** Normalized view of one tool part (live stream or mapped history). */
export interface IAgentToolStep {
  toolCallId: string;
  toolName: string;
  state: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  approval?: { id: string; approved?: boolean; reason?: string };
}

export interface IAgentReasoningStep {
  kind: 'reasoning';
  text: string;
}

export interface IAgentToolStepEntry {
  kind: 'tool';
  tool: IAgentToolStep;
}

export type TAgentWorkStep = IAgentReasoningStep | IAgentToolStepEntry;

export type TAgentTranscriptItem =
  | { kind: 'work'; steps: TAgentWorkStep[] }
  | { kind: 'part'; part: UIMessage['parts'][number]; index: number };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/**
 * First executable operation's kind and root field names in a callGraphql
 * document, or null when the input carries no parseable query. Malformed or
 * absent queries fall back to a generic label.
 */
const summarizeGraphqlCall = (
  input: Record<string, unknown>,
): { operation: string; fields: string[] } | null => {
  const query = input.query;

  if (typeof query !== 'string' || !query.trim()) {
    return null;
  }

  try {
    const document = parse(query);
    const operationName =
      typeof input.operationName === 'string' ? input.operationName : null;
    const operations = document.definitions.filter(
      (definition) => definition.kind === 'OperationDefinition',
    );
    const operation = operationName
      ? operations.find(
          (definition) => definition.name?.value === operationName,
        )
      : operations[0];

    if (!operation) {
      return null;
    }

    const fields = operation.selectionSet.selections
      .filter((selection) => selection.kind === 'Field')
      .map((selection) => selection.name.value);

    return { operation: operation.operation, fields };
  } catch {
    return null;
  }
};

const graphqlCallLabel = (input: Record<string, unknown>): string => {
  const summary = summarizeGraphqlCall(input);

  if (!summary || summary.fields.length === 0) {
    return 'GraphQL request';
  }

  return `${summary.operation} ${summary.fields.join(', ')}`;
};

/**
 * The agents' executable tools wrap the real action: `callTool` carries the
 * platform tool id and `callGraphql` carries a GraphQL document. Surface the
 * wrapped identity as the label so the user sees the actual action, not the
 * generic bridge name.
 */
export const describeToolCall = (
  toolName: string,
  input: unknown,
): { label: string; args: unknown } => {
  if (toolName === 'callTool' && isRecord(input)) {
    const callInput = input as ICallToolInput;

    if (typeof callInput.toolId === 'string' && callInput.toolId) {
      return { label: callInput.toolId, args: callInput.input ?? {} };
    }
  }

  if (toolName === 'callGraphql' && isRecord(input)) {
    return {
      label: graphqlCallLabel(input),
      args: {
        query: input.query,
        ...(input.variables !== undefined
          ? { variables: input.variables }
          : {}),
      },
    };
  }

  return { label: toolName, args: input };
};

const toolNameOf = (part: TUIPart): string =>
  'toolName' in part && typeof part.toolName === 'string'
    ? part.toolName
    : part.type.slice('tool-'.length);

/**
 * Parts rendered as their own cards — pending approvals and ask_user
 * suspensions/results — are never folded into a work-steps group, so a
 * group stops right before them and they surface on their own.
 */
const isStandalonePart = (part: TUIPart): boolean => {
  if (isToolPart(part)) {
    const name = toolNameOf(part);

    return (
      /^ask_?user$/i.test(name) ||
      name === 'createArtifact' ||
      part.state === 'approval-requested' ||
      part.state === 'approval-responded' ||
      part.state === 'output-denied'
    );
  }

  return false;
};

/**
 * Groups an assistant message's parts for the compact transcript:
 * every contiguous run of reasoning + tool parts becomes one collapsible
 * "work" item; text, data, file and standalone tool parts keep their own
 * slots so rendering order is preserved.
 */
export const groupAgentWorkSteps = (
  parts: UIMessage['parts'],
): TAgentTranscriptItem[] => {
  const items: TAgentTranscriptItem[] = [];
  let steps: TAgentWorkStep[] = [];

  const flush = () => {
    if (steps.length) {
      items.push({ kind: 'work', steps });
      steps = [];
    }
  };

  parts.forEach((part, index) => {
    // Step boundaries mark where one model step ends and the next begins —
    // they carry no renderable content, so they neither flush the group
    // nor appear as their own item.
    if (part.type === 'step-start') {
      return;
    }

    if (isReasoningPart(part)) {
      steps.push({ kind: 'reasoning', text: part.text });
      return;
    }

    if (isToolPart(part) && !isStandalonePart(part)) {
      steps.push({
        kind: 'tool',
        tool: {
          toolCallId: part.toolCallId,
          toolName: toolNameOf(part),
          state: part.state,
          input: part.input,
          output: 'output' in part ? part.output : undefined,
          errorText: 'errorText' in part ? part.errorText : undefined,
        },
      });
      return;
    }

    flush();
    items.push({ kind: 'part', part, index });
  });

  flush();

  return items;
};

const singularize = (noun: string): string =>
  noun.endsWith('ies')
    ? `${noun.slice(0, -3)}y`
    : noun.endsWith('s')
    ? noun.slice(0, -1)
    : noun;

const pluralize = (noun: string): string =>
  noun.endsWith('s') ? noun : `${noun}s`;

/**
 * Human label for a `callTool` step derived from the wrapped tool id
 * (`core.trpc.customers.find` → "Looked up customers").
 */
const labelForToolId = (toolId: string): string => {
  const path = toolId.split('.trpc.')[1] ?? toolId;
  const segments = path.split('.').filter(Boolean);
  const action = segments[segments.length - 1] ?? '';
  const resource = segments[segments.length - 2] ?? segments[0] ?? '';
  const singular = singularize(resource);
  const plural = pluralize(resource);

  switch (action) {
    case 'find':
    case 'findAll':
    case 'list':
    case 'get':
      return `Looked up ${plural}`;
    case 'findOne':
    case 'getOne':
    case 'detail':
      return `Opened ${singular}`;
    case 'count':
      return `Counted ${plural}`;
    case 'create':
    case 'add':
      return `Created ${singular}`;
    case 'edit':
    case 'update':
      return `Updated ${singular}`;
    case 'remove':
    case 'delete':
      return `Removed ${singular}`;
    default:
      return `Ran ${path}`;
  }
};

const readFileName = (url: string): string => {
  try {
    const path = url.split('?')[0];
    const segment = path.split('/').filter(Boolean).pop();

    return segment ? decodeURIComponent(segment) : 'file';
  } catch {
    return 'file';
  }
};

/** Display label for one work-steps row. */
export const agentStepLabel = (step: TAgentWorkStep): string => {
  if (step.kind === 'reasoning') {
    return 'Thought';
  }

  const { tool } = step;

  if (tool.toolName === 'searchTools') {
    const intent =
      isRecord(tool.input) && typeof tool.input.intent === 'string'
        ? tool.input.intent
        : '';
    return intent ? `Searched tools for "${intent}"` : 'Searched tools';
  }

  if (tool.toolName === 'searchGraphql') {
    const intent =
      isRecord(tool.input) && typeof tool.input.intent === 'string'
        ? tool.input.intent
        : '';
    return intent ? `Searched API for "${intent}"` : 'Searched API';
  }

  if (tool.toolName === 'callGraphql') {
    const summary = isRecord(tool.input)
      ? summarizeGraphqlCall(tool.input)
      : null;

    if (!summary || summary.fields.length === 0) {
      return 'Ran a GraphQL request';
    }

    const fields = summary.fields.join(', ');

    return summary.operation === 'query'
      ? `Queried ${fields}`
      : `Ran ${fields}`;
  }

  if (tool.toolName === 'callTool') {
    const input = tool.input as ICallToolInput | undefined;
    const toolId =
      input && typeof input.toolId === 'string' ? input.toolId : '';
    return toolId ? labelForToolId(toolId) : 'Ran a tool';
  }

  if (tool.toolName === 'readFile') {
    const url =
      isRecord(tool.input) && typeof tool.input.url === 'string'
        ? tool.input.url
        : '';
    return `Read ${readFileName(url)}`;
  }

  if (tool.toolName === 'execute_typescript') {
    return 'Ran code';
  }

  return `Ran ${tool.toolName}`;
};

/** The newest meaningful part owns the turn's single live activity label. */
export const agentMessageActivity = (parts: UIMessage['parts']): string => {
  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (part.type === 'text' && 'text' in part && part.text.trim())
      return 'Writing…';
    if (isReasoningPart(part)) return 'Thinking…';
    if (!isToolPart(part)) continue;
    if (part.state !== 'input-streaming' && part.state !== 'input-available')
      return 'Working…';
    const name = toolNameOf(part);
    const input = isRecord(part.input) ? part.input : {};
    switch (name) {
      case 'createArtifact':
        return 'Creating file…';
      case 'searchTools':
      case 'searchGraphql':
        return 'Searching workspace…';
      case 'findPages':
        return 'Finding a page…';
      case 'readFile':
        return typeof input.url === 'string'
          ? `Reading ${readFileName(input.url)}`
          : 'Reading file…';
      case 'execute_typescript':
        return 'Running code…';
      case 'callGraphql': {
        const summary = summarizeGraphqlCall(input);
        return summary?.fields.length
          ? `${
              summary.operation === 'mutation' ? 'Running' : 'Querying'
            } ${summary.fields.join(', ')}`
          : 'Looking up workspace data…';
      }
      case 'askUser':
        return 'Preparing a question…';
      default:
        return 'Working…';
    }
  }
  return 'Working…';
};
