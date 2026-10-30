import { AddProjectForm } from '@/project/components/add-project/AddProjectForm';
import { useGetConvertedProject } from '@/project/hooks/getConvertedProject';
import { ITask } from '@/task/types';
import { IconClipboard } from '@tabler/icons-react';
import { Command, Sheet } from 'erxes-ui';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

// The task's actions menu item: convert it to a project, or go to the
// project it already became.
export const ConvertToProjectTrigger = ({
  task,
  setOpen,
  onConvert,
}: {
  task: ITask;
  setOpen: (open: boolean) => void;
  onConvert: () => void;
}) => {
  const { t } = useTranslation('operation');
  const navigate = useNavigate();
  const { project, loading } = useGetConvertedProject({
    variables: { convertedFromId: task._id },
  });

  return (
    <Command.Item
      disabled={loading}
      onSelect={() => {
        setOpen(false);

        if (project) {
          navigate(`/operation/projects/${project._id}/overview`);
          return;
        }

        onConvert();
      }}
    >
      <IconClipboard className="size-4" />
      <div className="flex items-center">
        {project ? t('go-to-project-btn') : t('convert-to-project')}
      </div>
    </Command.Item>
  );
};

// The new-project form a task is converted with; it outlives the menu.
export const ConvertToProjectSheet = ({
  task,
  open,
  onOpenChange,
}: {
  task: ITask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <Sheet.View
      className="sm:max-w-3xl w-full p-0"
      onEscapeKeyDown={(e) => {
        e.preventDefault();
      }}
    >
      <AddProjectForm task={task} onClose={() => onOpenChange(false)} />
    </Sheet.View>
  </Sheet>
);
