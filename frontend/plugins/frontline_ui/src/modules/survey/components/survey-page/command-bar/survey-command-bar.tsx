import { IconSquareToggle, IconTrash } from '@tabler/icons-react';
import { Row } from '@tanstack/table-core';
import { Button, CommandBar, RecordTable, Separator, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  useSurveyRemove,
  useSurveyToggleStatus,
} from '@/survey/hooks/useSurveyMutations';
import { ISurvey, SURVEY_STATUS } from '@/survey/types/surveyTypes';

export const SurveyCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();
  const { removeSurveys, loading: removing } = useSurveyRemove();
  const { toggleSurveyStatus, loading: toggling } = useSurveyToggleStatus();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const surveyIds = selectedRows.map((row: Row<ISurvey>) => row.original._id);

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
        <Button variant="secondary" onClick={handleArchive} disabled={toggling}>
          <IconSquareToggle />
          {t('archive')}
        </Button>
        <Button
          variant="destructive"
          onClick={handleRemove}
          disabled={removing}
        >
          <IconTrash />
          {t('remove')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
