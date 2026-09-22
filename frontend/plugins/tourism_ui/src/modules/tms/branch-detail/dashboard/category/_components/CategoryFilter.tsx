import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CATEGORIES_CURSOR_SESSION_KEY } from '../constants/categoryCursorSessionKey';
import { CategoryTotalCount } from './CategoryTotalCount';

const CategoryFilterPopover = () => {
  const { t } = useTranslation('tourism');
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder={t('filter')} variant="secondary" />
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
    </>
  );
};

export const CategoryFilter = () => {
  return (
    <Filter id="categories-filter" sessionKey={CATEGORIES_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <CategoryFilterPopover />
        <Filter.SearchValueBarItem />
        <CategoryTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
