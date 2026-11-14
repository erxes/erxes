import { EventSourceParserStream } from 'eventsource-parser/stream';
import { z } from 'zod';

export const Chunk = z.looseObject({ type: z.string() });

export type Chunk = z.infer<typeof Chunk>;

const Part = z.looseObject({
  type: z.string(),
  state: z.string().optional(),
  toolCallId: z.string().optional(),
  output: z.unknown().optional(),
  approval: z.looseObject({ id: z.string() }).optional(),
});

export type Part = z.infer<typeof Part>;

export const userMessage = (text: string, id = `u-${text.length}-${Date.now()}`) => ({
  id,
  role: 'user',
  parts: [{ type: 'text', text }],
});

export const postChat = async (
  url: string,
  token: string,
  body: Record<string, unknown>,
  options: { stopAfter?: (chunk: Chunk) => boolean } = {},
) => {
  const controller = new AbortController();

  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  const chunks: Chunk[] = [];

  if (!response.ok || !response.body) {
    return { status: response.status, chunks, error: await response.json() };
  }

  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();

  for (;;) {
    const { value, done } = await reader.read();

    if (done || value.data === '[DONE]') break;

    const parsed = Chunk.parse(JSON.parse(value.data));

    chunks.push(parsed);

    if (options.stopAfter?.(parsed)) {
      controller.abort();
      break;
    }
  }

  return { status: response.status, chunks, error: null };
};

export const textOf = (chunks: Chunk[]) =>
  chunks
    .filter((chunk) => chunk.type === 'text-delta')
    .map((chunk) => String(chunk.delta))
    .join('');

export const threadIdOf = (chunks: Chunk[]) => {
  const start = chunks.find((chunk) => chunk.type === 'start');

  return z.object({ messageMetadata: z.object({ threadId: z.string() }) }).parse(start)
    .messageMetadata.threadId;
};

export const partsOf = (message: { parts: unknown[] } | undefined) =>
  z.array(Part).parse(message?.parts ?? []);
