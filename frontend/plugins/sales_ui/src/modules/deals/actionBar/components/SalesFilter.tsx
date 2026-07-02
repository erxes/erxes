import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import {
  IconCalendarBolt,
  IconCalendarClock,
  IconCalendarPlus,
  IconCalendarX,
} from '@tabler/icons-react';
import {
  SelectBranches,
  SelectCompany,
  SelectCustomer,
  SelectDepartments,
  SelectMember,
  SelectProduct,
} from 'ui-modules';

import { DealsTotalCount } from '@/deals/components/DealsTotalCount';
import { IDeal } from '@/deals/types/deals';
import { SalesFilterState } from '@/deals/actionBar/types/actionBarTypes';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { SelectPriority } from '@/deals/components/common/filters/SelectPriority';
import { useTranslation } from 'react-i18next';

export const SalesFilter = () => {
  const [queries] = useMultiQueryState<SalesFilterState>([
    'companyIds',
    'productId',
    'userIds',
    'branchIds',
    'departmentIds',
    'customerIds',
    'assignedUserIds',
    'createdStartDate',
    'createdEndDate',
    'startDateStartDate',
    'startDateEndDate',
    'closeDateStartDate',
    'closeDateEndDate',
    'stageChangedStartDate',
    'stageChangedEndDate',
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
        <div className="flex flex-wrap items-center gap-2">
          <Filter.Popover scope={'sales-page'}>
            <Filter.Trigger isFiltered={hasFilters} />
            <Combobox.Content>
              <SalesFilterView />
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.View filterKey="createdStartDate" inDialog>
              <Filter.DialogDateView
                filterKey="createdStartDate"
                label="Date created"
              />
            </Filter.View>
            <Filter.View filterKey="startDateStartDate" inDialog>
              <Filter.DialogDateView
                filterKey="startDateStartDate"
                label="Start date"
              />
            </Filter.View>
            <Filter.View filterKey="closeDateStartDate" inDialog>
              <Filter.DialogDateView
                filterKey="closeDateStartDate"
                label="Close date"
              />
            </Filter.View>
            <Filter.View filterKey="stageChangedStartDate" inDialog>
              <Filter.DialogDateView
                filterKey="stageChangedStartDate"
                label="Stage changed date"
              />
            </Filter.View>
          </Filter.Dialog>
        </div>
        <SalesFilterBar queries={queries} />
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
  const { t } = useTranslation('sales');
  const {
    assignedUserIds,
    branchIds,
    departmentIds,
    companyIds,
    customerIds,
    userIds,
    priority,
    labelIds,
    productId,
  } = queries || {};

  return (
    <>
      <Filter.BarItem queryKey="createdStartDate">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('date-created')}
        </Filter.BarName>
        <Filter.Date filterKey="createdStartDate" label="Date created" />
      </Filter.BarItem>
      <Filter.BarItem queryKey="startDateStartDate">
        <Filter.BarName>
          <IconCalendarBolt />
          {t('start-date')}
        </Filter.BarName>
        <Filter.Date filterKey="startDateStartDate" label="Start date" />
      </Filter.BarItem>
      <Filter.BarItem queryKey="closeDateStartDate">
        <Filter.BarName>
          <IconCalendarX />
          Close date
        </Filter.BarName>
        <Filter.Date filterKey="closeDateStartDate" label="Close date" />
      </Filter.BarItem>
      <Filter.BarItem queryKey="stageChangedStartDate">
        <Filter.BarName>
          <IconCalendarClock />
          Stage changed
        </Filter.BarName>
        <Filter.Date
          filterKey="stageChangedStartDate"
          label="Stage changed date"
        />
      </Filter.BarItem>
      {companyIds && (
        <SelectCompany.FilterBar
          mode="multiple"
          filterKey="companyIds"
          label={t('by-company')}
        />
      )}
      {customerIds && (
        <SelectCustomer.FilterBar
          mode="multiple"
          filterKey="customerIds"
          label={t('by-customer')}
        />
      )}
      {assignedUserIds && (
        <SelectMember.FilterBar
          mode="multiple"
          queryKey="assignedUserIds"
          label={t('by-user')}
        />
      )}
      {userIds && (
        <SelectMember.FilterBar
          mode="multiple"
          queryKey="userIds"
          label={t('by-user')}
        />
      )}
      {branchIds && (
        <SelectBranches.FilterBar
          mode="multiple"
          filterKey="branchIds"
          label={t('by-branch')}
        />
      )}
      {departmentIds && (
        <SelectDepartments.FilterBar
          mode="multiple"
          filterKey="departmentIds"
          label={t('by-department')}
        />
      )}
      {priority && <SelectPriority.FilterBar />}
      {labelIds && (
        <SelectLabels.FilterBar
          filterKey="labelIds"
          mode="multiple"
          label={t('by-label')}
        />
      )}
      {productId && (
        <SelectProduct.FilterBar
          filterKey="productId"
          mode="multiple"
          label={t('by-product')}
        />
      )}
    </>
  );
};

const SalesFilterView = () => {
  const { t } = useTranslation('sales');
  return (
    <>
      <Filter.View>
        <Command>
          <Command.List className="p-1">
            <SelectCompany.FilterItem
              value="companyIds"
              label={t('by-company')}
            />
            <SelectCustomer.FilterItem
              value="customerIds"
              label={t('by-customer')}
            />
            <Command.Separator className="my-1" />
            <SelectMember.FilterItem
              value="assignedUserIds"
              label={t('by-assigned-user')}
            />
            <SelectMember.FilterItem
              value="userIds"
              label={t('created-by-user')}
            />
            <Command.Separator className="my-1" />
            <SelectBranches.FilterItem
              value="branchIds"
              label={t('by-branch')}
            />
            <SelectDepartments.FilterItem
              value="departmentIds"
              label={t('by-department')}
            />
            <SelectProduct.FilterItem
              value="productId"
              label={t('by-product')}
            />
            <SelectPriority.FilterItem
              value="priority"
              label={t('by-priority')}
            />
            <SelectLabels.FilterItem value="labelIds" label={t('by-label')} />
            <Command.Separator className="my-1" />
            <Filter.Item value="createdStartDate">
              <IconCalendarPlus />
              {t('date-created')}
            </Filter.Item>
            <Filter.Item value="startDateStartDate">
              <IconCalendarBolt />
              {t('start-date')}
            </Filter.Item>
            <Filter.Item value="closeDateStartDate">
              <IconCalendarX />
              Close date
            </Filter.Item>
            <Filter.Item value="stageChangedStartDate">
              <IconCalendarClock />
              Stage changed
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
      <SelectProduct.FilterView filterKey="productId" mode="multiple" />
      <SelectPriority.FilterView />
      <SelectLabels.FilterView filterKey="labelIds" mode="multiple" />
      <Filter.View filterKey="createdStartDate">
        <Filter.DateView filterKey="createdStartDate" label="Date created" />
      </Filter.View>
      <Filter.View filterKey="startDateStartDate">
        <Filter.DateView filterKey="startDateStartDate" label="Start date" />
      </Filter.View>
      <Filter.View filterKey="closeDateStartDate">
        <Filter.DateView filterKey="closeDateStartDate" label="Close date" />
      </Filter.View>
      <Filter.View filterKey="stageChangedStartDate">
        <Filter.DateView
          filterKey="stageChangedStartDate"
          label="Stage changed date"
        />
      </Filter.View>
    </>
  );
};
