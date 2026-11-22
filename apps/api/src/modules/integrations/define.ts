import type { ActionField, IntegrationStatus } from '@erxes/core-contract';
import type { Db } from '@erxes/core-db';
import {
  type ClientOptions as PackageClientOptions,
  fieldsOf,
  type Keys,
  type KeyedIntegration as PackageIntegration,
  type Listing,
} from '@erxes/plugin-sdk/integrations';
import { z } from 'zod';
import type { ActionContext, ActionSpec, CallContext } from '~/modules/automations/actions/context';
import type { BankConfig } from './banks/types';

export interface ClientOptions extends PackageClientOptions {
  /** The platform's QPay QuickQR vendor account (QUICK_QR_*), unset where it has none. */
  quickQr?: { url: string; username: string; password: string };
  /** The bank connection a transfer gateway reads its statement through (its `connectionId`). */
  bank?: BankConfig;
}

export type KeyedIntegration<K extends Keys = Keys, C = unknown> = PackageIntegration<
  K,
  C,
  ClientOptions
>;

/** The step's `connection` input: one of the integration's active connections, else the default. */
export const CONNECTION_FIELD: ActionField = {
  key: 'connection',
  label: 'Connection',
  type: 'connection',
  required: false,
  description: 'Empty: the default one',
};

/** One of the integration's connections, with its client open. */
interface Connected<C> {
  id: string;
  name: string;
  client: C;
}

/** What a keyed integration's action gets: the step, its integration, and a connection to run on. */
export interface IntegrationCall<C> extends CallContext {
  integration: { key: string; name: string };
  /**
   * The connection the step's `connection` input names, else the organisation's default
   * gateway when it is one of the integration's, else its oldest active one. 409 NOT_CONNECTED.
   */
  connection(): Promise<Connected<C>>;
}

/**
 * An action core runs for a keyed integration (`<integration>.<key>`). It reaches the
 * service outside any transaction and may run more than once: it sends `idempotencyKey(ctx)`.
 */
export type KeyedAction<C> = ActionSpec & {
  key: string;
  call(ctx: IntegrationCall<C>): Promise<unknown>;
};

/** An action of an integration with its own page: a core action, keyed within the integration. */
export type PagedAction = ActionSpec & { key: string } & (
    | { run(ctx: ActionContext): Promise<unknown> }
    | { call(ctx: CallContext): Promise<unknown> }
  );

export interface PagedIntegration extends Listing {
  status(tx: Db): Promise<IntegrationStatus>;
  /** Listed in automations while `status` is connected or needs attention. */
  actions?: PagedAction[];
  keys?: never;
  client?: never;
  verify?: never;
  payments?: never;
  oauth?: never;
  hooks?: never;
  triggers?: never;
}

export type Integration = KeyedIntegration | PagedIntegration;

const Values = z.record(z.string(), z.unknown());

export const sealedValues = (opened: string) => Values.parse(JSON.parse(opened));

export const splitValues = (keys: Keys, values: Record<string, unknown>) => {
  const sealed = new Set(
    fieldsOf(keys).flatMap((item) => (item.type === 'secret' ? [item.key] : [])),
  );

  const given = Object.entries(values).filter(([, value]) => value !== undefined);

  return {
    settings: Object.fromEntries(given.filter(([key]) => !sealed.has(key))),
    secrets: Object.fromEntries(given.filter(([key]) => sealed.has(key))),
  };
};
