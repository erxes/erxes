import { IProject } from '@/project/types';
import { useProjectDetailSheet } from '@/project/hooks/useProjectDetailSheet';
import {
  STATUS_TYPES,
  StatusInlineIcon,
  StatusInlineLabel,
} from '@/operation/components/StatusInline';
import { PriorityBadge } from '@/operation/components/PriorityInline';
import { IconClipboard, IconUserOff } from '@tabler/icons-react';
import { format, isBefore, isValid, startOfDay } from 'date-fns';
import { cn, IconComponent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { RelationRecordRow } from './RelationRecordRow';

export const ProjectRow = ({ project }: { project: IProject }) => {
  const { t } = useTranslation('operation');
  const [, setActiveProject] = useProjectDetailSheet();
  const dueDate = project.targetDate ? new Date(project.targetDate) : null;
  const hasDate = dueDate && isValid(dueDate);
  const overdue = Boolean(
    hasDate &&
      isBefore(dueDate, startOfDay(new Date())) &&
      project.status !== STATUS_TYPES.COMPLETED &&
      project.status !== STATUS_TYPES.CANCELLED,
  );
  // The backend defaults status to 0, which means no status was chosen.
  const hasStatus =
    project.status != null &&
    Object.values(STATUS_TYPES).includes(project.status);

  return (
    <RelationRecordRow
      name={project.name}
      leading={
        project.icon ? (
          <IconComponent name={project.icon} className="size-4" />
        ) : (
          <IconClipboard className="size-4" />
        )
      }
      trailing={
        (project.priority === 3 || project.priority === 4) && (
          <PriorityBadge
            priority={project.priority}
            className="h-5 shrink-0 px-1.5 font-normal"
          />
        )
      }
      onClick={() => setActiveProject(project._id, { stack: true })}
    >
      <span className="inline-flex min-w-0 items-center gap-1">
        {hasStatus ? (
          <>
            <StatusInlineIcon
              statusType={project.status}
              className="size-3.5"
            />
            <StatusInlineLabel statusType={project.status} />
          </>
        ) : (
          t('no-status', 'No status')
        )}
      </span>
      <span className="inline-flex min-w-0 max-w-full items-center gap-1">
        <span className="sr-only">{t('lead', 'Lead')}</span>
        {project.leadId ? (
          <MembersInline.Provider memberIds={[project.leadId]} showInactive>
            <MembersInline.Avatar className="size-4" />
            <MembersInline.Title className="truncate text-xs font-normal" />
          </MembersInline.Provider>
        ) : (
          <>
            <IconUserOff className="size-3.5 shrink-0" />
            {t('lead-not-specified', 'Lead not specified')}
          </>
        )}
      </span>
      {hasDate && (
        <span
          className={cn(overdue && 'text-destructive')}
          title={overdue ? t('overdue', 'Overdue') : undefined}
        >
          {t('due', 'Due')} {format(dueDate, 'MMM d')}
        </span>
      )}
    </RelationRecordRow>
  );
};
