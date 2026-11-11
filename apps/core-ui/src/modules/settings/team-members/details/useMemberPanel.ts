import { useSearchParams } from 'react-router-dom';
import { MEMBER_PANEL_QUERY_KEY } from '../constants';

/** The member open beside the list (`?user_id=`), and the tab it shows (`?tab=`). */
export const useMemberPanel = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const close = () =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      next.delete(MEMBER_PANEL_QUERY_KEY);
      next.delete('tab');
      return next;
    });

  return { memberId: searchParams.get(MEMBER_PANEL_QUERY_KEY), close };
};

/** Opens a member in the side panel on its overview (old more-menu "Edit"). */
export const useOpenMemberPanel = () => {
  const [, setSearchParams] = useSearchParams();

  return (id: string) =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      next.set(MEMBER_PANEL_QUERY_KEY, id);
      next.set('tab', 'overview');
      return next;
    });
};
