import { Document } from 'mongoose';

// A persisted chat session (thread) between a user and an agent. Survives page
// reloads — replaces the previous browser-only / LibSQL-file memory.
export interface IMastraThread {
  threadId: string;
  agentId: string;
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

export interface IMastraMessage {
  threadId: string;
  role: MastraMessageRole;
  content: string;
}

export interface IMastraMessageDocument extends IMastraMessage, Document {
  _id: string;
  createdAt: Date;
}
