import { IProject } from '@/project/types';
import { IconClipboard } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useProjectDetailSheet } from '@/project/hooks/useProjectDetailSheet';
import { ContactWidgetRow } from 'ui-modules';

// A project as one compact line (name, target date); opens stacked in the record panel.
export const ProjectRow = ({ project }: { project: IProject }) => {
  const [, setActiveProject] = useProjectDetailSheet();

  return (
    <ContactWidgetRow
      leading={<IconClipboard className="size-4" />}
      title={project.name}
      meta={project.targetDate && format(new Date(project.targetDate), 'MMM d')}
      onClick={() => setActiveProject(project._id, { stack: true })}
    />
  );
};
