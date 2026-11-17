import { useCreateProjectRecord } from '@/project/hooks/useCreateProjectRecord';
import { useGetConvertedProject } from '@/project/hooks/getConvertedProject';
import { useProjectDetailSheet } from '@/project/hooks/useProjectDetailSheet';
import { ITaskDetail } from '@/task/types';
import { IconClipboard } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ConvertToProjectTrigger = ({
  task,
  setOpen,
}: {
  task: ITaskDetail;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('operation');
  const { openProjectDraft } = useCreateProjectRecord();
  const [, setActiveProject] = useProjectDetailSheet();
  const { project, loading } = useGetConvertedProject({
    variables: { convertedFromId: task._id },
  });

  return (
    <Command.Item
      disabled={loading}
      onSelect={() => {
        setOpen(false);
        if (project) {
          setActiveProject(project._id, { stack: true });
          return;
        }
        openProjectDraft(
          {
            name: task.name || '',
            teamIds: task.teamId ? [task.teamId] : undefined,
            priority: task.priority ?? 0,
            leadId: task.assigneeId ?? undefined,
            startDate: task.startDate ? new Date(task.startDate) : undefined,
            targetDate: task.targetDate ? new Date(task.targetDate) : undefined,
            convertedFromId: task._id,
            description: task.description ?? undefined,
            customerId: task.customerId,
            companyId: task.companyId,
          },
          { stack: true },
        );
      }}
    >
      <IconClipboard className="size-4" />
      {project ? t('go-to-project-btn') : t('convert-to-project')}
    </Command.Item>
  );
};
