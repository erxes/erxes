import { AutomationsDisplayControl } from '@/automations/components/list/AutomationsDisplayControl';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  Combobox,
  Command,
  Filter,
  PageSubHeader,
  Skeleton,
  useNonNullMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Templates only support search server-side, so this is the single-filter form
 * of the automations filter bar. The key stays `searchValue` to match the
 * platform-wide filter convention and reuse Filter's built-in search pieces.
 */
export const useWorkflowTemplateFilters = () => {
  const { searchValue } = useNonNullMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);

  return { searchValue: searchValue || undefined };
};

export const WorkflowTemplateFilters = ({
  totalCount,
  loading,
}: {
  totalCount: number;
  loading: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Filter id="workflow-templates">
      <PageSubHeader>
        <Filter.Bar>
          <Filter.Popover scope={AutomationsHotKeyScope.TemplatesFilter}>
            <Filter.Trigger />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('search-filter')}
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
            <Filter.View filterKey="searchValue" inDialog>
              <Filter.DialogStringView filterKey="searchValue" />
            </Filter.View>
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
        </Filter.Bar>
        <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
          {totalCount
            ? `${totalCount} ${t('records-found-label')}`
            : loading && <Skeleton className="w-20 h-4 inline-block mt-1.5" />}
        </div>
        <div className="ml-auto">
          <AutomationsDisplayControl />
        </div>
      </PageSubHeader>
    </Filter>
  );
};
