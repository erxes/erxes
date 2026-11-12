import { pluginPlan, subscriptionInfo } from '~/modules/saas/saas.service';
import { authedUnscoped, pluginUnscoped } from '~/orpc';

// Unscoped: the first answer may wait on erxes.io, which no transaction should.
export const saasRouter = {
  plan: authedUnscoped.saas.plan.handler(({ context }) => subscriptionInfo(context.actor)),
  pluginPlan: pluginUnscoped.saas.pluginPlan.handler(({ context }) => pluginPlan(context.plugin)),
};
