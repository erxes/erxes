import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { IconBuilding, IconUsers } from '@tabler/icons-react';
import { AgentHotKeyScope } from '../types/path/AgentHotKeyScope';
import { AgentTotalCount } from './AgentTotalCount';
import { useAgentLeadSessionKey } from '../hooks/useAgentLeadSessionKey';
import { SelectAgentStatus } from './selects/SelectAgentStatus';
import { SelectCompany } from 'ui-modules/modules/contacts/components/SelectCompany';
import { SelectCustomer } from 'ui-modules';

const AgentFilterPopover = () => {
  const [queries] = useMultiQueryState<{
    agentStatus: string;
    agentCustomerId: string;
    agentCompanyId: string;
  }>(['agentStatus', 'agentCustomerId', 'agentCompanyId']);

  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

  return (
    <>
      <Filter.Popover scope={AgentHotKeyScope.AgentPage}>
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
                <SelectAgentStatus.FilterItem />
                <SelectCustomer.FilterItem value="agentCustomerId" label="Customers" />
                <SelectCompany.FilterItem value="agentCompanyId" label="Companies" />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectAgentStatus.FilterView />
          <SelectCustomer.FilterView filterKey="agentCustomerId" mode="single" />
          <SelectCompany.FilterView filterKey="agentCompanyId" mode="single" />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="agentStatus" inDialog>
          <SelectAgentStatus.FilterView />
        </Filter.View>
        <Filter.View filterKey="agentCustomerId" inDialog>
          <SelectCustomer.FilterView filterKey="agentCustomerId" mode="single" />
        </Filter.View>
        <Filter.View filterKey="agentCompanyId" inDialog>
          <SelectCompany.FilterView filterKey="agentCompanyId" mode="single" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const AgentFilter = () => {
  const { sessionKey } = useAgentLeadSessionKey();

  return (
    <Filter id="agent-filter" sessionKey={sessionKey}>
      <Filter.Bar>
        <SelectAgentStatus.FilterBar />
        <Filter.BarItem queryKey="agentCustomerId">
          <Filter.BarName>
            <IconUsers size={14} />
            Customers
          </Filter.BarName>
          <SelectCustomer.FilterBar
            filterKey="agentCustomerId"
            label="Customers"
            mode="single"
          />
        </Filter.BarItem>
        <Filter.BarItem queryKey="agentCompanyId">
          <Filter.BarName>
            <IconBuilding size={14} />
            Companies
          </Filter.BarName>
          <SelectCompany.FilterBar
            filterKey="agentCompanyId"
            label="Companies"
            mode="single"
          />
        </Filter.BarItem>
        <AgentFilterPopover />
        <AgentTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
