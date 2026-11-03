import { aiAgentActionConfigSchema } from 'erxes-api-shared/core-modules';

export type {
  TAiAgentActionConfig,
  TAiAgentObjectField,
  TAiAgentToolConfig,
} from 'erxes-api-shared/core-modules';

export type TAiToolCallTrace = {
  name: string;
  kind: 'helper' | 'handoff';
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
};

export type TAiActionExecutionResult =
  | {
      type: 'generateText';
      text: string;
      attributes?: Record<string, unknown>;
      // Tool calls made during generation (history/debugging)
      toolCalls?: TAiToolCallTrace[];
      // Tool definitions offered to the provider on this run (debugging)
      toolsOffered?: string[];
      degraded?: boolean;
      // Figures the first draft stated that no source or message contained
      ungroundedNumbers?: string[];
      // What this run is about, kept so actions behind a tool can file their
      // results in long-term memory after the agent has finished
      memoryScopes?: { type: string; id: string }[];
      // Set when the agent handed the conversation off to a tool route
      handoff?: {
        toolId: string;
        name: string;
        args: Record<string, unknown>;
      };
      // Handoff arguments, exposed for {{ actions.<id>.args.* }} placeholders
      args?: Record<string, unknown>;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    }
  | {
      type: 'splitTopic';
      topicId: string | null;
      matched: boolean;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    }
  | {
      type: 'classification';
      attributes: Record<string, unknown>;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
      };
    };

export const parseAiAgentActionConfig = (input: unknown) => {
  return aiAgentActionConfigSchema.parse(input);
};
