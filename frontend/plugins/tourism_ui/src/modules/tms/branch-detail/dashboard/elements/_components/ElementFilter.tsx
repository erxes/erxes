import {
  Combobox,
  Command,
  Filter,
  useQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconTags } from '@tabler/icons-react';
import { ELEMENTS_CURSOR_SESSION_KEY } from '../constants/elementCursorSessionKey';
import { useElementCategories } from '../hooks/useElementCategories';
import { CategorySelector } from './CategorySelector';
import { ElementsTotalCount } from './ElementsTotalCount';

function SelectCategoryFilterItem() {
  const { t } = useTranslation('tourism');
  return (
    <Filter.Item value="category">
      <IconTags />
      {t('category')}
    </Filter.Item>
  );
}

function SelectCategoryFilterView() {
  const { t } = useTranslation('tourism');
  const [categoryId, setCategoryId] = useQueryState<string | undefined>(
    'categoryId',
  );

  return (
    <Filter.View filterKey="category">
      <Command>
        <Command.Input placeholder={t('search-category')} />
        <Command.List>
          <Command.Empty>{t('no-category-found')}</Command.Empty>
          <CategorySelector
            value={categoryId ?? undefined}
            onChange={(value) => setCategoryId(value)}
          />
        </Command.List>
      </Command>
    </Filter.View>
  );
}

const ElementFilterPopover = () => {
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
                <Command.Separator className="my-1" />
                <SelectCategoryFilterItem />
              </Command.List>
            </Command>
          </Filter.View>
          <SelectCategoryFilterView />
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

export const ElementFilter = () => {
  const { t } = useTranslation('tourism');
  const [queries] = useMultiQueryState<{
    searchValue: string;
    categoryId: string;
  }>(['searchValue', 'categoryId']);

  const { getCategoryNameById } = useElementCategories();

  const selectedCategoryLabel = queries?.categoryId
    ? getCategoryNameById(queries.categoryId)
    : undefined;

  return (
    <Filter id="elements-filter" sessionKey={ELEMENTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <ElementFilterPopover />
        <Filter.SearchValueBarItem />

        <Filter.BarItem queryKey="categoryId">
          <Filter.BarName>
            <IconTags />
            {t('category')}
          </Filter.BarName>
          <Filter.BarButton filterKey="category">
            {selectedCategoryLabel || t('select-category')}
          </Filter.BarButton>
        </Filter.BarItem>
        <ElementsTotalCount />
      </Filter.Bar>
    </Filter>
  );
};
