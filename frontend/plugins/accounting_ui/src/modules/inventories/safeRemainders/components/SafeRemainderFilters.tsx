import {
  IconCalendar,
  IconSearch,
  IconToggleRightFilled,
} from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectBranches, SelectDepartments, SelectMember } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useSafeRemainderQueryParams } from '../hooks/useSafeRemainders';

const SafeRemainderFilterPopover = () => {
  const { t } = useTranslation('accounting');
  const queryParams = useSafeRemainderQueryParams();
  const hasFilters = Object.values(queryParams || {}).some(
    (value) => value !== null && value !== undefined && value !== '',
  );

  return (
    <>
      <Filter.Popover scope="accounts-filter">
        <Filter.Trigger isFiltered={hasFilters} />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput
                placeholder={t('filter')}
                variant="secondary"
                className="bg-background"
              />
              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
                <Filter.Item value="date" inDialog>
                  <IconCalendar />
                  {t('date')}
                </Filter.Item>
                <SelectBranches.FilterItem value="branchId" label="Салбар" />
                <SelectDepartments.FilterItem
                  value="departmentId"
                  label="Хэлтэс"
                />
                <Filter.Item value="statuses" disabled={true}>
                  <IconToggleRightFilled />
                  {t('statuses')}
                </Filter.Item>

                <Command.Separator className="my-1" />
                <SelectMember.FilterItem
                  value="createdUserId"
                  label="Үүсгэсэн"
                />
                <SelectMember.FilterItem
                  value="modifiedUserId"
                  label="Өөрчилсөн"
                />
                <Filter.Item value="updatedDate" inDialog>
                  <IconCalendar />
                  {t('updated-date')}
                </Filter.Item>
                <Filter.Item value="createdDate" inDialog>
                  <IconCalendar />
                  {t('created-date')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <Filter.View filterKey="date">
            <Filter.DateView filterKey="date" />
          </Filter.View>
          <SelectBranches.FilterView mode="single" filterKey="branchId" />
          <SelectDepartments.FilterView
            mode="single"
            filterKey="departmentId"
          />

          <SelectMember.FilterView mode="single" queryKey="createdUserId" />
          <SelectMember.FilterView mode="single" queryKey="modifiedUserId" />
          <Filter.View filterKey="updatedDate">
            <Filter.DateView filterKey="updatedDate" />
          </Filter.View>
          <Filter.View filterKey="createdDate">
            <Filter.DateView filterKey="createdDate" />
          </Filter.View>
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="date" inDialog>
          <Filter.DialogDateView filterKey="date" />
        </Filter.View>
        <Filter.View filterKey="updatedDate" inDialog>
          <Filter.DialogDateView filterKey="updatedDate" />
        </Filter.View>
        <Filter.View filterKey="createdDate" inDialog>
          <Filter.DialogDateView filterKey="createdDate" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const SafeRemainderFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  const [queries] = useMultiQueryState<{
    number: string;
    searchValue: string;
    accountSearchValue: string;
  }>(['number', 'searchValue', 'accountSearchValue']);

  const { searchValue } = queries;

  return (
    <Filter id="accounts-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            {t('search')}
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar />
            {t('date')}
          </Filter.BarName>
          <Filter.Date filterKey="date" />
        </Filter.BarItem>
        <SelectBranches.FilterBar
          label="Салбар"
          filterKey="branchId"
          mode="single"
        />
        <SelectDepartments.FilterBar
          label="Хэлтэс"
          filterKey="departmentId"
          mode="single"
        />

        <SelectMember.FilterBar
          queryKey="createdUserId"
          label="Үүсгэсэн"
          mode="single"
        />
        <SelectMember.FilterBar
          queryKey="modifiedUserId"
          label="Өөрчилсөн"
          mode="single"
        />
        <Filter.BarItem queryKey="createdDate">
          <Filter.BarName>
            <IconCalendar />
            {t('created-date')}
          </Filter.BarName>
          <Filter.Date filterKey="createdDate" />
        </Filter.BarItem>
        <Filter.BarItem queryKey="updatedDate">
          <Filter.BarName>
            <IconCalendar />
            {t('updated-date')}
          </Filter.BarName>
          <Filter.Date filterKey="updatedDate" />
        </Filter.BarItem>

        <SafeRemainderFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
