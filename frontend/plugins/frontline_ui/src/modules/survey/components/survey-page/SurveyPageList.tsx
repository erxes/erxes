import { IconChartBar } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { Empty, RecordTable, useMultiQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SurveyCommandBar } from '@/survey/components/survey-page/command-bar/survey-command-bar';
import { surveyColumns } from '@/survey/components/survey-page/survey-columns';
import { SurveysCreateButton } from '@/survey/components/survey-page/surveys-create';
import { useSurveyList } from '@/survey/hooks/useSurveyList';
import { ISurvey } from '@/survey/types/surveyTypes';

export const SurveyPageList = ({ channelId }: { channelId?: string }) => {
  const { t } = useTranslation('frontline');
  const [{ status, searchValue }] = useMultiQueryState<{
    status?: string;
    searchValue?: string;
  }>(['status', 'searchValue']);

  const { surveys, loading, handleFetchMore, pageInfo } = useSurveyList({
    variables: {
      status: status || undefined,
      searchValue: searchValue || undefined,
      channelId,
    },
  });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (!loading && surveys?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconChartBar />
          </Empty.Media>
          <Empty.Title>{t('no-surveys-found', 'No surveys found')}</Empty.Title>
          <Empty.Description>
            {t(
              'surveys-empty-description',
              'Create a survey and send it into a messenger conversation.',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <SurveysCreateButton variant="outline" />
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={surveyColumns as unknown as ColumnDef<ISurvey>[]}
      data={surveys || []}
      className="m-3"
      tableId="frontline_surveys_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={surveys?.length}
        sessionKey="surveys_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <SurveyCommandBar />
    </RecordTable.Provider>
  );
};
