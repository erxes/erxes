import {
  Combobox,
  Command,
  Filter,
  Select,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { IconCheck, IconTag } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SelectTags } from 'ui-modules';
import { PACKAGE_STATUSES } from '../types/Package';

const STATUS_OPTIONS = PACKAGE_STATUSES.map((s) => ({
  label: s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
}));

function StatusFilterView() {
  const [status, setStatus] = useQueryState<string>('status');
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="status">
      <Command className="outline-hidden">
        <Command.List className="p-1">
          {STATUS_OPTIONS.map((option) => (
            <Command.Item
              key={option.value}
              value={option.value}
              onSelect={() => {
                setStatus(option.value);
                resetFilterState();
              }}
            >
              <IconTag />
              {option.label}
              {status === option.value && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
}

function StatusFilterBar() {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [status, setStatus] = useQueryState<string>('status');

  if (!status) return null;

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconTag />
        {t('status', 'Status')}
      </Filter.BarName>
      <Select
        value={status}
        onValueChange={(value) => setStatus(value || null)}
      >
        <Filter.BarButton filterKey="status">
          <Select.Value placeholder={t('select-status', 'Select status')} />
        </Filter.BarButton>
        <Select.Content>
          {STATUS_OPTIONS.map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </Filter.BarItem>
  );
}

function TagsFilterBar() {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const [tags] = useQueryState<string[]>('tags');

  if (!tags?.length) return null;

  return (
    <SelectTags.FilterBar
      mode="multiple"
      filterKey="tags"
      label={t('tags', 'Tags')}
      tagType="core:product"
    />
  );
}

export const PackagesFilter = () => {
  return (
    <Filter id="packages-filter">
      <Filter.Bar>
        <PackagesFilterPopover />
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <StatusFilterBar />
        <TagsFilterBar />
      </Filter.Bar>
    </Filter>
  );
};

export const PackagesFilterPopover = () => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder={t('filter', 'Filter')} variant="secondary" />
              <Command.List className="p-1">
                <Filter.SearchValueTrigger />
                <Filter.Item value="status">
                  <IconTag />
                  {t('status', 'Status')}
                </Filter.Item>
                <SelectTags.FilterItem value="tags" label={t('tags', 'Tags')} />
              </Command.List>
            </Command>
          </Filter.View>
          <StatusFilterView />
          <SelectTags.FilterView
            mode="multiple"
            filterKey="tags"
            tagType="core:product"
          />
        </Combobox.Content>
      </Filter.Popover>
    </>
  );
};
