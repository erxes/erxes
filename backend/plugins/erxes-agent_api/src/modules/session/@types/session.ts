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
  // Who set the title: 'derived' (first-message snippet), 'generated' (LLM
  // summary of the conversation), 'manual' (user rename — never overwritten).
  titleSource?: 'derived' | 'generated' | 'manual';
  // messageCount at the last LLM title generation — drives periodic refresh.
  titleMessageCount?: number;
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

// One chronological segment of an assistant turn — reasoning bursts and tool
// invocations in the order they happened, so the UI can replay the turn
// faithfully (thinking → tool → thinking → …) instead of one merged blob.
export type IMastraTurnPart =
  | { kind: 'thinking'; text: string }
  | { kind: 'tool'; call: IMastraToolCall };

// Extra turn artifacts persisted alongside the assistant reply text.
// `thinking`/`toolCalls` are kept as flat aggregates (queries/forensics);
// `parts` carries the same data in arrival order for rendering.
export interface IMastraMessageMeta {
  thinking?: string;
  toolCalls?: IMastraToolCall[];
  parts?: IMastraTurnPart[];
  interrupted?: boolean;
}

// A file attached to a user message. `url` is either a storage key (private
// files, read back via core's /read-file) or a full public URL.
export interface IMastraChatAttachment {
  url: string;
  name: string;
  type?: string;
  size?: number;
}

export interface IMastraMessage {
  threadId: string;
  role: MastraMessageRole;
  content: string;
  meta?: IMastraMessageMeta;
  attachments?: IMastraChatAttachment[];
}

export interface IMastraMessageDocument extends IMastraMessage, Document {
  _id: string;
  createdAt: Date;
}
