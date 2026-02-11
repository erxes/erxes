import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import { IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { PRODUCTS_CURSOR_SESSION_KEY } from '../constants/productsCursorSessionKey';
import { useTranslation } from 'react-i18next';
import { ProductsTotalCount } from './ProductsTotalCount';

export const ProductsFilter = () => {
  return (
    <Filter id="products-filter" sessionKey={PRODUCTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <ProductsFilterPopover />
        <ProductsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};

export const ProductsFilterPopover = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'filter',
  });
  return (
    <>
      <Filter.Popover scope={ProductHotKeyScope.ProductsPage}>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />

              <Command.List className="p-1">
                <Filter.Item value="searchValue" inDialog>
                  <IconSearch />
                  {t('search')}
                </Filter.Item>
              </Command.List>
            </Command>
          </Filter.View>
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
