import { BROADCAST_MESSAGE_STATUS } from '@/broadcast/constants';
import { createBroadcastFilterSelect } from './createBroadcastFilterSelect';

export const BroadcastMessageStatus = createBroadcastFilterSelect({
  queryKey: 'status',
  options: BROADCAST_MESSAGE_STATUS,
  placeholderKey: 'filter.status-placeholder',
  emptyKey: 'filter.status-empty',
});
