import { Combobox, Command, Filter, PageSubHeader, Skeleton } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { PipelineStatusFilter } from './PipelineStatusFilter';

const PipelinesFilterMenu = () => {
  const { t } = useTranslation('sales');

  return (
    <Filter.View>
      <Command>
        <Filter.CommandInput
          placeholder={t('filter', 'Filter')}
          variant="secondary"
          className="bg-background"
        />
        <Command.List className="p-1">
          <Filter.SearchValueTrigger />
          <PipelineStatusFilter.Item />
          <SelectMember.FilterItem
            value="createdBy"
            label={t('created-by', 'Created by')}
          />
        </Command.List>
      </Command>
    </Filter.View>
  );
};

const PipelinesFilterPopover = () => (
  <>
    <Filter.Popover scope="sales-pipelines-settings-page">
      <Filter.Trigger />
      <Combobox.Content>
        <PipelinesFilterMenu />
        <PipelineStatusFilter.View />
        <SelectMember.FilterView queryKey="createdBy" />
      </Combobox.Content>
    </Filter.Popover>
    <Filter.Dialog>
      <Filter.View filterKey="searchValue" inDialog>
        <Filter.DialogStringView filterKey="searchValue" />
      </Filter.View>
    </Filter.Dialog>
  </>
);

const PipelinesCount = ({
  count,
  loading,
}: Readonly<{ count: number; loading: boolean }>) => {
  const { t } = useTranslation('sales');

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {loading ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        t('records-found', { count })
      )}
    </div>
  );
};

export const PipelinesSubHeader = ({
  count,
  loading,
}: Readonly<{ count: number; loading: boolean }>) => {
  const { t } = useTranslation('sales');

  return (
    <Filter id="pipelines-filter">
      <PageSubHeader>
        <Filter.Bar>
          <PipelinesFilterPopover />
          <Filter.SearchValueBarItem />
          <PipelineStatusFilter.Bar />
          <SelectMember.FilterBar
            queryKey="createdBy"
            label={t('created-by', 'Created by')}
          />
          <PipelinesCount count={count} loading={loading} />
        </Filter.Bar>
      </PageSubHeader>
    </Filter>
  );
};
