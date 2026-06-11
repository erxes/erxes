import { Document } from 'mongoose';

// A persisted chat session (thread) between a user and an agent. Survives page
// reloads — replaces the previous browser-only / LibSQL-file memory.
export interface IMastraThread {
  threadId: string;
  agentId: string;
  // Owner: in-app user _id or "bot:<id>" for messenger sessions. Optional only
  // for legacy docs created before ownership existed.
  userId?: string;
  title?: string;
  messageCount?: number;
  lastMessageAt?: Date;
}

export interface IMastraThreadDocument extends IMastraThread, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MastraMessageRole = 'user' | 'assistant';

// One tool invocation made during an assistant turn, kept for the expandable
// tool-call detail in the chat UI.
export interface IMastraToolCall {
  toolCallId?: string;
  toolName: string;
  args?: any;
  result?: any;
  isError?: boolean;
}

// Extra turn artifacts persisted alongside the assistant reply text.
export interface IMastraMessageMeta {
  thinking?: string;
  toolCalls?: IMastraToolCall[];
  interrupted?: boolean;
}

export interface IMastraMessage {
  threadId: string;
  role: MastraMessageRole;
  content: string;
  meta?: IMastraMessageMeta;
}

export interface IMastraMessageDocument extends IMastraMessage, Document {
  _id: string;
  createdAt: Date;
}
