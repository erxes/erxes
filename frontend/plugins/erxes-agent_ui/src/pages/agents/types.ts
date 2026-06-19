export interface IMastraAgent {
  _id: string;
  name: string;
  agentId: string;
  description?: string | null;
  instructions?: string | null;
  provider?: string | null;
  model?: string | null;
  toolPolicy?: 'all' | 'custom' | null;
  allowedTools?: string[] | null;
  destructiveOps?: 'allow' | 'ask' | null;
  memoryEnabled?: boolean | null;
  maxSteps?: number | null;
  temperature?: number | null;
  isEnabled?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMastraAgentResponse {
  mastraAgent: IMastraAgent | null;
}

export interface IErxesTool {
  plugin?: string | null;
  module?: string | null;
  operation: string;
  operationType?: string | null;
  description?: string | null;
  graphqlArgs?: string | null;
  returnType?: string | null;
}

export interface IAvailableErxesToolsResponse {
  mastraAvailableErxesTools: IErxesTool[];
}

export type ToolKind = 'erxes' | 'builtin';

export interface IToolItem {
  kind: ToolKind;
  key: string;
  operation: string;
  operationType?: string;
  plugin: string;
  module: string;
  description: string;
}

export interface IToolModuleGroup {
  module: string;
  items: IToolItem[];
}

export interface IToolPluginGroup {
  pluginKey: string;
  plugin: string;
  isBuiltin: boolean;
  count: number;
  modules: IToolModuleGroup[];
}
