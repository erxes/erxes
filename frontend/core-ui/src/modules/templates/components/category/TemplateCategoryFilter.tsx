import { TemplateCategoryFilterState } from '@/templates/types/TemplateCategory';
import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import { SelectTemplateCategory } from 'ui-modules/modules/templates';

export const TemplateCategoryFilter = () => {
  const [queries] = useMultiQueryState<TemplateCategoryFilterState>([
    'searchValue',
    'parentIds',

    'createdAt',
    'createdBy',

    'updatedAt',
    'updatedBy',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <PageSubHeader>
      <Filter id="templates-filter">
        <Filter.Bar className="overflow-auto styled-scroll">
          <TemplateCategoryFilterBar queries={queries} />
          <div className="flex flex-wrap flex-1 items-center gap-2">
            <Filter.Popover scope={'templates-page'}>
              <Filter.Trigger isFiltered={hasFilters} />
              <Combobox.Content>
                <TemplateCategoryFilterView />
              </Combobox.Content>
            </Filter.Popover>
            <Filter.Dialog>
              <Filter.View filterKey="searchValue" inDialog>
                <Filter.DialogStringView filterKey="searchValue" />
              </Filter.View>
              <Filter.View filterKey="createdAt" inDialog>
                <Filter.DialogDateView filterKey="createdAt" />
              </Filter.View>
              <Filter.View filterKey="updatedAt" inDialog>
                <Filter.DialogDateView filterKey="updatedAt" />
              </Filter.View>
            </Filter.Dialog>
          </div>
        </Filter.Bar>
      </Filter>
    </PageSubHeader>
  );
};

const TemplateCategoryFilterBar = ({
  queries,
}: {
  queries: TemplateCategoryFilterState;
}) => {
  const { searchValue, createdBy, updatedBy, parentIds } = queries || {};

  const { t } = useTranslation('templates', {
    keyPrefix: 'filter',
  });

  return (
    <>
      <Filter.BarItem queryKey="searchValue">
        <Filter.BarName>
          <IconSearch />
          {t('search')}
        </Filter.BarName>
        <Filter.BarButton filterKey="searchValue" inDialog>
          {searchValue}
        </Filter.BarButton>
      </Filter.BarItem>

      <Filter.BarItem queryKey="createdAt">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('created-at')}
        </Filter.BarName>
        <Filter.Date filterKey="createdAt" />
      </Filter.BarItem>

      <Filter.BarItem queryKey="updatedAt">
        <Filter.BarName>
          <IconCalendarPlus />
          {t('updated-at')}
        </Filter.BarName>
        <Filter.Date filterKey="updatedAt" />
      </Filter.BarItem>

      {createdBy && (
        <SelectMember.FilterBar queryKey="createdBy" label="Created By" />
      )}

      {updatedBy && (
        <SelectMember.FilterBar queryKey="updatedBy" label="Updated By" />
      )}

      {parentIds && (
        <SelectTemplateCategory.FilterBar queryKey="parentIds" label="Parent" />
      )}
    </>
  );
};

const TemplateCategoryFilterView = () => {
  const { t } = useTranslation('templates', {
    keyPrefix: 'filter',
  });

  return (
    <>
      <Filter.View>
        <Command>
          <Filter.CommandInput
            placeholder="Filter"
            variant="secondary"
            className="bg-background"
          />
          <Command.List className="p-1">
            <Filter.Item value="searchValue" inDialog>
              <IconSearch />
              {t('search')}
            </Filter.Item>

            <SelectTemplateCategory.FilterItem
              value="parentIds"
              label="Parent"
            />

            <SelectMember.FilterItem value="createdBy" label="Created By" />
            <SelectMember.FilterItem value="updatedBy" label="Updated By" />

            <Command.Separator className="my-1" />

            <Filter.Item value="createdAt">
              <IconCalendarPlus />
              {t('created-at')}
            </Filter.Item>

            <Filter.Item value="updatedAt">
              <IconCalendarPlus />
              {t('updated-at')}
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>

      <SelectMember.FilterView queryKey="createdBy" />
      <SelectMember.FilterView queryKey="updatedBy" />

      <SelectTemplateCategory.FilterView queryKey="parentIds" />

      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>
      <Filter.View filterKey="updatedAt">
        <Filter.DateView filterKey="updatedAt" />
      </Filter.View>
    </>
  );
};
