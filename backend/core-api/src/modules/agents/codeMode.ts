import type { Tool } from '@mastra/core/tools' with {
  'resolution-mode': 'import',
};
import { buildGraphqlTools } from '@/agents/graphqlTools';
import { parseAgentGraphqlOperation, requiresGraphqlApproval } from '@/agents/graphqlPolicy';
import { readApprovalMode, readIdentity, toToolFailure } from '@/agents/tools';

const AGENTS_CODE_MODE_TIMEOUT_MS = 15_000;

export interface IAgentsCodeModeAddition {
  tool: Tool;
  instructions: string;
}

let codeModeAdditionPromise: Promise<IAgentsCodeModeAddition> | null = null;

/** The sandbox has GraphQL bridges only; approval-gated writes run in chat. */
export const buildCodeModeAddition = (): Promise<IAgentsCodeModeAddition> => {
  if (!codeModeAdditionPromise) {
    codeModeAdditionPromise = (async () => {
      const { createCodeMode } = await import('@mastra/core/tools');
      const { QuickJsCodeModeTransport } = await import('@mastra/quickjs');
      const { searchGraphql, callGraphql } = await buildGraphqlTools();
      const safeCallGraphql: Tool = {
        ...callGraphql,
        execute: async (input, context) => {
          try {
            readIdentity(context);
            const { query, operationName } = input as { query: string; operationName?: string };
            const parsed = parseAgentGraphqlOperation(query, operationName);
            if (requiresGraphqlApproval(parsed, readApprovalMode(context))) {
              return {
                status: 'error',
                code: 'APPROVAL_REQUIRED',
                error: 'This mutation requires approval. Call callGraphql directly in chat.',
              };
            }
            if (!callGraphql.execute) throw new Error('callGraphql is not executable.');
            return callGraphql.execute(input, context);
          } catch (error) {
            return toToolFailure(error);
          }
        },
      };
      const { tool, instructions } = createCodeMode(
        { tools: { searchGraphql, callGraphql: safeCallGraphql }, timeout: AGENTS_CODE_MODE_TIMEOUT_MS },
        new QuickJsCodeModeTransport(),
      );
      return { tool, instructions };
    })();
  }
  return codeModeAdditionPromise;
};
