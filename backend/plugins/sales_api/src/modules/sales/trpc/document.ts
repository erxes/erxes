import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { salesDocumentEditorAttributes } from '~/meta/documents';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const documentTrpcRouter = t.router({
  documents: t.router({
    editorAttributes: t.procedure
      .input(z.object({ contentType: z.string() }))
      .query(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;

        return await salesDocumentEditorAttributes(
          models,
          subdomain,
          input.contentType,
        );
      }),
  }),
});
