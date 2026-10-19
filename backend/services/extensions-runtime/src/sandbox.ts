import type { ChildProcess } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ApiError } from './errors';
import { LIMITS } from './limits';
import {
  createToken,
  startWorkerd,
  waitUntilListening,
} from './workerd/launch';

// Known limits. Until these land, install only trusted extensions written by
// the erxes team:
// - No per-call db budgets: one call can issue unbounded concurrent db ops
//   (no per-grant, per-tenant or global db concurrency or queue timeout).
// - Size checks run after allocation: find results are buffered before the
//   byte check, the supervisor's reply is buffered before its size check, and
//   stored documents have no size limit beyond Mongo's.
// - No memory cap per workerd process: OSS workerd ignores isolate limits, so
//   one tenant can exhaust the host's memory.
// - No watchdog after a call returns: work a call leaves running (waitUntil,
//   timers) keeps using CPU in its tenant's process until the process is
//   stopped.

// Where workerd's Host entrypoint calls back into the runtime (loopback only).
export const HOST_PORT = Number(process.env.EXT_HOST_PORT || 3321);
// workerd processes listen on this port and the ones after it.
const SUPERVISOR_BASE_PORT = Number(process.env.EXT_SUPERVISOR_PORT || 3330);

// The supervisor sends this on its /db callbacks, so only workerd can make
// them.
export const HOST_TOKEN = createToken();

// ---- Grants: what one running invocation may touch.
//
// The supervisor hands the extension a Host stub whose only prop is a grant
// id. /db looks the id up here, so a call can reach only its own tenant, its
// own install and that install's collections. The grant is revoked when the
// call returns or times out, so a straggling db call from a killed run is
// refused. It also carries the caller's session and the install's pinned
// contracts, so a contract call runs as the caller and only on what the
// install pinned.

export type Session = { token: string; hostname: string };

export type Grant = {
  tenant: string;
  extId: string;
  collections: string[];
  uses: Record<string, number>;
  session: Session;
  // When the run times out (epoch ms).
  deadline: number;
  // Aborted on revocation, so an upstream call still holding the caller's
  // session (one the extension fired and never awaited) stops with the run.
  abort: AbortController;
};

const grants = new Map<string, Grant>();

export const findGrant = (id: string) => grants.get(id);

const revoke = (id: string) => {
  grants.get(id)?.abort.abort();
  grants.delete(id);
};

// Uninstall revokes every live grant of the install before dropping its
// collections, so a call still running can't write and recreate them.
export const revokeGrants = (tenant: string, extId: string) => {
  for (const [id, grant] of grants) {
    if (grant.tenant === tenant && grant.extId === extId) {
      revoke(id);
    }
  }
};

// ---- The pool.
//
// OSS workerd ignores `limits.cpuMs`, so a busy loop wedges its whole
// process, and the only way out is to kill it. Each process serves one tenant
// at a time, so killing one fails only that tenant's calls. Processes start
// on demand, up to LIMITS.workerdProcesses, and stop after
// LIMITS.workerdIdleMs. A process never changes tenant: when the pool is full,
// an idle process of another tenant is killed and a fresh one started, so
// nothing a tenant left running (a waitUntil, a timer) survives into another
// tenant's process. When every process is busy with other tenants, a call
// waits up to the run timeout for one, then fails with BUSY.
//
// When a call times out, its process is killed with SIGKILL:
// - that call fails with TIMEOUT;
// - the tenant's other calls in the same process fail with SANDBOX_RESTARTED:
//   their outcome is unknown, since they may have written before the kill;
// - their grants are revoked, so a db call that reaches the runtime later is
//   refused with GRANT_EXPIRED. Writes the runtime accepted before the kill
//   stay: there is no rollback, so a timed-out call may have written part of
//   its work.
// The next call for the tenant gets a fresh process.

