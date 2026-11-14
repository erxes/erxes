import { pluginPlan, subscriptionInfo } from '~/modules/saas/saas.service';
import { unscoped } from '~/orpc';

// Unscoped: the first answer may wait on erxes.io, which no transaction should.
export const saasRouter = {
  plan: unscoped.saas.plan.handler(() => subscriptionInfo()),
  pluginPlan: unscoped.saas.pluginPlan.handler(() => pluginPlan()),
};
