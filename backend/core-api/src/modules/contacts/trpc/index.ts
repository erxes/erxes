import { initTRPC } from '@trpc/server';

import { companyTrpcRouter } from '@/contacts/trpc/company';
import { customerRouter } from '@/contacts/trpc/customer';

const t = initTRPC.create();

export const contactTrpcRouter = t.mergeRouters(
  customerRouter,
  companyTrpcRouter,
);
