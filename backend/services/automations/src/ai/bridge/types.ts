import { TAiAgentInput } from '../aiAgent';

export type TAiBridgeHealthStatus = 'ok' | 'warning' | 'error' | 'skipped';

export type TAiBridgeConnection = TAiAgentInput['connection'];
export type TAiBridgeRuntime = TAiAgentInput['runtime'];

// JSON-schema-ish function definition sent to the provider
export type TAiBridgeToolDefinition = {
  name: string;
  description?: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
};

export type TAiBridgeToolCall = {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
};

export type TAiBridgeMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  // Set on assistant turns that requested tool calls
  toolCalls?: TAiBridgeToolCall[];
  // Set on tool result turns
  toolCallId?: string;
};

export type TAiBridgeHealthInput = {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
};

export type TAiBridgeHealthResult = {
  ready: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    credentials: TAiBridgeHealthStatus;
    endpoint: TAiBridgeHealthStatus;
    model: TAiBridgeHealthStatus;
  };
};

export type TAiBridgeInvokeInput = {
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
  messages: TAiBridgeMessage[];
  responseFormat?: 'json' | 'text';
  tools?: TAiBridgeToolDefinition[];
};

export type TAiBridgeInvokeResult = {
  text: string;
  raw?: any;
  toolCalls?: TAiBridgeToolCall[];
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
};

export interface IAiProviderBridge {
  checkHealth(input: TAiBridgeHealthInput): Promise<TAiBridgeHealthResult>;
  invoke(input: TAiBridgeInvokeInput): Promise<TAiBridgeInvokeResult>;
}
