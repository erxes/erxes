import { messagingQueries } from '@/messaging/graphql';
import { messagingAdminQueries } from '@/messaging/admin';

export const queries = {
  ...messagingQueries,
  ...messagingAdminQueries,
};
