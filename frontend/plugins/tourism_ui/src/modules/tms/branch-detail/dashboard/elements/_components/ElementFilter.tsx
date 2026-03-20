import {
  Combobox,
  Command,
  Filter,
  useQueryState,
  useMultiQueryState,
} from 'erxes-ui';
import { IconTags } from '@tabler/icons-react';
import { ELEMENTS_CURSOR_SESSION_KEY } from '../constants/elementCursorSessionKey';
import { useElementCategories } from '../hooks/useElementCategories';
import { CategorySelector } from './CategorySelector';

function SelectCategoryFilterItem() {
  return (
    <Filter.Item value="category">
      <IconTags />
      Category
    </Filter.Item>
  );
}

function SelectCategoryFilterView() {
  const [categoryId, setCategoryId] = useQueryState<string | undefined>(
    'categoryId',
  );

  return (
    <Filter.View filterKey="category">
      <Command>
        <Command.Input placeholder="Search category" />
        <Command.List>
          <Command.Empty>No category found.</Command.Empty>
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
  return (
    <>
      <Filter.Popover>
        <Filter.Trigger />
        <Combobox.Content>
          <Filter.View>
            <Command>
              <Filter.CommandInput placeholder="Filter" variant="secondary" />
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
            Category
          </Filter.BarName>
          <Filter.BarButton filterKey="category">
            {selectedCategoryLabel || 'Select category'}
          </Filter.BarButton>
        </Filter.BarItem>
      </Filter.Bar>
    </Filter>
  );
};
