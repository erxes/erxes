import { type Ctx, ExtensionError, mutation, query } from 'erxes-sdk/server';
import * as z from 'zod';
import { FollowUp } from './schema';

// The deal as the caller sees it in sales right now, or null when it's gone
// or sales won't show it to them.
const visibleDeal = async ({ erxes }: Ctx, dealId: string) => {
  try {
    return await erxes.sales.deals.get({ _id: dealId });
  } catch (e) {
    if (e instanceof ExtensionError && e.code === 'FORBIDDEN') {
      return null;
    }

    throw e;
  }
};

/**
 * Follow-ups due on or before `until`, soonest first, on deals the caller can
 * see. Each deal on the page is read from sales as the caller, so a page can
 * hold fewer rows than perPage; totalCount counts every stored follow-up.
 */
export const list = query({
  permission: 'followUps.view',
  input: z.object({
    until: z.iso.date().optional(),
    page: z.number().int().min(1).default(1),
    perPage: z.number().int().min(1).max(20).default(20),
  }),
  async handler(ctx, { until, page, perPage }) {
    const filter = until ? { dueDate: { $lte: until } } : {};

    const [rows, totalCount] = await Promise.all([
      ctx.db.followUps.find(filter, {
        sort: { dueDate: 1 },
        skip: (page - 1) * perPage,
        limit: perPage,
      }),
      ctx.db.followUps.count(filter),
    ]);
    const deals = await Promise.all(
      rows.map((row) => visibleDeal(ctx, row.dealId)),
    );

    const list = rows.flatMap((row, i) => {
      const deal = deals[i];
      return deal ? [{ ...row, dealName: deal.name }] : [];
    });

    return { list, totalCount };
  },
});

/** The follow-up on this deal, or null, including when the caller can't see the deal. */
export const forDeal = query({
  permission: 'followUps.view',
  input: z.object({ dealId: z.string().min(1) }),
  async handler(ctx, { dealId }) {
    if (!(await visibleDeal(ctx, dealId))) {
      return null;
    }

    return ctx.db.followUps.findOne({ dealId });
  },
});

/** Set the deal's follow-up, replacing any earlier one. */
export const set = mutation({
  permission: 'followUps.manage',
  input: FollowUp.pick({ dealId: true, dueDate: true, note: true }),
  async handler({ db, erxes, user }, { dealId, dueDate, note }) {
    // FORBIDDEN from sales passes through: no follow-up on a hidden deal.
    const deal = await erxes.sales.deals.get({ _id: dealId });

    if (!deal) {
      throw new ExtensionError('NOT_FOUND', 'This deal no longer exists');
    }

    const stage = deal.stageId
      ? await erxes.sales.stages.get({ _id: deal.stageId })
      : null;

    // Atomic: two saves at once leave one follow-up, the later one's.
    return db.followUps.updateOne(
      { dealId },
      {
        dealId,
        pipelineId: stage?.pipelineId ?? null,
        dueDate,
        note,
        setBy: user._id,
      },
      { upsert: true },
    );
  },
});

/**
 * Clear the deal's follow-up, for when it's done. Clearing one that's already
 * gone succeeds, so a retry or a second click is harmless.
 */
export const clear = mutation({
  permission: 'followUps.manage',
  input: z.object({ dealId: z.string().min(1) }),
  async handler({ db, erxes }, { dealId }) {
    // Null means the deal was deleted; its follow-up may still be cleared.
    await erxes.sales.deals.get({ _id: dealId });

    const cleared = await db.followUps.deleteOne({ dealId });

    return { dealId, cleared: cleared !== null };
  },
});
