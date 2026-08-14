export interface AgentToolField {
  name: string;
  type: string;
  required: boolean;
  enumValues?: string[];
}

export interface AgentToolPermission {
  module: string;
  action: string;
}

export interface AgentToolDescriptor {
  id: string; // e.g. 'sales.model.Deals.find' or 'sales.trpc.deal.findOne'
  kind: 'model' | 'trpc';
  plugin: string;
  module: string; // model name ('Deals') or first tRPC path segment ('deal')
  method: 'query' | 'mutation';
  destructive: boolean;
  description: string;
  inputFields: AgentToolField[] | null; // null = free-form object input
  modelFields?: AgentToolField[]; // model tools only: schema field summary for LLM guidance
  permission: AgentToolPermission | null;
  path?: string; // trpc tools: full procedure path e.g. 'deal.findOne'
  modelName?: string; // model tools only
  op?: 'find' | 'findOne' | 'count' | 'create' | 'update' | 'remove';
}

export interface AgentToolManifest {
  plugin: string;
  tools: AgentToolDescriptor[];
}
