import { IconArchive } from '@tabler/icons-react';
import { isUndefinedOrNull, Skeleton, Toggle, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { formatTotal } from '~/lib/cursorList';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { pluginTitle, useInstalledPlugins } from '../useCatalogContext';
import { PRODUCTS_SESSION_KEY, useProducts } from '../useProducts';

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

/** Product types and plugins read as people call them. */
const useOptionLabel = () => {
  const { t } = useTranslation('product');
  const { plugins } = useInstalledPlugins();

  return (path: string, value: string) => {
    if (path === 'subject.kind') return t(`kind.${value}`, value);

    if (path === 'subject.plugins') return pluginTitle(plugins, value);

    return value;
  };
};

/** Filters the catalog by any field or property (`F`), saved with views; archived products on their own. */
export const ProductsFilter = () => {
  const optionLabel = useOptionLabel();

  return (
    <ListFilter recordType="product" sessionKey={PRODUCTS_SESSION_KEY} optionLabel={optionLabel}>
      <ArchivedToggle />
      <TotalCount />
    </ListFilter>
  );
};
