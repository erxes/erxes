import { AsyncLocalStorage } from 'node:async_hooks';
// createCodeMode owns a Zod v4 output object; nested fields must use v4 too.
import { z } from 'zod/v4';
import type { IAgentsIssuedReference } from '@/agents/references';
import type { Tool } from '@mastra/core/tools' with {
  'resolution-mode': 'import',
};
import { buildGraphqlTools } from '@/agents/graphqlTools';
import {
  parseAgentGraphqlOperation,
  requiresGraphqlApproval,
} from '@/agents/graphqlPolicy';
import { readApprovalMode, readIdentity, toToolFailure } from '@/agents/tools';

const AGENTS_CODE_MODE_TIMEOUT_MS = 15_000;
const MAX_CODE_REFERENCES = 250;
const referenceCollectors = new AsyncLocalStorage<IAgentsIssuedReference[]>();
const manifestSchema = z.object({
  version: z.literal(1),
  items: z
    .array(
      z.object({
        handle: z.string().uuid(),
        type: z.enum([
          'customer',
          'company',
          'user',
          'product',
          'structureEntity',
          'brand',
          'deal',
          'conversation',
          'page',
        ]),
        id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
        label: z.string().min(1).max(80),
        path: z.string().optional(),
      }),
    )
    .max(MAX_CODE_REFERENCES),
});

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
            const { query, operationName, variables } = input as {
              query: string;
              operationName?: string;
              variables?: Record<string, unknown>;
            };
            const parsed = parseAgentGraphqlOperation(query, operationName, variables);
            if (requiresGraphqlApproval(parsed, readApprovalMode(context))) {
              return {
                status: 'error',
                code: 'APPROVAL_REQUIRED',
                error:
                  'This mutation requires approval. Call callGraphql directly in chat.',
              };
            }
            if (!callGraphql.execute)
              throw new Error('callGraphql is not executable.');
            const result: unknown = await callGraphql.execute(input, context);
            // Collect only actual host bridge outputs, outside the program's
            // control. A program can return arbitrary JSON in its result.
            const parsedResult = z
              .object({
                status: z.literal('ok'),
                referenceManifest: manifestSchema,
              })
              .safeParse(result);
            const collector = referenceCollectors.getStore();
            if (collector && parsedResult.success) {
              collector.push(
                ...parsedResult.data.referenceManifest.items.slice(
                  0,
                  MAX_CODE_REFERENCES - collector.length,
                ),
              );
            }
            return result;
          } catch (error) {
            return toToolFailure(error);
          }
        },
      };
      const { tool, instructions } = createCodeMode(
        {
          tools: { searchGraphql, callGraphql: safeCallGraphql },
          timeout: AGENTS_CODE_MODE_TIMEOUT_MS,
        },
        new QuickJsCodeModeTransport(),
      );
      // Mastra's createCodeMode returns a Zod object. Extend its existing
      // output contract; never authorize manifests returned by sandbox code.
      const schema = tool.outputSchema as unknown as {
        extend: (fields: {
          referenceManifest: typeof manifestSchema;
        }) => NonNullable<Tool['outputSchema']>;
      };
      if (!tool.execute || typeof schema?.extend !== 'function') {
        throw new Error('Unsupported code mode output contract.');
      }
      const execute = tool.execute;
      const verifiedTool: Tool = {
        ...tool,
        outputSchema: schema.extend({ referenceManifest: manifestSchema }),
        execute: (input, context) =>
          referenceCollectors.run([], async () => {
            const result: unknown = await execute(input, context);
            const items = referenceCollectors.getStore() ?? [];
            if (
              !result ||
              typeof result !== 'object' ||
              Array.isArray(result)
            ) {
              throw new Error('Invalid code mode result.');
            }
            return { ...result, referenceManifest: { version: 1, items } };
          }),
      };
      return { tool: verifiedTool, instructions };
    })();
  }
  return codeModeAdditionPromise;
};
