import { useTranslation } from 'react-i18next';
import { Command } from 'erxes-ui';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const ProjectsChangePriorityTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  const { t } = useTranslation('operation');
  return (
    <Command.Item
      onSelect={() => {
        setCurrentContent('priority');
      }}
    >
      <div className="flex gap-2 items-center">{t('change-priority')}</div>
    </Command.Item>
  );
};

export const ProjectsChangePriorityContent = ({
  projectIds,
  setOpen,
}: {
  projectIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { updateProject } = useUpdateProject();
  return (
    <SelectPriority.Provider
      onValueChange={async (value) => {
        await Promise.all(
          projectIds.map((projectId) => {
            return updateProject({
              variables: {
                _id: projectId,
                priority: value,
              },
            });
          }),
        );
        setOpen(false);
      }}
    >
      <SelectPriority.Content />
    </SelectPriority.Provider>
  );
};