type Slot = {
  port: number;
  tenant: string;
  child?: ChildProcess;
  ready: Promise<void>;
  running: number;
  idleSince: number;
  // Set once the process is going away. Calls that were in it read it.
  stopped?: 'timeout' | 'exit' | 'idle' | 'shutdown';
};

const slots: Slot[] = [];
let waiting: (() => void)[] = [];

const wake = () => {
  const resolvers = waiting;
  waiting = [];
  resolvers.forEach((resolve) => resolve());
};

const stop = (slot: Slot, reason: NonNullable<Slot['stopped']>) => {
  if (slot.stopped) {
    return;
  }

  slot.stopped = reason;
  slot.child?.kill('SIGKILL');
};

const freePort = () => {
  for (let i = 0; i < LIMITS.workerdProcesses; i++) {
    const port = SUPERVISOR_BASE_PORT + i;

    if (!slots.some((slot) => slot.port === port)) {
      return port;
    }
  }

  return undefined;
};

const spawnSlot = (tenant: string, port: number) => {
  const slot: Slot = {
    port,
    tenant,
    running: 0,
    idleSince: Date.now(),
    ready: Promise.resolve(),
  };

  const remove = () => {
    slots.splice(slots.indexOf(slot), 1);
    wake();
  };

  slot.ready = (async () => {
    const child = await startWorkerd({
      hostPort: HOST_PORT,
      supervisorPort: port,
      token: HOST_TOKEN,
    });

    slot.child = child;
    // The port stays taken until the process is gone.
    child.once('exit', (code) => {
      if (!slot.stopped) {
        slot.stopped = 'exit';
        console.error(
          `workerd on ${port} (${slot.tenant}) exited with ${code}`,
        );
      }
      remove();
    });

    await waitUntilListening(`http://127.0.0.1:${port}/`);
  })();

  slot.ready.catch((e: unknown) => {
    console.error(`workerd on ${port} failed to start`, e);
    stop(slot, 'exit');

    if (!slot.child) {
      remove();
    }
  });

  slots.push(slot);
  return slot;
};

// The tenant's own process, else a new one. With the pool full, an idle
// process of another tenant is stopped, and the caller waits for its port.
// Counts the call as running before returning, so no other call can take the
// slot.
const pick = (tenant: string) => {
  const live = slots.filter((slot) => !slot.stopped);
  const port = freePort();
  const slot =
    live.find((candidate) => candidate.tenant === tenant) ??
    (port === undefined ? undefined : spawnSlot(tenant, port));

  if (!slot) {
    const idle = live.find((candidate) => candidate.running === 0);

    if (idle) {
      stop(idle, 'idle');
    }

    return undefined;
  }

  slot.running++;
  return slot;
};

const acquire = async (tenant: string) => {
  const deadline = Date.now() + LIMITS.runTimeoutMs;

  for (;;) {
    const slot = pick(tenant);

    if (slot) {
      return slot;
    }

    const left = deadline - Date.now();

    if (left <= 0) {
      throw new ApiError(
        503,
        'BUSY',
        'Every extension sandbox is busy with other workspaces. Try again.',
      );
    }

    await new Promise<void>((resolve) => {
      waiting.push(resolve);
      setTimeout(resolve, left);
    });
  }
};

setInterval(() => {
  for (const slot of slots) {
    if (
      !slot.stopped &&
      slot.running === 0 &&
      Date.now() - slot.idleSince > LIMITS.workerdIdleMs
    ) {
      stop(slot, 'idle');
    }
  }
}, 60_000).unref();

export const stopAll = () => slots.forEach((slot) => stop(slot, 'shutdown'));

// ---- One call.

const ErrorBody = z.object({
  code: z.string(),
  message: z.string(),
  issues: z
    .array(z.object({ path: z.string(), message: z.string() }))
    .optional(),
});

const SupervisorResult = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: z.unknown(), ms: z.number() }),
  z.object({ ok: z.literal(false), error: ErrorBody, ms: z.number() }),
]);

export type InvokeResult = z.infer<typeof SupervisorResult>;

