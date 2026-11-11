import { EventEmitter } from 'node:events';
import { sslOptions } from '@erxes/core-db';
import { Client } from 'pg';
import { z } from 'zod';
import { config } from '~/config';

/** What a committed change announces on `core_live` (migrations 0008, 0009 and 0010). */
const LiveSignal = z.discriminatedUnion('k', [
  z.object({ o: z.string(), k: z.literal('inbox'), u: z.string() }),
  z.object({
    o: z.string(),
    k: z.literal('timeline'),
    t: z.enum(['customer', 'company']),
    i: z.string(),
  }),
  /** Many records changed at once (merge, import): refetch everything. */
  z.object({ o: z.string(), k: z.literal('resync') }),
  /** A plugin's topic changed (`core_live_signal`): to everyone, or members `u`. */
  z.object({
    o: z.string(),
    k: z.literal('plugin'),
    p: z.string(),
    t: z.string(),
    u: z.array(z.string()).optional(),
  }),
]);

export type LiveSignal = z.infer<typeof LiveSignal>;

/**
 * One LISTEN connection per API server, shared by every open stream:
 * `signal` for each committed change, `events` when new events wait for the
 * processor, `state` when the connection is up or lost, `resync` after a
 * reconnect (notifications sent meanwhile were missed, so clients refetch).
 */
class LiveHub extends EventEmitter {
  connected = false;
  private client: Client | null = null;
  private stopped = false;
  private attempt = 0;

  start(url: string | undefined = config.live.listenUrl) {
    if (!url) {
      console.info('[core] live updates: off (no listen connection; browsers poll)');

      return;
    }

    this.stopped = false;
    void this.connect(url);
  }

  private async connect(url: string) {
    const client = new Client({
      connectionString: url,
      ssl: sslOptions(config.data),
      application_name: 'erxes-core-live',
      keepAlive: true,
    });

    client.on('notification', (message) => {
      if (message.channel === 'core_events') {
        this.emit('events');

        return;
      }

      try {
        const signal = LiveSignal.safeParse(JSON.parse(message.payload ?? ''));

        if (signal.success) this.emit('signal', signal.data);
      } catch {
        // Not JSON, so not ours.
      }
    });
    client.on('error', (error) => {
      console.error('[core] live updates: listen connection error', error.message);
    });
    client.on('end', () => {
      if (this.client === client) this.lost(url);
    });

    try {
      await client.connect();
      await client.query('LISTEN core_live');
      await client.query('LISTEN core_events');
      this.client = client;

      const reconnected = this.attempt > 0;

      this.attempt = 0;
      this.setConnected(true);
      console.info('[core] live updates: listening');

      if (reconnected) this.emit('resync');
      // Events published while nobody listened.
      this.emit('events');
    } catch (error) {
      console.error(
        '[core] live updates: could not listen',
        error instanceof Error ? error.message : error,
      );
      await client.end().catch(() => undefined);
      this.lost(url);
    }
  }

  private lost(url: string) {
    this.client = null;
    this.setConnected(false);

    if (this.stopped) return;

    // 1 s, 2 s, 4 s … up to 30 s, with jitter so servers don't reconnect in step.
    const delay = Math.min(30_000, 1000 * 2 ** this.attempt) * (0.75 + Math.random() / 2);

    this.attempt += 1;
    setTimeout(() => void this.connect(url), delay).unref();
  }

  private setConnected(connected: boolean) {
    if (this.connected !== connected) {
      this.connected = connected;
      this.emit('state', connected);
    }
  }

  async stop() {
    this.stopped = true;

    const client = this.client;

    this.client = null;
    this.setConnected(false);
    await client?.end().catch(() => undefined);
  }
}

export const liveHub = new LiveHub();

liveHub.setMaxListeners(0);
