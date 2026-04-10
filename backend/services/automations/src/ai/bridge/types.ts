import { TAiAgentInput } from '../aiAgent';

export type TAiBridgeHealthStatus = 'ok' | 'warning' | 'error' | 'skipped';

export type TAiBridgeConnection = TAiAgentInput['connection'];
export type TAiBridgeRuntime = TAiAgentInput['runtime'];

export type TAiBridgeMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
};

export type TAiBridgeInvokeResult = {
  text: string;
  raw?: any;
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
