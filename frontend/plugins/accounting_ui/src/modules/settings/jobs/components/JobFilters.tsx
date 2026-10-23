import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconCircleCheck,
  IconClock,
  IconCoin,
  IconCopy,
  IconSearch,
} from '@tabler/icons-react';
import {
  Combobox,
  Button,
  Command,
  Dialog,
  Filter,
  Input,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { SelectProduct } from 'ui-modules';
import { useJobFilters } from '../hooks/useJobFilters';
import { JOB_DURATION_TYPES } from '../types/jobFormSchema';

const textFilters = [
  { key: 'searchValue', label: 'search' },
  { key: 'laborCostName', label: 'job-labor-name' },
  { key: 'overheadCostName', label: 'job-overhead-name' },
] as const;

const optionFilters = [
  {
    key: 'duplicatedOutput',
    Icon: IconCopy,
    label: 'job-duplicated-output',
    options: [
      { value: 'true', label: 'yes' },
      { value: 'false', label: 'no' },
    ],
  },
  {
    key: 'durationType',
    Icon: IconClock,
    label: 'job-duration-type',
    options: JOB_DURATION_TYPES.map((value) => ({
      value,
      label: `job-duration-${value}`,
    })),
  },
  {
    key: 'hasLabor',
    Icon: IconCoin,
    label: 'job-has-labor',
    options: [
      { value: 'true', label: 'yes' },
      { value: 'false', label: 'no' },
    ],
  },
  {
    key: 'hasOverhead',
    Icon: IconCoin,
    label: 'job-has-overhead',
    options: [
      { value: 'true', label: 'yes' },
      { value: 'false', label: 'no' },
    ],
  },
  {
    key: 'status',
    Icon: IconCircleCheck,
    label: 'status',
    options: [
      { value: 'active', label: 'active' },
      { value: 'inactive', label: 'inactive' },
    ],
  },
] as const;

const JobTextFilter = ({
  filterKey,
  label,
}: {
  filterKey: string;
  label: string;
}) => {
  const { t } = useTranslation('accounting');
  const [query, setQuery] = useQueryState<string>(filterKey);
  const [value, setValue] = useState(query ?? '');
  const { resetFilterState } = useFilterContext();
  return (
    <Dialog.Content>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(value.trim() || null);
          resetFilterState();
        }}
      >
        <Dialog.Header>
          <Dialog.Title>{t('filter-by', { label: t(label) })}</Dialog.Title>
        </Dialog.Header>
        <Input
          aria-label={t(label)}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
        <Dialog.Footer>
          <Button type="button" variant="secondary" onClick={resetFilterState}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('apply')}</Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
};

const JobOptionFilter = ({
  filterKey,
  label,
  options,
}: {
  filterKey: string;
  label: string;
  options: readonly { value: string; label: string }[];
}) => {
  const { t } = useTranslation('accounting');
  const [selected, setSelected] = useQueryState<string | boolean>(filterKey);
  const { resetFilterState } = useFilterContext();
  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{t('filter-by', { label: t(label) })}</Dialog.Title>
      </Dialog.Header>
      <Command>
        <Command.Input placeholder={t(label)} focusOnMount />
        <Command.List>
          {options.map(({ value, label: optionLabel }) => (
            <Command.Item
              key={value}
              value={t(optionLabel)}
              onSelect={() => {
                setSelected(value === String(selected) ? null : value);
                resetFilterState();
              }}
            >
              {t(optionLabel)}
              <Combobox.Check checked={String(selected) === value} />
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Dialog.Content>
  );
};

export const JobFilters = ({
  unwindOutputs = false,
}: {
  unwindOutputs?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const filters = useJobFilters(unwindOutputs);
  const availableOptionFilters = optionFilters.filter(
    ({ key }) => unwindOutputs || key !== 'duplicatedOutput',
  );
  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );
  return (
    <Filter id="job-filters">
      <Filter.Bar>
        {textFilters.map(({ key, label }) => (
          <Filter.BarItem key={key} queryKey={key}>
            <Filter.BarName>
              <IconSearch />
              {t(label)}
            </Filter.BarName>
            <Filter.BarButton filterKey={key} inDialog>
              {filters[key]}
            </Filter.BarButton>
          </Filter.BarItem>
        ))}
        <SelectProduct.FilterBar
          filterKey="inputProductId"
          label={t('job-input-products')}
          mode="single"
        />
        <SelectProduct.FilterBar
          filterKey="outputProductId"
          label={t('job-output-products')}
          mode="single"
        />
        {availableOptionFilters
          .filter(({ key }) => filters[key] !== undefined)
          .map(({ key, label, options, Icon }) => (
            <div
              key={key}
              className="flex h-7 items-stretch gap-px rounded bg-muted text-sm font-medium shadow-xs"
            >
              <Filter.BarName>
                <Icon />
                {t(label)}
              </Filter.BarName>
              <Filter.BarButton filterKey={key} inDialog>
                {t(
                  options.find(
                    (option) => option.value === String(filters[key]),
                  )?.label ?? '',
                )}
              </Filter.BarButton>
              <Filter.BarClose filterKey={key} />
            </div>
          ))}
        <Filter.Popover scope="job-filter">
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput placeholder={t('filter')} />
                <Command.List>
                  {textFilters.map(({ key, label }) => (
                    <Filter.Item key={key} value={key} inDialog>
                      <IconSearch />
                      {t(label)}
                    </Filter.Item>
                  ))}
                  <SelectProduct.FilterItem
                    value="inputProductId"
                    label={t('job-input-products')}
                  />
                  <SelectProduct.FilterItem
                    value="outputProductId"
                    label={t('job-output-products')}
                  />
                  {availableOptionFilters.map(({ key, label, Icon }) => (
                    <Filter.Item key={key} value={key} inDialog>
                      <Icon />
                      {t(label)}
                    </Filter.Item>
                  ))}
                </Command.List>
              </Command>
            </Filter.View>
            <SelectProduct.FilterView
              filterKey="inputProductId"
              mode="single"
            />
            <SelectProduct.FilterView
              filterKey="outputProductId"
              mode="single"
            />
          </Combobox.Content>
        </Filter.Popover>
      </Filter.Bar>
      <Filter.Dialog>
        {availableOptionFilters.map(({ key, label, options }) => (
          <Filter.View key={key} filterKey={key} inDialog>
            <JobOptionFilter filterKey={key} label={label} options={options} />
          </Filter.View>
        ))}
        {textFilters.map(({ key, label }) => (
          <Filter.View key={key} filterKey={key} inDialog>
            <JobTextFilter filterKey={key} label={label} />
          </Filter.View>
        ))}
      </Filter.Dialog>
    </Filter>
  );
};
