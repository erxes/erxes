import type { UIMessageChunk } from 'ai';
import {
  IMastraToolCall,
  IMastraTurnPart,
  IMastraMessageMeta,
} from '@/session/@types/session';

// Folds the AI SDK v5 UIMessage chunk stream (what Mastra's `toUIMessageStream`
// emits) into the erxes-only turn artifacts we persist: the running answer text,
// the ordered `parts` (reasoning bursts + tool calls in arrival order), and the
// flat thinking/tool aggregates. The wire protocol is now standard, so this is
// the ONLY place that understands the chunk shapes — replacing the old custom
// normalizeChunk + dual accumulator.
//
// Reasoning bursts and tool calls keep arrival order in `parts`; tool entries in
// `parts` share object identity with `toolCalls`, so an output landing later
// updates both. A new non-reasoning chunk ends the current reasoning burst, so
// the next reasoning delta starts a fresh part instead of growing the old one.
export class UITurnAccumulator {
  text = '';
  thinking = '';
  toolCalls: IMastraToolCall[] = [];
  parts: IMastraTurnPart[] = [];
  private thinkingOpen = false;

  fold(chunk: UIMessageChunk): void {
    switch (chunk.type) {
      case 'text-delta':
        this.text += chunk.delta ?? '';
        this.thinkingOpen = false;
        break;
      case 'reasoning-delta':
        this.appendThinking(chunk.delta ?? '');
        break;
      case 'reasoning-end':
      case 'text-start':
        this.thinkingOpen = false;
        break;
      case 'tool-input-available':
        this.thinkingOpen = false;
        this.recordToolCall({
          toolCallId: chunk.toolCallId,
          toolName: chunk.toolName,
          args: chunk.input,
        });
        break;
      case 'tool-input-error':
        this.thinkingOpen = false;
        this.recordToolCall({
          toolCallId: chunk.toolCallId,
          toolName: chunk.toolName,
          args: chunk.input,
          result: chunk.errorText,
          isError: true,
        });
        break;
      case 'tool-output-available':
        this.recordToolOutput(chunk.toolCallId, chunk.output, false);
        break;
      case 'tool-output-error':
        this.recordToolOutput(chunk.toolCallId, chunk.errorText, true);
        break;
      default:
        break;
    }
  }

  private appendThinking(text: string): void {
    if (!text) return;
    this.thinking += text;
    const last = this.parts[this.parts.length - 1];
    if (this.thinkingOpen && last?.kind === 'thinking') last.text += text;
    else {
      this.parts.push({ kind: 'thinking', text });
      this.thinkingOpen = true;
    }
  }

  private recordToolCall(call: IMastraToolCall): void {
    // Dedupe by toolCallId — a repeated input chunk for the same call updates
    // the existing entry in place (the parts entry shares its object identity)
    // rather than appending a duplicate.
    const existing = call.toolCallId
      ? this.toolCalls.find((tc) => tc.toolCallId === call.toolCallId)
      : undefined;
    if (existing) {
      Object.assign(existing, call);
      return;
    }
    this.toolCalls.push(call);
    this.parts.push({ kind: 'tool', call });
  }

  private recordToolOutput(
    toolCallId: string,
    result: unknown,
    isError: boolean,
  ): void {
    const existing = this.toolCalls.find((tc) => tc.toolCallId === toolCallId);
    // Drop an orphan output (a protocol violation Mastra never emits): with no
    // matching call there is no toolName/args to render or persist it against.
    if (!existing) return;
    existing.result = result;
    existing.isError = isError;
  }

  /** Tool results gathered this turn, for the no-prose synthesis fallback. */
  toolResults(): { toolCallId?: string; toolName: string; result: unknown }[] {
    return this.toolCalls
      .filter((tc) => tc.result !== undefined)
      .map((tc) => ({
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        result: tc.result,
      }));
  }

  /** The erxes turn meta to persist for this turn. */
  meta(interrupted: boolean, langfuseTraceId?: string): IMastraMessageMeta {
    return {
      thinking: this.thinking || undefined,
      toolCalls: this.toolCalls.length ? this.toolCalls : undefined,
      parts: this.parts.length ? this.parts : undefined,
      interrupted: interrupted || undefined,
      langfuseTraceId,
    };
  }
}
