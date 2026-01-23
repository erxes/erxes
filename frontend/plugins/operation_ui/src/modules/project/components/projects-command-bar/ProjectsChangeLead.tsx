import { Command } from 'erxes-ui';
import { SelectLead } from '../select/SelectLead';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';

export const ProjectsChangeLeadTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (currentContent: string) => void;
}) => {
  return (
    <Command.Item
      onSelect={() => {
        setCurrentContent('lead');
      }}
    >
      <div className="flex gap-2 items-center">Change Lead</div>
    </Command.Item>
  );
};

export const ProjectsChangeLeadContent = ({
  projectIds,
  teamId,
  setOpen,
}: {
  projectIds: string[];
  teamId: string | undefined;
  setOpen: (open: boolean) => void;
}) => {
  const { updateProject } = useUpdateProject();
  return (
    <SelectLead.Provider
      onValueChange={async (value) => {
        await Promise.all(
          projectIds.map((projectId) => {
            updateProject({
              variables: {
                _id: projectId,
                leadId: value,
              },
            });
          }),
        );
        setOpen(false);
      }}
    >
      <SelectLead.Content teamIds={teamId} />
    </SelectLead.Provider>
  );
};
