import { FormStatus } from '@/forms/components/form-page/filters/FormStatus';
import { useFormsList } from '@/forms/hooks/useFormsList';
import { FormsPageHotKeyScope } from '@/forms/types/formTypes';
import { IconTag } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  isUndefinedOrNull,
  PageSubHeader,
  Skeleton,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SelectTags } from 'ui-modules';

export const ChannelFormsSubHeader = () => {
  const { t } = useTranslation('common');
  const { t: tf } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();

  const [queries] = useMultiQueryState<{
    tagId: string;
    status: string;
    searchValue: string;
  }>(['tagId', 'status', 'searchValue']);

  const { tagId, status, searchValue } = queries;

  const { totalCount, loading } = useFormsList({
    variables: {
      channelId: channelId || '',
      tagId: tagId || '',
      status: status || '',
      searchValue: searchValue || '',
    },
  });

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  return (
    <PageSubHeader>
      <Filter id="channel-forms-filter">
        <Filter.Popover scope={FormsPageHotKeyScope.FormsPage}>
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
                  <SelectTags.FilterItem value="tagId" label={tf('by-tag')} />
                  <FormStatus.Item />
                </Command.List>
              </Command>
            </Filter.View>
            <SelectTags.FilterView mode="single" filterKey="tagId" />
            <FormStatus.View />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <ChannelFormsTagFilterBarItem queryKey="tagId" />
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

const ChannelFormsTagFilterBarItem = ({ queryKey }: { queryKey: string }) => {
  const { t: tf } = useTranslation('frontline');
  const [query, setQuery] = useQueryState<string | null>(queryKey);
  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconTag />
      </Filter.BarName>
      <SelectTags.FilterBar
        mode="single"
        filterKey={queryKey}
        tagType="frontline:form"
        variant="filter"
        label={tf('by-tag')}
        initialValue={[query as string]}
        onValueChange={(value) => setQuery(value as string)}
      />
    </Filter.BarItem>
  );
};
