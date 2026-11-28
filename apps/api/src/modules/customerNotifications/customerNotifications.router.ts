import { requestOrgId, withOrg } from '@erxes/core-db';
import { unscoped } from '~/orpc';
import {
  customerUnreadCount,
  listCustomerNotifications,
  markCustomerNotificationsRead,
  notifyCustomers,
} from './customerNotifications.service';

/** Customer procedures open their own short transaction (`unscoped`, see AGENTS.md). */
const inOrg = <T>(run: Parameters<typeof withOrg<T>>[1]) => withOrg(requestOrgId(), run);

export const customerNotificationsRouter = {
  create: unscoped.customerNotifications.create.handler(({ input }) =>
    inOrg((tx) => notifyCustomers(tx, input)),
  ),
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
