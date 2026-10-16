import { useTranslation } from 'react-i18next';
import { IconClock, IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { SelectProduct } from 'ui-modules';
import { useTechCardFilters } from '../hooks/useTechCardFilters';
import { TECH_CARD_DURATION_TYPES } from '../types/techCardFormSchema';

const textFilters = [
  { key: 'searchValue', label: 'search' },
  { key: 'laborCostName', label: 'tech-card-labor-name' },
  { key: 'overheadCostName', label: 'tech-card-overhead-name' },
] as const;

const TechCardDurationFilter = () => {
  const { t } = useTranslation('accounting');
  const [durationType, setDurationType] = useQueryState<string>('durationType');
  const { resetFilterState } = useFilterContext();
  return (
    <Command>
      <Command.Input placeholder={t('tech-card-duration-type')} focusOnMount />
      <Command.List>
        {TECH_CARD_DURATION_TYPES.map((value) => (
          <Command.Item
            key={value}
            value={value}
            onSelect={() => {
              setDurationType(value === durationType ? null : value);
              resetFilterState();
            }}
          >
            {t(`tech-card-duration-${value}`)}
            <Combobox.Check checked={durationType === value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};

export const TechCardFilters = () => {
  const { t } = useTranslation('accounting');
  const filters = useTechCardFilters();
  const hasFilters = Object.values(filters).some(Boolean);
  return (
    <Filter id="tech-card-filters">
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
          label={t('tech-card-input-products')}
          mode="single"
        />
        <SelectProduct.FilterBar
          filterKey="outputProductId"
          label={t('tech-card-output-products')}
          mode="single"
        />
        <Filter.BarItem queryKey="durationType">
          <Filter.BarName>
            <IconClock />
            {t('tech-card-duration-type')}
          </Filter.BarName>
          <Filter.BarButton filterKey="durationType" inDialog>
            {filters.durationType
              ? t(`tech-card-duration-${filters.durationType}`)
              : ''}
          </Filter.BarButton>
        </Filter.BarItem>
        <Filter.Popover scope="tech-card-filter">
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput placeholder={t('filter')} />
                <Command.List>
                  {textFilters.map(({ key, label }) => (
                    <Filter.Item key={key} value={key} inDialog>
                      <IconSearch />
                      {label}
                    </Filter.Item>
                  ))}
                  <SelectProduct.FilterItem
                    value="inputProductId"
                    label={t('tech-card-input-products')}
                  />
                  <SelectProduct.FilterItem
                    value="outputProductId"
                    label={t('tech-card-output-products')}
                  />
                  <Filter.Item value="durationType" inDialog>
                    <IconClock />
                    {t('tech-card-duration-type')}
                  </Filter.Item>
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
        <Filter.View filterKey="durationType" inDialog>
          <TechCardDurationFilter />
        </Filter.View>
        {textFilters.map(({ key }) => (
          <Filter.View key={key} filterKey={key} inDialog>
            <Filter.DialogStringView filterKey={key} />
          </Filter.View>
        ))}
      </Filter.Dialog>
    </Filter>
  );
};
