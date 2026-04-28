import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IAiAgentFile {
  id: string;
  key: string;
  name: string;
  size?: number;
  type?: string;
  uploadedAt?: Date | string;
  versions?: IAiAgentFileVersion[];
}

export interface IAiAgentFileVersion {
  key: string;
  name: string;
  size?: number;
  type?: string;
  uploadedAt?: Date | string;
}

export interface IAiAgentConnectionConfig {
  apiKey?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface ICloudflareAiGatewayAgentConnection {
  provider: 'cloudflare-ai-gateway';
  model: string;
  config: IAiAgentConnectionConfig & {
    accountId?: string;
    gatewayId?: string;
    gatewayToken?: string;
    mode?: 'compat' | 'openai-provider';
  };
}

export interface IOpenAIAgentConnection {
  provider: 'openai';
  model: string;
  config: IAiAgentConnectionConfig;
}

export type IAiAgentConnection =
  | ICloudflareAiGatewayAgentConnection
  | IOpenAIAgentConnection;

export interface ILegacyAiAgentConnectionConfig {
  apiKey?: string;
  baseUrl?: string;
  headers?: Record<string, string>;
  accountId?: string;
  gatewayId?: string;
  gatewayToken?: string;
  mode?: 'compat' | 'openai-provider';
  cloudflare?: {
    accountId?: string;
    gatewayId?: string;
    gatewayToken?: string;
    mode?: 'compat' | 'openai-provider';
  };
  [key: string]: any;
}

export interface IAiAgentRuntime {
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

export interface IAiAgentContext {
  systemPrompt: string;
  files: IAiAgentFile[];
}

export interface IAiAgent {
  name: string;
  description: string;
  connection: IAiAgentConnection;
  runtime: IAiAgentRuntime;
  context: IAiAgentContext;
}

export interface AiAgentDocument extends IAiAgent {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const aiAgentFileVersionSchema = new Schema<IAiAgentFileVersion>(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number },
    type: { type: String },
    uploadedAt: { type: Date },
  },
  { _id: false },
);

const aiAgentFileSchema = new Schema<IAiAgentFile>(
  {
    id: { type: String, required: true },
    key: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number },
    type: { type: String },
    uploadedAt: { type: Date },
    versions: {
      type: [aiAgentFileVersionSchema],
      default: () => [],
    },
  },
  { _id: false },
);

const aiAgentConnectionSchema = new Schema<IAiAgentConnection>(
  {
    provider: {
      type: String,
      required: true,
      enum: ['cloudflare-ai-gateway', 'openai'],
      default: 'cloudflare-ai-gateway',
    },
    model: { type: String, required: true, default: 'openai/gpt-5-mini' },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  { _id: false },
);

const aiAgentRuntimeSchema = new Schema<IAiAgentRuntime>(
  {
    temperature: { type: Number, default: 0.2 },
    maxTokens: { type: Number, default: 500 },
    timeoutMs: { type: Number, default: 15000 },
  },
  { _id: false },
);

const aiAgentContextSchema = new Schema<IAiAgentContext>(
  {
    systemPrompt: { type: String, default: '' },
    files: {
      type: [aiAgentFileSchema],
      default: () => [],
    },
  },
  { _id: false },
);

export const aiAgentSchema = new Schema<AiAgentDocument>(
  {
    _id: {
      type: String,
      default: () => nanoid(),
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    connection: {
      type: aiAgentConnectionSchema,
      required: true,
    },
    runtime: {
      type: aiAgentRuntimeSchema,
      default: () => ({}),
    },
    context: {
      type: aiAgentContextSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);
