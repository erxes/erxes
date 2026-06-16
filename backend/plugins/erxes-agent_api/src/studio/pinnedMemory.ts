/**
 * Resource-pinned memory facade for the Studio bridge.
 *
 * The erxes dashboard scopes chat threads by `resourceId = scopedResource(
 * subdomain, userId)` (e.g. "localhost:<userId>"); Mastra Studio's playground
 * scopes by `resourceId = <agentId>`. Same native store, different bucket — so
 * Studio and the dashboard show different conversations ("different planet").
 *
 * This Proxy pins every memory read/write/list to the dashboard's dev resource,
 * regardless of what Studio passes. Attached to the Studio agents via
 * `agent.__setMemory(...)`, it makes Studio list (and write) the SAME threads
 * the dashboard does — one shared conversation history. Dev-tool only.
 */
import { getMastraMemory } from '~/mastra/memory/mastraMemory';

type SharedMemory = Awaited<ReturnType<typeof getMastraMemory>>;

// Memory methods whose first argument carries a resourceId — at the top level,
// inside `.filter`, or per-message in `.messages[]` — that we rewrite.
const PINNED = new Set<string>([
  'listThreads',
  'getThreadById',
  'recall',
  'query',
  'saveMessages',
  'createThread',
  'saveThread',
  'getThreadsByResourceId',
  'listThreadsByResourceId',
  'listMessagesByResourceId',
  'updateWorkingMemory',
  'getWorkingMemory',
  'getContext',
  'getSystemMessage',
]);

function rewriteArg(arg: unknown, resource: string): unknown {
  if (!arg || typeof arg !== 'object') return arg;
  const a = { ...(arg as Record<string, unknown>) };
  if ('resourceId' in a) a.resourceId = resource;
  const filter = a.filter as Record<string, unknown> | undefined;
  if (filter && typeof filter === 'object' && 'resourceId' in filter) {
    a.filter = { ...filter, resourceId: resource };
  }
  if (Array.isArray(a.messages)) {
    a.messages = a.messages.map((m) =>
      m && typeof m === 'object' && 'resourceId' in (m as object)
        ? { ...(m as Record<string, unknown>), resourceId: resource }
        : m,
    );
  }
  return a;
}

/** Wrap a Memory so all thread/message ops use `resource`. */
export function pinResource(memory: SharedMemory, resource: string): SharedMemory {
  return new Proxy(memory as object, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig !== 'function') return orig;
      const fn = orig as (...a: unknown[]) => unknown;
      if (PINNED.has(prop as string)) {
        return (...args: unknown[]) =>
          fn.apply(
            target,
            args.length
              ? [rewriteArg(args[0], resource), ...args.slice(1)]
              : args,
          );
      }
      return fn.bind(target);
    },
  }) as SharedMemory;
}

/**
 * The erxes dev resource the dashboard writes under: an explicit
 * `ERXES_STUDIO_RESOURCE` override, else the most frequent user-style
 * resourceId in the native store (agent-style resources have no ":"; bot/
 * schedule buckets are excluded). Returns null if none can be determined.
 */
export async function detectDevResource(
  subdomain: string,
): Promise<string | null> {
  const override = (process.env.ERXES_STUDIO_RESOURCE || '').trim();
  if (override) return override;
  try {
    const memory = await getMastraMemory(subdomain);
    const res = (await (
      memory as unknown as {
        listThreads(a: unknown): Promise<{
          threads?: Array<{ resourceId?: string }>;
        }>;
      }
    ).listThreads({ perPage: 500 })) ?? { threads: [] };
    const counts = new Map<string, number>();
    for (const t of res.threads ?? []) {
      const r = t.resourceId;
      if (!r || !r.includes(':')) continue; // agent-style resource → skip
      const suffix = r.slice(r.indexOf(':') + 1);
      if (suffix.startsWith('bot:') || suffix.startsWith('schedule:')) continue;
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    let best: string | null = null;
    let max = 0;
    for (const [r, n] of counts) {
      if (n > max) {
        max = n;
        best = r;
      }
    }
    return best;
  } catch {
    return null;
  }
}
