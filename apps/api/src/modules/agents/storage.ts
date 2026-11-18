import { hostname } from 'node:os';
import { getPool, newId } from '@erxes/core-db';
import {
  type PostgresDatabase,
  type PostgresExecutor,
  PostgresStorage,
} from '@gscode1/pi-durable-postgres/core';
import type { PoolClient, QueryResultRow } from 'pg';
import { logger } from '~/logger';

/** How long a storage stays this server's after its last commit; past it another server may take it. */
const LEASE_SECONDS = 300;

const log = logger.child({ component: 'agents' });

/** This API server; each open storage adds its own id, so even this server can't open it twice. */
const SERVER = `${hostname()}:${process.pid}`;

/** Another API server runs the storage now. */
export class StorageBusy extends Error {}

// pi's ids are int8 and it wants numbers: core's pool already parses int8 as a number (client.ts).
const executorOver = (client: PoolClient, assertActive: () => void): PostgresExecutor => {
  const query = <R extends QueryResultRow>(text: string, params: readonly unknown[] = []) => {
    assertActive();

    return client.query<R>({ text, values: [...params] });
  };

  return {
    exec: async (text) => {
      await query(text);
    },
    run: async (text, params) => (await query(text, params)).rowCount ?? 0,
    get: async <T>(text: string, params: readonly unknown[]) =>
      (await query<T & QueryResultRow>(text, params)).rows[0],
    all: async <T>(text: string, params: readonly unknown[]) =>
      (await query<T & QueryResultRow>(text, params)).rows,
  };
};

type Isolation = 'read committed' | 'repeatable read';

const LEASE = `lease_owner = $1, lease_until = now() + make_interval(secs => ${LEASE_SECONDS})`;

/**
 * pi-durable-postgres's database facade on core's pool, for one storage. Every statement runs in a
 * transaction that sets `app.org_id` and `pi.storage_key` locally, so row level security keeps it
 * to that storage, as `withOrg` does for a request. Instead of a pinned connection and an advisory
 * lock, the storage has a lease in its metadata row: opening takes it, and every write transaction
 * extends it first and fails when another server holds it, so a server that lost it can't write.
 * Operations run one at a time in admission order, as the adapter requires.
 */
class AgentDatabase implements PostgresDatabase {
  private tail: Promise<unknown> = Promise.resolve();
  private closing: Promise<void> | undefined;
  private failure: Error | undefined;
  private readonly owner = `${SERVER}:${newId()}`;

  constructor(
    private readonly orgId: string,
    private readonly storageKey: string,
    private readonly readOnly: boolean,
  ) {}

  private enqueue<T>(operation: () => Promise<T>) {
    if (this.closing) return Promise.reject(new Error('The agent storage is closed'));

    const result = this.tail.then(() => {
      if (this.failure) throw this.failure;

      return operation();
    });

    this.tail = result.catch(() => undefined);

    return result;
  }

  private async inTransaction<T>(
    isolation: Isolation,
    fenced: boolean,
    callback: (executor: PostgresExecutor) => Promise<T>,
  ) {
    const client = await getPool().connect();
    let active = true;
    let broken: Error | undefined;

    const executor = executorOver(client, () => {
      if (!active) throw new Error('The transaction handle is no longer active');
    });

    try {
      await client.query(`BEGIN ISOLATION LEVEL ${isolation.toUpperCase()}`);
      await client.query({
        text: "select set_config('app.org_id', $1, true), set_config('pi.storage_key', $2, true)",
        values: [this.orgId, this.storageKey],
      });

      if (fenced) {
        // Locks the row until commit, so the lease can't change hands while this transaction writes.
        const held = await client.query({
          text: `update core_agent_durable_metadata set ${LEASE}
                 where singleton = 1 and lease_owner = $1 and lease_until > now()`,
          values: [this.owner],
        });

        if (held.rowCount === 0) {
          this.failure = new StorageBusy(`Lost the lease of ${this.storageKey}`);
          throw this.failure;
        }
      }

      const result = await callback(executor);

      active = false;
      await client.query('COMMIT');

      return result;
    } catch (error) {
      active = false;
      await client.query('ROLLBACK').catch((rollback: unknown) => {
        broken = rollback instanceof Error ? rollback : new Error(String(rollback));
      });
      throw error;
    } finally {
      client.release(broken);
    }
  }

  private read<T>(callback: (tx: PostgresExecutor) => Promise<T>) {
    return this.enqueue(() => this.inTransaction('read committed', false, callback));
  }

  private write<T>(callback: (tx: PostgresExecutor) => Promise<T>) {
    if (this.readOnly) return Promise.reject(new Error(`${this.storageKey} is open read-only`));

    return this.enqueue(() => this.inTransaction('read committed', true, callback));
  }

  exec(text: string) {
    return this.write((tx) => tx.exec(text));
  }

  run(text: string, params: readonly unknown[]) {
    return this.write((tx) => tx.run(text, params));
  }

  get<T>(text: string, params: readonly unknown[]) {
    return this.read((tx) => tx.get<T>(text, params));
  }

  all<T>(text: string, params: readonly unknown[]) {
    return this.read((tx) => tx.all<T>(text, params));
  }

  transaction = Object.assign(
    <T>(callback: (tx: PostgresExecutor) => Promise<T>) => this.write(callback),
    {
      snapshot: <T>(callback: (tx: PostgresExecutor) => Promise<T>) =>
        this.enqueue(() => this.inTransaction('repeatable read', false, callback)),
      maintenance: () =>
        Promise.reject(new Error('Agent storages are maintained through Drizzle migrations')),
    },
  );

  acquireOwnership() {
    // A read-only storage takes no lease: it reads what the server running it committed.
    if (this.readOnly) return Promise.resolve();

    return this.enqueue(async () => {
      const taken = await this.inTransaction('read committed', false, async (tx) => {
        // A new storage's counters: pi's ids and commit sequence start here.
        await tx.run(
          `insert into core_agent_durable_metadata (singleton, next_id, next_seq) values (1, 2, 1)
           on conflict (storage_key, singleton) do nothing`,
          [],
        );

        return tx.run(
          `update core_agent_durable_metadata set ${LEASE}
           where singleton = 1 and (lease_owner is null or lease_until < now())`,
          [this.owner],
        );
      });

      if (taken === 0) throw new StorageBusy(`Another server runs ${this.storageKey}`);
    });
  }

  private async release() {
    await this.tail;

    if (this.failure || this.readOnly) return;

    try {
      await this.inTransaction('read committed', false, (tx) =>
        tx.run(
          `update core_agent_durable_metadata set lease_owner = null, lease_until = null
           where singleton = 1 and lease_owner = $1`,
          [this.owner],
        ),
      );
    } catch (error) {
      log.warn({ err: error, storageKey: this.storageKey }, 'agents: could not release a lease');
    }
  }

  close() {
    this.closing ??= this.release();

    return this.closing;
  }
}

/**
 * Opens one agent conversation's storage for this server, such as `assistant:<threadId>`. Throws
 * `StorageBusy` while another server runs it. `readOnly` takes no lease, for a server that only shows
 * a conversation another one runs; its writes reject.
 */
export const openAgentStorage = (orgId: string, storageKey: string, { readOnly = false } = {}) =>
  PostgresStorage.open(new AgentDatabase(orgId, storageKey, readOnly));
