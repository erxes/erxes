import {
  IconAlertSquareRounded,
  IconProgressCheck,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';

import { ProjectHotKeyScope } from '@/project/constants/ProjectHotKeyScope';
import { ProjectsTotalCount } from '@/project/components/ProjectsTotalCount';
import { SelectLead } from '@/project/components/select/SelectLead';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { useParams } from 'react-router-dom';
import { PROJECTS_CURSOR_SESSION_KEY } from '@/project/constants/ProjectSessionKey';
import { SelectTeam } from '@/team/components/SelectTeam';
import { SelectPriority } from '@/operation/components/SelectPriority';

const ProjectsFilterPopover = () => {
  const { teamId } = useParams();

  const [queries] = useMultiQueryState<{
    name: string;
    lead: string;
    team: string[];
    priority: string;
    status: string;
  }>(['name', 'lead', 'team', 'priority', 'status']);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <>
      <Filter.Popover scope={ProjectHotKeyScope.ProjectsPage}>
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder="Filter"
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="name" inDialog>
                  <IconSearch />
                  Search
                </Filter.Item>
                <Command.Separator className="my-1" />
                <SelectLead.FilterItem />
                {!teamId && (
                  <Filter.Item value="team">
                    <IconUsers />
                    Team
                  </Filter.Item>
                )}
                <Filter.Item value="priority">
                  <IconAlertSquareRounded />
                  Priority
                </Filter.Item>
                <Filter.Item value="status">
                  <IconProgressCheck />
                  Status
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <SelectLead.FilterView />
          {!teamId && <SelectTeam.FilterView />}
          <SelectPriority.FilterView />
          <SelectStatus.FilterView />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="name" inDialog>
          <Filter.DialogStringView filterKey="name" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const ProjectsFilter = () => {
  const { teamId } = useParams();

  const [queries] = useMultiQueryState<{
    name: string;
    lead: string;
    team: string[];
    priority: string;
    status: string;
  }>(['name', 'lead', 'team', 'priority', 'status']);
  const { name } = queries || {};

  return (
    <Filter id="Projects-filter" sessionKey={PROJECTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        {name && (
          <Filter.BarItem queryKey="name">
            <Filter.BarName>
              <IconSearch />
              Search
            </Filter.BarName>
            <Filter.BarButton filterKey="name" inDialog>
              {name}
            </Filter.BarButton>
          </Filter.BarItem>
        )}
        <SelectLead.FilterBar />
        {!teamId && (
          <Filter.BarItem queryKey="team">
            <Filter.BarName>
              <IconUsers />
              Team
            </Filter.BarName>
            <SelectTeam.FilterBar />
          </Filter.BarItem>
        )}
        <Filter.BarItem queryKey="priority">
          <Filter.BarName>
            <IconAlertSquareRounded />
            Priority
          </Filter.BarName>
          <SelectPriority.FilterBar />
        </Filter.BarItem>
        <Filter.BarItem queryKey="status">
          <Filter.BarName>
            <IconProgressCheck />
            Status
          </Filter.BarName>
          <SelectStatus.FilterBar />
        </Filter.BarItem>
        <ProjectsFilterPopover />
        <ProjectsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
