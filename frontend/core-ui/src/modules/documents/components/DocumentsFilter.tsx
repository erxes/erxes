import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import { Combobox, Command, Filter, useMultiQueryState } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { DocumentFilterState } from '../types';
import { useTranslation } from 'react-i18next';

// TODO: Change assignedTo to createdBy

export const DocumentsFilter = () => {
  const [queries] = useMultiQueryState<DocumentFilterState>([
    'createdAt',
    'assignedTo',
    'searchValue',
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
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
  );
};

const DocumentFilterBar = ({ queries }: { queries: DocumentFilterState }) => {
  const { searchValue, assignedTo } = queries || {};
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
      {assignedTo && <SelectMember.FilterBar />}
    </>
  );
};

const DocumentFilterView = () => {
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

            <SelectMember.FilterItem />
            <Command.Separator className="my-1" />
            <Filter.Item value="createdAt">
              <IconCalendarPlus />
              {t('created-at')}
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>
      <SelectMember.FilterView />
      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>
    </>
  );
};
