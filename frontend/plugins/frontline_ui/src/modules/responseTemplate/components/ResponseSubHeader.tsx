import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  PageSubHeader,
  Skeleton,
  useMultiQueryState,
} from 'erxes-ui';
import { useGetResponses } from '../hooks/useGetResponses';
import { useTranslation } from 'react-i18next';

export const ResponseSubHeader = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline');
  const [queries] = useMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);
  const { searchValue } = queries;

  const { totalCount, isInitialLoad, isRefetching } = useGetResponses({
    variables: {
      filter: { channelId, searchValue: searchValue || undefined },
    },
  });

  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

  return (
    <PageSubHeader>
      <Filter id="response-templates-filter" sessionKey="responses_cursor">
        <Filter.Popover scope="response-templates-page">
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                </Command.List>
              </Command>
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {isUndefinedOrNull(totalCount) || isInitialLoad || isRefetching ? (
            <Skeleton className="w-20 h-4 inline-block mt-1.5" />
          ) : (
            t('records-found', { count: totalCount })
          )}
        </div>
      </Filter>
    </PageSubHeader>
  );
};
