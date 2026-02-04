import { IconCalendarPlus, IconSearch } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  useMultiQueryState,
} from 'erxes-ui';
import { useSearchParams } from 'react-router';
import { SelectMember } from 'ui-modules';
import { DocumentFilterState } from '../types';
import { useTranslation } from 'react-i18next';

export const DocumentsFilter = () => {
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('documentId');

  const [queries] = useMultiQueryState<DocumentFilterState & { assignedTo?: string | string[] | null }>([
    'createdAt',
    'createdBy',
    'assignedTo', // Read for backward compatibility
    'searchValue',
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
    </PageSubHeader>
  );
};

const DocumentFilterBar = ({ queries }: { queries: DocumentFilterState & { assignedTo?: string | string[] | null } }) => {
  const { searchValue, createdBy, assignedTo } = queries || {};
  // Use createdBy if available, otherwise fall back to assignedTo for backward compatibility
  const userIds = createdBy || assignedTo;
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
      {userIds && <SelectMember.FilterBar queryKey="createdBy" label={t('created-by')} />}
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

            <SelectMember.FilterItem value="createdBy" label={t('created-by')} />
            <Command.Separator className="my-1" />
            <Filter.Item value="createdAt">
              <IconCalendarPlus />
              {t('created-at')}
            </Filter.Item>
          </Command.List>
        </Command>
      </Filter.View>
      <SelectMember.FilterView queryKey="createdBy" />
      <Filter.View filterKey="createdAt">
        <Filter.DateView filterKey="createdAt" />
      </Filter.View>
    </>
  );
};
