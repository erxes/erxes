import { initTRPC } from '@trpc/server';
import { segmentsRouter } from './segments';
import { ITRPCContext } from 'erxes-api-shared/utils';

const t = initTRPC.context<ITRPCContext>().create({});

export const segmentsTRPCRouter = t.mergeRouters(segmentsRouter);
