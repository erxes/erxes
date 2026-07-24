import {
  TAiBridgeMessage,
  TAiBridgeToolDefinition,
} from '../bridge';
import { TAiToolCallTrace } from './contract';

// A tool wired for one agent run: the provider-facing definition plus how to
// execute it. Handoff tools have no executor — the call ends the turn and
// routing happens via optionalConnects.
export type TAiToolRuntime = {
  toolId: string;
  kind: 'helper' | 'handoff';
  definition: TAiBridgeToolDefinition;
  execute?: (args: Record<string, unknown>) => Promise<unknown>;
};

export type TAiHandoffResult = {
  toolId: string;
  name: string;
  args: Record<string, unknown>;
};

export const MAX_AI_TOOL_ITERATIONS = 5;

const stringifyToolResult = (result: unknown) =>
  typeof result === 'string' ? result : JSON.stringify(result ?? null);

type TAiUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

const addUsage = (total: Required<TAiUsage>, usage?: TAiUsage) => {
  total.inputTokens += usage?.inputTokens || 0;
  total.outputTokens += usage?.outputTokens || 0;
  total.totalTokens += usage?.totalTokens || 0;
};

// Runs the provider conversation until the model answers without tool calls,
// hands off, or the iteration budget runs out. `invoke` is the single-turn
// provider call (timeout fallback handling stays with the caller).
export const runAiToolLoop = async ({
  messages,
  tools,
  invoke,
}: {
  messages: TAiBridgeMessage[];
  tools: TAiToolRuntime[];
  invoke: (
    loopMessages: TAiBridgeMessage[],
    definitions: TAiBridgeToolDefinition[],
  ) => Promise<{
    text: string;
    toolCalls?: { id: string; name: string; arguments: Record<string, unknown> }[];
    usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number };
  }>;
}) => {
  const toolsByName = new Map(tools.map((tool) => [tool.definition.name, tool]));
  const definitions = tools.map((tool) => tool.definition);
  const loopMessages = [...messages];
  const trace: TAiToolCallTrace[] = [];
  const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  let handoff: TAiHandoffResult | undefined;

  let providerResponse = await invoke(loopMessages, definitions);
  addUsage(totalUsage, providerResponse.usage);

  for (
    let iteration = 0;
    iteration < MAX_AI_TOOL_ITERATIONS;
    iteration++
  ) {
    const toolCalls = providerResponse.toolCalls || [];

    if (!toolCalls.length) {
      break;
    }

    // A handoff ends the turn immediately; helper calls in the same turn are
    // dropped on purpose — the routed flow owns what happens next.
    const handoffCall = toolCalls.find(
      (call) => toolsByName.get(call.name)?.kind === 'handoff',
    );

    if (handoffCall) {
      const tool = toolsByName.get(handoffCall.name);
      handoff = {
        toolId: tool?.toolId || handoffCall.name,
        name: handoffCall.name,
        args: handoffCall.arguments || {},
      };
      trace.push({
        name: handoffCall.name,
        kind: 'handoff',
        arguments: handoffCall.arguments || {},
      });
      break;
    }

    loopMessages.push({
      role: 'assistant',
      content: providerResponse.text || '',
      toolCalls,
    });

    for (const call of toolCalls) {
      const tool = toolsByName.get(call.name);
      let content: string;

      try {
        if (!tool?.execute) {
          throw new Error(`Unknown tool: ${call.name}`);
        }

        const result = await tool.execute(call.arguments || {});
        trace.push({
          name: call.name,
          kind: 'helper',
          arguments: call.arguments || {},
          result,
        });
        content = stringifyToolResult(result);
      } catch (error: any) {
        trace.push({
          name: call.name,
          kind: 'helper',
          arguments: call.arguments || {},
          error: error.message,
        });
        content = JSON.stringify({ error: error.message });
      }

      loopMessages.push({
        role: 'tool',
        content,
        toolCallId: call.id,
      });
    }

    providerResponse = await invoke(loopMessages, definitions);
    addUsage(totalUsage, providerResponse.usage);
  }

  // Usage covers every provider call of the loop, not just the last one
  return {
    providerResponse: { ...providerResponse, usage: totalUsage },
    handoff,
    toolCallTrace: trace,
  };
};
