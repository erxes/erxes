import { ImportExportStatusFilterView } from '@/import-export/settings/components/ImportExportStatusFilterView';
import { IMPORT_EXPORT_STATUS_OPTIONS } from '@/import-export/settings/constants/importExportStatusOptions';
import { IconProgressCheck } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  Skeleton,
  useFilterQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const StatusBarItem = () => {
  const { t } = useTranslation('importExport');
  const [status] = useFilterQueryState<string>('status');
  const labelKey = IMPORT_EXPORT_STATUS_OPTIONS.find(
    (option) => option.value === status,
  )?.labelKey;

  return (
    <Filter.BarItem queryKey="status">
      <Filter.BarName>
        <IconProgressCheck />
        Status
      </Filter.BarName>
      <Popover>
        <Popover.Trigger>
          <Filter.BarButton>
            {labelKey ? t(labelKey) : t('all-statuses')}
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <ImportExportStatusFilterView />
        </Combobox.Content>
      </Popover>
    </Filter.BarItem>
  );
};

const HistoriesTotalCount = ({
  totalCount,
  loading,
}: {
  totalCount: number;
  loading?: boolean;
}) => {
  const { t } = useTranslation('importExport');

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {totalCount
        ? t('records-found', { total: totalCount })
        : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
    </div>
  );
};

export const ImportExportHistoriesFilter = ({
  id,
  sessionKey,
  totalCount,
  loading,
}: {
  id: string;
  sessionKey: string;
  totalCount: number;
  loading?: boolean;
}) => {
  const { t } = useTranslation('importExport');
  const [status] = useFilterQueryState<string>('status');

  return (
    <Filter id={id} sessionKey={sessionKey}>
      <Filter.Bar>
        <Filter.Popover scope={id}>
          <Filter.Trigger isFiltered={!!status} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.Item value="status">
                    <IconProgressCheck />
                    {t('status')}
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>
            <Filter.View filterKey="status">
              <ImportExportStatusFilterView />
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>

        <Filter.Dialog>
          <Filter.View filterKey="status" inDialog>
            <ImportExportStatusFilterView />
          </Filter.View>
        </Filter.Dialog>

        <StatusBarItem />

        <HistoriesTotalCount totalCount={totalCount} loading={loading} />
      </Filter.Bar>
    </Filter>
  );
};
