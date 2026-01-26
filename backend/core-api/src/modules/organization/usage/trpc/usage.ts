import { initTRPC } from '@trpc/server';
import { getUsageRedisKey, redis } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { CoreTRPCContext } from '~/init-trpc';

const t = initTRPC.context<CoreTRPCContext>().create();

export const usageTrpcRouter = t.router({
  usage: t.router({
    get: t.procedure
      .input(z.object({ targetType: z.string() }))
      .query(
        async ({ ctx, input }) =>
          await ctx.models.Usage.getUsage(input.targetType),
      ),
    addCount: t.procedure
      .input(z.object({ targetType: z.string(), delta: z.number() }))
      .mutation(async ({ ctx, input }) =>
        ctx.models.Usage.addUsageCount(input.targetType, input.delta),
      ),
    resyncRecurringUsage: t.procedure
      .input(z.object({ targetType: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { subdomain, models } = ctx;
        const { targetType } = input;
        const redisKey = getUsageRedisKey(subdomain, targetType);
        const usage = await models.Usage.getUsage(targetType);
        if (!usage) {
          return null;
        }
        let count = usage.totalCount;
        let ttl: number | undefined;

        if (usage.recurringInterval) {
          count = usage.count;
          ttl = getSecondsUntilWindowEnd(usage.recurringInterval);
        }

        const payload = {
          limit: usage.limit,
          count,
        };

        if (ttl) {
          await redis.set(redisKey, JSON.stringify(payload), 'EX', ttl);
        } else {
          await redis.set(redisKey, JSON.stringify(payload));
        }

        return JSON.stringify(payload);
      }),
  }),
});

function getSecondsUntilWindowEnd(interval: 'day' | 'week' | 'month') {
  const now = new Date();

  if (interval === 'day') {
    const end = new Date(now);
    end.setUTCHours(23, 59, 59, 999);
    return Math.floor((end.getTime() - now.getTime()) / 1000);
  }

  if (interval === 'week') {
    const end = new Date(now);
    const day = end.getUTCDay(); // 0 (Sun) → 6 (Sat)
    const diff = 6 - day; // end of week (Sunday-based)
    end.setUTCDate(end.getUTCDate() + diff);
    end.setUTCHours(23, 59, 59, 999);
    return Math.floor((end.getTime() - now.getTime()) / 1000);
  }

  if (interval === 'month') {
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999),
    );
    return Math.floor((end.getTime() - now.getTime()) / 1000);
  }

  throw new Error('Unsupported interval');
}
