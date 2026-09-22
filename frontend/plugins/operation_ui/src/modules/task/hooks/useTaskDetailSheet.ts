import { TASK_DETAIL_QUERY_KEY } from '@/task/constants';
import { useQueryState } from 'erxes-ui';

// The URL is the single source of truth for the task detail sheet: it is open
// exactly when `?task_id=` is present. Browser back/forward and copied links
// work for free, with no manual history bookkeeping.
export const useTaskDetailSheet = () =>
  useQueryState<string>(TASK_DETAIL_QUERY_KEY);
