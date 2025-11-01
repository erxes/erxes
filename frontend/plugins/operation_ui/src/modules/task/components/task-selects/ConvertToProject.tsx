import { AddProjectForm } from '@/project/components/add-project/AddProjectForm';
import { useGetConvertedProject } from '@/project/hooks/getConvertedProject';
import { ITask } from '@/task/types';
import { Button, Sheet, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export const ConvertToProject = ({ task }: { task: ITask }) => {
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const onOpen = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const { project, loading } = useGetConvertedProject({
    variables: { convertedFromId: task._id },
  });

  if (project) {
    return (
      <Button
        variant="outline"
        onClick={() => navigate(`/operation/projects/${project._id}/overview`)}
      >
        {loading ? <Spinner /> : 'Go to Project'}
      </Button>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
        <Sheet.Trigger asChild>
          <Button variant="outline">Convert to Project</Button>
        </Sheet.Trigger>
        <Sheet.View
          className="sm:max-w-3xl w-full p-0"
          onEscapeKeyDown={(e) => {
            e.preventDefault();
          }}
        >
          <AddProjectForm task={task} onClose={onClose} />
        </Sheet.View>
      </Sheet>
    </>
  );
};
