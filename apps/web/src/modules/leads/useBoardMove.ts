import type { Company, Customer, LeadRecordType } from '@erxes/core-contract';
import {
  type InfiniteData,
  type QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useToast } from 'erxes-ui';
import { z } from 'zod';
import { messageOf, orpc } from '~/lib/api';
import type { CursorPage } from '~/lib/cursorList';
import { useLeadsT } from './i18n';
import { leadStagesQuery } from './useLeads';

export type BoardLead = Customer | Company;

type BoardCache = InfiniteData<CursorPage<BoardLead>>;

/** Lists of the board's records: one column (`stageId`), or all of them. */
const leadListKey = (recordType: LeadRecordType, stageId?: string) => {
  const filter = { type: 'infinite' as const, input: stageId ? { leadStageId: stageId } : {} };

  return recordType === 'company'
    ? orpc.companies.list.key(filter)
    : orpc.customers.list.key(filter);
};

/** A lead some loaded list holds, such as the card being dragged. */
export const findCachedLead = (client: QueryClient, recordType: LeadRecordType, id: string) =>
  client
    .getQueriesData<BoardCache>({ queryKey: leadListKey(recordType) })
    .flatMap(([, cache]) => cache?.pages ?? [])
    .flatMap((page) => page.data)
    .find((lead) => lead.id === id);

/** Newest first, as the server lists them. */
const newerFirst = (a: BoardLead, b: BoardLead) =>
  a.createdAt === b.createdAt ? (a.id < b.id ? 1 : -1) : a.createdAt < b.createdAt ? 1 : -1;

const withoutLead = (cache: BoardCache, id: string): BoardCache => ({
  ...cache,
  pages: cache.pages.map((page, index) => ({
    ...page,
    data: page.data.filter((item) => item.id !== id),
    totalCount: index === 0 ? Math.max(0, page.totalCount - 1) : page.totalCount,
  })),
});

/** Adds the lead where the server will list it; past the loaded pages it comes with them. */
const withLead = (cache: BoardCache, moved: BoardLead): BoardCache => {
  const pages = cache.pages.map((page, index) => ({
    ...page,
    totalCount: index === 0 ? page.totalCount + 1 : page.totalCount,
  }));

  const last = pages.at(-1);
  const oldest = last?.data.at(-1);

  if (!last || (last.pageInfo.hasNextPage && oldest && newerFirst(moved, oldest) > 0)) {
    return { ...cache, pages };
  }

  const at = pages.findIndex((page) => page.data.some((item) => newerFirst(moved, item) < 0));
  const target = at === -1 ? pages.length - 1 : at;

  return {
    ...cache,
    pages: pages.map((page, index) =>
      index === target ? { ...page, data: [...page.data, moved].toSorted(newerFirst) } : page,
    ),
  };
};

/**
 * Moves a card between columns in the cache, where the server will list it,
 * with the stage counts. Fetches of those columns in flight are dropped (not
 * reverted), so they can't bring the old order back.
 */
const moveInCache = async (
  client: QueryClient,
  recordType: LeadRecordType,
  lead: BoardLead,
  toStageId: string,
) => {
  const from = leadListKey(recordType, lead.leadStageId ?? undefined);
  const to = leadListKey(recordType, toStageId);
  const moved = { ...lead, leadStageId: toStageId, leadStageChangedAt: new Date().toISOString() };
  const field = recordType === 'company' ? 'companyLeadCount' : 'leadCount';

  await Promise.all([
    client.cancelQueries({ queryKey: from }, { revert: false }),
    client.cancelQueries({ queryKey: to }, { revert: false }),
  ]);
  client.setQueriesData<BoardCache>(
    { queryKey: from },
    (cache) => cache && withoutLead(cache, lead.id),
  );
  client.setQueriesData<BoardCache>({ queryKey: to }, (cache) => cache && withLead(cache, moved));
  client.setQueryData(leadStagesQuery().queryKey, (stages) =>
    stages
      ? {
          data: stages.data.map((stage) =>
            stage.id === lead.leadStageId
              ? { ...stage, [field]: Math.max(0, stage[field] - 1) }
              : stage.id === toStageId
                ? { ...stage, [field]: stage[field] + 1 }
                : stage,
          ),
        }
      : stages,
  );
};

const listedStage = z.tuple([
  z.unknown(),
  z.object({ input: z.object({ leadStageId: z.string().optional() }).optional() }),
]);

/**
 * Moves a dragged lead to a stage. The card lands at once; afterwards only
 * what the move touched reloads: its two columns, unfiltered lists, the
 * counts, the report and the lead itself.
 */
export const useBoardMove = (recordType: LeadRecordType) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const t = useLeadsT();

  const refresh = (ids: string[], stages: (string | null | undefined)[]) => {
    const touches = (key: readonly unknown[]) => {
      const parsed = listedStage.safeParse(key);
      const stageId = parsed.success ? parsed.data[1].input?.leadStageId : undefined;

      return !stageId || stages.includes(stageId);
    };

    const detail = recordType === 'company' ? orpc.companies.get : orpc.customers.get;

    return Promise.all([
      client.invalidateQueries({
        queryKey: leadListKey(recordType),
        predicate: (query) => touches(query.queryKey),
      }),
      client.invalidateQueries({ queryKey: orpc.leads.key() }),
      ...ids.map((id) => client.invalidateQueries({ queryKey: detail.key({ input: { id } }) })),
    ]);
  };

  return useMutation(
    orpc.leads.move.mutationOptions({
      onMutate: async ({ ids: [id], stageId }) => {
        const lead = id ? findCachedLead(client, recordType, id) : undefined;

        if (lead) await moveInCache(client, recordType, lead, stageId);

        return { from: lead?.leadStageId };
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('actions.move-failed'),
          description: messageOf(error),
        }),
      onSettled: (data, error, { ids, stageId }, context) => refresh(ids, [stageId, context?.from]),
    }),
  );
};
