import {
  STATUS_TYPES,
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import { useTaskDetailSheet } from '@/task/hooks/useTaskDetailSheet';
import { ITask } from '@/task/types';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { ITriageDetail } from '@/triage/types/triage';
import { IconChecklist, IconInbox, IconUserOff } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Badge, Skeleton } from 'erxes-ui';
import { RelationRecordRow } from './RelationRecordRow';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MembersInline, useSidePanel } from 'ui-modules';

const TaskRelationRow = ({
  name,
  triage = false,
  onClick,
  children,
}: {
  name?: string | null;
  triage?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('operation');
  const Icon = triage ? IconInbox : IconChecklist;

  return (
    <RelationRecordRow
      name={name}
      onClick={onClick}
      leading={<Icon className="size-4" />}
      leadingClassName={triage ? 'bg-primary/10 text-primary' : undefined}
      trailing={
        <Badge
          variant={triage ? 'default' : 'secondary'}
          className="h-5 shrink-0 px-1.5 font-normal"
        >
          {triage ? t('triage', 'Triage') : t('task', 'Task')}
        </Badge>
      }
    >
      {children}
    </RelationRecordRow>
  );
};

export const TriageRow = ({
  triage,
}: {
  triage: Pick<ITriageDetail, '_id' | 'name' | 'status' | 'createdBy'>;
}) => {
  const { t } = useTranslation('operation');
  const { openRecord } = useSidePanel();

  return (
    <TaskRelationRow
      name={triage.name}
      triage
      onClick={() =>
        openRecord(
          { contentType: TRIAGE_CONTENT_TYPE, contentId: triage._id },
          { stack: true },
        )
      }
    >
      <span className="inline-flex min-w-0 items-center gap-1">
        <StatusInlineIcon statusType={triage.status} className="size-3.5" />
        {triage.status == null ? (
          t('status-unavailable', 'Status unavailable')
        ) : triage.status === STATUS_TYPES.TRIAGE ? (
          t('awaiting-review', 'Awaiting review')
        ) : (
          <StatusInlineLabel statusType={triage.status} />
        )}
      </span>
      <span className="inline-flex min-w-0 max-w-full items-center gap-1">
        <span className="shrink-0">{t('created-by', 'Created by')}</span>
        {triage.createdBy === 'system' ? (
          t('system', 'System')
        ) : (
          <MembersInline
            memberIds={triage.createdBy ? [triage.createdBy] : []}
            size="default"
            showInactive
            placeholder={t('unknown', 'Unknown')}
            className="truncate text-xs font-normal"
          />
        )}
      </span>
    </TaskRelationRow>
  );
};

export const TaskItemRow = ({
  task,
}: {
  task: Pick<
    ITask,
    '_id' | 'name' | 'targetDate' | 'status' | 'teamId' | 'assigneeId'
  >;
}) => {
  const { t } = useTranslation('operation');
  const [, setActiveTask] = useTaskDetailSheet();
  const { statuses, loading } = useGetStatusByTeam({
    variables: { teamId: task.teamId || '' },
    skip: !task.teamId,
  });
  const status = statuses.find((status) => status.value === task.status);

  return (
    <TaskRelationRow
      name={task.name}
      onClick={() => setActiveTask(task._id, { stack: true })}
    >
      {loading && !status ? (
        <Skeleton className="h-4 w-16" />
      ) : (
        <span className="inline-flex min-w-0 max-w-full items-center gap-1">
          <StatusInlineIcon
            statusType={status?.type}
            color={status?.color}
            className="size-3.5"
          />
          <span className="truncate capitalize">
            {status?.label || t('status-unavailable', 'Status unavailable')}
          </span>
        </span>
      )}
      <span className="inline-flex min-w-0 max-w-full items-center gap-1">
        {task.assigneeId ? (
          <MembersInline.Provider memberIds={[task.assigneeId]} showInactive>
            <MembersInline.Avatar className="size-4" />
            <MembersInline.Title className="truncate text-xs font-normal" />
          </MembersInline.Provider>
        ) : (
          <>
            <IconUserOff className="size-3.5 shrink-0" />
            {t('no-assignee', 'No assignee')}
          </>
        )}
      </span>
      {task.targetDate && (
        <span>
          {t('due', 'Due')} {format(new Date(task.targetDate), 'MMM d')}
        </span>
      )}
    </TaskRelationRow>
  );
};

export const TaskRow = ({ taskId }: { taskId: string }) => {
  const { task, loading } = useGetTask(taskId);
  const { triage, loading: loadingTriage } = useGetTriage(taskId, {
    skip: !!task?._id || loading,
  });

  if ((loading && !task) || loadingTriage) {
    return <Skeleton className="mx-2 my-2 h-12" />;
  }

  if (!task) {
    return triage ? <TriageRow triage={triage} /> : null;
  }

  return <TaskItemRow task={task} />;
};
