import {
  IconArrowBarToRight,
  IconCalendarEvent,
  IconChartBar,
  IconCheck,
  IconCircleX,
  IconEdit,
  IconLabel,
  IconList,
  IconSend,
  IconSquareToggle,
  IconStack2,
  IconToggleRight,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Badge,
  DropdownMenu,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  toast,
  Tooltip,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { FormStatus } from '@/forms/components/form-page/filters/FormStatus';
import { SurveyRejectDialog } from '@/survey/components/survey-page/SurveyRejectDialog';
import { SurveyResultsDialog } from '@/survey/components/survey-page/SurveyResultsDialog';
import {
  useSurveyRemove,
  useSurveyToggleStatus,
} from '@/survey/hooks/useSurveyMutations';
import { ISurvey, SURVEY_STATUS } from '@/survey/types/surveyTypes';
import { MoveToChannelDialog } from '@/channels/components/move-resources/MoveToChannelDialog';
import { ChannelResourceType } from '@/channels/types';

const SurveyMoreColumnCell = ({ cell }: { cell: Cell<ISurvey, unknown> }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const survey = cell.row.original;
  const isPending = survey.status === SURVEY_STATUS.PENDING;
  const isReviewable = isPending || survey.status === SURVEY_STATUS.REJECTED;
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

  const handleApprove = () =>
    toggleSurveyStatus({
      variables: { _ids: [survey._id], status: SURVEY_STATUS.ACTIVE },
      onCompleted: () => {
        setOpen(false);
        toast({
          variant: 'success',
          title: t('survey-approved', 'Survey approved'),
        });
      },
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
        {isReviewable ? (
          <>
            <DropdownMenu.Item onSelect={handleApprove}>
              <IconCheck />
              {t('survey-approve', 'Approve')}
            </DropdownMenu.Item>
            {isPending && (
              <DropdownMenu.Item
                onSelect={() => {
                  setOpen(false);
                  setRejectOpen(true);
                }}
              >
                <IconCircleX />
                {t('survey-reject', 'Reject')}
              </DropdownMenu.Item>
            )}
          </>
        ) : (
          <DropdownMenu.Item onSelect={handleToggle}>
            <IconSquareToggle />
            {survey.status === SURVEY_STATUS.ACTIVE
              ? t('archive')
              : t('unarchive')}
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Item
          onSelect={() => {
            setOpen(false);
            setMoveOpen(true);
          }}
        >
          <IconArrowBarToRight />
          {t('move-to-channel', 'Move to Channel')}
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={handleRemove}>
          <IconTrash />
          {t('remove')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
      <SurveyRejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        surveyIds={[survey._id]}
      />
      <MoveToChannelDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        resourceType={ChannelResourceType.SURVEY}
        resourceIds={[survey._id]}
        sourceChannelId={channelId || ''}
      />
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
    cell: function SurveyStatusCell({ cell }) {
      const status = cell.getValue() as string;
      const { rejectionReason } = cell.row.original;

      if (!rejectionReason) {
        return (
          <RecordTableInlineCell>
            <FormStatus.Badge status={status} />
          </RecordTableInlineCell>
        );
      }

      return (
        <RecordTableInlineCell>
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <span>
                  <FormStatus.Badge status={status} />
                </span>
              </Tooltip.Trigger>
              <Tooltip.Content className="max-w-64 text-wrap">
                {rejectionReason}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdBy',
    header: function SurveyCreatedByHeader() {
      const { t } = useTranslation('frontline');
      return (
        <RecordTable.InlineHead
          label={t('created-by', 'Created by')}
          icon={IconUser}
        />
      );
    },
    cell: function SurveyCreatedByCell({ cell }) {
      const { t } = useTranslation('frontline');
      const { createdCpUser, createdCpUserId, createdUser } = cell.row.original;

      if (!createdCpUserId) {
        return (
          <RecordTableInlineCell>
            {createdUser?.details?.fullName || '—'}
          </RecordTableInlineCell>
        );
      }

      const requester = [createdCpUser?.firstName, createdCpUser?.lastName]
        .filter(Boolean)
        .join(' ');

      return (
        <RecordTableInlineCell className="gap-2">
          <span className="truncate">
            {requester ||
              createdCpUser?.email ||
              createdCpUser?.phone ||
              t('client-portal-user', 'Client portal user')}
          </span>
          <Badge variant="secondary">
            {t('client-portal', 'Client portal')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 220,
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
