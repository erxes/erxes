import { Filter, PageSubHeader, useMultiQueryState } from 'erxes-ui';
import {
  Export,
  Import,
  SelectBrands,
} from 'ui-modules';
import { TeamMemberFilterPopover } from './TeamMemberFilterPopover';
import { TeamMemberCounts } from '../TeamMemberCounts';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../../constants/teamMemberCursorSessionKey';
import { useTeamMemberVariables } from '@/settings/team-member/hooks/useTeamMember';

export const TeamMemberFilterBar = () => {
  const [queries] = useMultiQueryState<{
    branchIds: string[];
    departmentIds: string[];
    unitId: string;
    isActive: boolean;
    brandIds: string[];
  }>(['branchIds', 'departmentIds', 'unitId', 'isActive', 'brandIds']);

  const { brandIds } = queries;

  const variables = useTeamMemberVariables();

  const getFilters = () => {
    // IMPORTANT: remove cursor/limit/orderBy so export receives only filters
    const { cursor, limit, orderBy, ...filters } = variables as any;
    return filters;
  };

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

          {!!brandIds?.length && (
            <SelectBrands.FilterBar
              mode="multiple"
              filterKey="brandIds"
              label="Brands"
            />
          )}

          <TeamMemberCounts />
        </Filter.Bar>
      </Filter>
      <Import
        pluginName="core"
        moduleName="user"
        collectionName="user"
      />
      <Export
        pluginName="core"
        moduleName="user"
        collectionName="user"
        getFilters={getFilters}
      />
    </PageSubHeader>
  );
};
