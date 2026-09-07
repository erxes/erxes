import { IconCalendarPlus, IconSearch, IconTags } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  Popover,
  useMultiQueryState,
} from 'erxes-ui';
import { useSearchParams } from 'react-router';
import { SelectMember, TagsSelect } from 'ui-modules';
import { DocumentFilterState } from '../types';
import { useTranslation } from 'react-i18next';
import { DocumentsViewControl } from './DocumentsViewControl';

export const DocumentsFilter = () => {
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('documentId');

  const [queries] = useMultiQueryState<DocumentFilterState>([
    'createdAt',
    'createdBy',
    'searchValue',
    'tagIds',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  if (documentId !== null) {
    return null;
  }

  return (
    <PageSubHeader>
      <Filter id="documents-filter">
        <Filter.Bar className="overflow-auto styled-scroll">
          <DocumentFilterBar queries={queries} />
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <Filter.Popover scope={'documents-page'}>
              <Filter.Trigger isFiltered={hasFilters} />
              <Combobox.Content>
                <DocumentFilterView />
              </Combobox.Content>
            </Filter.Popover>
            <Filter.Dialog>
              <Filter.View filterKey="searchValue" inDialog>
                <Filter.DialogStringView filterKey="searchValue" />
              </Filter.View>
              <Filter.View filterKey="createdAt" inDialog>
                <Filter.DialogDateView filterKey="createdAt" />
              </Filter.View>
            </Filter.Dialog>
          </div>
        </Filter.Bar>
      </Filter>
      <DocumentsViewControl />
    </PageSubHeader>
  );
};

const DocumentFilterBar = ({ queries }: { queries: DocumentFilterState }) => {
  const { searchValue, createdBy, tagIds } = queries || {};
  const [, setQueries] = useMultiQueryState<DocumentFilterState>(['tagIds']);
  const { t } = useTranslation('documents', {
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
      <Filter.BarItem queryKey="tagIds">
        <Filter.BarName>
          <IconTags />
          Tags
        </Filter.BarName>
        <TagsSelect.Provider
          type="core:documents"
          value={tagIds || []}
          mode="multiple"
          onValueChange={(tagIds) => setQueries({ tagIds })}
        >
          <Popover>
            <Popover.Trigger>
              <Filter.BarButton filterKey="tagIds">
                <TagsSelect.SelectedList />
              </Filter.BarButton>
            </Popover.Trigger>
            <Popover.Content className="p-0">
              <TagsSelect.Content />
            </Popover.Content>
          </Popover>
        </TagsSelect.Provider>
      </Filter.BarItem>
      {createdBy && (
        <SelectMember.FilterBar queryKey="createdBy" label="Created By" />
      )}
    </>
  );
};

const DocumentFilterView = () => {
  const [{ tagIds }, setQueries] = useMultiQueryState<DocumentFilterState>([
    'tagIds',
  ]);
  const { t } = useTranslation('documents', {
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

            <Filter.Item value="tagIds">
              <IconTags />
              Tags
            </Filter.Item>
            <SelectMember.FilterItem value="createdBy" label="Created By" />
            <Command.Separator className="my-1" />
            <Filter.Item value="createdAt">
              <IconCalendarPlus />
              {t('created-at')}
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>
      <Filter.View filterKey="tagIds">
        <TagsSelect.Provider
          type="core:documents"
          value={tagIds || []}
          mode="multiple"
          onValueChange={(tagIds) => setQueries({ tagIds })}
        >
          <TagsSelect.Content />
        </TagsSelect.Provider>
      </Filter.View>
      <SelectMember.FilterView queryKey="createdBy" />
      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>
    </>
  );
};
