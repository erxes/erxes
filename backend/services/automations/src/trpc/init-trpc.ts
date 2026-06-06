import { initTRPC } from '@trpc/server';
import { ITRPCContext } from 'erxes-api-shared/utils';

export type AutomationsTRPCContext = ITRPCContext<{
  subdomain: string;
}>;

export const t = initTRPC.context<AutomationsTRPCContext>().create({});
