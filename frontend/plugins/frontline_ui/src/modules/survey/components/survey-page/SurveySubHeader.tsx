import { IconClock } from '@tabler/icons-react';
import {
  Button,
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
import { FormStatus } from '@/forms/components/form-page/filters/FormStatus';
import { useSurveyTotalCount } from '@/survey/hooks/useSurveyTotalCount';
import { SurveysViewControl } from '@/survey/components/survey-page/SurveysViewControl';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import {
  SURVEY_STATUS,
  SURVEY_STATUSES,
  SurveysPageHotKeyScope,
} from '@/survey/types/surveyTypes';

export const SurveySubHeader = ({ channelId }: { channelId?: string }) => {
  const { t } = useTranslation('common');
  const [queries, setQueries] = useMultiQueryState<{
    status: string;
    searchValue: string;
  }>(['status', 'searchValue']);
  const [selectedChannelId] = useQueryState<string>('channelId');

  const { status, searchValue } = queries || {};

  const { totalCount, loading } = useSurveyTotalCount({
    variables: {
      status: status || undefined,
      searchValue: searchValue || undefined,
      channelId: channelId || selectedChannelId || undefined,
    },
  });

  const { totalCount: pendingCount } = useSurveyTotalCount({
    variables: { status: SURVEY_STATUS.PENDING, channelId },
    skip: !channelId,
  });

  const hasFilters =
    Object.values(queries || {}).some((value) => value !== null) ||
    (!channelId && !!selectedChannelId);

  return (
    <PageSubHeader>
      <Filter id="surveys-filter">
        <Filter.Bar>
          <Filter.Popover scope={SurveysPageHotKeyScope.SurveysPage}>
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
                    {!channelId && <SelectChannel.FilterItem />}
                  </Command.List>
                </Command>
              </Filter.View>
              <FormStatus.View statuses={SURVEY_STATUSES} />
              {!channelId && <SelectChannel.FilterView />}
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <FormStatus.BarItem statuses={SURVEY_STATUSES} />
          {!channelId && <SelectChannel.FilterBar />}

          {!!pendingCount && status !== SURVEY_STATUS.PENDING && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQueries({ status: SURVEY_STATUS.PENDING })}
            >
              <IconClock />
              {`${pendingCount} ${t('pending-approval', 'pending approval')}`}
            </Button>
          )}

          <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
            {isUndefinedOrNull(totalCount) || loading ? (
              <Skeleton className="w-20 h-4 inline-block mt-1.5" />
            ) : (
              `${totalCount} ${t('records-found')}`
            )}
          </div>
        </Filter.Bar>
      </Filter>
      {!channelId && <SurveysViewControl />}
    </PageSubHeader>
  );
};
