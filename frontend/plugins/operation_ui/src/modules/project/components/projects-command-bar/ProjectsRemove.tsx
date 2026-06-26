import { useRemoveProject } from '@/project/hooks/useRemoveProject';
import { IconTrash } from '@tabler/icons-react';
import { Button, Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ProjectsDeleteTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Command.Item onSelect={() => setCurrentContent('delete')}>
      <div className="flex gap-2 items-center text-red-500">
        <IconTrash size={16} />
        {t('delete-project')}
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
  const { t } = useTranslation('operation');
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
        {t('delete-confirmation', { count: projectIds.length })}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
          {t('cancel')}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {t('delete')}
        </Button>
      </div>
    </div>
  );
};
