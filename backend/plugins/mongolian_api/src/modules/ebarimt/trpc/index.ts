import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ebarimtTrpcRouter as ebarimtRouter } from './ebarimt';
import { productRulesTrpcRouter as productRulesRouter } from './productRules';
import { putResponsesTrpcRouter as putResponsesRouter } from './putResponse';

export type EbarimtTRPCContext = ITRPCContext<{ models: IModels }>;

export const t = initTRPC.context<EbarimtTRPCContext>().create();

export const ebarimtTrpcRouter = t.mergeRouters(
  ebarimtRouter,
  putResponsesRouter,
  productRulesRouter,
) as ReturnType<typeof t.mergeRouters>;

export type EbarimtTRPCRouter = typeof ebarimtTrpcRouter;
