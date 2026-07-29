import { atomWithStorage } from 'jotai/utils';

export const pinnedNavigationActivityIdsState = atomWithStorage<
  string[] | null
>('navigation:pinned-activity-ids', null, undefined, {
  getOnInit: true,
});
