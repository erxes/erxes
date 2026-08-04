import { useTranslation } from 'react-i18next';
import { Command } from 'erxes-ui';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const ProjectsChangeStatusTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Command.Item
      onSelect={() => {
        setCurrentContent('status');
      }}
    >
      <div className="flex gap-2 items-center">{t('change-status')}</div>
    </Command.Item>
  );
};

export const ProjectsChangeStatusContent = ({
  projectIds,
  setOpen,
}: {
  projectIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { updateProject } = useUpdateProject();
  return (
    <SelectStatus.Provider
      onValueChange={async (value) => {
        await Promise.all(
          projectIds.map((projectId) => {
            return updateProject({
              variables: {
                _id: projectId,
                status: value,
              },
            });
          }),
        );
        setOpen(false);
      }}
    >
      <SelectStatus.Content />
    </SelectStatus.Provider>
  );
};
