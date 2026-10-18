import { TAiBridgeMessage, TAiBridgeToolDefinition } from '../bridge';
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

// Providers do not enforce the schema: a handoff that skips a required
// argument, invents one, or names a value outside its list goes back to the
// model to correct instead of routing the run on a guess.
export const findInvalidToolArguments = (
  { properties, required = [] }: TAiBridgeToolDefinition['parameters'],
  args: Record<string, unknown>,
) => [
  ...required
    .filter((name) => args[name] == null || args[name] === '')
    .map((name) => `"${name}" is required.`),
  ...Object.keys(args)
    .filter((name) => !(name in properties) && args[name] != null)
    .map((name) => `"${name}" is not a parameter of this tool.`),
  ...Object.entries(properties).flatMap(([name, schema]) => {
    const allowed = schema.enum || schema.items?.enum;
    const values = args[name] == null ? [] : [args[name]].flat();
    const invalid = allowed
      ? values.filter((value) => !allowed.includes(value as string))
      : [];

    return invalid.length
      ? [`"${name}" must be one of the listed values.`]
      : [];
  }),
];

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
    fallback?: boolean;
    toolCalls?: {
      id: string;
      name: string;
      arguments: Record<string, unknown>;
    }[];
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
  }>;
}) => {
  const toolsByName = new Map(
    tools.map((tool) => [tool.definition.name, tool]),
  );
  const definitions = tools.map((tool) => tool.definition);
  const loopMessages = [...messages];
  // Models re-issue the same lookup across iterations; replaying the recorded
  // answer keeps the turn from spending a round on work already done.
  const resultsByCall = new Map<string, unknown>();
  const trace: TAiToolCallTrace[] = [];
  const totalUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  let handoff: TAiHandoffResult | undefined;

  let providerResponse = await invoke(loopMessages, definitions);
  addUsage(totalUsage, providerResponse.usage);
  let degraded = !!providerResponse.fallback;

  for (let iteration = 0; iteration < MAX_AI_TOOL_ITERATIONS; iteration++) {
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
      const problems = tool
        ? findInvalidToolArguments(
            tool.definition.parameters,
            handoffCall.arguments || {},
          )
        : [];

      if (problems.length) {
        const error = problems.join(' ');

        trace.push({
          name: handoffCall.name,
          kind: 'handoff',
          arguments: handoffCall.arguments || {},
          error,
        });
        loopMessages.push(
          {
            role: 'assistant',
            content: providerResponse.text || '',
            toolCalls: [handoffCall],
          },
          {
            role: 'tool',
            content: JSON.stringify({ error }),
            toolCallId: handoffCall.id,
          },
        );
        providerResponse = await invoke(loopMessages, definitions);
        addUsage(totalUsage, providerResponse.usage);
        degraded = degraded || !!providerResponse.fallback;
        continue;
      }

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
      const callKey = `${call.name}:${JSON.stringify(call.arguments || {})}`;
      let content: string;

      try {
        if (!tool?.execute) {
          throw new Error(`Unknown tool: ${call.name}`);
        }

        const result = resultsByCall.has(callKey)
          ? resultsByCall.get(callKey)
          : await tool.execute(call.arguments || {});

        resultsByCall.set(callKey, result);
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
    degraded = degraded || !!providerResponse.fallback;
  }

  // Usage covers every provider call of the loop, not just the last one
  return {
    providerResponse: { ...providerResponse, usage: totalUsage },
    // The conversation as the model last saw it, tool results included
    messages: loopMessages,
    handoff,
    toolCallTrace: trace,
    degraded,
  };
};
