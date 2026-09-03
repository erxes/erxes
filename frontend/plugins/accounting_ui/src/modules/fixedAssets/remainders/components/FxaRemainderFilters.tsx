import { IconCalendar, IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useQueryState } from 'erxes-ui';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { SelectFixedAsset } from '@/settings/fixed-assets/components/SelectFixedAsset';
import { SelectFixedAssetCategory } from '@/settings/fixed-assets/components/SelectFixedAssetCategory';

const FxaRemainderAssetFilter = () => {
  const [fixedAssetId, setFixedAssetId] = useQueryState<string>('fixedAssetId');

  return (
    <div className="w-64">
      <SelectFixedAsset
        mode="single"
        value={fixedAssetId || ''}
        onValueChange={(value) =>
          setFixedAssetId(
            Array.isArray(value) ? value[0] || null : value || null,
          )
        }
        placeholder="Үндсэн хөрөнгө"
        className="h-8"
      />
    </div>
  );
};

const FxaRemainderCategoryFilter = () => {
  const [categoryId, setCategoryId] = useQueryState<string>('categoryId');

  return (
    <div className="w-56">
      <SelectFixedAssetCategory
        selected={categoryId || undefined}
        onSelect={(value) => setCategoryId(value || null)}
        nullable
        className="h-8"
      />
    </div>
  );
};

const FxaRemainderFilterPopover = () => (
  <Filter.Popover scope="fxa-remainders-filter">
    <Filter.Trigger isFiltered={false} />
    <Combobox.Content>
      <Filter.View>
        <Command>
          <Filter.CommandInput
            placeholder="Шүүлт"
            variant="secondary"
            className="bg-background"
          />
          <Command.List className="p-1">
            <Filter.Item value="searchValue" inDialog>
              <IconSearch />
              Хайлт
            </Filter.Item>
            <Filter.Item value="date" inDialog>
              <IconCalendar />
              Огноо
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>
    </Combobox.Content>
  </Filter.Popover>
);

export const FxaRemainderFilters = () => {
  const [searchValue] = useQueryState<string>('searchValue');

  return (
    <Filter id="fxa-remainders-filter">
      <Filter.Bar>
        <Filter.BarItem queryKey="searchValue">
          <Filter.BarName>
            <IconSearch />
            Хайлт
          </Filter.BarName>
          <Filter.BarButton filterKey="searchValue" inDialog>
            {searchValue}
          </Filter.BarButton>
        </Filter.BarItem>
        <FxaRemainderAssetFilter />
        <FxaRemainderCategoryFilter />
        <SelectBranches.FilterBar
          mode="single"
          filterKey="branchId"
          label="Салбар"
        />
        <SelectDepartments.FilterBar
          mode="single"
          filterKey="departmentId"
          label="Хэлтэс"
        />
        <Filter.BarItem queryKey="date">
          <Filter.BarName>
            <IconCalendar />
            Огноо
          </Filter.BarName>
          <Filter.Date filterKey="date" />
        </Filter.BarItem>
        <FxaRemainderFilterPopover />
      </Filter.Bar>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
        <Filter.View filterKey="date" inDialog>
          <Filter.DialogDateView filterKey="date" />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
