import { Filter, PageSubHeader, useMultiQueryState } from 'erxes-ui';
import {
  Can,
  Export,
  Import,
  SelectBrands,
  SelectStructureEntities,
} from 'ui-modules';
import { TeamMemberFilterPopover } from './TeamMemberFilterPopover';
import { TeamMemberCounts } from '../TeamMemberCounts';
import { TEAM_MEMBER_CURSOR_SESSION_KEY } from '../../constants/teamMemberCursorSessionKey';
import { useTeamMemberFilters } from '@/settings/team-member/hooks/useTeamMemberFilters';
import { useTranslation } from 'react-i18next';

export const TeamMemberFilterBar = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [{ brandIds, entityIds }] = useMultiQueryState<{
    brandIds: string[];
    entityIds: string[];
  }>(['brandIds', 'entityIds']);

  const filters = useTeamMemberFilters();

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
              label={t('brands')}
            />
          )}

          {!!entityIds?.length && (
            <SelectStructureEntities.FilterBar
              mode="multiple"
              filterKey="entityIds"
              label={t('structure')}
            />
          )}

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
          getFilters={() => filters}
        />
      </Can>
    </PageSubHeader>
  );
};
