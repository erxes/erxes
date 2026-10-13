import { initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { z } from 'zod';
import { createTRPCContext } from '../../utils';
import {
  PropertyValueUsageInput,
  TPropertyProducers,
  TPropertyValueUsageHandler,
} from './valueUsage';

// Records live in the plugin, so core asks it which of them hold a value.
export const initPropertyProducers = (
  app: Express,
  valueUsage: TPropertyValueUsageHandler,
) => {
  const t = initTRPC.context<{ subdomain: string }>().create();

  const router = t.router({
    [TPropertyProducers.VALUE_USAGE]: t.procedure
      .input(z.object({ subdomain: z.string(), data: PropertyValueUsageInput }))
      .query(({ input }) => valueUsage(input)),
  });

  app.use(
    '/properties',
    trpcExpress.createExpressMiddleware({
      router,
      createContext: createTRPCContext(async (_subdomain, context) => context),
    }),
  );
};
