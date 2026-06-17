// Chat-turn artifact types. The chat store itself is Mastra-native (see
// session/nativeStore.ts); these shapes describe the erxes-only per-turn
// artifacts the pipeline builds and mirrors onto the native message's
// content.metadata.erxes blob, and the attachment pointers on a user message.

// One tool invocation made during an assistant turn, kept for the expandable
// tool-call detail in the chat UI.
export interface IMastraToolCall {
  toolCallId?: string;
  toolName: string;
  args?: unknown;
  result?: unknown;
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
  // Learnings injected into this turn's context (digest entries) — lets a
  // thumbs rating reinforce/penalize the lessons that shaped the reply.
  learningIdsInContext?: string[];
  // Langfuse trace id for this turn — lets a later thumbs rating attach a human
  // score to the right trace in Langfuse (Plan B / langfuseClient.pushUserScore).
  langfuseTraceId?: string;
}

// A file attached to a user message. `url` is either a storage key (private
// files, read back via core's /read-file) or a full public URL.
export interface IMastraChatAttachment {
  url: string;
  name: string;
  type?: string;
  size?: number;
}
