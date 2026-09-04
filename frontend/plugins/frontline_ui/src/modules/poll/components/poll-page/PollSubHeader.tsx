import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  PageSubHeader,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FormStatus } from '@/forms/components/form-page/filters/FormStatus';
import { usePollTotalCount } from '@/poll/hooks/usePollTotalCount';
import { PollsPageHotKeyScope } from '@/poll/types/pollTypes';

export const PollSubHeader = ({ channelId }: { channelId?: string }) => {
  const { t } = useTranslation('common');
  const [queries] = useMultiQueryState<{
    status: string;
    searchValue: string;
  }>(['status', 'searchValue']);

  const { status, searchValue } = queries || {};

  const { totalCount, loading } = usePollTotalCount({
    variables: {
      status: status || undefined,
      searchValue: searchValue || undefined,
      channelId,
    },
  });

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <PageSubHeader>
      <Filter id="polls-filter">
        <Filter.Popover scope={PollsPageHotKeyScope.PollsPage}>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter._')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                  <FormStatus.Item />
                </Command.List>
              </Command>
            </Filter.View>
            <FormStatus.View />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <FormStatus.BarItem />

        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {isUndefinedOrNull(totalCount) || loading ? (
            <Skeleton className="w-20 h-4 inline-block mt-1.5" />
          ) : (
            `${totalCount} ${t('records-found')}`
          )}
        </div>
      </Filter>
    </PageSubHeader>
  );
};
