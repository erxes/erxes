import {
  IconCalendarEvent,
  IconChartBar,
  IconEdit,
  IconLabel,
  IconList,
  IconSend,
  IconSquareToggle,
  IconStack2,
  IconToggleRight,
  IconTrash,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { FormStatus } from '@/forms/components/form-page/filters/FormStatus';
import { SurveyResultsDialog } from '@/survey/components/survey-page/SurveyResultsDialog';
import {
  useSurveyRemove,
  useSurveyToggleStatus,
} from '@/survey/hooks/useSurveyMutations';
import { ISurvey, SURVEY_STATUS } from '@/survey/types/surveyTypes';

const SurveyMoreColumnCell = ({ cell }: { cell: Cell<ISurvey, unknown> }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const survey = cell.row.original;
  const { id } = useParams<{ id: string }>();
  const channelId = survey.channelId || id;
  const { toggleSurveyStatus } = useSurveyToggleStatus();
  const { removeSurveys } = useSurveyRemove();

  const onError = (error: Error) =>
    toast({
      title: t('error'),
      variant: 'destructive',
      description: error.message,
    });

  const handleToggle = () =>
    toggleSurveyStatus({
      variables: {
        _ids: [survey._id],
        status:
          survey.status === SURVEY_STATUS.ACTIVE
            ? SURVEY_STATUS.ARCHIVED
            : SURVEY_STATUS.ACTIVE,
      },
      onCompleted: () => setOpen(false),
      onError,
    });

  const handleRemove = () =>
    removeSurveys({
      variables: { _ids: [survey._id] },
      onCompleted: () => {
        setOpen(false);
        toast({
          variant: 'success',
          title: t('survey-removed', 'Survey removed'),
        });
      },
      onError,
    });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="bottom" align="start">
        <DropdownMenu.Item asChild>
          <Link
            to={`/settings/frontline/channels/${channelId}/surveys/${survey._id}`}
          >
            <IconEdit />
            {t('edit')}
          </Link>
        </DropdownMenu.Item>
        <SurveyResultsDialog
          surveyId={survey._id}
          trigger={
            <DropdownMenu.Item onSelect={(event) => event.preventDefault()}>
              <IconChartBar />
              {t('survey-results', 'Results')}
            </DropdownMenu.Item>
          }
        />
        <DropdownMenu.Item onSelect={handleToggle}>
          <IconSquareToggle />
          {survey.status === SURVEY_STATUS.ACTIVE
            ? t('archive')
            : t('unarchive')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={handleRemove}>
          <IconTrash />
          {t('remove')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const surveyColumns: ColumnDef<ISurvey>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    size: 33,
    cell: SurveyMoreColumnCell,
  },
  RecordTable.checkboxColumn as ColumnDef<ISurvey>,
  {
    accessorKey: 'title',
    id: 'title',
    header: function SurveyTitleHeader() {
      const { t } = useTranslation('frontline');
      return <RecordTable.InlineHead label={t('col-name')} icon={IconLabel} />;
    },
    cell: function SurveyTitleCell({ cell }) {
      const { id } = useParams<{ id: string }>();
      const channelId = cell.row.original.channelId || id;

      return (
        <RecordTableInlineCell>
          <Link
            to={`/settings/frontline/channels/${channelId}/surveys/${cell.row.original._id}`}
          >
            <RecordTableInlineCell.Anchor>
              {cell.getValue() as string}
            </RecordTableInlineCell.Anchor>
          </Link>
        </RecordTableInlineCell>
      );
    },
    size: 240,
  },
  {
    accessorKey: 'question',
    id: 'question',
    header: function SurveyQuestionHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead
          label={t('survey-question', 'Question')}
          icon={IconList}
        />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 280,
  },
  {
    accessorKey: 'steps',
    id: 'steps',
    header: function SurveyStepsHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead
          label={t('survey-steps', 'Steps')}
          icon={IconStack2}
        />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {(cell.getValue() as ISurvey['steps'])?.length || 1}
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: function SurveyStatusHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead label={t('status')} icon={IconToggleRight} />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <FormStatus.Badge status={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    accessorKey: 'sentCount',
    id: 'sentCount',
    header: function SurveySentCountHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead
          label={t('survey-sent', 'Survey sent')}
          icon={IconSend}
        />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">{(cell.getValue() as number) || 0}</Badge>
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: function SurveyCreatedAtHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead
          label={t('created-at')}
          icon={IconCalendarEvent}
        />
      );
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 160,
  },
];
