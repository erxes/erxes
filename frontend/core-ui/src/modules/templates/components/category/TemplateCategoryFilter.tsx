import { TemplateCategoryFilterState } from '@/templates/types/TemplateCategory';
import { IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TemplateAuditFilterBarItems,
  TemplateAuditFilterItems,
  TemplateAuditFilterViews,
  TemplateFilterDialog,
} from '@/templates/components/TemplateFilterParts';
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
          <div className="flex flex-wrap flex-1 items-center gap-2">
            <Filter.Popover scope={'templates-page'}>
              <Filter.Trigger isFiltered={hasFilters} />
              <Combobox.Content>
                <TemplateCategoryFilterView />
              </Combobox.Content>
            </Filter.Popover>
            <TemplateFilterDialog />
            <TemplateCategoryFilterBar queries={queries} />
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

      <TemplateAuditFilterBarItems
        createdBy={createdBy}
        updatedBy={updatedBy}
      />

      {parentIds && (
        <SelectTemplateCategory.FilterBar
          queryKey="parentIds"
          label={t('parent')}
        />
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
            placeholder={t('filter-placeholder')}
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
              label={t('parent')}
            />

            <TemplateAuditFilterItems />
          </Command.List>
        </Command>
      </Filter.View>

      <SelectTemplateCategory.FilterView queryKey="parentIds" />

      <TemplateAuditFilterViews />
    </>
  );
};
