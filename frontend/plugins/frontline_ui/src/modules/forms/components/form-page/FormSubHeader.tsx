import { Combobox, Command, Filter, isUndefinedOrNull, PageSubHeader, Skeleton, useMultiQueryState, useQueryState } from "erxes-ui";
import { FormsPageHotKeyScope } from "@/forms/types/formTypes";
import { IconTag } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { FormStatus } from "./filters/FormStatus";
import { SelectTags } from "ui-modules";
import { useFormsList } from "@/forms/hooks/useFormsList";
import { SelectChannel } from "@/inbox/channel/components/SelectChannel";

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

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
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
                  placeholder={t('filter._')}
                  variant="secondary"
                  className="bg-background"
                />
                <Command.List className="p-1">
                  <Filter.SearchValueTrigger />
                  <SelectTags.FilterItem value="tagId" label="By Tag" />
                  <FormStatus.Item />
                  <SelectChannel.FilterItem />
                </Command.List>
              </Command>
            </Filter.View>
            <SelectTags.FilterView mode="single" filterKey="tagId" />
            <FormStatus.View />
            <SelectChannel.FilterView />
          </Combobox.Content>
        </Filter.Popover>
        <Filter.Dialog>
          <Filter.DialogStringView filterKey="searchValue" />
        </Filter.Dialog>
        <Filter.SearchValueBarItem />
        <FormTagFilterBarItem queryKey="tagId" />
        <FormStatus.BarItem />
        <SelectChannel.FilterBar />

        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {(isUndefinedOrNull(totalCount) || loading) ? (
            <Skeleton className="w-20 h-4 inline-block mt-1.5" />
          ) : (
            `${totalCount} ${t('records-found')}`
          )}
        </div>
      </Filter>
    </PageSubHeader>
  );
};
export const FormTagFilterBarItem = ({ queryKey }: { queryKey: string }) => {
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
        label="By Tag"
        initialValue={[query as string]}
        onValueChange={(value) => setQuery(value as string)}
      />
    </Filter.BarItem>
  );
}