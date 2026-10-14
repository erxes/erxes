import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  PageSubHeader,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { FormsPageHotKeyScope } from '@/forms/types/formTypes';
import { useTranslation } from 'react-i18next';
import { FormStatus } from './filters/FormStatus';
import { FormChannelFilterView } from '@/forms/components/form-page/filters/FormChannelFilterView';
import { useFormsList } from '@/forms/hooks/useFormsList';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';

export const FormSubHeader = () => {
  const { t } = useTranslation('common');
  const [queries] = useMultiQueryState<{
    channelId: string;
    tagId: string;
    status: string;
    searchValue: string;
  }>(['tagId', 'status', 'searchValue', 'channelId']);

  const { channelId, tagId, status, searchValue } = queries;

  const { totalCount, loading } = useFormsList({
    variables: {
      channelId: channelId || '',
      tagId: tagId || '',
      status: status || '',
      searchValue: searchValue || '',
    },
  });

  const hasFilters = [channelId, status, searchValue].some(
    (value) => value !== null && value !== undefined,
  );

  return (
    <PageSubHeader>
      <Filter id="forms-filter">
        <Filter.Popover scope={FormsPageHotKeyScope.FormsPage}>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter._', 'Filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                  <FormStatus.Item />
                  <SelectChannel.FilterItem />
                </Command.List>
              </Command>
            </Filter.View>
            <FormStatus.View />
            <FormChannelFilterView />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <FormStatus.BarItem />
        <SelectChannel.FilterBar />

        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {isUndefinedOrNull(totalCount) || loading ? (
            <Skeleton className="w-20 h-4 inline-block mt-1.5" />
          ) : (
            `${totalCount} ${t('records-found', 'Records Found')}`
          )}
        </div>
      </Filter>
    </PageSubHeader>
  );
};
