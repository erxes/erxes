import { caller, requestOrgId, sourceOf, withOrg } from '@erxes/core-db';
import { unscoped } from '~/orpc';
import {
  customerAppOrigin,
  customerUnreadCount,
  listCustomerNotifications,
  markCustomerNotificationsRead,
  notifyCustomers,
} from './customerNotifications.service';

/** Customer procedures open their own short transaction (`unscoped`, see AGENTS.md). */
const inOrg = <T>(run: Parameters<typeof withOrg<T>>[1]) => withOrg(requestOrgId(), run);

export const customerNotificationsRouter = {
  // The app's address is a system lookup, made before the organisation's transaction.
  create: unscoped.customerNotifications.create.handler(async ({ input }) => {
    const appOrigin = await customerAppOrigin(sourceOf(caller()));

    return inOrg((tx) => notifyCustomers(tx, input, appOrigin));
  }),
  list: unscoped.customerNotifications.list.handler(({ input }) =>
    inOrg((tx) => listCustomerNotifications(tx, input)),
  ),
  unreadCount: unscoped.customerNotifications.unreadCount.handler(({ input }) =>
    inOrg((tx) => customerUnreadCount(tx, input.source)),
  ),
  markRead: unscoped.customerNotifications.markRead.handler(({ input }) =>
    inOrg((tx) => markCustomerNotificationsRead(tx, input)),
  ),
};
