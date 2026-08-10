import { Filter, PageSubHeader, useMultiQueryState } from 'erxes-ui';
import {
  Can,
  Export,
  Import,
  SelectBranches,
  SelectBrands,
  SelectDepartments,
  SelectUnit,
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

  const { brandIds, branchIds, departmentIds } = queries;

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

          {!!branchIds?.length && (
            <SelectBranches.FilterBar
              mode="multiple"
              filterKey="branchIds"
              label="Branches"
            />
          )}

          {!!departmentIds?.length && (
            <SelectDepartments.FilterBar
              mode="multiple"
              filterKey="departmentIds"
              label="Departments"
            />
          )}

          <SelectUnit.FilterBar />

          <TeamMemberCounts />
        </Filter.Bar>
      </Filter>
      <Can action="teamMembersImportManage">
        <Import
          pluginName="core"
          moduleName="organization"
          collectionName="users"
        />
      </Can>
      <Can action="teamMembersExportManage">
        <Export
          pluginName="core"
          moduleName="organization"
          collectionName="users"
          getFilters={getFilters}
        />
      </Can>
    </PageSubHeader>
  );
};
