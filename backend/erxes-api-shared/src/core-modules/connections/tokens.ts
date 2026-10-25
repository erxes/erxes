import { z } from 'zod';
import {
  createServiceToken,
  readServiceToken,
} from '../../utils/service-signature';
import {
  CONNECTION_TYPE_ID_PATTERN,
  CONNECTIONS_READ_PURPOSE,
  CONNECTIONS_TEST_PURPOSE,
  CONNECTIONS_TOKEN_TTL_MS,
} from './constants';
import { IConnectionValue, TConnectionLookup } from './types';

/**
 * Short-lived signed tokens carried in the tRPC input of connection calls.
 * Plain internal tRPC is reachable through the gateway's plugin proxy, so the
 * signature (shared service secret) is what admits a call; the payload binds
 * the tenant, the calling service and exactly what it asked for.
 */

const lookupSchema = z.union([
  z
    .object({
      type: z.string().regex(CONNECTION_TYPE_ID_PATTERN),
      connectionId: z.string().min(1).max(64),
    })
    .strict(),
  z
    .object({
      type: z.string().regex(CONNECTION_TYPE_ID_PATTERN),
      name: z.string().min(1).max(120),
    })
    .strict(),
]);

const readPayloadSchema = z.object({
  subdomain: z.string().min(1),
  service: z.string().min(1).max(40),
  lookup: lookupSchema,
});

export const connectionValueSchema = z.object({
  _id: z.string(),
  name: z.string(),
  type: z.string(),
  fields: z.record(z.string()),
});

const testPayloadSchema = z.object({
  subdomain: z.string().min(1),
  connection: connectionValueSchema,
});

export interface IConnectionReadRequest {
  subdomain: string;
  service: string;
  lookup: TConnectionLookup;
}

export const createConnectionReadToken = (request: IConnectionReadRequest) =>
  createServiceToken({ ...request }, CONNECTIONS_READ_PURPOSE);

/** Returns the verified read request, or null when the token is not valid. */
export const readConnectionReadToken = (
  token: unknown,
): IConnectionReadRequest | null => {
  const parsed = readPayloadSchema.safeParse(
    readServiceToken(token, CONNECTIONS_READ_PURPOSE, CONNECTIONS_TOKEN_TTL_MS),
  );

  return parsed.success ? (parsed.data as IConnectionReadRequest) : null;
};

export const createConnectionTestToken = (
  subdomain: string,
  connection: IConnectionValue,
) => createServiceToken({ subdomain, connection }, CONNECTIONS_TEST_PURPOSE);

export const readConnectionTestToken = (
  token: unknown,
): { subdomain: string; connection: IConnectionValue } | null => {
  const parsed = testPayloadSchema.safeParse(
    readServiceToken(token, CONNECTIONS_TEST_PURPOSE, CONNECTIONS_TOKEN_TTL_MS),
  );

  return parsed.success ? parsed.data : null;
};
