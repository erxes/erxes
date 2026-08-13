import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { useMediaQuery } from 'erxes-ui';
import { useAtomValue } from 'jotai';

const SPLIT_VIEW_QUERY = '(min-width: 1120px)';

export const useCanSplitInbox = (): boolean => useMediaQuery(SPLIT_VIEW_QUERY);

// The layout on screen; below the threshold it ignores the stored preference.
export const useInboxLayout = (): 'list' | 'split' => {
  const inboxLayout = useAtomValue(inboxLayoutState);
  const canSplit = useCanSplitInbox();

  return canSplit ? inboxLayout : 'list';
};
