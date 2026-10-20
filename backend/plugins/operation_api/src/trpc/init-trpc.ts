import {
  applyContactFieldsSync,
  findContactFieldsRecords,
  TContactFieldsFind,
  TContactFieldsSync,
} from 'erxes-api-shared/core-modules';
import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  generateProjectFields,
  generateTaskFields,
} from '~/modules/fields/fieldUtils';
import { taskTrpcRouter } from '~/modules/task/trpc/task';

export type OperationTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<OperationTRPCContext>().create();

export const appRouter = t.mergeRouters(
  t.router({
    operation: {
      hello: t.procedure.query(() => {
        return 'Hello operation';
      }),
    },
  }),
  taskTrpcRouter,
  t.router({
    fields: t.router({
      getFieldList: t.procedure
        .input(
          z.object({
            moduleType: z.string(),
            collectionType: z.string().optional(),
            segmentId: z.string().optional(),
            usageType: z.string().optional(),
            config: z.record(z.unknown()).optional(),
          }),
        )
        .query(async ({ ctx, input }) => {
          const { models, subdomain } = ctx;
          const { moduleType } = input;

          if (moduleType === 'task') {
            return await generateTaskFields({ models, subdomain, data: input });
          }

          if (moduleType === 'project') {
            return await generateProjectFields({
              models,
              subdomain,
              data: input,
            });
          }

          return [];
        }),
    }),
  }),
  t.router({
    contactFields: t.router({
      // Core reads record ↔ contact links from the fields through this.
      find: t.procedure
        .input(z.custom<TContactFieldsFind>())
        .query(async ({ ctx, input }) => {
          const { models, subdomain } = ctx;

          if (input.contentType !== 'operation:task') {
            return null;
          }

          return findContactFieldsRecords(
            models.Task,
            `${subdomain}:operation_tasks`,
            input,
          );
        }),
      // Core keeps these records' customerIds / companyIds in step with
      // relations; see erxes-api-shared contact-fields.
      sync: t.procedure
        .input(z.custom<TContactFieldsSync>())
        .mutation(async ({ ctx, input }) => {
          const { models } = ctx;

          await applyContactFieldsSync(
            { 'operation:task': models.Task },
            input,
          );
        }),
    }),
  }),
);

export type AppRouter = typeof appRouter;
