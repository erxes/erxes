import { StreamEvent } from '~/modules/chat/types';

// Pure SSE reader: turns the streaming response body into a sequence of typed
// events. No store/UI coupling — given a Response, it yields the parsed frames
// emitted by POST /pl:erxes-agent/chat/stream. Heartbeat/non-`data:` lines and
// malformed frames are skipped. An aborted/dropped read throws out of the
// generator so the caller can finalize the partial reply.
export async function* readStreamEvents(
  response: Response,
): AsyncGenerator<StreamEvent> {
  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of rawEvent.split('\n')) {
        if (!line.startsWith('data: ')) continue; // skip heartbeats
        try {
          yield JSON.parse(line.slice(6)) as StreamEvent;
        } catch {
          // malformed frame — ignore
        }
      }
    }
  }
}
