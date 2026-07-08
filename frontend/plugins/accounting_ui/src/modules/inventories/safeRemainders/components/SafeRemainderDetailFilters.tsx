import {
  IconSearch,
  IconToggleRightFilled,
  IconTypeface,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectCategory } from 'ui-modules';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Шинэ' },
  { value: 'checked', label: 'Шалгасан' },
];

const DIFF_OPTIONS = [
  { value: 'gt', label: 'Илүү' },
  { value: 'lt', label: 'Дутуу' },
  { value: 'eq', label: 'Тэнцүү' },
];

const labelOf = (
  options: { value: string; label: string }[],
  value?: string | null,
) => options.find((o) => o.value === value)?.label ?? value ?? '';

const EnumFilterView = ({
  filterKey,
  options,
  placeholder,
}: {
  filterKey: string;
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  const [value, setValue] = useQueryState<string>(filterKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={filterKey}>
      <Command>
        <Command.Input placeholder={placeholder} focusOnMount />
        <Command.List>
          {options.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                setValue(value === option.value ? null : option.value);
                resetFilterState();
              }}
            >
              {option.label}
              <Combobox.Check checked={value === option.value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

const EnumFilterBar = ({
  filterKey,
  label,
  icon,
  options,
}: {
  filterKey: string;
  label: string;
  icon: React.ReactNode;
  options: { value: string; label: string }[];
}) => {
  const [value, setValue] = useQueryState<string>(filterKey);
  const [open, setOpen] = useState(false);

  if (!value) return null;

  return (
    <Filter.BarItem queryKey={filterKey}>
      <Filter.BarName>
        {icon}
        {label}
      </Filter.BarName>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={filterKey}>
            {labelOf(options, value)}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <Command>
            <Command.List>
              {options.map((option) => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    setValue(value === option.value ? null : option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Combobox.Check checked={value === option.value} />
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const SafeRemainderDetailFilterPopover = () => {
  const { t } = useTranslation('accounting');
  const [queryParams] = useMultiQueryState<Record<string, any>>([
    'searchValue',
    'status',
    'diffType',
    'category',
  ]);
  const hasFilters = Object.values(queryParams || {}).some(
    (value) => value !== null && value !== undefined && value !== '',
  );

  return (
    <>
      <Filter.Popover scope="safe-rem-detail-filter">
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
                <Filter.Item value="diffType">
                  <IconTypeface />
                  {t('diff-type-label')}
                </Filter.Item>
                <SelectCategory.FilterItem
                  value="category"
                  label={t('category')}
                />
                <Filter.Item value="status">
                  <IconToggleRightFilled />
                  {t('status')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
          <EnumFilterView
            filterKey="diffType"
            options={DIFF_OPTIONS}
            placeholder={t('diff-type-label')}
          />
          <EnumFilterView
            filterKey="status"
            options={STATUS_OPTIONS}
            placeholder={t('status')}
          />
          <SelectCategory.FilterView filterKey="category" mode="multiple" />
        </Combobox.Content>
      </Filter.Popover>
      <Filter.Dialog>
        <Filter.View filterKey="searchValue" inDialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.View>
      </Filter.Dialog>
    </>
  );
};

export const SafeRemainderDetailFilter = ({
  afterBar,
}: {
  afterBar?: React.ReactNode;
}) => {
  const { t } = useTranslation('accounting');
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);

  const { searchValue } = queries;

  return (
    <Filter id="safe-rem-detail-filter">
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
        <EnumFilterBar
          filterKey="diffType"
          label={t('diff-type-label')}
          icon={<IconTypeface />}
          options={DIFF_OPTIONS}
        />
        <SelectCategory.FilterBar
          filterKey="category"
          label={t('category')}
          mode="multiple"
        />
        <EnumFilterBar
          filterKey="status"
          label={t('status')}
          icon={<IconToggleRightFilled />}
          options={STATUS_OPTIONS}
        />
        <SafeRemainderDetailFilterPopover />
        {afterBar && <>{afterBar}</>}
      </Filter.Bar>
    </Filter>
  );
};
