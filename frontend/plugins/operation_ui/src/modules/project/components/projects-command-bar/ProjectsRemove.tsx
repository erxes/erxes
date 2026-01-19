import { Command } from 'erxes-ui';
import { useRemoveProject } from '@/project/hooks/useRemoveProject';
import { IconTrash } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const ProjectsDeleteTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  return (
    <Command.Item onSelect={() => setCurrentContent('delete')}>
      <div className="flex gap-2 items-center text-red-500">
        <IconTrash size={16} />
        Delete Project
      </div>
    </Command.Item>
  );
};

export const ProjectsDeleteContent = ({
  projectIds,
  setOpen,
}: {
  projectIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { removeProject, loading } = useRemoveProject();

  const handleDelete = async () => {
    await Promise.all(
      projectIds.map((id) =>
        removeProject({
          variables: {
            _id: id,
          },
        }),
      ),
    );
    setOpen(false);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="text-sm font-medium">
        Are you sure you want to delete {projectIds.length} projects?
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
