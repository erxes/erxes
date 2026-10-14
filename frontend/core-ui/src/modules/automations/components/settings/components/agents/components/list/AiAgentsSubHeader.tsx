import { AiAgentProviderFilter } from '@/automations/components/settings/components/agents/components/list/AiAgentProviderFilter';
import { getAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { useAiAgentsList } from '@/automations/components/settings/components/agents/hooks/useAiAgentsList';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { IconPlug, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  Popover,
  Skeleton,
} from 'erxes-ui';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

const AiAgentsTotalCount = () => {
  const { totalCount, loading } = useAiAgentsList();

  if (loading) {
    return <Skeleton className="mt-1.5 inline-block h-4 w-20" />;
  }

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {totalCount} records found
    </div>
  );
};

export const AiAgentsSubHeader = () => {
  const { kind } = useAiAgentsList();
  const createUrl = `${AutomationSettingsPath.AgentCreate}${
    kind ? `?kind=${kind}` : ''
  }`;

  return (
    <Filter id="automation-ai-agents">
      <PageSubHeader className="items-center">
        <Filter.Bar>
          <Filter.Popover scope="automation-ai-agents-page">
            <Filter.Trigger isFiltered={!!kind} />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder="Filter"
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.Item value="kind">
                      <IconPlug />
                      Provider
                    </Filter.Item>
                    <Filter.SearchValueTrigger />
                  </Command.List>
                </Command>
              </Filter.View>
              <Filter.View filterKey="kind">
                <AiAgentProviderFilter />
              </Filter.View>
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" />
            </Filter.View>
            <Filter.View filterKey="kind" inDialog>
              <AiAgentProviderFilter />
            </Filter.View>
          </Filter.Dialog>

          <Filter.BarItem queryKey="kind">
            <Filter.BarName>
              <IconPlug />
              Provider
            </Filter.BarName>
            <Popover>
              <Popover.Trigger>
                <Filter.BarButton>
                  {kind ? getAiAgentKind(kind).label : 'Set value'}
                </Filter.BarButton>
              </Popover.Trigger>
              <Combobox.Content>
                <AiAgentProviderFilter />
              </Combobox.Content>
            </Popover>
          </Filter.BarItem>
          <Filter.SearchValueBarItem />
          <AiAgentsTotalCount />
        </Filter.Bar>

        <Can action="automationsAiAgentAdd">
          <Button asChild className="ml-auto shrink-0">
            <Link to={createUrl}>
              <IconPlus />
              Create agent
            </Link>
          </Button>
        </Can>
      </PageSubHeader>
    </Filter>
  );
};
