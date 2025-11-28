import { initTRPC } from '@trpc/server';
import { CoreTRPCContext } from '~/init-trpc';
import { importRouter } from './import';

const t = initTRPC.context<CoreTRPCContext>().create();

export const importExportTrpcRouter = t.mergeRouters(importRouter);
