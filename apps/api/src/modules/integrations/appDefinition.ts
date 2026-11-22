import type { ActionField, DataField } from '@erxes/core-contract';
import type { z } from 'zod';
import { fail } from '~/http/errors';
import { idempotencyKey, parseInput } from '~/modules/automations/actions/context';
import { CONNECTION_FIELD, type KeyedAction, type Keys } from './define';
import { GatewayError } from './gateways/types';

const RETRIED = new Set([408, 409, 425, 429]);

/** The service's answer to this request, which a retry won't change. */
const refused = (error: unknown): error is GatewayError =>
  error instanceof GatewayError &&
  error.status !== null &&
  error.status >= 400 &&
  error.status < 500 &&
  !RETRIED.has(error.status);

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

/**
 * An app's action (`github.create_issue`): its input checked with `input`, run on the client of
 * the step's `connection`.
 */
export const appAction = <C, T>(definition: {
  key: string;
  label: string;
  description: string;
  fields: ActionField[];
  outputs?: DataField[];
  input: z.ZodType<T>;
  run(call: ActionCall<C, T>): Promise<Record<string, unknown>>;
}): KeyedAction<C> => {
  const { key, label, description, fields, outputs, input: schema } = definition;

  return {
    key,
    label,
    description,
    outputs,
    subject: null,
    fields: [CONNECTION_FIELD, ...fields],
    async call(ctx) {
      const input = parseInput(ctx, schema);
      const { client } = await ctx.connection();

      try {
        return await definition.run({ client, input, idempotencyKey: idempotencyKey(ctx) });
      } catch (error) {
        if (refused(error)) throw fail('GATEWAY_REFUSED', error.message);

        throw error;
      }
    },
  };
};

export interface Apps<K> {
  hooks?: AppHooks<K> | AppWideHooks<K>;
  triggers?: AppTrigger<K>[];
}
