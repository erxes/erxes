import type { Tool } from '@mastra/core/tools' with {
  'resolution-mode': 'import',
};
import {
  buildAgentsTools,
  isGatedAgentToolCall,
  readApprovalMode,
} from '@/agents/tools';

/**
 * Code mode: the tenant's chat agent additionally carries a tool that
 * executes model-authored TypeScript in an in-process QuickJS (WebAssembly)
 * sandbox — the default "built-in server" environment. The WASM boundary
 * gives guest code a bare global object (no filesystem, network, process,
 * timer, or module access); the only capabilities inside the sandbox are
 * the injected `external_*` bridges to this module's allow-listed tools.
 *
 * Sandbox bounds come from the transport's documented defaults (128 MiB
 * heap, 1 MiB stack) plus the plugin's own wall-clock timeout below.
 *
 * SECURITY: Mastra's code-mode dispatcher invokes `tool.execute` directly,
 * so the agent pipeline's `requireApproval` suspension never runs for
 * `external_*` calls. The allow-list therefore carries a wrapped `callTool`
 * that refuses approval-gated tool ids (destructive, or on the
 * always-confirm list) instead of executing them — those tools must be
 * called interactively, where the approval UI works. `askUser` is
 * deliberately excluded: suspending from inside a sandboxed program has
 * unverified semantics.
 */

const AGENTS_CODE_MODE_TIMEOUT_MS = 15_000;

type MastraTool = Tool;

export interface IAgentsCodeModeAddition {
  tool: MastraTool;
  instructions: string;
}

let codeModeAdditionPromise: Promise<IAgentsCodeModeAddition> | null = null;

/**
 * Builds the code-mode tool plus its instructions, once per process: it
 * wraps the process-wide two-tier bridge tools, which never change.
 */
export const buildCodeModeAddition =
  (): Promise<IAgentsCodeModeAddition> => {
    if (!codeModeAdditionPromise) {
      codeModeAdditionPromise = (async () => {
        const { createCodeMode } = await import('@mastra/core/tools');
        const { QuickJsCodeModeTransport } = await import('@mastra/quickjs');
        const { searchTools, callTool } = await buildAgentsTools();

        const safeCallTool: MastraTool = {
          ...callTool,
          execute: async (input, context) => {
            const toolId = (input as { toolId?: unknown })?.toolId;
            const subdomain = context.requestContext?.get('subdomain');

            // Fail closed: without the forwarded request context the
            // caller's tenant cannot be verified, so nothing executes.
            if (typeof subdomain !== 'string') {
              return {
                status: 'error',
                error:
                  'The request context is missing; tool calls from code are refused.',
                code: 'SERVER_ERROR',
              };
            }

            if (
              typeof toolId === 'string' &&
              (await isGatedAgentToolCall(
                subdomain,
                toolId,
                readApprovalMode(context),
              ))
            ) {
              return {
                status: 'error',
                error: `Tool "${toolId}" requires user approval and cannot be run from code. Call this tool directly instead of inside your program.`,
                code: 'APPROVAL_REQUIRED',
              };
            }

            if (!callTool.execute) {
              throw new Error('callTool is not executable.');
            }

            return callTool.execute(input, context);
          },
        };

        const { tool, instructions } = createCodeMode(
          {
            tools: { searchTools, callTool: safeCallTool },
            timeout: AGENTS_CODE_MODE_TIMEOUT_MS,
          },
          new QuickJsCodeModeTransport(),
        );

        return { tool, instructions };
      })();
    }

    return codeModeAdditionPromise;
  };
