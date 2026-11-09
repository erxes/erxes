import { z } from 'zod';
import { DATA_EXTENSION_LIMITS } from './constants';
import {
  findDataExtensionRecordsByRelation,
  getDataExtensionRecords,
  IDataExtensionOwnerContext,
  linkDataExtensionRecords,
  purgeDataExtensionValues,
  searchDataExtensionRecords,
  patchDataExtensionRecord,
} from './owner';
import { assertDataExtensionsOwnerProof } from './requestProof';

const proof = z.object({ issuedAt: z.number(), signature: z.string() });

/**
 * Inputs of the owner contract. Every module that owns records exposes the
 * same six procedures under `dataExtensions.records`, so the runtime can
 * reach any owner the same way.
 */
export const DATA_EXTENSIONS_OWNER_INPUTS = {
  get: z.object({
    recordType: z.string(),
    ids: z.array(z.string()).max(DATA_EXTENSION_LIMITS.recordsPerLookup),
    proof,
  }),
  patch: z.object({
    recordType: z.string(),
    _id: z.string(),
    values: z.record(z.unknown()),
    proof,
  }),
  findByRelation: z.object({
    recordType: z.string(),
    key: z.string(),
    targetIds: z.array(z.string()).max(DATA_EXTENSION_LIMITS.recordsPerLookup),
    limit: z.number().int().positive().optional(),
    proof,
  }),
  search: z.object({
    recordType: z.string(),
    searchValue: z
      .string()
      .max(DATA_EXTENSION_LIMITS.searchTextLength)
      .optional(),
    limit: z.number().int().positive().optional(),
    proof,
  }),
  purge: z.object({
    recordType: z.string(),
    keys: z.array(z.string()).min(1).max(10),
    proof,
  }),
  link: z.object({
    recordType: z.string(),
    key: z.string(),
    ids: z.array(z.string()).max(DATA_EXTENSION_LIMITS.recordsPerLookup),
    targetId: z.string(),
    action: z.enum(['add', 'remove']),
    proof,
  }),
};

type OwnerInputs = {
  [K in keyof typeof DATA_EXTENSIONS_OWNER_INPUTS]: z.infer<
    (typeof DATA_EXTENSIONS_OWNER_INPUTS)[K]
  >;
};

export type DataExtensionsOwnerOperation = keyof OwnerInputs;

export interface IDataExtensionsOwnerCall<
  K extends DataExtensionsOwnerOperation,
> {
  operation: K;
  /** Owner name from the record type registry, e.g. `core`. */
  owner: string;
  subdomain: string;
  userId?: string;
  input: OwnerInputs[K];
  context: IDataExtensionOwnerContext;
  /** Extra check that the acting user may still write (e.g. is active). */
  assertActor?: (userId: string) => Promise<void>;
}

/**
 * One entry point for an owner's tRPC procedures: verifies the runtime's
 * proof for this tenant, actor and exact input, then runs the operation.
 * A module adds Data Extensions support by wiring its procedures here and
 * supplying its storage adapters.
 */
export const runDataExtensionsOwnerCall = async <
  K extends DataExtensionsOwnerOperation,
>({
  operation,
  owner,
  subdomain,
  userId,
  input,
  context,
  assertActor,
}: IDataExtensionsOwnerCall<K>) => {
  const { proof: requestProof, ...request } = input;

  assertDataExtensionsOwnerProof({
    subdomain,
    userId,
    request,
    proof: requestProof,
  });

  switch (operation) {
    case 'get': {
      const { recordType, ids } = input as OwnerInputs['get'];

      return getDataExtensionRecords(context, owner, recordType, ids);
    }
    case 'patch': {
      const { recordType, _id, values } = input as OwnerInputs['patch'];

      if (assertActor && userId) {
        await assertActor(userId);
      }

      return patchDataExtensionRecord(context, owner, recordType, _id, values);
    }
    case 'findByRelation': {
      const { recordType, key, targetIds, limit } =
        input as OwnerInputs['findByRelation'];

      return findDataExtensionRecordsByRelation(
        context,
        owner,
        recordType,
        key,
        targetIds,
        limit,
      );
    }
    case 'search': {
      const { recordType, searchValue, limit } = input as OwnerInputs['search'];

      return searchDataExtensionRecords(
        context,
        owner,
        recordType,
        searchValue,
        limit,
      );
    }
    case 'purge': {
      const { recordType, keys } = input as OwnerInputs['purge'];

      if (assertActor && userId) {
        await assertActor(userId);
      }

      return purgeDataExtensionValues(context, owner, recordType, keys);
    }
    case 'link': {
      const { recordType, key, ids, targetId, action } =
        input as OwnerInputs['link'];

      if (assertActor && userId) {
        await assertActor(userId);
      }

      return linkDataExtensionRecords(
        context,
        owner,
        recordType,
        key,
        ids,
        targetId,
        action,
      );
    }
    default:
      throw new Error(`Unknown Data Extensions operation "${operation}"`);
  }
};
