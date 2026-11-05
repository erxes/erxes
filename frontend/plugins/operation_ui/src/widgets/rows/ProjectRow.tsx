import { IProject } from '@/project/types';
import { IconClipboard } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ContactWidgetRow } from 'ui-modules';

// A project as one compact line (name, target date); opens its overview.
export const ProjectRow = ({ project }: { project: IProject }) => {
  const navigate = useNavigate();

  return (
    <ContactWidgetRow
      leading={<IconClipboard className="size-4" />}
      title={project.name}
      meta={project.targetDate && format(new Date(project.targetDate), 'MMM d')}
      onClick={() => navigate(`/operation/projects/${project._id}/overview`)}
    />
  );
};
