import { IconArchive } from '@tabler/icons-react';
import { Toggle, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { RecordCount } from '~/modules/views/filter/RecordCount';
import { pluginTitle, useInstalledPlugins } from '../useCatalogContext';
import { PRODUCTS_SESSION_KEY, useProducts } from '../useProducts';

const TotalCount = () => {
  const { totalCount, totalCapped } = useProducts();

  return <RecordCount totalCount={totalCount} totalCapped={totalCapped} />;
};

/** Shows archived products instead of the active ones. */
const ArchivedToggle = () => {
  const { t } = useTranslation('product');
  const [archived, setArchived] = useQueryState<boolean>('archived');
  const label = t('status.archived', 'Archived');

  return (
    <IconTip label={label}>
      <Toggle
        aria-label={label}
        className="size-7 min-w-7 px-0"
        pressed={archived === true}
        onPressedChange={(pressed) => setArchived(pressed ? true : null)}
      >
        <IconArchive />
      </Toggle>
    </IconTip>
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
      <TotalCount />
      <ArchivedToggle />
    </ListFilter>
  );
};
