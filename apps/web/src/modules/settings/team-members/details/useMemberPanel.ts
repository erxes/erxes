import { parseAsString, useQueryStates } from 'nuqs';
import { MEMBER_PANEL_QUERY_KEY } from '../constants';

const memberPanelQuery = { [MEMBER_PANEL_QUERY_KEY]: parseAsString, tab: parseAsString };

/** The member open beside the list (`?user_id=`), and the tab it shows (`?tab=`). */
export const useMemberPanel = () => {
  const [query, setQuery] = useQueryStates(memberPanelQuery);

  return {
    memberId: query[MEMBER_PANEL_QUERY_KEY],
    tab: query.tab,
    setTab: (tab: string) => void setQuery({ tab }),
    close: () => void setQuery({ [MEMBER_PANEL_QUERY_KEY]: null, tab: null }),
  };
};

/** Opens a member in the side panel on its overview. */
export const useOpenMemberPanel = () => {
  const [, setQuery] = useQueryStates(memberPanelQuery);

  return (id: string) => void setQuery({ [MEMBER_PANEL_QUERY_KEY]: id, tab: 'overview' });
};
