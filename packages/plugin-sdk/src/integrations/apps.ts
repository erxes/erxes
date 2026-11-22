import type { ActionField, AppRecord, DataField } from '@erxes/core-contract';
import type { z } from 'zod';
import type { Keys } from './fields';

export interface Delivery {
  method: string;
  headers: Record<string, string>;
  query: Record<string, unknown>;
  raw: string;
  body: unknown;
}

export interface AppEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
}

interface Received {
  reply?: { status: number; body: unknown };
  events: AppEvent[];
}

export class DeliveryRefused extends Error {}

export interface AppClient {
  clientId: string;
  clientSecret: string;
}

export interface AppHooks<C, S extends Keys = Keys> {
  appWide?: never;
  scope: S;
  subscribe(input: {
    keys: C;
    scope: z.output<S>;
    url: string;
    secret: string;
    events: string[];
    externalId: string | null;
  }): Promise<{ externalId: string; secret?: string }>;
  unsubscribe(input: { keys: C; scope: z.output<S>; externalId: string }): Promise<void>;
  receive(delivery: Delivery, secret: string): Received;
}

type Enrich<C, S> = (input: {
  keys: C;
  scope: S;
  payload: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

export interface AppWideHooks<C, S extends Keys = Keys> {
  appWide: true;
  scope: S;
  route(scope: z.output<S>): string;
  subscribe(input: {
    keys: C;
    scope: z.output<S>;
    client: AppClient;
    url: string;
    verifyToken: string;
    events: string[];
    appEvents: string[];
  }): Promise<void>;
  unsubscribe(input: { keys: C; scope: z.output<S> }): Promise<void>;
  receive(
    delivery: Delivery,
    client: { secret: string; verifyToken: string },
  ): {
    reply?: { status: number; body: unknown };
    routes: { route: string; events: AppEvent[] }[];
  };
  enrich?: Partial<Record<string, Enrich<C, z.output<S>>>>;
}

interface TriggerInfo {
  key: string;
  label: string;
  description: string;
  outputs: DataField[];
}

export interface HookTrigger extends TriggerInfo {
  via: 'hook';
  on: string;
  when?: (payload: Record<string, unknown>) => boolean;
}

interface Polled {
  cursor: unknown;
  items: { id: string; payload: Record<string, unknown> }[];
}

interface PollTrigger<C> extends TriggerInfo {
  via: 'poll';
  params: Keys;
  everyMinutes: number;
  poll(input: { keys: C; params: unknown; cursor: unknown }): Promise<Polled>;
}

type AppTrigger<C> = HookTrigger | PollTrigger<C>;

export const pollTrigger = <C, P extends Keys>(
  definition: TriggerInfo & {
    params: P;
    everyMinutes?: number;
    poll(input: { keys: C; params: z.output<P>; cursor: unknown }): Promise<Polled>;
  },
): PollTrigger<C> => ({
  ...definition,
  via: 'poll',
  everyMinutes: definition.everyMinutes ?? 5,
  poll: (input) => definition.poll({ ...input, params: definition.params.parse(input.params) }),
});

export const hookTrigger = (definition: Omit<HookTrigger, 'via'>): HookTrigger => ({
  ...definition,
  via: 'hook',
});

interface ActionCall<C, I> {
  client: C;
  input: I;
  idempotencyKey: string;
}

export interface AppAction<C> {
  key: string;
  label: string;
  description: string;
  fields: ActionField[];
  outputs?: DataField[];
  input: z.ZodType;
  run(call: ActionCall<C, unknown>): Promise<Record<string, unknown>>;
}

export const appAction = <C, T>(definition: {
  key: string;
  label: string;
  description: string;
  fields: ActionField[];
  outputs?: DataField[];
  input: z.ZodType<T>;
  run(call: ActionCall<C, T>): Promise<Record<string, unknown>>;
}): AppAction<C> => ({
  ...definition,
  run: (call) => definition.run({ ...call, input: definition.input.parse(call.input) }),
});

/**
 * Lists the service's records of one type (`page`, `repository`) for the builder's pickers, read
 * with a connection's client. `parents` holds the values of the inputs the picker depends on,
 * nearest first (a workflow's repository, then its owner). `search` is what the member typed, in
 * lower case: a service that searches uses it, and core keeps the records whose label holds it.
 */
export type AppRecords<C> = Record<
  string,
  { list(input: { client: C; parents: string[]; search: string }): Promise<AppRecord[]> }
>;

export interface Apps<K> {
  hooks?: AppHooks<K> | AppWideHooks<K>;
  triggers?: AppTrigger<K>[];
}
