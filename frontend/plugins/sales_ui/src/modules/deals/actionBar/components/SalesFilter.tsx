import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import {
  IconCalendarBolt,
  IconCalendarPlus,
  IconCalendarX,
} from '@tabler/icons-react';
import {
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
} from 'ui-modules';

import { DealsTotalCount } from '@/deals/components/DealsTotalCount';
import { IDeal } from '@/deals/types/deals';
import { SalesFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { SelectPriority } from '@/deals/components/common/filters/SelectPriority';

export const SalesFilter = () => {
  const [queries] = useMultiQueryState<SalesFilterState>([
    'companyIds',
    'userIds',
    'branchIds',
    'departmentIds',
    'customerIds',
    'assignedUserIds',
    'createdStartDate',
    'createdEndDate',
    'startDateStartDate',
    'startDateEndDate',
    'priority',
    'labelIds',
    'tagIds',
    'awaiting',
    'advanced',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <Filter id="sales-filter">
      <Filter.Bar className="overflow-auto styled-scroll">
        <SalesFilterBar queries={queries} />
        <div className="flex flex-wrap items-center gap-2">
          <Filter.Popover scope={'sales-page'}>
            <Filter.Trigger isFiltered={hasFilters} />
            <Combobox.Content>
              <SalesFilterView />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.View filterKey="createdStartDate" inDialog>
              <Filter.DialogDateView filterKey="createdStartDate" />
            </Filter.View>
            <Filter.View filterKey="createdEndDate" inDialog>
              <Filter.DialogDateView filterKey="createdEndDate" />
            </Filter.View>
          </Filter.Dialog>
        </div>
        <DealsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

export const filterDeals = (deals: IDeal[], filters: SalesFilterState) => {
  let result = deals;

  // Filter by labels first for performance
  if (filters.labelIds?.length) {
    result = result.filter((deal) =>
      deal.labelIds?.some((label) => filters.labelIds?.includes(label)),
    );
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((deal) => deal.name.toLowerCase().includes(q));
  }

  if (filters.advanced) {
    Object.entries(filters.advanced).forEach(([key, value]) => {
      result = result.filter((deal) => deal[key as keyof IDeal] === value);
    });
  }

  return result;
};

const SalesFilterBar = ({ queries }: { queries: SalesFilterState }) => {
  const {
    assignedUserIds,
    branchIds,
    departmentIds,
    companyIds,
    customerIds,
    userIds,
    priority,
    labelIds,
  } = queries || {};

  return (
    <>
      <Filter.BarItem queryKey="createdStartDate">
        <Filter.BarName>
          <IconCalendarPlus />
          Date created
        </Filter.BarName>
        <Filter.Date filterKey="createdStartDate" />
      </Filter.BarItem>
      <Filter.BarItem queryKey="startDateStartDate">
        <Filter.BarName>
          <IconCalendarBolt />
          Start date
        </Filter.BarName>
        <Filter.Date filterKey="startDateStartDate" />
      </Filter.BarItem>
      <Filter.BarItem queryKey="startDateEndDate">
        <Filter.BarName>
          <IconCalendarX />
          End date
        </Filter.BarName>
        <Filter.Date filterKey="startDateEndDate" />
      </Filter.BarItem>
      {companyIds && (
        <SelectCompany.FilterBar
          mode="multiple"
          filterKey="companyIds"
          label="By Company"
        />
      )}
      {customerIds && (
        <SelectCustomer.FilterBar
          mode="multiple"
          filterKey="customerIds"
          label="By Customer"
        />
      )}
      {assignedUserIds && (
        <SelectMember.FilterBar
          mode="multiple"
          queryKey="assignedUserIds"
          label="By User"
        />
      )}
      {userIds && (
        <SelectMember.FilterBar
          mode="multiple"
          queryKey="userIds"
          label="By User"
        />
      )}
      {branchIds && (
        <SelectBranches.FilterBar
          mode="multiple"
          filterKey="branchIds"
          label="By Branch"
        />
      )}
      {departmentIds && (
        <SelectDepartments.FilterBar
          mode="multiple"
          filterKey="departmentIds"
          label="By Department"
        />
      )}
      {priority && <SelectPriority.FilterBar />}
      {labelIds && (
        <SelectLabels.FilterBar
          filterKey="labelIds"
          mode="multiple"
          label="By Label"
        />
      )}
    </>
  );
};

const SalesFilterView = () => {
  return (
    <>
      <Filter.View>
        <Command>
          <Command.List className="p-1">
            <SelectCompany.FilterItem value="companyIds" label="By Company" />
            <SelectCustomer.FilterItem
              value="customerIds"
              label="By Customer"
            />
            <Command.Separator className="my-1" />
            <SelectMember.FilterItem
              value="assignedUserIds"
              label="By Assigned user"
            />
            <SelectMember.FilterItem value="userIds" label="Created By" />
            <Command.Separator className="my-1" />
            <SelectBranches.FilterItem value="branchIds" label="By Branch" />
            <SelectDepartments.FilterItem
              value="departmentIds"
              label="By Department"
            />
            <SelectPriority.FilterItem value="priority" label="By Priority" />
            <SelectLabels.FilterItem value="labelIds" label="By Label" />
            <Command.Separator className="my-1" />
            <Filter.Item value="createdStartDate">
              <IconCalendarPlus />
              Date created
            </Filter.Item>
            <Filter.Item value="startDateStartDate">
              <IconCalendarBolt />
              Start date
            </Filter.Item>
            <Filter.Item value="startDateEndDate">
              <IconCalendarX />
              End date
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>
      <SelectMember.FilterView mode="multiple" queryKey="assignedUserIds" />
      <SelectMember.FilterView mode="multiple" queryKey="userIds" />
      <SelectCompany.FilterView mode="multiple" filterKey="companyIds" />
      <SelectCustomer.FilterView mode="multiple" filterKey="customerIds" />
      <SelectBranches.FilterView mode="multiple" filterKey="branchIds" />
      <SelectDepartments.FilterView mode="multiple" filterKey="departmentIds" />
      <SelectPriority.FilterView />
      <SelectLabels.FilterView filterKey="labelIds" mode="multiple" />
      <Filter.View filterKey="createdStartDate">
        <Filter.DateView filterKey="createdStartDate" />
      </Filter.View>
      <Filter.View filterKey="startDateStartDate">
        <Filter.DateView filterKey="startDateStartDate" />
      </Filter.View>
      <Filter.View filterKey="startDateEndDate">
        <Filter.DateView filterKey="startDateEndDate" />
      </Filter.View>
    </>
  );
};
