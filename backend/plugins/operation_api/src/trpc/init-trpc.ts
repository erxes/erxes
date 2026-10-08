import { initTRPC } from '@trpc/server';

import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  generateProjectFields,
  generateTaskFields,
} from '~/modules/fields/fieldUtils';
import { taskTrpcRouter } from '~/modules/task/trpc/task';
import { taskDocumentEditorAttributes } from '~/meta/documents';
import { TASK_CONTENT_TYPE } from '~/meta/import-export/utils';

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
    documents: t.router({
      editorAttributes: t.procedure
        .input(z.object({ contentType: z.literal(TASK_CONTENT_TYPE) }))
        .query(({ ctx }) =>
          taskDocumentEditorAttributes(ctx.subdomain, ctx.models),
        ),
    }),
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
);

export type AppRouter = typeof appRouter;
