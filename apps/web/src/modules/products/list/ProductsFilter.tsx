import { IconArchive } from '@tabler/icons-react';
import { Toggle, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { IconTip } from '~/components/IconTip';
import { ListFilter } from '~/modules/views/filter/ListFilter';
import { pluginTitle, useInstalledPlugins } from '../useCatalogContext';
import { PRODUCTS_SESSION_KEY, useProducts } from '../useProducts';

/** Shows archived products instead of the active ones. */
const ArchivedToggle = () => {
  const { t } = useTranslation('product');
  const [archived, setArchived] = useQueryState('archived', z.boolean());
  const label = t('status.archived', 'Archived');

  return (
    <IconTip label={label}>
      <Toggle
        aria-label={label}
        size="icon"
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
  const { totalCount, totalCapped } = useProducts();

  return (
    <ListFilter
      recordType="product"
      sessionKey={PRODUCTS_SESSION_KEY}
      optionLabel={optionLabel}
      totalCount={totalCount}
      totalCapped={totalCapped}
    >
      <ArchivedToggle />
    </ListFilter>
  );
};
