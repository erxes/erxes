/**
 * The two pieces of infrastructure the integration suite does not use for
 * real, because the developer's own Redis may be live: an in-memory Redis
 * (service discovery, permission cache) and the log queue, kept as the jobs
 * that would reach the logs service.
 */
export class MemoryRedis {
  readonly store = new Map<string, string>();

  async get(key: string) {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string | number) {
    this.store.set(key, String(value));
    return 'OK';
  }

  async del(...keys: string[]) {
    keys.forEach((key) => this.store.delete(key));
    return keys.length;
  }

  on() {
    return this;
  }
}

export const memoryRedis = new MemoryRedis();

export interface IQueuedJob {
  service: string;
  queue: string;
  data: Record<string, unknown>;
}

export const queuedJobs: IQueuedJob[] = [];

export const memoryQueue = (service: string, queue: string) => ({
  add: async (_name: string, data: Record<string, unknown>) => {
    queuedJobs.push({ service, queue, data: JSON.parse(JSON.stringify(data)) });
  },
});
