import { IconMailCheck, IconShieldHalf } from '@tabler/icons-react';
import { Combobox, Command, Filter, Skeleton, useMultiQueryState } from 'erxes-ui';
import { OptionFilter, type OptionFilterProps } from '~/components/OptionFilter';
import { ROLE_LABEL, STATUS_LABEL, TEAM_MEMBERS_SESSION_KEY, useTeamMembers } from './useTeamMembers';

const STATUS: OptionFilterProps = {
  filterKey: 'status',
  label: 'Status',
  icon: IconMailCheck,
  options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
};

const ROLE: OptionFilterProps = {
  filterKey: 'role',
  label: 'Role',
  icon: IconShieldHalf,
  options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
};

const TotalCount = () => {
  const { totalCount } = useTeamMembers();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount === undefined ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        `${totalCount} records found`
      )}
    </div>
  );
};

export const TeamMembersFilter = () => {
  const [queries] = useMultiQueryState<{ searchValue: string; status: string; role: string }>([
    'searchValue',
    'status',
    'role',
  ]);
  const filtered = Object.values(queries ?? {}).some((value) => value !== null);

  return (
    <Filter id="core-team-members-filter" sessionKey={TEAM_MEMBERS_SESSION_KEY}>
      <Filter.Bar>
        <Filter.Popover scope="core-team-members-page">
          <Filter.Trigger isFiltered={filtered} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput placeholder="Filter" variant="secondary" className="bg-background" />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                  <OptionFilter.Item {...STATUS} />
                  <OptionFilter.Item {...ROLE} />
                </Command.List>
              </Command>
            </Filter.View>
            <OptionFilter.View {...STATUS} />
            <OptionFilter.View {...ROLE} />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <OptionFilter.Bar {...STATUS} />
        <OptionFilter.Bar {...ROLE} />
        <TotalCount />
      </Filter.Bar>
    </Filter>
  );
};
