import { Filter, useMultiQueryState } from 'erxes-ui';
import { SelectBrand, SelectMember } from 'ui-modules';
import { IconCalendar } from '@tabler/icons-react';
import {
  CHECK_ORDER_FILTER_KEYS,
  ICheckOrderFilterField,
  ICheckOrderFilterValues,
  PRIMARY_FILTER_FIELDS,
} from './MSDynamicCheckOrderFilterFields';
import { MSDynamicCheckOrderFilterPopover } from './MSDynamicCheckOrderFilterPopover';
import { MSDynamicCheckOrderTotalCount } from './MSDynamicCheckOrderTotalCount';

interface IMSDynamicCheckOrderTextFilterBarItemProps {
  field: ICheckOrderFilterField;
  value?: string | number;
}

const MSDynamicCheckOrderDateFilterBarItem = () => {
  return (
    <>
      <Filter.BarItem queryKey="paidDateRange">
        <Filter.BarName>
          <IconCalendar />
          Paid Date Range
        </Filter.BarName>
        <Filter.Date filterKey="paidDateRange" />
      </Filter.BarItem>
      <Filter.BarItem queryKey="createdAtRange">
        <Filter.BarName>
          <IconCalendar />
          Created Date Range
        </Filter.BarName>
        <Filter.Date filterKey="createdAtRange" />
      </Filter.BarItem>
    </>
  );
};

export const MSDynamicCheckOrderTextFilterBarItem = ({
  field,
  value,
}: IMSDynamicCheckOrderTextFilterBarItemProps) => {
  const { Icon, key, label } = field;

  return (
    <Filter.BarItem queryKey={key}>
      <Filter.BarName>
        <Icon />
        {label}
      </Filter.BarName>
      <Filter.BarButton filterKey={key} inDialog>
        {value}
      </Filter.BarButton>
    </Filter.BarItem>
  );
};

export const MSDynamicCheckOrderFilterBar = () => {
  const [filterValues] = useMultiQueryState<ICheckOrderFilterValues>(
    CHECK_ORDER_FILTER_KEYS,
  );
  return (
    <Filter.Bar>
      <MSDynamicCheckOrderFilterPopover />
      <SelectBrand.FilterBar queryKey="brandId" />
      <SelectMember.FilterBar queryKey="user" />
      {PRIMARY_FILTER_FIELDS.filter((f) => f.key === 'number').map((field) => (
        <MSDynamicCheckOrderTextFilterBarItem
          key={field.key}
          field={field}
          value={filterValues[field.key] ?? undefined}
        />
      ))}
      <MSDynamicCheckOrderDateFilterBarItem />
      <MSDynamicCheckOrderTotalCount />
    </Filter.Bar>
  );
};