export type Run = {
  tenant: string;
  extId: string;
  version: string;
  code: string;
  codeHash: string;
  collections: string[];
  uses: Record<string, number>;
  name: string;
  input: unknown;
  user: { _id: string };
  session: Session;
};

const fail = (code: string, message: string, ms: number): InvokeResult => ({
  ok: false,
  error: { code, message },
  ms,
});

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const callSlot = async (slot: Slot, grant: string, run: Run) => {
  const startedAt = Date.now();
  let res: Response;

  try {
    res = await fetch(`http://127.0.0.1:${slot.port}/invoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        // One isolate per tenant and build.
        workerKey: `${run.tenant}:${run.extId}@${run.version}#${run.codeHash}`,
        grant,
        code: run.code,
        name: run.name,
        input: run.input,
        user: run.user,
      }),
      signal: AbortSignal.timeout(LIMITS.runTimeoutMs),
    });
  } catch (e) {
    const ms = Date.now() - startedAt;

    if (e instanceof DOMException && e.name === 'TimeoutError') {
      // Kill only this tenant's process. Its other calls fail below.
      stop(slot, 'timeout');
      return fail('TIMEOUT', `Timed out after ${LIMITS.runTimeoutMs}ms`, ms);
    }

    if (slot.stopped) {
      return fail(
        'SANDBOX_RESTARTED',
        slot.stopped === 'timeout'
          ? 'Another call in this workspace timed out and the sandbox it shared with this one was killed. This call may or may not have written its changes.'
          : 'The sandbox stopped during this call. It may or may not have written its changes.',
        ms,
      );
    }

    throw e;
  }

  const text = await res.text();
  const ms = Date.now() - startedAt;

  if (Buffer.byteLength(text) > LIMITS.resultBytes) {
    return fail(
      'RESULT_TOO_LARGE',
      `The result is over ${LIMITS.resultBytes} bytes. Return less, or page through it.`,
      ms,
    );
  }

  const parsed = SupervisorResult.safeParse(parseJson(text));

  return parsed.success
    ? parsed.data
    : fail('FUNCTION_ERROR', 'The extension returned a malformed result', ms);
};

const runningByTenant = new Map<string, number>();
let runningTotal = 0;

export const invoke = async (run: Run): Promise<InvokeResult> => {
  const tenantRunning = runningByTenant.get(run.tenant) ?? 0;

  if (tenantRunning >= LIMITS.tenantConcurrency) {
    throw new ApiError(
      429,
      'BUSY',
      `This workspace already has ${tenantRunning} extension calls running. Try again.`,
    );
  }

  if (runningTotal >= LIMITS.globalConcurrency) {
    throw new ApiError(
      503,
      'BUSY',
      'Too many extension calls running. Try again.',
    );
  }

  runningByTenant.set(run.tenant, tenantRunning + 1);
  runningTotal++;

  const grant = randomUUID();
  const granted: Grant = {
    tenant: run.tenant,
    extId: run.extId,
    collections: run.collections,
    uses: run.uses,
    session: run.session,
    deadline: Date.now() + LIMITS.runTimeoutMs,
    abort: new AbortController(),
  };
  grants.set(grant, granted);

  let slot: Slot | undefined;

  try {
    slot = await acquire(run.tenant);
    await slot.ready;
    // The run's own clock starts now, in callSlot.
    granted.deadline = Date.now() + LIMITS.runTimeoutMs;
    return await callSlot(slot, grant, run);
  } finally {
    // Every way a run ends comes through here: return, error, timeout kill.
    revoke(grant);
    runningTotal--;

    const left = (runningByTenant.get(run.tenant) ?? 1) - 1;
    if (left > 0) {
      runningByTenant.set(run.tenant, left);
    } else {
      runningByTenant.delete(run.tenant);
    }

    if (slot && --slot.running === 0) {
      slot.idleSince = Date.now();
      wake();
    }
  }
};
