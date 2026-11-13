import { IconArchive, IconCategory, IconPlug, IconTag } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  Skeleton,
  Toggle,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { OptionFilter, type OptionFilterProps } from '~/components/OptionFilter';
import { formatTotal } from '~/lib/cursorList';
import { useProductCategories } from '../categories/useProductCategories';
import { useInstalledPlugins } from '../useCatalogContext';
import { PRODUCTS_SESSION_KEY, useProducts } from '../useProducts';

/** Kind, category and plugin: one-of-a-list filters. */
const useOptionFilters = (): OptionFilterProps[] => {
  const { t } = useTranslation('product');
  const { tree } = useProductCategories();
  const { plugins } = useInstalledPlugins();

  return [
    {
      filterKey: 'kind',
      label: t('fields.kind', 'Kind'),
      icon: IconTag,
      options: [
        { value: 'goods', label: t('kind.goods', 'Goods') },
        { value: 'service', label: t('kind.service', 'Service') },
      ],
    },
    {
      filterKey: 'categoryId',
      label: t('fields.category', 'Category'),
      icon: IconCategory,
      options: tree.map((node) => ({ value: node.category.id, label: node.path })),
    },
    {
      filterKey: 'plugin',
      label: t('fields.plugins', 'Used by'),
      icon: IconPlug,
      options: plugins.map((plugin) => ({ value: plugin.name, label: plugin.title })),
    },
  ];
};

const TotalCount = () => {
  const { t } = useTranslation();
  const { totalCount, totalCapped } = useProducts();

  return (
    <div className="h-7 whitespace-nowrap text-sm font-medium leading-7 text-muted-foreground">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="mt-1.5 inline-block h-4 w-20" />
      ) : (
        `${formatTotal(totalCount, totalCapped)} ${t('records-found', { count: totalCapped ? 2 : totalCount })}`
      )}
    </div>
  );
};

/** Shows archived products instead of the active ones. */
const ArchivedToggle = () => {
  const { t } = useTranslation('product');
  const [archived, setArchived] = useQueryState<boolean>('archived');

  return (
    <Toggle
      variant="outline"
      pressed={archived === true}
      onPressedChange={(pressed) => setArchived(pressed ? true : null)}
    >
      <IconArchive />
      {t('status.archived', 'Archived')}
    </Toggle>
  );
};

const FilterPopover = ({ filters }: { filters: OptionFilterProps[] }) => {
  const { t } = useTranslation('common');

  const [queries] = useMultiQueryState<{
    searchValue: string;
    kind: string;
    categoryId: string;
    plugin: string;
  }>(['searchValue', 'kind', 'categoryId', 'plugin']);

  const hasFilters = Object.values(queries).some((value) => value !== null);

  return (
    <Filter.Popover scope="products-page">
      <Filter.Trigger isFiltered={hasFilters} />
      <Combobox.Content>
        <Filter.View>
          <Command>
            <Filter.CommandInput
              placeholder={t('filter._')}
              variant="secondary"
              className="bg-background"
            />
            <Command.List className="p-1">
              <Filter.SearchValueTrigger />
              {filters.map((filter) => (
                <OptionFilter.Item key={filter.filterKey} {...filter} />
              ))}
            </Command.List>
          </Command>
        </Filter.View>
        {filters.map((filter) => (
          <OptionFilter.View key={filter.filterKey} {...filter} />
        ))}
      </Combobox.Content>
    </Filter.Popover>
  );
};

export const ProductsFilter = () => {
  const filters = useOptionFilters();

  return (
    <Filter id="products-filter" sessionKey={PRODUCTS_SESSION_KEY}>
      <Filter.Bar>
        <FilterPopover filters={filters} />
        <Filter.Dialog>
          <Filter.View filterKey="searchValue" inDialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.View>
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        {filters.map((filter) => (
          <OptionFilter.Bar key={filter.filterKey} {...filter} />
        ))}
        <ArchivedToggle />
        <TotalCount />
      </Filter.Bar>
    </Filter>
  );
};
