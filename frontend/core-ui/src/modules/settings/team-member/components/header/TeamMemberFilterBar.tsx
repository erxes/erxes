import { Filter, PageSubHeader, useMultiQueryState } from 'erxes-ui';
import {
  SelectBranches,
  SelectBrands,
  SelectDepartments,
  SelectUnit,
} from 'ui-modules';
import { TeamMemberFilterPopover } from './TeamMemberFilterPopover';
import { TeamMemberCounts } from '../TeamMemberCounts';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../../constants/teamMemberCursorSessionKey';

export const TeamMemberFilterBar = () => {
  const [queries] = useMultiQueryState<{
    branchIds: string[];
    departmentIds: string[];
    unitId: string;
    isActive: boolean;
    brandIds: string[];
  }>(['branchIds', 'departmentIds', 'unitId', 'isActive', 'brandIds']);

  const isFiltered = Object.values(queries).some((query) => !!query);

  const { branchIds, departmentIds, unitId, brandIds } = queries;

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
          {!!brandIds && (
            <SelectBrands.FilterBar
              mode="multiple"
              filterKey="brandIds"
              label="Brands"
            />
          )}
          <TeamMemberCounts />
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};
