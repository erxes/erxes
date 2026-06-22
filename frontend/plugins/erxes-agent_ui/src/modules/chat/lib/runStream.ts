import { Message } from '~/modules/chat/types';
import { randomIdSuffix } from '~/modules/chat/lib/ids';
import { readStreamEvents } from '~/modules/chat/lib/streamTransport';
import { ApplyOps, applyStreamEvent, LiveState } from '~/modules/chat/lib/applyEvent';

// The store-side hooks the harness writes through. Bound to one agent/thread by
// the caller so this stays a plain runtime with no store coupling.
export interface RunStreamSink {
  // Commit the live bubble (append on first call) AND advance the stream tick in
  // a single store write.
  commitLive: (clientId: string, msg: Message) => void;
  appendError: (content: string) => void;
  setActivity: (text: string) => void;
  setSessionTitle: (threadId: string, title: string) => void;
}

// Drive one streamed assistant turn off an already-open SSE response. Owns the
// rAF coalescing/flush scheduler, the live-bubble builder, and the
// terminal/finalize logic; the pure applyStreamEvent reducer translates each
// event into a bubble mutation.
export const runStream = async (
  response: Response,
  threadId: string,
  abort: AbortController,
  sink: RunStreamSink,
): Promise<void> => {
  // The live assistant bubble; advanced in place as events arrive. Keyed by a
  // stable client id so its updates land on the same row even if another
  // message is appended mid-stream.
  let live: Message | null = null;
  const liveClientId = `m-${randomIdSuffix(8)}`;
  const liveState: LiveState = { sawDone: false, hasLive: false };

  // Coalesce store writes to one per animation frame. A fast provider emits
  // many tokens per frame; without this the live bubble re-renders (and
  // re-parses its whole growing markdown) on every token, pegging the main
  // thread so streaming stutters. `live` still advances synchronously so each
  // event builds on the latest; only the store write — and the React render
  // it triggers — is throttled to ~60fps. `flushLive` is called synchronously
  // at every terminal point so the final state is never left in the buffer.
  let flushScheduled = false;
  let liveDirty = false;

  const flushLive = () => {
    flushScheduled = false;
    if (!liveDirty || !live) return;
    liveDirty = false;
    // commitLive appends when the row isn't in the store yet (the first flush),
    // so this one call covers both append and in-place update; it also bumps the
    // monotonic stream tick so the view can follow streamed output off a single
    // dependency, rather than inferring growth from message contents.
    sink.commitLive(liveClientId, live);
  };

  const scheduleFlush = () => {
    if (flushScheduled) return;
    flushScheduled = true;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(flushLive);
    } else {
      setTimeout(flushLive, 16);
    }
  };

  const upsertLive = (mutate: (m: Message) => Message) => {
    const base: Message = live ?? {
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
      _clientId: liveClientId,
    };
    live = mutate({ ...base, parts: base.parts?.slice() });
    liveState.hasLive = true;
    liveDirty = true;
    scheduleFlush();
  };

  const ops: ApplyOps = {
    upsertLive,
    appendError: sink.appendError,
    setActivity: sink.setActivity,
    setSessionTitle: sink.setSessionTitle,
    fallbackThreadId: threadId,
  };

  try {
    for await (const ev of readStreamEvents(response)) {
      applyStreamEvent(ops, ev, liveState);
    }
  } catch (err) {
    if (!abort.signal.aborted) {
      // Persist whatever streamed before the failure, then surface the error.
      flushLive();
      throw err;
    }
  }

  // User pressed stop, or the connection dropped mid-stream: finalize what we
  // have so the partial reply stays visible.
  if (!liveState.sawDone && live) {
    upsertLive((m) => ({
      ...m,
      streaming: false,
      interrupted: abort.signal.aborted,
    }));
  }
  if (!liveState.sawDone && !live && !abort.signal.aborted) {
    throw new Error('The connection to the agent was lost. Please try again.');
  }

  // Write the final buffered state synchronously — the last events (done /
  // finalize above) may still be sitting in the coalesced frame.
  flushLive();
};
