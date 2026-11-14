import { Filter, PageSubHeader } from 'erxes-ui';
import { OptionFilter } from '~/components/OptionFilter';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../constants';
import { TeamMemberCounts } from './TeamMemberCounts';
import { TeamMemberFilterPopover } from './TeamMemberFilterPopover';
import { useRoleFilter } from './useRoleFilter';

export const TeamMemberFilterBar = () => {
  const role = useRoleFilter();

  return (
    <PageSubHeader>
      <Filter id="team-member" sessionKey={TEAM_MEMBER_CURSOR_SESSION_KEY}>
        <Filter.Bar>
          <TeamMemberFilterPopover />

          <Filter.Dialog>
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" />
            </Filter.View>
          </Filter.Dialog>

          <Filter.SearchValueBarItem />

          <OptionFilter.Bar {...role} />

          <TeamMemberCounts />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
