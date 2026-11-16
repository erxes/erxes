import { AnyProcedure, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { Express } from 'express';
import { z } from 'zod';
import { createTRPCContext } from '../../utils/trpc';

export enum TTemplatePartProducers {
  CREATE = 'createPart',
  REMOVE = 'removePart',
}

const createPartInputSchema = z.object({
  subdomain: z.string(),
  data: z.object({
    // The part type without its plugin, e.g. `tickets.pipeline`
    type: z.string(),
    doc: z.record(z.string(), z.unknown()),
    userId: z.string(),
  }),
});

const removePartInputSchema = z.object({
  subdomain: z.string(),
  data: z.object({
    type: z.string(),
    _id: z.string(),
    refs: z.record(z.string(), z.string()).optional(),
  }),
});

export type TTemplatePartCreateInput = z.infer<
  typeof createPartInputSchema
>['data'];
export type TTemplatePartRemoveInput = z.infer<
  typeof removePartInputSchema
>['data'];

/**
 * What a created part tells the template: its id, and the ids of what came
 * with it (a pipeline's channel and first status), read in steps as
 * `{{ parts.<key>.<ref> }}`.
 */
export type TTemplatePartCreated = {
  _id: string;
  refs?: Record<string, string>;
};

// A part holding data people made since (tickets in a pipeline) stays
export type TTemplatePartRemoved = { removed: boolean; reason?: string };

export type TTemplatePartsProducersInput = {
  [TTemplatePartProducers.CREATE]: TTemplatePartCreateInput;
  [TTemplatePartProducers.REMOVE]: TTemplatePartRemoveInput;
};

type TPartHandlerProps<TModels, TInput> = TInput & {
  models: TModels;
  subdomain: string;
};

export type TTemplatePartsConfig<TModels = any> = {
  generateModels: (subdomain: string) => Promise<TModels>;
  types: Record<
    string,
    {
      create: (
        props: TPartHandlerProps<TModels, TTemplatePartCreateInput>,
      ) => Promise<TTemplatePartCreated>;
      remove: (
        props: TPartHandlerProps<TModels, TTemplatePartRemoveInput>,
      ) => Promise<TTemplatePartRemoved>;
    }
  >;
};

/**
 * Puts the records a plugin creates for templates on the wire, the way
 * approval appliers are: core's installer asks the owning plugin to create or
 * remove a part, and never touches its collections.
 */
export const initTemplateParts = (
  app: Express,
  pluginName: string,
  config: TTemplatePartsConfig,
) => {
  const t = initTRPC.context<any>().create();
  const handlerOf = (type: string) => {
    const handler = config.types[type];

    if (!handler) {
      throw new Error(`${pluginName} does not create template part "${type}"`);
    }

    return handler;
  };

  const procedures: Record<string, AnyProcedure> = {
    [TTemplatePartProducers.CREATE]: t.procedure
      .input(createPartInputSchema)
      .mutation(async ({ input }) => {
        const { subdomain, data } = input;
        const models = await config.generateModels(subdomain);

        return handlerOf(data.type).create({ ...data, models, subdomain });
      }),
    [TTemplatePartProducers.REMOVE]: t.procedure
      .input(removePartInputSchema)
      .mutation(async ({ input }) => {
        const { subdomain, data } = input;
        const models = await config.generateModels(subdomain);

        return handlerOf(data.type).remove({ ...data, models, subdomain });
      }),
  };

  app.use(
    '/templates',
    trpcExpress.createExpressMiddleware({
      allowMethodOverride: true,
      router: t.router(procedures),
      createContext: createTRPCContext(async (_subdomain, context) => context),
    }),
  );
};
