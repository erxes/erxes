import { SelectTemplateContentTypes } from '@/templates/components/select/TemplateContentTypeSelect';
import { TemplateImport } from '@/templates/components/TemplateImport';
import { TemplateFilterState } from '@/templates/types/Template';
import { IconBox, IconSearch } from '@tabler/icons-react';
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

export const TemplatesFilter = () => {
  const [queries] = useMultiQueryState<TemplateFilterState>([
    'searchValue',
    'contentType',
    'categoryIds',

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
                <TemplateFilterView />
              </Combobox.Content>
            </Filter.Popover>
            <TemplateFilterDialog />
            <TemplateFilterBar queries={queries} />
          </div>
        </Filter.Bar>
      </Filter>

      <TemplateImport />
    </PageSubHeader>
  );
};

const TemplateFilterBar = ({ queries }: { queries: TemplateFilterState }) => {
  const { searchValue, createdBy, updatedBy, categoryIds } = queries || {};

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

      <Filter.BarItem queryKey="contentType">
        <Filter.BarName>
          <IconBox />
          {t('types')}
        </Filter.BarName>
        <SelectTemplateContentTypes.FilterBar queryKey="contentType" />
      </Filter.BarItem>

      <TemplateAuditFilterBarItems
        createdBy={createdBy}
        updatedBy={updatedBy}
      />

      {categoryIds && (
        <SelectTemplateCategory.FilterBar
          queryKey="categoryIds"
          label={t('category')}
        />
      )}
    </>
  );
};

const TemplateFilterView = () => {
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

            <Filter.Item value="contentType">
              <IconBox />
              {t('types')}
            </Filter.Item>

            <SelectTemplateCategory.FilterItem
              value="categoryIds"
              label={t('category')}
            />

            <TemplateAuditFilterItems />
          </Command.List>
        </Command>
      </Filter.View>

      <SelectTemplateCategory.FilterView queryKey="categoryIds" />
      <SelectTemplateContentTypes.FilterView queryKey="contentType" />

      <TemplateAuditFilterViews />
    </>
  );
};
