import { useTranslation } from 'react-i18next';
import { Combobox, Command, Filter, PageSubHeader } from 'erxes-ui';
import { BrandsTotalCount } from './BrandsTotalCount';

export const BrandsSubHeader = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'brands' });
  return (
    <Filter id="brands">
      <PageSubHeader>
        <Filter.Bar>
          <Filter.Popover scope="brands-page">
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('filter')}
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
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
          <Filter.SearchValueBarItem />
          <BrandsTotalCount />
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
};
