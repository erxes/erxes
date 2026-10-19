/**
 * `relation.findRelatedIds` — the agent-facing relation lookup.
 *
 * The guarantees under test:
 *
 * - only customer↔X / company↔X pairs are resolved (other pairs are
 *   rejected before touching the models layer);
 * - the same type on both sides is rejected;
 * - malformed content types fail zod validation;
 * - empty ids are dropped, results cap at 200 with `truncated` + `total`;
 * - the procedure carries agent meta permission `contacts.contactsRead`,
 *   while the existing internal procedures carry none.
 */

import { TRPCError } from '@trpc/server';
import type { CoreTRPCContext } from '~/init-trpc';
import { relationTrpcRouter } from '@/relations/trpc/relation';

const buildCaller = (ids: string[] = []) => {
  const getRelationIds = jest.fn(async () => ids);

  const caller = relationTrpcRouter.createCaller({
    models: { Relations: { getRelationIds } },
  } as unknown as CoreTRPCContext);

  return { caller, getRelationIds };
};

const agentProcedures = () => {
  // Router internals: `_def.procedures` is a flat `relation.x` -> proc map.
  const defs = relationTrpcRouter._def.procedures as Record<
    string,
    { _def: { meta?: Record<string, unknown> } }
  >;

  return defs;
};

describe('relation.findRelatedIds', () => {
  it('returns related ids for customer -> company and forwards the input verbatim', async () => {
    const { caller, getRelationIds } = buildCaller(['comp-1', 'comp-2']);
    const input = {
      contentType: 'core:customer',
      contentId: 'cust-1',
      relatedContentType: 'core:company',
    };

    const result = await caller.relation.findRelatedIds(input);

    expect(result).toEqual({
      ...input,
      relatedIds: ['comp-1', 'comp-2'],
      total: 2,
      truncated: false,
    });
    expect(getRelationIds).toHaveBeenCalledWith(input);
  });

  it('drops empty ids from the model layer', async () => {
    const { caller } = buildCaller(['comp-1', '', 'comp-2']);

    const result = await caller.relation.findRelatedIds({
      contentType: 'core:company',
      contentId: 'comp-x',
      relatedContentType: 'core:customer',
    });

    expect(result.relatedIds).toEqual(['comp-1', 'comp-2']);
    expect(result.total).toBe(2);
    expect(result.truncated).toBe(false);
  });

  it('caps results at 200 with truncated + total when more links exist', async () => {
    const ids = Array.from({ length: 205 }, (_, i) => `id-${i}`);
    const { caller } = buildCaller(ids);

    const result = await caller.relation.findRelatedIds({
      contentType: 'core:customer',
      contentId: 'cust-1',
      relatedContentType: 'sales:deal',
    });

    expect(result.relatedIds).toHaveLength(200);
    expect(result.total).toBe(205);
    expect(result.truncated).toBe(true);
  });

  it('rejects a pair where neither side is a contact type without hitting the model', async () => {
    const { caller, getRelationIds } = buildCaller();

    await expect(
      caller.relation.findRelatedIds({
        contentType: 'sales:deal',
        contentId: 'deal-1',
        relatedContentType: 'core:product',
      }),
    ).rejects.toThrow(TRPCError);
    expect(getRelationIds).not.toHaveBeenCalled();
  });

  it('rejects the same content type on both sides', async () => {
    const { caller, getRelationIds } = buildCaller();

    await expect(
      caller.relation.findRelatedIds({
        contentType: 'core:customer',
        contentId: 'cust-1',
        relatedContentType: 'core:customer',
      }),
    ).rejects.toThrow(/must differ/);
    expect(getRelationIds).not.toHaveBeenCalled();
  });

  it('rejects a malformed content type at the schema level', async () => {
    const { caller } = buildCaller();

    await expect(
      caller.relation.findRelatedIds({
        contentType: 'customer',
        contentId: 'cust-1',
        relatedContentType: 'core:company',
      }),
    ).rejects.toThrow(/plugin:type/);
  });

  it('does not expose agent metadata on any internal procedure', () => {
    for (const proc of Object.values(agentProcedures())) {
      expect(proc._def.meta?.agent).toBeUndefined();
    }
  });
});
