import {
  IconCheck,
  IconCircleX,
  IconSquareToggle,
  IconTrash,
} from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useSurveyRemove,
  useSurveyToggleStatus,
} from '@/survey/hooks/useSurveyMutations';
import { SurveyRejectDialog } from '@/survey/components/survey-page/SurveyRejectDialog';
import { ISurvey, SURVEY_STATUS } from '@/survey/types/surveyTypes';
import { MoveToChannelCommandBarButton } from '@/channels/components/move-resources/MoveToChannelCommandBarButton';
import { ChannelResourceType } from '@/channels/types';

export const SurveyCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const [rejectOpen, setRejectOpen] = useState(false);
  const { removeSurveys, loading: removing } = useSurveyRemove();
  const { toggleSurveyStatus, loading: toggling } = useSurveyToggleStatus();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const surveyIds = selectedRows.map((row: Row<ISurvey>) => row.original._id);
  const sourceChannelIds = selectedRows.map(
    (row: Row<ISurvey>) => row.original.channelId || '',
  );
  const pendingIds = selectedRows
    .filter(
      (row: Row<ISurvey>) => row.original.status === SURVEY_STATUS.PENDING,
    )
    .map((row: Row<ISurvey>) => row.original._id);
  const reviewableIds = selectedRows
    .filter((row: Row<ISurvey>) =>
      [SURVEY_STATUS.PENDING, SURVEY_STATUS.REJECTED].some(
        (status) => status === row.original.status,
      ),
    )
    .map((row: Row<ISurvey>) => row.original._id);

  const onError = (error: Error) =>
    toast({
      title: t('error'),
      variant: 'destructive',
      description: error.message,
    });

  const handleRemove = () =>
    removeSurveys({
      variables: { _ids: surveyIds },
      onCompleted: () => {
        table.resetRowSelection();
        toast({
          variant: 'success',
          title: t('survey-removed', 'Survey removed'),
        });
      },
      onError,
    });

  const handleApprove = () =>
    toggleSurveyStatus({
      variables: { _ids: reviewableIds, status: SURVEY_STATUS.ACTIVE },
      onCompleted: () => {
        table.resetRowSelection();
        toast({
          variant: 'success',
          title: t('survey-approved', 'Survey approved'),
        });
      },
      onError,
    });

  const handleArchive = () =>
    toggleSurveyStatus({
      variables: { _ids: surveyIds, status: SURVEY_STATUS.ARCHIVED },
      onCompleted: () => table.resetRowSelection(),
      onError,
    });

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        {reviewableIds.length > 0 && (
          <Button
            variant="secondary"
            onClick={handleApprove}
            disabled={toggling}
          >
            <IconCheck />
            {t('survey-approve', 'Approve')}
          </Button>
        )}
        {pendingIds.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => setRejectOpen(true)}
            disabled={toggling}
          >
            <IconCircleX />
            {t('survey-reject', 'Reject')}
          </Button>
        )}
        <Button variant="secondary" onClick={handleArchive} disabled={toggling}>
          <IconSquareToggle />
          {t('archive')}
        </Button>
        <MoveToChannelCommandBarButton
          resourceType={ChannelResourceType.SURVEY}
          resourceIds={surveyIds}
          sourceChannelIds={sourceChannelIds}
          onMoved={() => table.resetRowSelection()}
        />
        <Button
          variant="destructive"
          onClick={handleRemove}
          disabled={removing}
        >
          <IconTrash />
          {t('remove')}
        </Button>
      </CommandBar.Bar>
      <SurveyRejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        surveyIds={pendingIds}
        onRejected={() => table.resetRowSelection()}
      />
    </CommandBar>
  );
};
