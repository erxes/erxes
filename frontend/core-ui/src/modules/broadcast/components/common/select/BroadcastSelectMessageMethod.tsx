import {
  BROADCAST_MESSAGE_METHODS,
  BROADCAST_SELECTABLE_METHODS,
} from '@/broadcast/constants';
import { createBroadcastFilterSelect } from './createBroadcastFilterSelect';

export const BroadcastMessageMethod = createBroadcastFilterSelect({
  queryKey: 'methods',
  options: BROADCAST_SELECTABLE_METHODS,
  // A campaign made with a method no longer offered still filters by name.
  labels: BROADCAST_MESSAGE_METHODS,
  placeholderKey: 'filter.method-placeholder',
  emptyKey: 'filter.method-empty',
});
